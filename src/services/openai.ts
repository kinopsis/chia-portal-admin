// OpenAI Service for AI Chatbot Integration
// Epic 4 - US-011: Configuración Base del Chatbot IA Multi-Canal

'use client'

import OpenAI from 'openai'
import { config } from '@/lib/config'
import { supabase } from '@/lib/supabase/client'

// Types for OpenAI service
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
}

export interface ChatResponse {
  content: string
  confidence: number
  sources: string[]
  tokens: number
}

export interface SimilarContent {
  id: string
  content_type: string
  title: string
  content: string
  similarity: number
}

// Initialize OpenAI client
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured')
    }
    
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    })
  }
  
  return openaiClient
}

/**
 * Generate embeddings for text content using OpenAI
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const client = getOpenAIClient()
    
    // Clean and prepare text
    const cleanText = text.replace(/\n/g, ' ').trim()
    
    if (!cleanText) {
      throw new Error('Text content is empty')
    }

    const response = await client.embeddings.create({
      model: config.openai.embeddingModel,
      input: cleanText,
      encoding_format: 'float'
    })

    const embedding = response.data[0]?.embedding
    if (!embedding) {
      throw new Error('No embedding returned from OpenAI')
    }

    return {
      embedding,
      tokens: response.usage?.total_tokens || 0
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search for similar content using vector similarity
 */
export async function searchSimilarContent(
  query: string,
  threshold: number = 0.7,
  limit: number = 5
): Promise<SimilarContent[]> {
  try {
    // Generate embedding for the query
    const { embedding } = await generateEmbedding(query)
    
    // Search for similar content in Supabase
    const { data, error } = await supabase.rpc('search_similar_content', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    })

    if (error) {
      console.error('Error searching similar content:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in searchSimilarContent:', error)
    throw error
  }
}

/**
 * Generate AI response using GPT-4.1 nano with context
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  context: SimilarContent[] = []
): Promise<ChatResponse> {
  try {
    const client = getOpenAIClient()
    
    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context)
    
    // Prepare messages for OpenAI
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }))
    ]

    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages: openaiMessages,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response content from OpenAI')
    }

    // Calculate confidence based on response characteristics
    const confidence = calculateConfidence(content, context)
    
    // Extract sources from context
    const sources = context.map(item => item.title)

    return {
      content,
      confidence,
      sources,
      tokens: response.usage?.total_tokens || 0
    }
  } catch (error) {
    console.error('Error generating chat response:', error)
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build system prompt with municipal context
 */
function buildSystemPrompt(context: SimilarContent[]): string {
  const basePrompt = `Eres un asistente virtual del Portal de Atención Ciudadana de Chía, Cundinamarca, Colombia.

Tu función es ayudar a los ciudadanos con información sobre trámites, servicios, dependencias municipales y preguntas frecuentes.

INSTRUCCIONES IMPORTANTES:
1. Responde SOLO con información oficial del municipio de Chía
2. Si no tienes información específica, indica que el ciudadano debe contactar la dependencia correspondiente
3. Sé claro, conciso y amable en tus respuestas
4. Usa un lenguaje formal pero accesible
5. Si la confianza en tu respuesta es baja (<70%), sugiere contactar un funcionario
6. Incluye números de contacto cuando sea relevante: (601) 123-4567
7. Menciona el horario de atención: Lunes a Viernes 8:00 AM - 5:00 PM

INFORMACIÓN DE CONTACTO:
- Teléfono: (601) 123-4567
- Email: info@chia.gov.co
- Dirección: Carrera 11 # 17-25, Chía, Cundinamarca
- Horario: Lunes a Viernes: 8:00 AM - 5:00 PM`

  if (context.length > 0) {
    const contextInfo = context.map(item => 
      `${item.content_type.toUpperCase()}: ${item.title}\n${item.content}`
    ).join('\n\n')
    
    return `${basePrompt}\n\nINFORMACIÓN RELEVANTE ENCONTRADA:\n${contextInfo}`
  }

  return basePrompt
}

