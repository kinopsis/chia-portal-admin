// API Route for AI Chatbot
// Epic 4 - US-011: Configuración Base del Chatbot IA Multi-Canal

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import {
  generateChatResponse,
  hybridSearch,
  validateOpenAIConfig,
  type ChatMessage
} from '@/services/openai-server'
import { config } from '@/lib/config'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 50 // Max requests per window
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface ChatRequest {
  message: string
  sessionToken?: string
  userId?: string
  channel?: 'web' | 'whatsapp'
  phoneNumber?: string
}

interface ChatApiResponse {
  success: boolean
  data?: {
    response: string
    confidence: number
    sources: string[]
    sessionToken: string
    escalateToHuman: boolean
  }
  error?: string
  rateLimited?: boolean
}

/**
 * Rate limiting middleware
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  userLimit.count++
  return true
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest, body: ChatRequest): string {
  // Use user ID if available, otherwise use session token or IP
  if (body.userId) return `user:${body.userId}`
  if (body.sessionToken) return `session:${body.sessionToken}`
  if (body.phoneNumber) return `phone:${body.phoneNumber}`
  
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

/**
 * Handle POST request for chat
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChatApiResponse>> {
  try {
    // Create Supabase client with service role for RPC operations
    const supabase = createServiceRoleClient()

    // Validate OpenAI configuration
    const configValidation = validateOpenAIConfig()
    if (!configValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: `OpenAI configuration error: ${configValidation.errors.join(', ')}`
      }, { status: 500 })
    }

    // Parse request body
    const body: ChatRequest = await request.json()

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required and must be a string'
      }, { status: 400 })
    }

    // Check rate limiting
    const clientId = getClientIdentifier(request, body)
    if (!checkRateLimit(clientId)) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        rateLimited: true
      }, { status: 429 })
    }

    // Clean and validate message
    const message = body.message.trim()
    if (message.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Message cannot be empty'
      }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({
        success: false,
        error: 'Message is too long (max 1000 characters)'
      }, { status: 400 })
    }

    // Get or create chat session
    const sessionToken = body.sessionToken || crypto.randomUUID()
    const { data: sessionData, error: sessionError } = await supabase.rpc(
      'get_or_create_chat_session',
      {
        p_user_id: body.userId || null,
        p_session_token: sessionToken,
        p_channel: body.channel || 'web',
        p_phone_number: body.phoneNumber || null
      }
    )

    if (sessionError) {
      console.error('Error managing chat session:', sessionError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create chat session'
      }, { status: 500 })
    }

    const sessionId = sessionData

    // Store user message
    const { data: userMessage, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        metadata: {
          channel: body.channel || 'web',
          timestamp: new Date().toISOString()
        }
      })
      .select('id')
      .single()

    if (messageError) {
      console.error('Error storing user message:', messageError)
      // Continue processing even if message storage fails
    }

    // Search for relevant content using hybrid search
    const relevantContent = await hybridSearch(message, 0.7, 5)
    
    // Generate AI response
    const chatMessages: ChatMessage[] = [
      { role: 'user', content: message }
    ]
    
    const aiResponse = await generateChatResponse(chatMessages, relevantContent)
    
    // Determine if escalation to human is needed
    const escalateToHuman = aiResponse.confidence < 0.7
    
    // Store AI response
    const { data: assistantMessage, error: responseError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse.content,
        confidence_score: aiResponse.confidence,
        escalated_to_human: escalateToHuman,
        metadata: {
          sources: aiResponse.sources,
          tokens: aiResponse.tokens,
          channel: body.channel || 'web',
          timestamp: new Date().toISOString()
        }
      })
      .select('id')
      .single()

    if (responseError) {
      console.error('Error storing AI response:', responseError)
      // Continue processing even if message storage fails
    } else {
      console.log('✅ Assistant message saved successfully:', { messageId: assistantMessage?.id, sessionId })
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse.content,
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        sessionToken,
        escalateToHuman,
        messageId: assistantMessage?.id // Include the database message ID for feedback
      }
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * Handle GET request for chat session info
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Create Supabase client
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('sessionToken')

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'Session token is required'
      }, { status: 400 })
    }

    // Get session info
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, channel, is_active, created_at, expires_at')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or expired'
      }, { status: 404 })
    }

    // Get recent messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('role, content, confidence_score, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(20)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
    }

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          channel: session.channel,
          isActive: session.is_active,
          createdAt: session.created_at,
          expiresAt: session.expires_at
        },
        messages: messages || []
      }
    })

  } catch (error) {
    console.error('Error in chat GET API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
