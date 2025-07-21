// Supabase client configuration for browser-side operations

import { createBrowserClient } from '@supabase/ssr'
import { config } from '../config'

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  config.supabase.url,
  config.supabase.anonKey
)

// Export the client as default for convenience
export default supabase
