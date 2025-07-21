'use client'

import { useAuth } from '@/hooks'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export default function RoleGuard({
  children,
  requiredRole,
  allowedRoles,
  fallback = null,
  requireAuth = true,
}: RoleGuardProps) {
  const { user, userProfile, loading } = useAuth()

  // Show loading state
  if (loading) {
    return <>{fallback}</>
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <>{fallback}</>
  }

  // If no role requirements, show content for authenticated users
  if (!requiredRole && !allowedRoles) {
    return requireAuth && user ? <>{children}</> : <>{fallback}</>
  }

  // Check role requirements
  if (userProfile) {
    const hasRequiredRole = requiredRole ? userProfile.rol === requiredRole : true
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(userProfile.rol) : true

    if (hasRequiredRole && hasAllowedRole) {
      return <>{children}</>
    }
  }

  return <>{fallback}</>
}

// Convenience components for specific roles
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard requiredRole="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function FuncionarioOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={['funcionario', 'admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function CiudadanoOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard requiredRole="ciudadano" fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AuthenticatedOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard requireAuth={true} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function GuestOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard requireAuth={false} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
