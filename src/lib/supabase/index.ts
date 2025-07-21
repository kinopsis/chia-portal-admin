// Supabase exports for easy importing

export { default as supabase } from './client'
// export { createClient, createServiceRoleClient } from './server'
export { updateSession } from './middleware'

// Re-export Supabase types for convenience
export type {
  User,
  Session,
  AuthError,
  AuthResponse,
  AuthTokenResponse,
  UserResponse,
  WeakPassword,
  AuthOtpResponse,
  AuthTokenResponsePassword,
  SignInWithSSO,
  GenerateLinkResponse,
  AuthMFAChallengeResponse,
  AuthMFAAdminDeleteFactorResponse,
  AuthMFAAdminListFactorsResponse,
} from '@supabase/supabase-js'
