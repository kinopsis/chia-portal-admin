import { NextRequest, NextResponse } from 'next/server'

/**
 * Health Check Endpoint
 * Usado por Docker y Coolify para verificar el estado de la aplicación
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que la aplicación esté funcionando
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.APP_ENV || 'production',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      features: {
        ai_chatbot: process.env.ENABLE_AI_CHATBOT === 'true',
        notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
        analytics: process.env.ENABLE_ANALYTICS === 'true',
      },
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}
