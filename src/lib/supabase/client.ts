// Supabase client configuration for browser-side operations

import { createBrowserClient } from '@supabase/ssr'
import { config } from '../config'

// Safe client creation that handles missing environment variables
function createSafeSupabaseClient() {
  const url = config.supabase.url
  const anonKey = config.supabase.anonKey

  // If environment variables are missing, return a mock client for build time
  if (!url || !anonKey) {
    console.warn('Supabase environment variables are missing. Using mock client.')

    // Return a mock client that won't cause build failures
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        eq: () => ({ data: [], error: null }),
        order: () => ({ data: [], error: null }),
      }),
      auth: {
        signIn: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
    } as any
  }

  return createBrowserClient(url, anonKey)
}

// Create a single supabase client for interacting with your database
export const supabase = createSafeSupabaseClient()

// Export the client as default for convenience
export default supabase
