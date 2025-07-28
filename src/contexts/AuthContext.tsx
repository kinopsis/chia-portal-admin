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
  signOut: () => Promise<void>
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

  useEffect(() => {
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
        }
      } catch (error) {
        console.warn('Error getting initial session:', error)
        // Set default values on error
        setSession(null)
        setUser(null)
        setUserProfile(null)
      } finally {
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
          // Only fetch profile if we don't have it or if it's a different user
          if (!userProfile || userProfile.id !== session.user.id) {
            await fetchUserProfile(session.user.id)
          }
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.warn('Error in auth state change:', error)
      } finally {
        // Only set loading to false if we're not in the middle of fetching profile
        if (!session?.user || userProfile?.id === session.user.id) {
          setLoading(false)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string, retryCount = 0, forceRefresh = false) => {
    // Check cache first (valid for 5 minutes)
    const cached = profileCache.current.get(userId)
    const cacheAge = cached ? Date.now() - cached.timestamp : Infinity
    const cacheValid = cacheAge < 5 * 60 * 1000 // 5 minutes

    if (cached && cacheValid && !forceRefresh) {
      console.log('📋 Using cached user profile for:', userId)
      setUserProfile(cached.profile)
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
        return
      }

      // Cache the profile
      profileCache.current.set(userId, {
        profile: data,
        timestamp: Date.now()
      })

      setUserProfile(data)
      console.log('✅ User profile loaded successfully:', {
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
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
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

  const signOut = async () => {
    await supabase.auth.signOut()
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
