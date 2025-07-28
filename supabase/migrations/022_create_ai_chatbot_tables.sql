-- Migration: Create AI Chatbot Tables with Vector Support
-- Description: Create tables for AI chatbot functionality with pgvector support
-- Author: AI Assistant
-- Date: 2025-07-26
-- Phase: Epic 4 - US-011: Configuración Base del Chatbot IA Multi-Canal

BEGIN;

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create chatbot_knowledge table for storing vectorized content
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('tramite', 'opa', 'faq', 'dependencia', 'general')),
  content_id UUID, -- Reference to original content (tramites.id, opas.id, faqs.id, etc.)
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table for managing user conversations
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous users
  session_token VARCHAR(255) UNIQUE NOT NULL, -- For anonymous session tracking
  channel VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'whatsapp')),
  phone_number VARCHAR(20), -- For WhatsApp sessions
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create chat_messages table for conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  confidence_score DECIMAL(3,2), -- For AI response confidence (0.00 to 1.00)
  escalated_to_human BOOLEAN DEFAULT false,
  feedback VARCHAR(20) CHECK (feedback IN ('helpful', 'not_helpful', 'neutral')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_feedback table for user feedback on responses
CREATE TABLE IF NOT EXISTS chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'report_issue')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_content_type ON chatbot_knowledge(content_type);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_content_id ON chatbot_knowledge(content_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_embedding ON chatbot_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_created_at ON chatbot_knowledge(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_token ON chat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_channel ON chat_sessions(channel);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_phone_number ON chat_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_expires_at ON chat_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_confidence_score ON chat_messages(confidence_score);
CREATE INDEX IF NOT EXISTS idx_chat_messages_escalated ON chat_messages(escalated_to_human);

CREATE INDEX IF NOT EXISTS idx_chat_feedback_message_id ON chat_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_session_id ON chat_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_type ON chat_feedback(feedback_type);

-- Create full-text search indexes for better content search
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_search ON chatbot_knowledge USING gin(
  to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(content, ''))
);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_chatbot_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chatbot_knowledge_updated_at
  BEFORE UPDATE ON chatbot_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_knowledge_updated_at();

CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_sessions_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chatbot_knowledge
-- Admins and funcionarios can manage knowledge base
CREATE POLICY "Admins and funcionarios can manage knowledge" ON chatbot_knowledge
  FOR ALL
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'funcionario')
  );

-- Everyone can read knowledge for chatbot responses
CREATE POLICY "Everyone can read knowledge" ON chatbot_knowledge
  FOR SELECT
  USING (true);

-- RLS Policies for chat_sessions
-- Users can access their own sessions
CREATE POLICY "Users can access own sessions" ON chat_sessions
  FOR ALL
  USING (
    user_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'funcionario')
  );

-- Anonymous sessions can be accessed by session_token
CREATE POLICY "Anonymous sessions by token" ON chat_sessions
  FOR ALL
  USING (
    user_id IS NULL OR
    auth.jwt() ->> 'role' IN ('admin', 'funcionario')
  );

-- RLS Policies for chat_messages
-- Users can access messages from their sessions
CREATE POLICY "Users can access own messages" ON chat_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs 
      WHERE cs.id = session_id 
      AND (cs.user_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'funcionario'))
    )
  );

-- RLS Policies for chat_feedback
-- Users can provide feedback on their messages
CREATE POLICY "Users can provide feedback" ON chat_feedback
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.id = message_id 
      AND (cs.user_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'funcionario'))
    )
  );

-- Create function to search similar content using vector similarity
CREATE OR REPLACE FUNCTION search_similar_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content_type varchar,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ck.id,
    ck.content_type,
    ck.title,
    ck.content,
    1 - (ck.embedding <=> query_embedding) as similarity
  FROM chatbot_knowledge ck
  WHERE 1 - (ck.embedding <=> query_embedding) > match_threshold
  ORDER BY ck.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to get or create chat session
CREATE OR REPLACE FUNCTION get_or_create_chat_session(
  p_user_id uuid DEFAULT NULL,
  p_session_token varchar DEFAULT NULL,
  p_channel varchar DEFAULT 'web',
  p_phone_number varchar DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  session_id uuid;
BEGIN
  -- Try to find existing active session
  SELECT id INTO session_id
  FROM chat_sessions
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id) OR
    (p_session_token IS NOT NULL AND session_token = p_session_token)
  )
  AND is_active = true
  AND expires_at > NOW()
  ORDER BY updated_at DESC
  LIMIT 1;

  -- If no session found, create new one
  IF session_id IS NULL THEN
    INSERT INTO chat_sessions (
      user_id,
      session_token,
      channel,
      phone_number
    ) VALUES (
      p_user_id,
      COALESCE(p_session_token, gen_random_uuid()::text),
      p_channel,
      p_phone_number
    )
    RETURNING id INTO session_id;
  ELSE
    -- Update existing session
    UPDATE chat_sessions
    SET updated_at = NOW(),
        expires_at = NOW() + INTERVAL '24 hours'
    WHERE id = session_id;
  END IF;

  RETURN session_id;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE chatbot_knowledge IS 'Stores vectorized content for AI chatbot knowledge base';
COMMENT ON TABLE chat_sessions IS 'Manages user chat sessions across web and WhatsApp channels';
COMMENT ON TABLE chat_messages IS 'Stores conversation history with confidence scores';
COMMENT ON TABLE chat_feedback IS 'Collects user feedback on AI responses for improvement';

COMMENT ON COLUMN chatbot_knowledge.embedding IS 'Vector embedding from OpenAI text-embedding-3-small (1536 dimensions)';
COMMENT ON COLUMN chat_messages.confidence_score IS 'AI confidence score (0.00-1.00) for response quality';
COMMENT ON COLUMN chat_sessions.expires_at IS 'Session expiration time (24 hours from last activity)';

-- Verify the migration
SELECT 
  'AI Chatbot tables created successfully' as status,
  COUNT(*) FILTER (WHERE table_name = 'chatbot_knowledge') as knowledge_table,
  COUNT(*) FILTER (WHERE table_name = 'chat_sessions') as sessions_table,
  COUNT(*) FILTER (WHERE table_name = 'chat_messages') as messages_table,
  COUNT(*) FILTER (WHERE table_name = 'chat_feedback') as feedback_table
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chatbot_knowledge', 'chat_sessions', 'chat_messages', 'chat_feedback');

COMMIT;