/**
 * Calculate confidence score for AI response
 */
function calculateConfidence(content: string, context: SimilarContent[]): number {
  let confidence = 0.5 // Base confidence
  
  // Increase confidence if we have relevant context
  if (context.length > 0) {
    const avgSimilarity = context.reduce((sum, item) => sum + item.similarity, 0) / context.length
    confidence += avgSimilarity * 0.4
  }
  
  // Increase confidence for longer, more detailed responses
  if (content.length > 100) {
    confidence += 0.1
  }
  
  // Decrease confidence for generic responses
  if (content.includes('no tengo información') || content.includes('contactar')) {
    confidence -= 0.2
  }
  
  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence))
}

/**
 * Hybrid search combining vector similarity and text search
 */
export async function hybridSearch(
  query: string,
  vectorThreshold: number = 0.7,
  limit: number = 10
): Promise<SimilarContent[]> {
  try {
    // Perform vector search
    const vectorResults = await searchSimilarContent(query, vectorThreshold, limit)
    
    // Perform text search using Supabase full-text search
    const { data: textResults, error } = await supabase
      .from('chatbot_knowledge')
      .select('id, content_type, title, content')
      .textSearch('title,content', query, {
        type: 'websearch',
        config: 'spanish'
      })
      .limit(limit)

    if (error) {
      console.error('Error in text search:', error)
      // Return only vector results if text search fails
      return vectorResults
    }

    // Combine and deduplicate results
    const combinedResults = new Map<string, SimilarContent>()
    
    // Add vector results with their similarity scores
    vectorResults.forEach(result => {
      combinedResults.set(result.id, result)
    })
    
    // Add text results with estimated similarity
    textResults?.forEach(result => {
      if (!combinedResults.has(result.id)) {
        combinedResults.set(result.id, {
          ...result,
          similarity: 0.6 // Estimated similarity for text matches
        })
      }
    })
    
    // Sort by similarity and return top results
    return Array.from(combinedResults.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      
  } catch (error) {
    console.error('Error in hybrid search:', error)
    throw error
  }
}

/**
 * Store knowledge content with embeddings
 */
export async function storeKnowledgeContent(
  contentType: string,
  contentId: string | null,
  title: string,
  content: string,
  metadata: Record<string, any> = {}
): Promise<string> {
  try {
    // Generate embedding for the content
    const { embedding } = await generateEmbedding(`${title} ${content}`)
    
    // Store in database
    const { data, error } = await supabase
      .from('chatbot_knowledge')
      .insert({
        content_type: contentType,
        content_id: contentId,
        title,
        content,
        metadata,
        embedding
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error storing knowledge content:', error)
      throw error
    }

    return data.id
  } catch (error) {
    console.error('Error in storeKnowledgeContent:', error)
    throw error
  }
}

/**
 * Update knowledge content and regenerate embeddings
 */
export async function updateKnowledgeContent(
  id: string,
  title: string,
  content: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    // Generate new embedding
    const { embedding } = await generateEmbedding(`${title} ${content}`)
    
    // Update in database
    const { error } = await supabase
      .from('chatbot_knowledge')
      .update({
        title,
        content,
        metadata,
        embedding,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating knowledge content:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in updateKnowledgeContent:', error)
    throw error
  }
}

/**
 * Validate OpenAI configuration
 */
export function validateOpenAIConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.openai.apiKey) {
    errors.push('OpenAI API key is not configured')
  }
  
  if (!config.openai.model) {
    errors.push('OpenAI model is not configured')
  }
  
  if (!config.openai.embeddingModel) {
    errors.push('OpenAI embedding model is not configured')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export default {
  generateEmbedding,
  searchSimilarContent,
  generateChatResponse,
  hybridSearch,
  storeKnowledgeContent,
  updateKnowledgeContent,
  validateOpenAIConfig
}
