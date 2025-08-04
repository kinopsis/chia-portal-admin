/**
 * Unified Services Manager Component
 * Main component for managing both Trámites and OPAs with a single interface
 * 
 * Features:
 * - Unified data management
 * - Advanced filtering
 * - Multiple view modes (table/cards)
 * - Real-time metrics
 * - Bulk actions
 * - CRUD operations
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Card, Button, Badge, Modal, ConfirmDialog } from '@/components/atoms'
import { ToggleSwitch } from '@/components/atoms/ToggleSwitch'
import { TramitesFilters } from '@/components/organisms'
import { PageHeader } from '@/components/layout'

import { UnifiedMetrics } from '@/components/organisms/UnifiedMetrics'

import { UnifiedServiceForm } from '@/components/organisms/UnifiedServiceForm'
import { ServiceCardView } from './ServiceCardView'
import { useUnifiedServices } from '@/hooks/useUnifiedServices'
import { useServiceToggle } from '@/hooks/useServiceToggle'
import { useAdminBreadcrumbs, useFuncionarioBreadcrumbs, useAuth } from '@/hooks'
import type { UnifiedServiceItem, CreateServiceData, UpdateServiceData } from '@/services/unifiedServices'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate } from '@/utils'
import { clsx } from 'clsx'

export interface UnifiedServicesManagerProps {
  // Configuration
  serviceType?: 'tramite' | 'opa' | 'both'
  defaultServiceType?: 'tramite' | 'opa'
  
  // Features
  enableMetrics?: boolean
  enableAdvancedFilters?: boolean
  enableBulkActions?: boolean
  enableExport?: boolean
  
  // Permissions
  permissions?: {
    create?: boolean
    read?: boolean
    update?: boolean
    delete?: boolean
    export?: boolean
  }
  
  // UI
  showHeader?: boolean
  showBreadcrumbs?: boolean
  compactMode?: boolean
  className?: string
  
  // Callbacks
  onServiceTypeChange?: (type: 'tramite' | 'opa') => void
  onItemSelect?: (item: UnifiedServiceItem) => void
  onBulkAction?: (action: string, items: UnifiedServiceItem[]) => void
}

/**
 * UnifiedServicesManager component
 */
