'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Spinner } from '@/components/atoms'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/auth/login',
  fallback,
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push(redirectTo)
        return
      }

      // Check role requirements
      if (userProfile && (requiredRole || allowedRoles)) {
        const hasRequiredRole = requiredRole ? userProfile.rol === requiredRole : true
        const hasAllowedRole = allowedRoles ? allowedRoles.includes(userProfile.rol) : true

        if (!hasRequiredRole || !hasAllowedRole) {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [user, userProfile, loading, requiredRole, allowedRoles, redirectTo, router])

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      )
    )
  }

  // Not authenticated
  if (!user) {
    return null // Will redirect
  }

  // Check role requirements
  if (userProfile && (requiredRole || allowedRoles)) {
    const hasRequiredRole = requiredRole ? userProfile.rol === requiredRole : true
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(userProfile.rol) : true

    if (!hasRequiredRole || !hasAllowedRole) {
      return null // Will redirect
    }
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="admin" {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function FuncionarioRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={['funcionario', 'admin']} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function AuthenticatedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole' | 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props}>
      {children}
    </ProtectedRoute>
  )
}
