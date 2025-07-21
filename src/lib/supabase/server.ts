// Supabase client configuration for server-side operations

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config } from '../config'

// Create a server-side Supabase client
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Create a service role client for admin operations
export function createServiceRoleClient() {
  if (!config.supabase.serviceRoleKey) {
    throw new Error('Service role key is required for admin operations')
  }

  return createServerClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for service role client
        },
      },
    }
  )
}
