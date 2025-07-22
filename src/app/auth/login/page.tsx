'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Input, Card } from '@/components'
import { useAuth } from '@/hooks'
import { getPostLoginRedirect } from '@/utils/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [redirecting, setRedirecting] = useState(false)

  // Use ref to track if redirect has been attempted to prevent multiple redirects
  const redirectAttempted = useRef(false)

  const { signIn, userProfile, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle redirect after successful authentication
  useEffect(() => {
    // Only attempt redirect if:
    // 1. User is authenticated
    // 2. User profile is loaded
    // 3. Auth context is not loading
    // 4. We haven't already attempted a redirect
    // 5. We're not currently submitting the form
    if (user && userProfile && !authLoading && !redirectAttempted.current && !isSubmitting) {
      console.log('🔄 Attempting redirect for user:', userProfile.email, 'with role:', userProfile.rol)

      redirectAttempted.current = true
      setRedirecting(true)

      const redirectTo = searchParams.get('redirectTo')
      const redirectPath = getPostLoginRedirect(userProfile.rol, redirectTo || undefined)

      console.log('🎯 Redirecting to:', redirectPath)

      // Use replace instead of push for smoother navigation
      router.replace(redirectPath)
    }
  }, [user, userProfile, authLoading, router, searchParams, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setRedirecting(false)
    redirectAttempted.current = false // Reset redirect flag for new login attempt

    console.log('🔐 Starting login process...')

    const { error } = await signIn(email, password)

    if (error) {
      console.error('❌ Login error:', error.message)
      setError(error.message)
      setIsSubmitting(false)
      redirectAttempted.current = false
    } else {
      console.log('✅ Login successful, waiting for profile to load...')
      // Don't set isSubmitting to false here - let the useEffect handle the redirect
      // The loading state will be managed by the redirect process
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-yellow/10 to-primary-green/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-6">
            <span className="text-white text-2xl font-bold">🏛️</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-gray-600">Accede al Portal de Atención Ciudadana de Chía</p>
        </div>

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {redirecting && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-3"></div>
                  <p className="text-sm text-green-600">¡Inicio de sesión exitoso! Redirigiendo...</p>
                </div>
              </div>
            )}

            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              fullWidth
              disabled={isSubmitting || redirecting}
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              disabled={isSubmitting || redirecting}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                  disabled={isSubmitting || redirecting}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>

              <Link
                href="/auth/forgot-password"
                className={`text-sm text-primary-green hover:text-primary-green-dark ${
                  isSubmitting || redirecting ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting || redirecting}
              disabled={isSubmitting || redirecting}
            >
              {redirecting
                ? 'Redirigiendo...'
                : isSubmitting
                  ? 'Iniciando sesión...'
                  : 'Iniciar Sesión'
              }
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿No tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting || redirecting}
                >
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terminos" className="text-primary-green hover:text-primary-green-dark">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacidad" className="text-primary-green hover:text-primary-green-dark">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
