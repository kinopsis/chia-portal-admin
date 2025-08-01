// Debug API endpoint to check environment variables
// This endpoint helps diagnose ChatWidget configuration issues

import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Only allow in development or with special debug header
    const isDevelopment = process.env.NODE_ENV === 'development'
    const debugHeader = request.headers.get('x-debug-key')
    const isAuthorized = isDevelopment || debugHeader === 'chia-debug-2025'

    if (!isAuthorized) {
      return NextResponse.json({
        error: 'Debug endpoint not available'
      }, { status: 403 })
    }

    // Check environment variables status
    const envStatus = {
      // Supabase Configuration
      supabase: {
        url: {
          exists: !!config.supabase.url,
          value: config.supabase.url ? `${config.supabase.url.substring(0, 20)}...` : 'NOT_SET',
          isPlaceholder: config.supabase.url.includes('placeholder')
        },
        anonKey: {
          exists: !!config.supabase.anonKey,
          value: config.supabase.anonKey ? `${config.supabase.anonKey.substring(0, 20)}...` : 'NOT_SET',
          isPlaceholder: config.supabase.anonKey.includes('placeholder')
        },
        serviceRoleKey: {
          exists: !!config.supabase.serviceRoleKey,
          value: config.supabase.serviceRoleKey ? `${config.supabase.serviceRoleKey.substring(0, 20)}...` : 'NOT_SET',
          isPlaceholder: config.supabase.serviceRoleKey.includes('placeholder')
        }
      },

      // OpenAI Configuration
      openai: {
        apiKey: {
          exists: !!config.openai.apiKey,
          value: config.openai.apiKey ? `${config.openai.apiKey.substring(0, 10)}...` : 'NOT_SET',
          isPlaceholder: config.openai.apiKey.includes('placeholder'),
          startsWithSk: config.openai.apiKey.startsWith('sk-')
        },
        model: {
          exists: !!config.openai.model,
          value: config.openai.model
        },
        embeddingModel: {
          exists: !!config.openai.embeddingModel,
          value: config.openai.embeddingModel
        }
      },

      // Feature Flags
      features: {
        enableAiChatbot: {
          exists: config.features.ENABLE_AI_CHATBOT !== undefined,
          value: config.features.ENABLE_AI_CHATBOT
        }
      },

      // Environment Info
      environment: {
        nodeEnv: process.env.NODE_ENV,
        appEnv: process.env.APP_ENV,
        nextPublicEnableAiChatbot: process.env.NEXT_PUBLIC_ENABLE_AI_CHATBOT
      }
    }

    // Check for placeholder configuration
    const isPlaceholderConfig = (
      config.supabase.url.includes('placeholder') ||
      config.supabase.serviceRoleKey.includes('placeholder') ||
      config.openai.apiKey.includes('placeholder')
    )

    // Validate configuration for ChatWidget
    const validationErrors = []
    
    if (!config.supabase.url) {
      validationErrors.push('NEXT_PUBLIC_SUPABASE_URL is missing')
    }
    if (!config.supabase.serviceRoleKey) {
      validationErrors.push('SUPABASE_SERVICE_ROLE_KEY is missing')
    }
    if (!config.openai.apiKey) {
      validationErrors.push('OPENAI_API_KEY is missing')
    }
    if (config.supabase.url.includes('placeholder')) {
      validationErrors.push('NEXT_PUBLIC_SUPABASE_URL contains placeholder value')
    }
    if (config.supabase.serviceRoleKey.includes('placeholder')) {
      validationErrors.push('SUPABASE_SERVICE_ROLE_KEY contains placeholder value')
    }
    if (config.openai.apiKey.includes('placeholder')) {
      validationErrors.push('OPENAI_API_KEY contains placeholder value')
    }
    if (config.openai.apiKey && !config.openai.apiKey.startsWith('sk-')) {
      validationErrors.push('OPENAI_API_KEY does not start with sk-')
    }

    // Check if ChatWidget should be enabled
    const shouldEnableChatbot = config.features.ENABLE_AI_CHATBOT && validationErrors.length === 0

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isPlaceholderConfig,
      shouldEnableChatbot,
      validationErrors,
      envStatus,
      recommendations: validationErrors.length > 0 ? [
        'Configure missing environment variables in Coolify',
        'Ensure SUPABASE_SERVICE_ROLE_KEY is the service role key (not anon key)',
        'Ensure OPENAI_API_KEY starts with sk- and is valid',
        'Rebuild application after configuring environment variables'
      ] : [
        'All environment variables are properly configured',
        'ChatWidget should be working correctly'
      ]
    })

  } catch (error) {
    console.error('Error in debug endpoint:', error)
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
