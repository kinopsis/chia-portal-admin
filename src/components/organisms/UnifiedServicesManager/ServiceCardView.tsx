'use client'

/**
 * ServiceCardView Component
 * 
 * Mobile-optimized card view for services as an alternative to the table view.
 * Provides better UX on small screens with touch-friendly interactions.
 */

import React from 'react'
import { Badge, Card } from '@/components/atoms'
import { ToggleSwitch } from '@/components/atoms/ToggleSwitch'
import { UnifiedServiceCardGrid } from '@/components/molecules/UnifiedServiceCard'
import type { UnifiedServiceItem } from '@/services/unifiedServices'
import type { UnifiedServiceData, ManagementActions } from '@/components/molecules/UnifiedServiceCard'
import { formatDate } from '@/utils'
import { clsx } from 'clsx'

export interface ServiceCardViewProps {
  /** Array of service items to display */
  items: UnifiedServiceItem[]
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string | null
  /** Toggle service state */
  onToggle: (item: UnifiedServiceItem, newState?: boolean) => Promise<boolean>
  /** Edit service */
  onEdit: (item: UnifiedServiceItem) => void
  /** View service details */
  onView: (item: UnifiedServiceItem) => void
  /** Delete service */
  onDelete: (item: UnifiedServiceItem) => void
  /** Loading states by service ID */
  loadingStates?: Record<string, boolean>
  /** Error states by service ID */
  errorStates?: Record<string, string | null>
  /** Clear error for service */
  onClearError?: (serviceId: string) => void
  /** Permissions */
  permissions?: {
    update?: boolean
    delete?: boolean
  }
}

export const ServiceCardView: React.FC<ServiceCardViewProps> = ({
  items,
  loading = false,
  error,
  onToggle,
  onEdit,
  onView,
  onDelete,
  loadingStates = {},
  errorStates = {},
  onClearError,
  permissions = { update: true, delete: true }
}) => {


  // Convert UnifiedServiceItem to UnifiedServiceData format
  const convertToUnifiedServiceData = (items: UnifiedServiceItem[]): UnifiedServiceData[] => {
    const converted = items.map(item => ({
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      tipo: item.tipo_servicio as 'tramite' | 'opa',
      activo: item.activo,
      dependencia: item.dependencia?.nombre,
      subdependencia: item.subdependencia?.nombre,
      tiempo_estimado: item.tiempo_estimado,
      created_at: item.created_at,
      updated_at: item.updated_at,
      originalData: {
        tiene_pago: item.requiere_pago,
        requiere_pago: item.requiere_pago
      }
    }))



    return converted
  }

  // Management actions
  const actions: ManagementActions = {
    onToggle: onToggle ? (service, newState) => {
      const originalItem = items.find(item => item.id === service.id)
      if (originalItem) {
        onToggle(originalItem, newState)
      }
    } : undefined,
    onEdit: onEdit ? (service) => {
      const originalItem = items.find(item => item.id === service.id)
      if (originalItem) {
        onEdit(originalItem)
      }
    } : undefined,
    onView: onView ? (service) => {
      const originalItem = items.find(item => item.id === service.id)
      if (originalItem) {
        onView(originalItem)
      }
    } : undefined,
    onDelete: onDelete ? (service) => {
      const originalItem = items.find(item => item.id === service.id)
      if (originalItem) {
        onDelete(originalItem)
      }
    } : undefined
  }

  // Convert loading states
  const convertedLoadingStates: Record<string, any> = {}
  Object.entries(loadingStates).forEach(([serviceId, isLoading]) => {
    convertedLoadingStates[serviceId] = {
      toggle: isLoading,
      edit: false,
      delete: false,
      view: false
    }
  })

  // Convert error states
  const convertedErrorStates: Record<string, any> = {}
  Object.entries(errorStates).forEach(([serviceId, error]) => {
    convertedErrorStates[serviceId] = {
      toggle: error,
      edit: null,
      delete: null,
      view: null
    }
  })
  // Use the unified card grid for consistent display
  return (
    <UnifiedServiceCardGrid
      services={convertToUnifiedServiceData(items)}
      actions={actions}
      context="admin"
      userRole="admin"
      loading={loading}
      loadingStates={convertedLoadingStates}
      errorStates={convertedErrorStates}
      permissions={{
        edit: permissions.update,
        toggle: permissions.update,
        delete: permissions.delete,
        view: true,
        duplicate: permissions.update
      }}
      emptyState={
        error ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar servicios
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green/90 transition-colors"
              >
                Reintentar
              </button>
            )}
          </Card>
        ) : (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay servicios
            </h3>
            <p className="text-gray-600">
              No se encontraron servicios que coincidan con los filtros seleccionados.
            </p>
          </Card>
        )
      }
      data-testid="unified-services-card-view"
    />
  )
}

export default ServiceCardView
