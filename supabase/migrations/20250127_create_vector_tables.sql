-- Migration: Create Vector Tables for AI Chatbot
-- Epic 4 - US-011: Configuración Base del Chatbot IA Multi-Canal
-- Date: 2025-07-27
-- Purpose: Enable vector storage and semantic search for AI chatbot

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Create content_embeddings table for storing vectorized content
CREATE TABLE IF NOT EXISTS content_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id TEXT NOT NULL, -- Reference to original content (tramite_id, opa_id, faq_id, etc.)
    content_type TEXT NOT NULL CHECK (content_type IN ('tramite', 'opa', 'faq', 'dependencia', 'general')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI text-embedding-ada-002 produces 1536-dimensional vectors
    tokens INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient vector similarity search
CREATE INDEX IF NOT EXISTS content_embeddings_embedding_idx ON content_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create indexes for filtering and performance
CREATE INDEX IF NOT EXISTS content_embeddings_content_type_idx ON content_embeddings (content_type);
CREATE INDEX IF NOT EXISTS content_embeddings_content_id_idx ON content_embeddings (content_id);
CREATE INDEX IF NOT EXISTS content_embeddings_updated_at_idx ON content_embeddings (updated_at DESC);

-- Create chat_sessions table for managing user conversations
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'whatsapp')),
    phone_number TEXT, -- For WhatsApp sessions
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create chat_messages table for storing conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- AI confidence level (0.00 to 1.00)
    escalated_to_human BOOLEAN DEFAULT FALSE,
    feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful')),
    metadata JSONB DEFAULT '{}', -- Store sources, tokens, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for chat tables
CREATE INDEX IF NOT EXISTS chat_sessions_session_token_idx ON chat_sessions (session_token);
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_channel_idx ON chat_sessions (channel);
CREATE INDEX IF NOT EXISTS chat_sessions_expires_at_idx ON chat_sessions (expires_at);

CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_role_idx ON chat_messages (role);

-- Create updated_at trigger for content_embeddings
CREATE OR REPLACE FUNCTION update_content_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_embeddings_updated_at_trigger
    BEFORE UPDATE ON content_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_content_embeddings_updated_at();

-- Create updated_at trigger for chat_sessions
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_sessions_updated_at_trigger
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_sessions_updated_at();

-- Function to get or create chat session
CREATE OR REPLACE FUNCTION get_or_create_chat_session(
    p_user_id UUID DEFAULT NULL,
    p_session_token TEXT DEFAULT NULL,
    p_channel TEXT DEFAULT 'web',
    p_phone_number TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    session_id UUID;
    generated_token TEXT;
BEGIN
    -- Generate session token if not provided
    IF p_session_token IS NULL THEN
        generated_token := gen_random_uuid()::TEXT;
    ELSE
        generated_token := p_session_token;
    END IF;

    -- Try to find existing session
    SELECT id INTO session_id
    FROM chat_sessions
    WHERE session_token = generated_token
    AND expires_at > NOW();

    -- Create new session if not found
    IF session_id IS NULL THEN
        INSERT INTO chat_sessions (session_token, user_id, channel, phone_number)
        VALUES (generated_token, p_user_id, p_channel, p_phone_number)
        RETURNING id INTO session_id;
    END IF;

    RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for hybrid search (semantic + keyword)
CREATE OR REPLACE FUNCTION hybrid_search_content(
    query_text TEXT,
    query_embedding VECTOR(1536),
    similarity_threshold FLOAT DEFAULT 0.7,
    match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content_type TEXT,
    title TEXT,
    content TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id,
        ce.content_type,
        ce.title,
        ce.content,
        (1 - (ce.embedding <=> query_embedding)) AS similarity
    FROM content_embeddings ce
    WHERE 
        (1 - (ce.embedding <=> query_embedding)) > similarity_threshold
        OR (
            ce.title ILIKE '%' || query_text || '%'
            OR ce.content ILIKE '%' || query_text || '%'
        )
    ORDER BY 
        (1 - (ce.embedding <=> query_embedding)) DESC,
        CASE 
            WHEN ce.title ILIKE '%' || query_text || '%' THEN 1
            WHEN ce.content ILIKE '%' || query_text || '%' THEN 2
            ELSE 3
        END
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chat_sessions
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for content_embeddings
ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "content_embeddings_read_policy" ON content_embeddings
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update/delete only to admin and funcionario roles
CREATE POLICY "content_embeddings_write_policy" ON content_embeddings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'funcionario')
        )
    );

-- RLS Policies for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can access their own sessions
CREATE POLICY "chat_sessions_user_policy" ON chat_sessions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Admin can access all sessions
CREATE POLICY "chat_sessions_admin_policy" ON chat_sessions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can access messages from their sessions
CREATE POLICY "chat_messages_user_policy" ON chat_messages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
        )
    );

-- Admin can access all messages
CREATE POLICY "chat_messages_admin_policy" ON chat_messages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON content_embeddings TO authenticated;
GRANT ALL ON chat_sessions TO authenticated;
GRANT ALL ON chat_messages TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_or_create_chat_session TO authenticated;
GRANT EXECUTE ON FUNCTION hybrid_search_content TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions TO authenticated;

-- Create a scheduled job to clean up expired sessions (runs every hour)
-- Note: This requires pg_cron extension which may need to be enabled separately
-- SELECT cron.schedule('cleanup-expired-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');

COMMENT ON TABLE content_embeddings IS 'Stores vectorized content for AI semantic search';
COMMENT ON TABLE chat_sessions IS 'Manages user chat sessions across multiple channels';
COMMENT ON TABLE chat_messages IS 'Stores conversation history and AI responses';
COMMENT ON FUNCTION hybrid_search_content IS 'Performs hybrid semantic and keyword search';
COMMENT ON FUNCTION get_or_create_chat_session IS 'Creates or retrieves existing chat session';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Removes expired chat sessions and messages';
