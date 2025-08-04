'use client'

/**
 * UnifiedServiceCardGrid Component
 * 
 * Grid container for displaying multiple UnifiedServiceCard components
 * with consistent spacing, loading states, and responsive behavior.
 */

import React from 'react'
import { clsx } from 'clsx'
import { UnifiedServiceCard, UnifiedServiceCardSkeleton } from './'
import type { UnifiedServiceCardProps, UnifiedServiceData, ManagementActions } from './UnifiedServiceCard'

export interface UnifiedServiceCardGridProps {
  /** Array of services to display */
  services: UnifiedServiceData[]
  
  /** Management actions for all cards */
  actions?: ManagementActions
  
  /** User role for determining available actions */
  userRole?: 'admin' | 'funcionario' | 'ciudadano'
  
  /** Context where the cards are displayed */
  context?: 'public' | 'admin' | 'funcionario'
  
  /** Loading states for specific services */
  loadingStates?: Record<string, {
    toggle?: boolean
    edit?: boolean
    delete?: boolean
    view?: boolean
    duplicate?: boolean
  }>
  
  /** Error states for specific services */
  errorStates?: Record<string, {
    toggle?: string
    edit?: string
    delete?: string
    view?: string
    duplicate?: string
  }>
  
  /** Permissions for actions */
  permissions?: {
    edit?: boolean
    toggle?: boolean
    delete?: boolean
    view?: boolean
    duplicate?: boolean
  }
  
  /** Show loading skeleton */
  loading?: boolean
  
  /** Number of skeleton cards to show when loading */
  skeletonCount?: number
  
  /** Empty state content */
  emptyState?: React.ReactNode
  
  /** Additional CSS classes */
  className?: string
  
  /** Test ID for testing */
  'data-testid'?: string
}

export const UnifiedServiceCardGrid: React.FC<UnifiedServiceCardGridProps> = ({
  services,
  actions = {},
  userRole = 'ciudadano',
  context = 'public',
  loadingStates = {},
  errorStates = {},
  permissions = {},
  loading = false,
  skeletonCount = 6,
  emptyState,
  className,
  'data-testid': testId,
}) => {
  const showManagementActions = context !== 'public' && (userRole === 'admin' || userRole === 'funcionario')



  // Loading state
  if (loading) {
    return (
      <div className={clsx('space-y-4', className)} data-testid={testId}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <UnifiedServiceCardSkeleton
            key={index}
            showManagementActions={showManagementActions}
            showShimmer={true}
            data-testid={`skeleton-card-${index}`}
          />
        ))}
      </div>
    )
  }

  // Empty state
  if (services.length === 0) {
    if (emptyState) {
      return <div className={className} data-testid={testId}>{emptyState}</div>
    }

    return (
      <div className={clsx('text-center py-12', className)} data-testid={testId}>
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron servicios
        </h3>
        <p className="text-gray-600">
          No hay servicios que coincidan con los criterios seleccionados.
        </p>
      </div>
    )
  }

  // Services grid
  return (
    <div className={clsx('space-y-4', className)} data-testid={testId}>
      {services.map((service) => (
        <UnifiedServiceCard
          key={service.id}
          service={service}
          actions={actions}
          userRole={userRole}
          context={context}
          loadingStates={loadingStates[service.id] || {}}
          errorStates={errorStates[service.id] || {}}
          permissions={permissions}
          data-testid={`service-card-${service.id}`}
        />
      ))}
    </div>
  )
}

export default UnifiedServiceCardGrid
