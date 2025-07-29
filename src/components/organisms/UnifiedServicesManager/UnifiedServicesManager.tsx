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
import { PageHeader } from '@/components/layout'
import { DataTable } from '@/components/organisms'
import { UnifiedMetrics } from '@/components/organisms/UnifiedMetrics'
import { UnifiedFilters } from '@/components/organisms/UnifiedFilters'
import { UnifiedServiceForm } from '@/components/organisms/UnifiedServiceForm'
import { useUnifiedServices } from '@/hooks/useUnifiedServices'
import { useAdminBreadcrumbs } from '@/hooks'
import type { UnifiedServiceItem, CreateServiceData, UpdateServiceData } from '@/services/unifiedServices'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate } from '@/utils'
import { clsx } from 'clsx'

export interface UnifiedServicesManagerProps {
  // Configuration
  serviceType?: 'tramite' | 'opa' | 'both'
  defaultServiceType?: 'tramite' | 'opa'
  viewMode?: 'table' | 'cards' | 'hybrid'
  defaultViewMode?: 'table' | 'cards'
  
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
  onViewModeChange?: (mode: 'table' | 'cards') => void
  onItemSelect?: (item: UnifiedServiceItem) => void
  onBulkAction?: (action: string, items: UnifiedServiceItem[]) => void
}

/**
 * UnifiedServicesManager component
 */
export const UnifiedServicesManager: React.FC<UnifiedServicesManagerProps> = ({
  serviceType = 'both',
  defaultServiceType = 'tramite',
  viewMode = 'hybrid',
  defaultViewMode = 'table',
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
  onViewModeChange,
  onItemSelect,
  onBulkAction
}) => {
  // Breadcrumbs
  const breadcrumbs = useAdminBreadcrumbs('Servicios Unificados')

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
    viewMode: currentViewMode,
    setViewMode,
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
    defaultViewMode,
    enableMetrics,
    pageSize: compactMode ? 10 : 20
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

  // Handle view mode change
  const handleViewModeChange = useCallback((newViewMode: 'table' | 'cards') => {
    setViewMode(newViewMode)
    if (onViewModeChange) {
      onViewModeChange(newViewMode)
    }
  }, [setViewMode, onViewModeChange])

  // Handle item actions
  const handleEdit = useCallback((item: UnifiedServiceItem) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
    if (onItemSelect) {
      onItemSelect(item)
    }
  }, [onItemSelect])

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
      await deleteItem(selectedItem.id, selectedItem.tipo)
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

  // Table columns configuration
  const columns: Column<UnifiedServiceItem>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      render: (value, record) => (
        <div className="font-mono text-sm">
          {value}
        </div>
      )
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {record.descripcion && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {record.descripcion}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'tipo',
      title: 'Tipo',
      align: 'center',
      render: (value, record) => (
        <Badge 
          variant={value === 'tramite' ? 'primary' : 'secondary'}
          size="sm"
        >
          {value === 'tramite' ? '📄 Trámite' : '⚡ OPA'}
        </Badge>
      )
    },
    {
      key: 'dependencia',
      title: 'Dependencia',
      render: (value, record) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value.nombre}</div>
          <div className="text-gray-500">{record.subdependencia.nombre}</div>
        </div>
      )
    },
    {
      key: 'tiene_pago',
      title: 'Pago',
      align: 'center',
      render: (value, record) => (
        <Badge 
          variant={value ? 'warning' : 'success'}
          size="sm"
        >
          {value ? '💰 Con pago' : '🆓 Gratuito'}
        </Badge>
      )
    },
    {
      key: 'activo',
      title: 'Estado',
      align: 'center',
      render: (value, record) => (
        <Badge 
          variant={value ? 'success' : 'danger'}
          size="sm"
        >
          {value ? '✅ Activo' : '❌ Inactivo'}
        </Badge>
      )
    },
    {
      key: 'updated_at',
      title: 'Actualizado',
      sortable: true,
      render: (value, record) => (
        <span className="text-sm text-gray-500">
          {formatDate(value)}
        </span>
      )
    }
  ]

  // Row actions
  const rowActions = [
    {
      key: 'edit',
      label: 'Editar',
      icon: '✏️',
      onClick: handleEdit,
      disabled: !permissions.update
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      onClick: handleDelete,
      disabled: !permissions.delete,
      variant: 'danger' as const
    }
  ]

  // Service type tabs
  const serviceTypeTabs = [
    { key: 'both', label: 'Todos', count: metrics?.combined.total || 0 },
    { key: 'tramite', label: 'Trámites', count: metrics?.tramites.total || 0 },
    { key: 'opa', label: 'OPAs', count: metrics?.opas.total || 0 }
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
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <Button
                  variant={currentViewMode === 'table' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('table')}
                  className="rounded-none"
                >
                  📊 Tabla
                </Button>
                <Button
                  variant={currentViewMode === 'cards' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('cards')}
                  className="rounded-none"
                >
                  🗃️ Cards
                </Button>
              </div>

              {/* Create Button */}
              {permissions.create && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Nuevo Servicio</span>
                </Button>
              )}
            </div>
          }
        />
      )}

      {/* Service Type Tabs */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {serviceTypeTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={filters.serviceType === tab.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleServiceTypeChange(tab.key as any)}
                className="flex items-center space-x-2"
              >
                <span>{tab.label}</span>
                <Badge variant="secondary" size="xs">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Bulk Actions */}
          {enableBulkActions && selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} seleccionado{selectedItems.length !== 1 ? 's' : ''}
              </span>
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
          )}
        </div>
      </Card>

      {/* Metrics */}
      {enableMetrics && (
        <UnifiedMetrics
          metrics={metrics}
          loading={loading}
          serviceType={filters.serviceType || 'both'}
          compact={compactMode}
        />
      )}

      {/* Filters */}
      {enableAdvancedFilters && (
        <UnifiedFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          dependencias={dependencias}
          subdependencias={filteredSubdependencias}
          loading={loading}
        />
      )}

      {/* Data Display */}
      <Card>
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          error={error}
          rowActions={rowActions}
          searchPlaceholder="Buscar servicios..."
          showSearchAndFilters={false} // Using custom filters above
          enableSelection={enableBulkActions}
          selectedRows={selectedItems}
          onSelectionChange={setSelectedItems}
          emptyStateProps={{
            title: 'No hay servicios',
            description: 'No se encontraron servicios con los filtros aplicados.',
            action: permissions.create ? (
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                Crear Primer Servicio
              </Button>
            ) : undefined
          }}
          pagination={{
            current: pagination.page,
            total: pagination.total,
            pageSize: pagination.limit,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: goToPage
          }}
        />
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
