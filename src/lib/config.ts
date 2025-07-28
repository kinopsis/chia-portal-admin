// Application configuration for the Chía Portal

import { APP_CONFIG, FEATURE_FLAGS } from './constants'

// Environment variables with defaults
export const config = {
  // Application
  app: {
    name: APP_CONFIG.name,
    version: APP_CONFIG.version,
    description: APP_CONFIG.description,
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // OpenAI Configuration (for AI Chatbot)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  // Authentication
  auth: {
    jwtSecret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'), // 24 hours
    cookieName: process.env.COOKIE_NAME || 'chia-portal-session',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
    from: process.env.FROM_EMAIL || 'noreply@chia.gov.co',
    secure: process.env.SMTP_SECURE === 'true',
  },

  // Analytics and Monitoring
  monitoring: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
    sentryDsn: process.env.SENTRY_DSN || '',
    enableTracking: process.env.ENABLE_ANALYTICS === 'true',
  },

  // Feature Flags
  features: FEATURE_FLAGS,

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: parseInt(process.env.API_TIMEOUT || '10000'),
    retries: parseInt(process.env.API_RETRIES || '3'),
  },

  // File Upload
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ],
    uploadPath: process.env.UPLOAD_PATH || '/uploads',
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100'),
    enabled: process.env.CACHE_ENABLED !== 'false',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableConsole: process.env.LOG_CONSOLE !== 'false',
    enableFile: process.env.LOG_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },

  // Security
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    csrfEnabled: process.env.CSRF_ENABLED !== 'false',
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    httpsOnly: process.env.HTTPS_ONLY === 'true',
  },

  // Analytics Configuration - Sprint 2.1
  analytics: {
    enableTracking: process.env.ANALYTICS_ENABLED !== 'false',
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
    trackingDomain: process.env.ANALYTICS_DOMAIN || 'localhost',
    enableDebug: process.env.ANALYTICS_DEBUG === 'true',
    sessionTimeout: parseInt(process.env.ANALYTICS_SESSION_TIMEOUT || '1800000'), // 30 minutes
    enableSearchTracking: process.env.ANALYTICS_SEARCH_TRACKING !== 'false',
    enablePerformanceTracking: process.env.ANALYTICS_PERFORMANCE_TRACKING !== 'false',
  },
} as const

// Validation function to check required environment variables
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required Supabase configuration
  if (!config.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!config.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }

  // Check OpenAI configuration if AI features are enabled
  if (config.features.ENABLE_AI_CHATBOT && !config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required when AI chatbot is enabled')
  }

  // Check email configuration if notifications are enabled
  if (config.features.ENABLE_NOTIFICATIONS) {
    if (!config.email.host) {
      errors.push('SMTP_HOST is required when notifications are enabled')
    }
    if (!config.email.user) {
      errors.push('SMTP_USER is required when notifications are enabled')
    }
    if (!config.email.password) {
      errors.push('SMTP_PASS is required when notifications are enabled')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper function to get configuration for specific environment
export function getEnvConfig() {
  const isDevelopment = config.app.env === 'development'
  const isProduction = config.app.env === 'production'
  const isTest = config.app.env === 'test'

  return {
    isDevelopment,
    isProduction,
    isTest,
    isClient: typeof window !== 'undefined',
    isServer: typeof window === 'undefined',
  }
}

// Export default configuration
export default config