export const UnifiedServicesManager: React.FC<UnifiedServicesManagerProps> = ({
  serviceType = 'both',
  defaultServiceType = 'tramite',
  enableMetrics = true,
  enableAdvancedFilters = true,
  enableBulkActions = true,
  enableExport = true,
  permissions = {
    create: true,
    read: true,
    update: true,
    delete: true,
    export: true
  },
  showHeader = true,
  showBreadcrumbs = true,
  compactMode = false,
  className,
  onServiceTypeChange,
  onItemSelect,
  onBulkAction
}) => {
  // Get user profile to determine role
  const { userProfile } = useAuth()

  // Breadcrumbs - Use appropriate breadcrumbs based on user role
  const adminBreadcrumbs = useAdminBreadcrumbs('Servicios Unificados')
  const funcionarioBreadcrumbs = useFuncionarioBreadcrumbs()
  const breadcrumbs = userProfile?.rol === 'funcionario' ? funcionarioBreadcrumbs : adminBreadcrumbs

  // Unified services hook
  const {
    data,
    loading,
    error,
    metrics,
    pagination,
    filters,
    setFilters,
    clearFilters,
    dependencias,
    subdependencias,
    filteredSubdependencias,

    selectedItems,
    setSelectedItems,
    refresh,
    createItem,
    updateItem,
    deleteItem,
    bulkAction,
    goToPage,
    nextPage,
    prevPage,
    getItemById,
    isItemSelected,
    toggleItemSelection,
    selectAll,
    clearSelection
  } = useUnifiedServices({
    defaultServiceType: serviceType === 'both' ? defaultServiceType : serviceType,
    enableMetrics,
    pageSize: compactMode ? 10 : 20
  })

  // Service toggle hook
  const {
    toggleService,
    loadingStates,
    errorStates,
    clearError
  } = useServiceToggle({
    onSuccess: (item, newState) => {
      console.log(`SUCCESS: ${item.nombre} ${newState ? 'activado' : 'desactivado'}`)
      refresh() // Refresh data after successful toggle
    },
    onError: (error, item) => {
      console.error(`ERROR: Error toggling ${item.nombre}:`, error)
    }
  })



  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UnifiedServiceItem | null>(null)



  // Handle service type change
  const handleServiceTypeChange = useCallback((newServiceType: 'tramite' | 'opa' | 'both') => {
    setFilters({ serviceType: newServiceType })
    if (onServiceTypeChange && newServiceType !== 'both') {
      onServiceTypeChange(newServiceType)
    }
  }, [setFilters, onServiceTypeChange])



  // Handle item actions
  const handleEdit = useCallback((item: UnifiedServiceItem) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
    if (onItemSelect) {
      onItemSelect(item)
    }
  }, [onItemSelect])

  const handleView = useCallback((item: UnifiedServiceItem) => {
    // TODO: Implement view details modal or navigate to detail page
    console.log('View details for:', item.nombre)
    // For now, just open edit modal in read-only mode
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }, [])

  const handleDelete = useCallback((item: UnifiedServiceItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }, [])

  // Handle form submissions
  const handleCreateSubmit = useCallback(async (data: CreateServiceData) => {
    try {
      await createItem(data)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating service:', error)
    }
  }, [createItem])

  const handleEditSubmit = useCallback(async (data: UpdateServiceData) => {
    try {
      await updateItem(data)
      setIsEditModalOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error updating service:', error)
    }
  }, [updateItem])

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return

    try {
      await deleteItem(selectedItem.id, selectedItem.tipo_servicio)
      setIsDeleteDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }, [selectedItem, deleteItem])

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedItems.length === 0) return

    try {
      await bulkAction(action, selectedItems)
      clearSelection()
      if (onBulkAction) {
        onBulkAction(action, selectedItems)
      }
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }, [selectedItems, bulkAction, clearSelection, onBulkAction])

  // Filter options for TramitesFilters component
  const dependenciasOptions = dependencias.map(dep => ({
    value: dep.id,
    label: dep.nombre,
    count: undefined // Could be added later for better UX
  }))

  const subdependenciasOptions = filteredSubdependencias.map(sub => ({
    value: sub.id,
    label: sub.nombre,
    count: undefined
  }))

  const tipoOptions = [
    { value: 'tramite', label: 'Trámites', count: metrics?.tramites.total },
    { value: 'opa', label: 'OPAs', count: metrics?.opas.total }
  ]

  const tiposPagoOptions = [
    { value: 'gratuito', label: 'Gratuito', count: metrics?.combined.gratuitos },
    { value: 'con_pago', label: 'Con Pago', count: metrics?.combined.conPago }
  ]





  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      {showHeader && (
        <PageHeader
          title="Gestión Unificada de Servicios"
          description="Administra trámites y OPAs desde una interfaz unificada"
          breadcrumbs={showBreadcrumbs ? breadcrumbs : undefined}
          variant="admin"
          actions={
            permissions.create && (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <span>+</span>
                <span>Nuevo Servicio</span>
              </Button>
            )
          }
        />
      )}

      {/* Compact Metrics Section */}
      {enableMetrics && (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <UnifiedMetrics
            metrics={metrics}
            loading={loading}
            serviceType={filters.serviceType || 'both'}
            compact={true}
            simplified={true}
          />
        </div>
      )}

      {/* TramitesFilters Component - Same as /tramites page */}
      <TramitesFilters
        searchQuery={filters.query || ''}
        onSearchChange={(query) => setFilters({ query, page: 1 })}
        dependenciasOptions={dependenciasOptions}
        subdependenciasOptions={subdependenciasOptions}
        tipoOptions={tipoOptions}
        tiposPagoOptions={tiposPagoOptions}
        selectedDependencias={filters.dependencia_id ? [filters.dependencia_id] : []}
        selectedSubdependencias={filters.subdependencia_id ? [filters.subdependencia_id] : []}
        selectedTipos={filters.serviceType && filters.serviceType !== 'both' ? [filters.serviceType] : []}
        selectedTiposPago={filters.tipoPago && filters.tipoPago !== 'both' ? [filters.tipoPago] : []}
        onDependenciasChange={(values) => setFilters({
          dependencia_id: values[0] || '',
          subdependencia_id: '', // Reset subdependencia when dependencia changes
          page: 1
        })}
        onSubdependenciasChange={(values) => setFilters({
          subdependencia_id: values[0] || '',
          page: 1
        })}
        onTiposChange={(values) => setFilters({
          serviceType: values[0] as 'tramite' | 'opa' | 'both' || 'both',
          page: 1
        })}
        onTiposPagoChange={(values) => setFilters({
          tipoPago: values[0] as 'gratuito' | 'con_pago' | 'both' || 'both',
          page: 1
        })}
        dependenciasLoading={loading}
        subdependenciasLoading={loading}
        totalResults={pagination.total}
        onClearFilters={clearFilters}
      />

      {/* Bulk Actions Bar */}
      {enableBulkActions && selectedItems.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedItems.length} seleccionado{selectedItems.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="neutral"
                size="sm"
                onClick={() => handleBulkAction('activate')}
              >
                Activar
              </Button>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
              >
                Desactivar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Card>
      )}



      {/* Data Display - Card View Only */}
      <Card>
        <div className="p-4">
          <ServiceCardView
            items={data}
            loading={loading}
            error={error}
            onToggle={toggleService}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            loadingStates={loadingStates}
            errorStates={errorStates}
            onClearError={clearError}
            permissions={permissions}
          />

          {/* Pagination for card view */}
          {data.length > 0 && (
            <div className="flex justify-center mt-6 space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPage}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Página {pagination.page} de {Math.ceil((pagination.total || 0) / (pagination.limit || 1))}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPage}
                disabled={pagination.page >= Math.ceil((pagination.total || 0) / (pagination.limit || 1))}
              >
                Siguiente
              </Button>
            </div>
          )}


        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Servicio"
        size="xl"
      >
        <UnifiedServiceForm
          mode="create"
          serviceType={filters.serviceType !== 'both' ? filters.serviceType : undefined}
          dependencias={dependencias}
          subdependencias={subdependencias}
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedItem(null)
        }}
        title="Editar Servicio"
        size="xl"
      >
        {selectedItem && (
          <UnifiedServiceForm
            mode="edit"
            initialData={selectedItem}
            dependencias={dependencias}
            subdependencias={subdependencias}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedItem(null)
            }}
            loading={loading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedItem(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Servicio"
        message={
          selectedItem ? (
            <div>
              <p>¿Estás seguro de que deseas eliminar el siguiente servicio?</p>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedItem.nombre}</p>
                <p className="text-sm text-gray-600">Código: {selectedItem.codigo}</p>
                <p className="text-sm text-gray-600">
                  Tipo: {selectedItem.tipo === 'tramite' ? 'Trámite' : 'OPA'}
                </p>
              </div>
              <p className="mt-3 text-sm text-red-600">
                Esta acción no se puede deshacer.
              </p>
            </div>
          ) : null
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={loading}
      />
    </div>
  )
}

export default UnifiedServicesManager
