// OpenAI Service for Server-side AI Chatbot Integration
// Epic 4 - US-011: Configuración Base del Chatbot IA Multi-Canal

import OpenAI from 'openai'
import { config } from '@/lib/config'
import { createClient } from '@supabase/supabase-js'

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

// Initialize Supabase client with service role for server-side operations
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
)

// Initialize OpenAI client for server-side usage
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured')
    }
    
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey
      // No dangerouslyAllowBrowser for server-side usage
    })
  }
  
  return openaiClient
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

/**
 * Generate embeddings for text content
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    // Use mock embedding if API key is placeholder or in development mode
    if (config.openai.apiKey.includes('placeholder') || config.openai.apiKey.includes('test')) {
      console.log('🤖 Using mock embedding for development')
      // Generate a mock embedding vector of 1536 dimensions (same as text-embedding-3-small)
      const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
      return {
        embedding: mockEmbedding,
        tokens: Math.ceil(text.length / 4) // Approximate token count
      }
    }

    const client = getOpenAIClient()

    const response = await client.embeddings.create({
      model: config.openai.embeddingModel,
      input: text.replace(/\n/g, ' ').trim(),
      encoding_format: 'float'
    })

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage.total_tokens
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Perform hybrid search (semantic + keyword)
 */
export async function hybridSearch(
  query: string,
  threshold: number = 0.7,
  limit: number = 5
): Promise<SimilarContent[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Perform hybrid search using Supabase RPC function
    const { data, error } = await supabase.rpc('hybrid_search_content', {
      query_text: query,
      query_embedding: queryEmbedding.embedding,
      similarity_threshold: threshold,
      match_count: limit
    })

    if (error) {
      console.error('Error in hybrid search:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in hybrid search:', error)
    return []
  }
}

/**
 * Generate chat response using OpenAI
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  relevantContent: SimilarContent[] = []
): Promise<ChatResponse> {
  try {
    // Use simulated responses if API key is placeholder or in development mode
    if (config.openai.apiKey.includes('placeholder') || config.openai.apiKey.includes('test')) {
      console.log('🤖 Using simulated OpenAI response for development')
      return generateSimulatedResponse(messages, relevantContent)
    }

    const client = getOpenAIClient()

    // Build context from relevant content
    const contextText = relevantContent
      .map(content => `${content.title}: ${content.content}`)
      .join('\n\n')
    
    // System prompt for the AI assistant
    const systemPrompt = `Eres el asistente virtual oficial de la Alcaldía de Chía, Colombia. 

Tu función es ayudar a los ciudadanos con información sobre:
- Trámites y servicios municipales
- Horarios de atención
- Requisitos para procedimientos
- Información de contacto
- Preguntas frecuentes

INSTRUCCIONES IMPORTANTES:
1. Responde SOLO con información oficial y verificada
2. Si no tienes información específica, indica que el ciudadano debe contactar directamente a la dependencia
3. Sé cordial, profesional y claro
4. Usa el contexto proporcionado para dar respuestas precisas
5. Si la confianza en tu respuesta es baja (<70%), recomienda contactar a un funcionario

CONTEXTO DISPONIBLE:
${contextText}

Responde en español colombiano, de manera clara y útil.`

    // Prepare messages for OpenAI
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]
    
    // Generate response
    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages: openaiMessages,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })
    
    const content = response.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'
    const tokens = response.usage?.total_tokens || 0
    
    // Calculate confidence based on content quality and relevance
    let confidence = 0.8 // Base confidence
    
    // Reduce confidence if no relevant content was found
    if (relevantContent.length === 0) {
      confidence -= 0.2
    }
    
    // Reduce confidence if response is very short
    if (content.length < 50) {
      confidence -= 0.1
    }
    
    // Reduce confidence if response contains uncertainty phrases
    const uncertaintyPhrases = ['no estoy seguro', 'no tengo información', 'no sé', 'posiblemente']
    if (uncertaintyPhrases.some(phrase => content.toLowerCase().includes(phrase))) {
      confidence -= 0.2
    }
    
    return {
      content,
      confidence: Math.max(0.1, Math.min(1.0, confidence)),
      sources: relevantContent.map(content => content.title),
      tokens
    }
    
  } catch (error) {
    console.error('Error generating chat response:', error)
    
    return {
      content: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor, intenta nuevamente o contacta directamente a la Alcaldía.',
      confidence: 0.1,
      sources: [],
      tokens: 0
    }
  }
}

/**
 * Create or update content embeddings
 */
