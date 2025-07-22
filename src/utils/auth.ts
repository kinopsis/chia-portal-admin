// Authentication utility functions

import type { UserRole } from '@/types'
import { ROLE_DEFAULT_ROUTES } from '@/lib/constants'

/**
 * Get the default redirect path for a user based on their role
 * @param role - The user's role
 * @param fallback - Fallback route if role is not found (default: '/dashboard')
 * @returns The redirect path for the user's role
 */
export function getRoleBasedRedirectPath(role: UserRole, fallback: string = '/dashboard'): string {
  return ROLE_DEFAULT_ROUTES[role] || fallback
}

/**
 * Check if a user has permission to access a specific route based on their role
 * @param userRole - The user's role
 * @param requiredRole - The required role for the route
 * @param allowedRoles - Array of allowed roles for the route
 * @returns True if user has permission, false otherwise
 */
export function hasRoutePermission(
  userRole: UserRole,
  requiredRole?: UserRole,
  allowedRoles?: UserRole[]
): boolean {
  if (requiredRole && userRole !== requiredRole) {
    return false
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return false
  }
  
  return true
}

/**
 * Get the appropriate redirect URL after successful authentication
 * @param userRole - The user's role
 * @param redirectTo - Optional specific redirect URL from query params
 * @returns The final redirect URL
 */
export function getPostLoginRedirect(userRole: UserRole, redirectTo?: string): string {
  // If there's a specific redirect URL requested, validate it's appropriate for the user's role
  if (redirectTo) {
    // Admin users can access any route
    if (userRole === 'admin') {
      return redirectTo
    }
    
    // Funcionario users can access funcionario and general routes
    if (userRole === 'funcionario' && !redirectTo.startsWith('/admin')) {
      return redirectTo
    }
    
    // Ciudadano users can only access general routes (not admin or funcionario)
    if (userRole === 'ciudadano' && !redirectTo.startsWith('/admin') && !redirectTo.startsWith('/funcionario')) {
      return redirectTo
    }
  }
  
  // Default to role-based redirect
  return getRoleBasedRedirectPath(userRole)
}
