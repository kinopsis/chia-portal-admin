'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { User as AppUser, UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  userProfile: AppUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    userData: { nombre: string; apellido: string }
  ) => Promise<{ error: Error | null }>
  signOut: (scope?: 'global' | 'local' | 'others') => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: Error | null }>
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isFuncionario: boolean
  isCiudadano: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Cache for user profiles to avoid unnecessary refetches
  const profileCache = React.useRef<Map<string, { profile: AppUser; timestamp: number }>>(new Map())

  // Safety timeout to prevent infinite loading
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Safety timeout to prevent infinite loading (30 seconds)
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Auth loading timeout reached, forcing loading to false')
      setLoading(false)
    }, 30000)

    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.warn('Error getting initial session:', error)
        // Set default values on error
        setSession(null)
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes with error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('🔄 Auth state change:', event, session?.user?.id)

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Clear cache if switching to a different user
          if (userProfile && userProfile.id !== session.user.id) {
            console.log('🧹 [DBA] Clearing profile cache for user switch')
            profileCache.current.clear()
            setUserProfile(null)
          }

          // Only fetch profile if we don't have it or if it's a different user
          if (!userProfile || userProfile.id !== session.user.id) {
            // Don't set loading to false here - let fetchUserProfile handle it
            await fetchUserProfile(session.user.id)
          } else {
            // Validate single session before proceeding
            console.log('🔍 [DBA] Validating existing session...')
            const isValidSession = await validateSingleSession(session.user, userProfile)
            if (!isValidSession) {
              console.log('❌ [DBA] Session validation failed, user will be signed out')
              return // Exit early as signOut was called
            }

            // If we already have the profile for this user, we're done loading
            setLoading(false)
          }
        } else {
          // User signed out - clear everything
          console.log('🧹 Clearing all auth state on sign out')
          profileCache.current.clear()
          setUserProfile(null)
          setLoading(false) // No user, no loading needed
        }
      } catch (error) {
        console.warn('Error in auth state change:', error)
        setLoading(false) // Set loading to false on error
      }
    })

    return () => {
      subscription.unsubscribe()
      // Clear the loading timeout on cleanup
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  const fetchUserProfile = async (userId: string, retryCount = 0, forceRefresh = false) => {
    // Validate that this is still the current user to avoid race conditions
    // Allow fetch if user is null (during initial load) or if user matches
    if (user && user.id !== userId) {
      console.log('🚫 Skipping profile fetch - user changed during request')
      return
    }

    // Check cache first (valid for 5 minutes)
    const cached = profileCache.current.get(userId)
    const cacheAge = cached ? Date.now() - cached.timestamp : Infinity
    const cacheValid = cacheAge < 5 * 60 * 1000 // 5 minutes

    if (cached && cacheValid && !forceRefresh) {
      console.log('📋 Using cached user profile for:', userId)
      // Double-check user is still the same before setting profile
      if (user?.id === userId) {
        setUserProfile(cached.profile)
        setLoading(false) // Ensure loading is set to false when using cache
      }
      return
    }

    try {
      console.log('🔄 Fetching user profile for:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('id, email, nombre, rol, dependencia_id, activo, created_at, updated_at')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching user profile:', {
          error,
          userId,
          retryCount,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details
        })

        // Retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
          console.log(`⏳ Retrying user profile fetch in ${delay}ms (attempt ${retryCount + 1}/3)`)
          setTimeout(() => {
            fetchUserProfile(userId, retryCount + 1, forceRefresh)
          }, delay)
          return
        }

        // After 3 retries, set userProfile to null but keep user session
        console.error('❌ Failed to fetch user profile after 3 retries, setting profile to null')
        setUserProfile(null)
        setLoading(false) // CRITICAL: Set loading to false even on error

        // Clear the loading timeout since we're done (even with error)
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
        return
      }

      // Validate user is still the same before setting profile (race condition protection)
      // Allow update if user is null (during initial load) or if user matches
      if (user && user.id !== userId) {
        console.log('🚫 Skipping profile update - user changed during fetch')
        return
      }

      // Cache the profile
      profileCache.current.set(userId, {
        profile: data,
        timestamp: Date.now()
      })

      setUserProfile(data)

      // Validate single session after setting profile
      const currentUser = user || (await supabase.auth.getUser()).data.user
      if (currentUser) {
        console.log('🔍 [DBA] Validating session after profile load...')
        const isValidSession = await validateSingleSession(currentUser, data)
        if (!isValidSession) {
          console.log('❌ [DBA] Session validation failed after profile load, user will be signed out')
          return // Exit early as signOut was called
        }
      }

      setLoading(false) // CRITICAL: Set loading to false on success

      // Clear the loading timeout since we successfully loaded
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      console.log('✅ [DBA] User profile loaded and validated successfully:', {
        userId: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        activo: data.activo
      })
    } catch (error) {
      console.error('❌ Network/unexpected error fetching user profile:', {
        error,
        userId,
        retryCount,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error)
      })

      // Retry logic for network errors
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000
        console.log(`⏳ Retrying user profile fetch due to network error in ${delay}ms (attempt ${retryCount + 1}/3)`)
        setTimeout(() => {
          fetchUserProfile(userId, retryCount + 1, forceRefresh)
        }, delay)
      } else {
        console.error('❌ Failed to fetch user profile after 3 network retries, setting profile to null')
        setUserProfile(null)
        setLoading(false) // CRITICAL: Set loading to false even on network error

        // Clear the loading timeout since we're done (even with error)
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
      }
    }
  }

  // DBA-optimized function to clear all authentication tokens from browser storage
  const clearAllAuthTokens = async () => {
    try {
      console.log('🧹 [DBA] Starting comprehensive token cleanup...')

      // Clear localStorage with pattern matching
      const localStorageKeys = Object.keys(localStorage)
      let localCleared = 0
      localStorageKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('sb-')) {
          localStorage.removeItem(key)
          localCleared++
          console.log(`🗑️ [DBA] Removed localStorage key: ${key}`)
        }
      })

      // Clear sessionStorage with pattern matching
      const sessionStorageKeys = Object.keys(sessionStorage)
      let sessionCleared = 0
      sessionStorageKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('sb-')) {
          sessionStorage.removeItem(key)
          sessionCleared++
          console.log(`🗑️ [DBA] Removed sessionStorage key: ${key}`)
        }
      })

      // Clear cookies with comprehensive domain handling
      const cookies = document.cookie.split(';')
      let cookiesCleared = 0
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        if (name.includes('supabase') || name.includes('auth') || name.includes('session') || name.includes('sb-')) {
          // Clear cookie for current domain and all subdomains
          const domain = window.location.hostname
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${domain}`
          cookiesCleared++
          console.log(`🗑️ [DBA] Cleared cookie: ${name}`)
        }
      })

      console.log(`✅ [DBA] Token cleanup completed:`, {
        localStorageCleared: localCleared,
        sessionStorageCleared: sessionCleared,
        cookiesCleared: cookiesCleared,
        totalCleared: localCleared + sessionCleared + cookiesCleared
      })
    } catch (error) {
      console.error('❌ [DBA] Error during token cleanup:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Starting sign in process')

      // Input validation
      if (!email || !email.trim()) {
        console.log('❌ [AUTH] Email validation failed')
        return { error: new Error('El correo electrónico es requerido') }
      }

      if (!password || !password.trim()) {
        console.log('❌ [AUTH] Password validation failed')
        return { error: new Error('La contraseña es requerida') }
      }

      // Client validation with detailed debugging
      console.log('🔍 [AUTH] Validating Supabase client...')
      console.log('🔍 [AUTH] Client status:', {
        clientExists: !!supabase,
        authExists: !!supabase?.auth,
        signInMethodExists: typeof supabase?.auth?.signInWithPassword,
        clientType: supabase?.constructor?.name
      })

      if (!supabase) {
        const error = '🚨 [AUTH] Supabase client is null/undefined'
        console.error(error)
        throw new Error('Supabase client is not available')
      }

      if (!supabase.auth) {
        const error = '🚨 [AUTH] Supabase auth module is null/undefined'
        console.error(error)
        throw new Error('Supabase auth is not available')
      }

      if (typeof supabase.auth.signInWithPassword !== 'function') {
        const error = '🚨 [AUTH] signInWithPassword is not a function'
        console.error(error, typeof supabase.auth.signInWithPassword)
        throw new Error('signInWithPassword method is not available')
      }

      console.log('✅ [AUTH] Client validation passed, attempting sign in...')

      // CRITICAL: Force logout with global scope to terminate all existing sessions
      // This prevents concurrent session issues that cause user switching
      console.log('🔄 [DBA] Forcing logout before sign in to prevent concurrent sessions')
      try {
        await supabase.auth.signOut({ scope: 'global' })
        await clearAllAuthTokens()
        console.log('✅ [DBA] Forced logout completed before sign in')
      } catch (logoutError) {
        console.warn('⚠️ [DBA] Logout before sign in failed, continuing with sign in:', logoutError)
        // Continue with sign in even if logout fails
      }

      // Small delay to ensure logout is processed
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('🔐 [AUTH] Credentials:', {
        email: email.trim(),
        passwordLength: password.length,
        hasEmail: !!email.trim(),
        hasPassword: !!password
      })

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      // Detailed error analysis and translation
      if (error) {
        console.error('❌ [AUTH] Supabase signIn error:', {
          message: error.message,
          status: error.status,
          statusCode: error.status,
          name: error.name,
          details: error
        })

        let translatedMessage = error.message

        switch (error.message) {
          case 'missing email or phone':
            translatedMessage = 'El correo electrónico es requerido'
            break
          case 'Invalid login credentials':
            translatedMessage = 'Credenciales de acceso inválidas'
            break
          case 'Email not confirmed':
            translatedMessage = 'El correo electrónico no ha sido confirmado'
            break
          case 'Too many requests':
            translatedMessage = 'Demasiados intentos. Intenta de nuevo más tarde'
            break
          default:
            console.log('🔍 [AUTH] Untranslated error:', error.message)
            break
        }

        return { error: new Error(translatedMessage) }
      }

      console.log('✅ [AUTH] SignIn successful - authentication completed')
      return { error: null }
    } catch (error) {
      console.error('🚨 [AUTH] SignIn catch error - unexpected exception:', {
        message: (error as Error).message,
        name: (error as Error).name,
        stack: (error as Error).stack,
        errorType: typeof error,
        errorConstructor: (error as Error).constructor?.name
      })

      // Additional debugging for undefined/TypeError issues
      if (error instanceof TypeError && (error as Error).message.includes('undefined')) {
        console.error('🔍 [AUTH] TypeError debugging - client state:', {
          supabaseExists: !!supabase,
          authExists: !!supabase?.auth,
          signInMethodType: typeof supabase?.auth?.signInWithPassword,
          clientKeys: supabase ? Object.keys(supabase) : 'N/A',
          authKeys: supabase?.auth ? Object.keys(supabase.auth) : 'N/A'
        })
      }

      return { error: error as Error }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: { nombre: string; apellido: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: userData.nombre,
            apellido: userData.apellido,
          },
        },
      })

      if (error) {
        return { error }
      }

      // Create user profile in the users table
      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          nombre: userData.nombre,
          // apellido: userData.apellido, // Commented out due to missing column in database
          rol: 'ciudadano' as UserRole,
          activo: true,
        })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }



  // DBA-optimized function to validate and enforce single session per user
  const validateSingleSession = async (currentUser: any, currentProfile: any) => {
    try {
      // Skip validation if no user or profile
      if (!currentUser || !currentProfile) {
        console.log('🔍 [DBA] Skipping session validation - missing user or profile')
        return true
      }

      console.log('🔍 [DBA] Validating single session for user:', {
        userId: currentUser.id,
        profileId: currentProfile.id,
        userEmail: currentUser.email,
        profileName: currentProfile.nombre,
        userRole: currentProfile.rol
      })

      // CRITICAL: Ensure user ID matches profile ID
      if (currentUser.id !== currentProfile.id) {
        console.error('❌ [DBA] Session conflict detected: User ID mismatch', {
          authUserId: currentUser.id,
          profileUserId: currentProfile.id,
          conflict: 'USER_PROFILE_MISMATCH'
        })

        // Force logout to resolve conflict
        console.log('🚨 [DBA] Forcing logout due to session conflict')
        await signOut('global')
        return false
      }

      // Additional validation: Check if session is still valid in Supabase
      console.log('🔍 [DBA] Validating session with Supabase...')
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ [DBA] Error validating session with Supabase:', error)
        await signOut('global')
        return false
      }

      if (!session || session.user.id !== currentUser.id) {
        console.error('❌ [DBA] Session validation failed:', {
          hasSession: !!session,
          sessionUserId: session?.user?.id,
          currentUserId: currentUser.id,
          conflict: 'SESSION_USER_MISMATCH'
        })
        await signOut('global')
        return false
      }

      // Validate session freshness (optional - prevent stale sessions)
      const sessionAge = Date.now() - new Date(session.user.last_sign_in_at || 0).getTime()
      const maxSessionAge = 24 * 60 * 60 * 1000 // 24 hours

      if (sessionAge > maxSessionAge) {
        console.warn('⚠️ [DBA] Session is stale, forcing refresh:', {
          sessionAge: Math.round(sessionAge / (60 * 1000)),
          maxAgeMinutes: Math.round(maxSessionAge / (60 * 1000))
        })
        // Could implement session refresh here if needed
      }

      console.log('✅ [DBA] Single session validation passed')
      return true
    } catch (error) {
      console.error('❌ [DBA] Error during session validation:', error)
      await signOut('global')
      return false
    }
  }

  const signOut = async (scope: 'global' | 'local' | 'others' = 'global') => {
    try {
      console.log(`🚪 [DBA] Starting sign out with scope: ${scope}`)

      // Clear user state immediately to prevent UI inconsistencies
      setUser(null)
      setUserProfile(null)
      setSession(null)
      setLoading(true)

      // Clear cache
      profileCache.current.clear()

      // Validate Supabase client before attempting sign out
      if (!supabase || !supabase.auth) {
        console.warn('⚠️ [DBA] Supabase client not available, clearing local state only')
      } else {
        // Sign out from Supabase with specified scope
        console.log(`🔐 [DBA] Executing Supabase signOut with scope: ${scope}`)

        // Fix: Create proper scope object based on the scope parameter
        let signOutOptions: { scope?: 'global' | 'local' | 'others' } = {}
        if (scope === 'global' || scope === 'local' || scope === 'others') {
          signOutOptions = { scope }
        }

        const { error } = await supabase.auth.signOut(signOutOptions)
        if (error) {
          console.error('❌ [DBA] Supabase signOut error:', error)
          // Continue with cleanup even if signOut fails
        } else {
          console.log('✅ [DBA] Supabase signOut successful')
        }
      }

      // Clear all browser storage to ensure no tokens remain
      await clearAllAuthTokens()

      console.log('✅ [DBA] Sign out completed successfully')

    } catch (error) {
      console.error('❌ [DBA] Error during sign out process:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (!error) {
        // Invalidate cache and refresh user profile
        profileCache.current.delete(user.id)
        await fetchUserProfile(user.id, 0, true)
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const hasRole = (role: UserRole): boolean => {
    return userProfile?.rol === role
  }

  const isAdmin = hasRole('admin')
  const isFuncionario = hasRole('funcionario')
  const isCiudadano = hasRole('ciudadano')

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    hasRole,
    isAdmin,
    isFuncionario,
    isCiudadano,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
