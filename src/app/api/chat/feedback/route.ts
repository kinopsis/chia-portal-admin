// API Route for Chat Feedback
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

interface FeedbackRequest {
  messageId: string
  feedbackType: 'helpful' | 'not_helpful' | 'report_issue'
  comment?: string
}

interface FeedbackApiResponse {
  success: boolean
  data?: {
    feedbackId: string
  }
  error?: string
}

/**
 * Handle POST request for chat feedback
 */
export async function POST(request: NextRequest): Promise<NextResponse<FeedbackApiResponse>> {
  try {
    // Parse request body
    const body: FeedbackRequest = await request.json()

    console.log('🔍 Feedback API - Received data:', { messageId: body.messageId, feedbackType: body.feedbackType, comment: body.comment })

    // Validate required fields
    if (!body.messageId || typeof body.messageId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message ID is required and must be a string'
      }, { status: 400 })
    }

    if (!body.feedbackType || !['helpful', 'not_helpful', 'report_issue'].includes(body.feedbackType)) {
      return NextResponse.json({
        success: false,
        error: 'Valid feedback type is required (helpful, not_helpful, report_issue)'
      }, { status: 400 })
    }

    // Validate comment length if provided
    if (body.comment && body.comment.length > 500) {
      return NextResponse.json({
        success: false,
        error: 'Comment cannot exceed 500 characters'
      }, { status: 400 })
    }

    // Create Supabase client with service role for database operations
    const supabase = createServiceRoleClient()

    // Check if message exists and get session info
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('id, session_id, role')
      .eq('id', body.messageId)
      .single()

    console.log('🔍 Database query result:', { message, messageError, messageId: body.messageId })

    if (messageError || !message) {
      console.log('❌ Message not found:', { messageError, message })
      return NextResponse.json({
        success: false,
        error: 'Message not found'
      }, { status: 404 })
    }

    // Only allow feedback on assistant messages
    if (message.role !== 'assistant') {
      return NextResponse.json({
        success: false,
        error: 'Feedback can only be provided for assistant messages'
      }, { status: 400 })
    }

    // Check if feedback already exists for this message
    const { data: existingFeedback, error: checkError } = await supabase
      .from('chat_feedback')
      .select('id')
      .eq('message_id', body.messageId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing feedback:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing feedback'
      }, { status: 500 })
    }

    if (existingFeedback) {
      return NextResponse.json({
        success: false,
        error: 'Feedback already provided for this message'
      }, { status: 409 })
    }

    // Insert feedback
    const { data: feedback, error: insertError } = await supabase
      .from('chat_feedback')
      .insert({
        message_id: body.messageId,
        session_id: message.session_id,
        feedback_type: body.feedbackType,
        comment: body.comment?.trim() || null
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save feedback'
      }, { status: 500 })
    }

    // Update the message with feedback info
    const { error: updateError } = await supabase
      .from('chat_messages')
      .update({
        feedback: body.feedbackType === 'helpful' ? 'helpful' : 'not_helpful'
      })
      .eq('id', body.messageId)

    if (updateError) {
      console.error('Error updating message feedback:', updateError)
      // Don't fail the request if this update fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        feedbackId: feedback.id
      }
    })

  } catch (error) {
    console.error('Error in chat feedback API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * Handle GET request for feedback statistics (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 })
    }

    // Get feedback statistics for the session
    const { data: feedbackStats, error } = await supabase
      .from('chat_feedback')
      .select('feedback_type')
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error fetching feedback stats:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch feedback statistics'
      }, { status: 500 })
    }

    // Calculate statistics
    const stats = {
      total: feedbackStats.length,
      helpful: feedbackStats.filter(f => f.feedback_type === 'helpful').length,
      not_helpful: feedbackStats.filter(f => f.feedback_type === 'not_helpful').length,
      report_issue: feedbackStats.filter(f => f.feedback_type === 'report_issue').length
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error in feedback GET API:', error)
    
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
