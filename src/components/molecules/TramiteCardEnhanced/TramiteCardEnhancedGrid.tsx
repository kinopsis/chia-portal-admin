'use client'

/**
 * TramiteCardEnhancedGrid Component
 * 
 * Grid container for displaying multiple TramiteCardEnhanced components
 * with loading states, empty states, and responsive behavior.
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Card, Button } from '@/components/atoms'
import { TramiteCardEnhanced, TramiteManagementActions } from './TramiteCardEnhanced'
import type { ServiceEnhanced } from '@/types'

export interface TramiteCardEnhancedGridProps {
  /** Array of services to display (tramites or OPAs) */
  tramites: ServiceEnhanced[]
  
  /** Whether sections are expanded by default */
  defaultExpanded?: boolean
  
  /** Whether to show management actions */
  showManagementActions?: boolean
  
  /** Context where the cards are displayed */
  context?: 'public' | 'admin' | 'funcionario'

  /** Management actions */
  actions?: TramiteManagementActions

  /** User role for determining available actions */
  userRole?: 'admin' | 'funcionario' | 'ciudadano'

  /** Loading states for specific actions */
  loadingStates?: {
    [serviceId: string]: {
      toggle?: boolean
      edit?: boolean
      delete?: boolean
      view?: boolean
      duplicate?: boolean
    }
  }

  /** Error states */
  errorStates?: {
    [serviceId: string]: {
      toggle?: string
      edit?: string
      delete?: string
      view?: string
      duplicate?: string
    }
  }

  /** Permissions for actions */
  permissions?: {
    edit?: boolean
    toggle?: boolean
    delete?: boolean
    view?: boolean
    duplicate?: boolean
  }

  /** Loading state */
  loading?: boolean
  
  /** Number of skeleton cards to show when loading */
  skeletonCount?: number
  
  /** Error message */
  error?: string
  
  /** Empty state configuration */
  emptyState?: {
    title?: string
    description?: string
    action?: React.ReactNode
  }
  
  /** Additional CSS classes */
  className?: string
  
  /** Test ID for testing */
  'data-testid'?: string
}

// Simple skeleton component for loading state
const TramiteCardEnhancedSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('p-6 animate-pulse', className)}>
    {/* Header skeleton */}
    <div className="mb-4">
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
      </div>
      
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
    
    {/* Footer skeleton */}
    <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="h-4 w-16 bg-gray-200 rounded mx-auto mb-1"></div>
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
      </div>
      <div className="text-center">
        <div className="h-4 w-16 bg-gray-200 rounded mx-auto mb-1"></div>
        <div className="h-6 w-12 bg-gray-200 rounded mx-auto"></div>
      </div>
      <div className="text-center">
        <div className="h-4 w-16 bg-gray-200 rounded mx-auto mb-1"></div>
        <div className="h-6 w-20 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>
  </Card>
)

export const TramiteCardEnhancedGrid: React.FC<TramiteCardEnhancedGridProps> = ({
  tramites,
  defaultExpanded = false,
  showManagementActions = false,
  context = 'public',
  actions = {},
  userRole = 'ciudadano',
  loadingStates = {},
  errorStates = {},
  permissions = {},
  loading = false,
  skeletonCount = 6,
  error,
  emptyState,
  className,
  'data-testid': testId,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-6', className)} data-testid={testId}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <TramiteCardEnhancedSkeleton
            key={index}
            className="animate-pulse"
          />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Error al cargar trámites
        </h3>
        <p className="text-gray-600 mb-4">
          {error}
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </Card>
    )
  }

  // Empty state
  if (tramites.length === 0) {
    const defaultEmptyState = {
      title: 'No hay trámites disponibles',
      description: 'No se encontraron trámites que coincidan con los criterios de búsqueda.',
      action: null
    }
    
    const finalEmptyState = { ...defaultEmptyState, ...emptyState }

    return (
      <Card className={cn('text-center py-12', className)}>
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {finalEmptyState.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {finalEmptyState.description}
        </p>
        {finalEmptyState.action}
      </Card>
    )
  }

  // Tramites grid
  return (
    <div className={cn('space-y-6', className)} data-testid={testId}>
      {tramites.map((tramite) => (
        <TramiteCardEnhanced
          key={tramite.id}
          tramite={tramite}
          defaultExpanded={defaultExpanded}
          showManagementActions={showManagementActions}
          context={context}
          actions={actions}
          userRole={userRole}
          loadingStates={loadingStates[tramite.id] || {}}
          errorStates={errorStates[tramite.id] || {}}
          permissions={permissions}
          data-testid={`tramite-card-${tramite.id}`}
        />
      ))}
    </div>
  )
}

export default TramiteCardEnhancedGrid