export async function updateContentEmbeddings(
  contentId: string,
  contentType: string,
  title: string,
  content: string
): Promise<boolean> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(`${title} ${content}`)

    // Store or update embedding in database
    const { error } = await supabase
      .from('content_embeddings')
      .upsert({
        content_id: contentId,
        content_type: contentType,
        title,
        content,
        embedding: embedding.embedding,
        tokens: embedding.tokens,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing content embedding:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating content embeddings:', error)
    return false
  }
}

/**
 * Generate simulated response for development
 */
function generateSimulatedResponse(
  messages: ChatMessage[],
  relevantContent: SimilarContent[] = []
): ChatResponse {
  const userMessage = messages[messages.length - 1]?.content.toLowerCase() || ''

  // Simulated responses based on common queries
  let response = ''
  let confidence = 0.8

  if (userMessage.includes('cédula') || userMessage.includes('cedula')) {
    response = `Para sacar tu cédula de ciudadanía, debes:

1. **Dirigirte a la Registraduría Nacional** más cercana
2. **Llevar los siguientes documentos:**
   - Tarjeta de identidad anterior (si la tienes)
   - Certificado de nacimiento (original)
   - Dos fotos 3x4 fondo blanco

3. **Proceso:**
   - Solicitar el formulario de inscripción
   - Diligenciarlo completamente
   - Pagar la tarifa correspondiente
   - Tomar huellas dactilares y foto

**Costo:** Aproximadamente $50,000 COP
**Tiempo de entrega:** 15 días hábiles

Para más información, puedes contactar la Registraduría al 123 o visitar su página web oficial.`
    confidence = 0.9
  } else if (userMessage.includes('impuesto') || userMessage.includes('pago')) {
    response = `Para el pago de impuestos municipales en Chía:

**Lugares de pago:**
- Oficinas de la Alcaldía (Carrera 11 # 17-25)
- Bancos autorizados (Bancolombia, Banco de Bogotá, Davivienda)
- PSE (Pagos en línea)

**Horarios de atención:**
- Lunes a Viernes: 8:00 AM - 5:00 PM
- Sábados: 8:00 AM - 12:00 PM

**Documentos necesarios:**
- Cédula de ciudadanía
- Recibo de pago o factura

**Teléfono:** (601) 123-4567
**Email:** impuestos@chia.gov.co`
    confidence = 0.85
  } else if (userMessage.includes('horario') || userMessage.includes('atención')) {
    response = `**Horarios de atención de la Alcaldía de Chía:**

🏛️ **Atención presencial:**
- Lunes a Viernes: 8:00 AM - 5:00 PM
- Sábados: 8:00 AM - 12:00 PM

📞 **Línea de atención:**
- Teléfono: (601) 123-4567
- Disponible 24/7 para emergencias

📧 **Contacto digital:**
- Email: info@chia.gov.co
- Portal web: www.chia.gov.co

📍 **Ubicación:**
Carrera 11 # 17-25, Chía, Cundinamarca`
    confidence = 0.95
  } else if (userMessage.includes('empresa') || userMessage.includes('registro')) {
    response = `Para registrar tu empresa en Chía:

**1. Registro en Cámara de Comercio:**
- Consulta de nombre
- Diligenciar formularios
- Pagar derechos de matrícula

**2. Registro ante la DIAN:**
- RUT (Registro Único Tributario)
- Inscripción en régimen tributario

**3. Registro municipal:**
- Solicitar registro de industria y comercio
- Pagar impuesto de industria y comercio

**Documentos necesarios:**
- Cédula del representante legal
- Formulario de registro mercantil
- Documento de constitución

**Contacto especializado:**
📞 (601) 123-4567 ext. 150
📧 empresas@chia.gov.co`
    confidence = 0.8
  } else {
    response = `¡Hola! Soy el asistente virtual de la Alcaldía de Chía.

Puedo ayudarte con información sobre:
- 📋 Trámites y servicios municipales
- 💰 Pagos de impuestos
- 🕐 Horarios de atención
- 🏢 Registro de empresas
- 📞 Información de contacto

¿En qué específicamente te puedo ayudar hoy?

**Para emergencias:** Llama al 123
**Atención presencial:** Lunes a Viernes 8:00 AM - 5:00 PM`
    confidence = 0.7
  }

  return {
    content: response,
    confidence,
    sources: relevantContent.map(content => content.title),
    tokens: response.length / 4 // Approximate token count
  }
}

export default {
  validateOpenAIConfig,
  generateEmbedding,
  hybridSearch,
  generateChatResponse,
  updateContentEmbeddings
}
