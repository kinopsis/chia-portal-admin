// DBA-Optimized Supabase client with direct createClient approach

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { config } from '../config'

// Singleton instance for connection pooling
let supabaseInstance: SupabaseClient | null = null

// DBA-style connection validation
function validateEnvironment() {
  const url = config.supabase.url
  const anonKey = config.supabase.anonKey

  console.log('🔍 [DBA] Environment validation:', {
    url: url ? `${url.substring(0, 30)}...` : '❌ MISSING',
    anonKey: anonKey ? `${anonKey.substring(0, 30)}...` : '❌ MISSING',
    urlValid: !!url && url.includes('supabase.co'),
    keyValid: !!anonKey && anonKey.startsWith('eyJ')
  })

  if (!url || !anonKey) {
    const error = '🚨 [DBA] CRITICAL: Supabase credentials missing. Check .env.local file.'
    console.error(error)
    throw new Error(error)
  }

  if (!url.includes('supabase.co')) {
    const error = '🚨 [DBA] CRITICAL: Invalid Supabase URL format'
    console.error(error)
    throw new Error(error)
  }

  if (!anonKey.startsWith('eyJ')) {
    const error = '🚨 [DBA] CRITICAL: Invalid Supabase anon key format'
    console.error(error)
    throw new Error(error)
  }

  return { url, anonKey }
}

// DBA-style client creation with connection monitoring
function createOptimizedSupabaseClient(): SupabaseClient {
  console.log('🔧 [DBA] Initializing Supabase connection...')

  const { url, anonKey } = validateEnvironment()

  try {
    // Always use browser client for consistent cookie handling
    if (typeof window !== 'undefined') {
      console.log('🔧 [DBA] Using browser SSR client with cookie support...')
      const client = createBrowserClient(url, anonKey)
      return client
    } else {
      // Fallback for server-side
      console.log('🔧 [DBA] Using server-side client...')
      const client = createClient(url, anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        global: {
          headers: {
            'X-Client-Info': 'chia-portal-admin@1.0.0',
            'X-Connection-Pool': 'singleton'
          },
        }
      })
      return client
    }

    // Deep validation of client structure
    if (!client) {
      throw new Error('🚨 [DBA] Client instantiation failed')
    }

    if (!client.auth) {
      throw new Error('🚨 [DBA] Auth module not initialized')
    }

    if (typeof client.auth.signInWithPassword !== 'function') {
      throw new Error('🚨 [DBA] signInWithPassword method not available')
    }

    if (typeof client.auth.signOut !== 'function') {
      throw new Error('🚨 [DBA] signOut method not available')
    }

    console.log('✅ [DBA] Supabase client initialized successfully')
    console.log('🔍 [DBA] Client methods available:', {
      signInWithPassword: typeof client.auth.signInWithPassword,
      signOut: typeof client.auth.signOut,
      getSession: typeof client.auth.getSession,
      getUser: typeof client.auth.getUser,
      onAuthStateChange: typeof client.auth.onAuthStateChange
    })

    return client
  } catch (error) {
    console.error('❌ [DBA] Client creation failed:', error)
    throw error
  }
}

// DBA-style singleton pattern with connection reuse
function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    console.log('🔄 [DBA] Creating new connection instance')
    supabaseInstance = createOptimizedSupabaseClient()
  } else {
    console.log('♻️ [DBA] Reusing existing connection')
  }
  return supabaseInstance
}

// Export direct client without wrapper (DBA best practice: minimal abstraction)
export const supabase = getSupabaseClient()

// Export the client as default for convenience
export default supabase
