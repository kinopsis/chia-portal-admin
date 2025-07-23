'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Input, Card, ErrorMessage, ProgressIndicator, ResponsiveContainer } from '@/components'
import { useAuth } from '@/hooks'
import { getPostLoginRedirect } from '@/utils/auth'

// Loading component for Suspense fallback
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-yellow/10 to-primary-green/10 py-mobile-lg xs:py-12 px-mobile-sm xs:px-6 lg:px-8">
      <ResponsiveContainer
        layout="stack"
        padding="adaptive"
        touchOptimized={true}
        className="max-w-sm xs:max-w-md w-full"
      >
        <div className="text-center space-y-mobile-sm xs:space-y-6">
          <div className="mx-auto w-12 h-12 xs:w-16 xs:h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-white text-xl xs:text-2xl font-bold" aria-hidden="true">🏛️</span>
          </div>
          <div>
            <h2 className="text-2xl xs:text-3xl font-bold text-gray-900">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-sm xs:text-base text-gray-600">
              Accede al Portal de Atención Ciudadana de Chía
            </p>
          </div>
        </div>

        <Card className="mt-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </ResponsiveContainer>
    </div>
  )
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function LoginContent() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-yellow/10 to-primary-green/10 py-mobile-lg xs:py-12 px-mobile-sm xs:px-6 lg:px-8">
      <ResponsiveContainer
        layout="stack"
        padding="adaptive"
        touchOptimized={true}
        className="max-w-sm xs:max-w-md w-full"
      >
        <div className="text-center space-y-mobile-sm xs:space-y-6">
          <div className="mx-auto w-12 h-12 xs:w-16 xs:h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-white text-xl xs:text-2xl font-bold" aria-hidden="true">🏛️</span>
          </div>
          <div>
            <h2 id="login-title" className="text-2xl xs:text-3xl font-bold text-gray-900">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-sm xs:text-base text-gray-600">
              Accede al Portal de Atención Ciudadana de Chía
            </p>
          </div>
        </div>

        <Card className="mt-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-labelledby="login-title"
            aria-describedby="login-description"
            noValidate
          >
            <div id="login-description" className="sr-only">
              Formulario de inicio de sesión para acceder al Portal de Atención Ciudadana
            </div>

            {error && (
              <ErrorMessage
                message="Error de inicio de sesión"
                context={error}
                type="validation"
                severity="error"
                showRetry={true}
                onRetry={() => setError('')}
                showDismiss={true}
                onDismiss={() => setError('')}
              />
            )}

            {redirecting && (
              <div
                className="bg-green-50 border border-green-200 rounded-lg p-mobile-sm xs:p-mobile-md"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center space-x-3">
                  <ProgressIndicator
                    type="dots"
                    size="sm"
                    color="success"
                    indeterminate={true}
                  />
                  <p className="text-sm xs:text-base text-green-600 font-medium">
                    ¡Inicio de sesión exitoso! Redirigiendo...
                  </p>
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
              aria-describedby="email-help"
              autoComplete="email"
            />
            <div id="email-help" className="sr-only">
              Ingresa tu dirección de correo electrónico registrada
            </div>

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              disabled={isSubmitting || redirecting}
              aria-describedby="password-help"
              autoComplete="current-password"
            />
            <div id="password-help" className="sr-only">
              Ingresa tu contraseña. Debe tener al menos 8 caracteres
            </div>

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
      </ResponsiveContainer>
    </div>
  )
}

// Main component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}
