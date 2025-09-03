/**
 * Admin Services Management Page
 * Enhanced version using the same layout structure as /tramites page
 * with management actions for administrators
 *
 * Features:
 * - Visual consistency with public tramites page
 * - Full management actions (edit, delete, toggle, view, create)
 * - Advanced filtering system
 * - Admin-level permissions
 * - Responsive design
 */

'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal } from '@/components/atoms'
import { TramiteCardEnhancedGrid, ServiceEnhanced, TramiteManagementActions } from '@/components/molecules/TramiteCardEnhanced'
import { TramitesFilters } from '@/components/organisms/TramitesFilters/TramitesFilters'
import { UnifiedServiceForm } from '@/components/organisms/UnifiedServiceForm'
import { FilterOption } from '@/components/molecules/FilterChips/FilterChips'
import { PageHeader } from '@/components/layout'
import { RoleGuard } from '@/components/auth'
import type { BreadcrumbItem } from '@/components/molecules'
import { normalizeSpanishText } from '@/lib/utils'
import { dependenciasClientService } from '@/services/dependencias'
import { unifiedServicesService } from '@/services/unifiedServices'
import type { UpdateServiceData, CreateServiceData } from '@/services/unifiedServices'
import { subdependenciasClientService } from '@/services/subdependencias'
import { useAdminBreadcrumbs } from '@/hooks'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { transformUnifiedServiceToServiceEnhanced } from '@/utils/serviceTransformers'
import type { Dependencia, Subdependencia } from '@/types'

// Add these imports for export/import functionality
import ExportModal from '@/components/organisms/ExportModal'
import ImportModal from '@/components/organisms/ImportModal'
import type { ServiceEnhanced as ServiceEnhancedType } from '@/types'

const AdminServiciosPage: React.FC = () => {
  // Add state for export/import modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  
  // State management - handles both tramites and OPAs
  const [services, setServices] = useState<ServiceEnhancedType[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceEnhancedType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDependencias, setSelectedDependencias] = useState<string[]>([])
  const [selectedSubdependencias, setSelectedSubdependencias] = useState<string[]>([])
  const [selectedTipos, setSelectedTipos] = useState<string[]>([])
  const [selectedTiposPago, setSelectedTiposPago] = useState<string[]>([])

  // Filter options
  const [dependenciasOptions, setDependenciasOptions] = useState<FilterOption[]>([])
  const [subdependenciasOptions, setSubdependenciasOptions] = useState<FilterOption[]>([])
  const [dependenciasLoading, setDependenciasLoading] = useState(false)
  const [subdependenciasLoading, setSubdependenciasLoading] = useState(false)

  // Hooks
  const toast = useToastNotifications()

  // Management action states
  const [actionLoadingStates, setActionLoadingStates] = useState<{[key: string]: any}>({})
  const [actionErrorStates, setActionErrorStates] = useState<{[key: string]: any}>({})

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceEnhancedType | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form dependencies
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [subdependencias, setSubdependencias] = useState<Subdependencia[]>([])
  const [dependenciasFormLoading, setDependenciasFormLoading] = useState(false)
  const [subdependenciasFormLoading, setSubdependenciasFormLoading] = useState(false)

  // Breadcrumbs for admin
  const breadcrumbs = useAdminBreadcrumbs('servicios')

  // Static filter options
  const tipoOptions = [
    { value: '', label: 'Todos los servicios' },
    { value: 'tramite', label: 'Solo Trámites' },
    { value: 'opa', label: 'Solo OPAs' },
  ]

  const tiposPagoOptions = [
    { value: '', label: 'Todos los costos' },
    { value: 'true', label: 'Con costo' },
    { value: 'false', label: 'Gratuitos' },
  ]

  // Fetch unified services data (tramites and OPAs) - Admin gets all services
  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)

      // Admin can see all services (active and inactive) from servicios table
      const result = await unifiedServicesService.getAll({
        serviceType: 'both',
        activo: undefined, // Get both active and inactive services
        limit: 1000 // Get all services for admin management
      })

      // Transform UnifiedServiceItem[] to ServiceEnhanced[]
      const transformedServices = result.data.map(transformUnifiedServiceToServiceEnhanced)

      setServices(transformedServices)
      setFilteredServices(transformedServices)
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Error al cargar los servicios. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch dependencias for filters
  const fetchDependencias = async () => {
    try {
      setDependenciasLoading(true)
      const result = await dependenciasClientService.getAll()

      if (result.success) {
        const options: FilterOption[] = [
          { value: '', label: 'Todas las dependencias' },
          ...result.data.map(dep => ({
            value: dep.id,
            label: dep.nombre
          }))
        ]
        setDependenciasOptions(options)
      }
    } catch (err) {
      console.error('Error fetching dependencias:', err)
    } finally {
      setDependenciasLoading(false)
    }
  }

  // Fetch subdependencias for filters
  const fetchSubdependencias = async () => {
    try {
      setSubdependenciasLoading(true)
      const result = await subdependenciasClientService.getAll()

      if (result.success) {
        const options: FilterOption[] = [
          { value: '', label: 'Todas las subdependencias' },
          ...result.data.map(sub => ({
            value: sub.id,
            label: sub.nombre
          }))
        ]
        setSubdependenciasOptions(options)
      }
    } catch (err) {
      console.error('Error fetching subdependencias:', err)
    } finally {
      setSubdependenciasLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchServices()
    fetchDependencias()
    fetchSubdependencias()
    fetchFormDependencies()
  }, [])

  // Load form dependencies (for edit modal)
  const fetchFormDependencies = async () => {
    setDependenciasFormLoading(true)
    setSubdependenciasFormLoading(true)

    try {
      // Load dependencias for form
      const depResult = await dependenciasClientService.getAll()
      if (depResult.success) {
        setDependencias(depResult.data)
      }

      // FIXED: Use subdependenciasClientService.getAll() instead of dependenciasClientService.getSubdependencias()
      const subResult = await subdependenciasClientService.getAll({ limit: 1000 })
      if (subResult.success) {
        setSubdependencias(subResult.data)
      }
    } catch (error) {
      console.error('Error loading form dependencies:', error)
    } finally {
      setDependenciasFormLoading(false)
      setSubdependenciasFormLoading(false)
    }
  }

  // Filter services based on selected criteria
  useEffect(() => {
    let filtered = [...services]

    // Search query filter
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeSpanishText(searchQuery.toLowerCase())
      filtered = filtered.filter(service => {
        const normalizedNombre = normalizeSpanishText((service.nombre || '').toLowerCase())
        const normalizedDescripcion = normalizeSpanishText((service.descripcion || '').toLowerCase())
        const normalizedCodigo = normalizeSpanishText((service.codigo || '').toLowerCase())
        const normalizedDependencia = normalizeSpanishText((service.dependencia_nombre || '').toLowerCase())
        const normalizedSubdependencia = normalizeSpanishText((service.subdependencia_nombre || '').toLowerCase())

        return normalizedNombre.includes(normalizedQuery) ||
               normalizedDescripcion.includes(normalizedQuery) ||
               normalizedCodigo.includes(normalizedQuery) ||
               normalizedDependencia.includes(normalizedQuery) ||
               normalizedSubdependencia.includes(normalizedQuery)
      })
    }

    // Dependencias filter
    if (selectedDependencias.length > 0 && !selectedDependencias.includes('')) {
      filtered = filtered.filter(service =>
        selectedDependencias.includes(service.dependencia_id || '')
      )
    }

    // Subdependencias filter
    if (selectedSubdependencias.length > 0 && !selectedSubdependencias.includes('')) {
      filtered = filtered.filter(service =>
        selectedSubdependencias.includes(service.subdependencia_id || '')
      )
    }

    // Tipo filter
    if (selectedTipos.length > 0 && !selectedTipos.includes('')) {
      filtered = filtered.filter(service =>
        selectedTipos.includes(service.tipo_servicio)
      )
    }

    // Tipo pago filter
    if (selectedTiposPago.length > 0 && !selectedTiposPago.includes('')) {
      filtered = filtered.filter(service => {
        const tienePago = service.tiene_pago || service.requiere_pago || false
        return selectedTiposPago.includes(tienePago.toString())
      })
    }

    setFilteredServices(filtered)
  }, [services, searchQuery, selectedDependencias, selectedSubdependencias, selectedTipos, selectedTiposPago])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDependencias([])
    setSelectedSubdependencias([])
    setSelectedTipos([])
    setSelectedTiposPago([])
  }

  // Helper function to set loading state for specific action
  const setActionLoading = (serviceId: string, action: string, loading: boolean) => {
    setActionLoadingStates(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [action]: loading
      }
    }))
  }

  // Helper function to set error state for specific action
  const setActionError = (serviceId: string, action: string, error: string | undefined) => {
    setActionErrorStates(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [action]: error
      }
    }))
  }

  // Management action handlers
  const handleEdit = useCallback(async (service: ServiceEnhanced) => {
    console.log('Edit service:', service.nombre)
    setSelectedService(service)
    setIsEditModalOpen(true)
  }, [])

  const handleEditSubmit = useCallback(async (data: UpdateServiceData) => {
    if (!selectedService) {
      console.error('❌ No service selected for update')
      return
    }

    setFormLoading(true)
    try {
      console.log('🔧 Updating service:', selectedService.id, data)

      // Ensure the ID is included in the update data
      const updateDataWithId = {
        ...data,
        id: selectedService.id
      }

      // Real API call to update service
      const updatedService = await unifiedServicesService.update(updateDataWithId)

      // Update local state with real data from API
      setServices(prev => prev.map(s =>
        s.id === selectedService.id
          ? {
              ...s,
              nombre: updatedService.nombre,
              descripcion: updatedService.descripcion,
              codigo: updatedService.codigo,
              tiempo_respuesta: updatedService.tiempo_respuesta,
              requiere_pago: updatedService.requiere_pago,
              activo: updatedService.activo,
              requisitos: updatedService.requisitos,
              updated_at: updatedService.updated_at
            }
          : s
      ))

      setIsEditModalOpen(false)
      setSelectedService(null)

      // Show success notification
      console.log('✅ Service updated successfully:', updatedService.nombre)

    } catch (error) {
      console.error('❌ Error updating service:', error)
      setActionError(selectedService.id, 'edit', 'Error al actualizar el servicio')
    } finally {
      setFormLoading(false)
    }
  }, [selectedService])

  // Handle create form submission
  const handleCreateSubmit = useCallback(async (data: CreateServiceData) => {
    try {
      setFormLoading(true)
      console.log('Creating service:', data)

      // Create service using unified service
      const newUnifiedService = await unifiedServicesService.create(data)
      console.log('Service created successfully (raw):', newUnifiedService)

      // Transform to ServiceEnhanced format to prevent React rendering errors
      const newService = transformUnifiedServiceToServiceEnhanced(newUnifiedService)
      console.log('Service transformed to ServiceEnhanced:', newService)

      // Add to local state (prepend to show at top)
      setServices(prev => [newService, ...prev])

      // Close modal
      setIsCreateModalOpen(false)

      // Show success notification with service details
      toast.showServiceCreated(newService.nombre, newService.codigo)

      console.log('Service creation completed successfully')
    } catch (error: any) {
      console.error('Error creating service:', error)

      // Show user-friendly error notification
      const errorMessage = error?.message || 'Error desconocido al crear el servicio'
      toast.showServiceError('crear', data.nombre, errorMessage)
    } finally {
      setFormLoading(false)
    }
  }, [toast])

  const handleDelete = useCallback(async (service: ServiceEnhanced) => {
    setActionLoading(service.id, 'delete', true)
    setActionError(service.id, 'delete', undefined)

    try {
      console.log('Delete service:', service.nombre)

      // Real API call to delete service
      await unifiedServicesService.delete(service.id)

      // Remove from local state
      setServices(prev => prev.filter(s => s.id !== service.id))

      // Show success notification
      console.log('✅ Service deleted successfully:', service.nombre)

    } catch (error) {
      console.error('❌ Error deleting service:', error)
      setActionError(service.id, 'delete', 'Error al eliminar el servicio')
    } finally {
      setActionLoading(service.id, 'delete', false)
    }
  }, [])

  const handleToggle = useCallback(async (service: ServiceEnhanced, newState: boolean) => {
    setActionLoading(service.id, 'toggle', true)
    setActionError(service.id, 'toggle', undefined)

    try {
      console.log(`🔄 Toggle service ${service.nombre} to ${newState ? 'active' : 'inactive'}`)

      // Real API call to toggle service status
      const updatedService = await unifiedServicesService.toggleActive(service.id, newState)

      // Transform the updated service to ServiceEnhanced format
      const transformedService = transformUnifiedServiceToServiceEnhanced(updatedService)

      // Update local state with real data from API
      setServices(prev => prev.map(s =>
        s.id === service.id ? transformedService : s
      ))

      // Update filtered services as well
      setFilteredServices(prev => prev.map(s =>
        s.id === service.id ? transformedService : s
      ))

      // Show success notification
      toast.showServiceToggled(service.nombre, newState)
      console.log(`✅ Service ${newState ? 'activated' : 'deactivated'} successfully:`, service.nombre)

    } catch (error: any) {
      console.error('❌ Error toggling service:', error)
      const errorMessage = error.message || 'Error al cambiar el estado del servicio'
      setActionError(service.id, 'toggle', errorMessage)
      toast.showError(`Error al ${newState ? 'activar' : 'desactivar'} "${service.nombre}": ${errorMessage}`)
    } finally {
      setActionLoading(service.id, 'toggle', false)
    }
  }, [toast])

  // Management actions object
  const managementActions: TramiteManagementActions = {
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggle: handleToggle,
  }

  // Permissions for admin (full access)
  const adminPermissions = {
    edit: true,
    view: false,     // Removed: View functionality not needed in workflow
    duplicate: false, // Removed: Duplicate functionality not needed in workflow
    toggle: true,
    delete: true,    // Admins can delete services with confirmation
  }

  return (
    <RoleGuard allowedRoles={['admin', 'funcionario']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header with admin-specific title and breadcrumbs */}
        <PageHeader
          title="Gestión de Servicios - Administración"
          description="Administra todos los trámites y servicios administrativos (OPAs) del sistema"
          breadcrumbs={breadcrumbs}
          variant="admin"
          actions={
            <div className="flex space-x-2">
              {/* Export Button */}
              <Button
                variant="secondary"
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Exportar</span>
              </Button>
              
              {/* Import Button */}
              <Button
                variant="secondary"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <span>📤</span>
                <span>Importar</span>
              </Button>
              
              {/* Create Button */}
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Nuevo Servicio</span>
              </Button>
            </div>
          }
        />

        {/* Content */}
        <div className="container-custom py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Create Button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Crear Nuevo Servicio</span>
              </Button>
            </div>

            {/* Filters */}
            <TramitesFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              dependenciasOptions={dependenciasOptions}
              subdependenciasOptions={subdependenciasOptions}
              tipoOptions={tipoOptions}
              tiposPagoOptions={tiposPagoOptions}
              selectedDependencias={selectedDependencias}
              selectedSubdependencias={selectedSubdependencias}
              selectedTipos={selectedTipos}
              selectedTiposPago={selectedTiposPago}
              onDependenciasChange={setSelectedDependencias}
              onSubdependenciasChange={setSelectedSubdependencias}
              onTiposChange={setSelectedTipos}
              onTiposPagoChange={setSelectedTiposPago}
              dependenciasLoading={dependenciasLoading}
              subdependenciasLoading={subdependenciasLoading}
              totalResults={filteredServices.length}
              onClearFilters={clearFilters}
            />

            {/* Results with Full Admin Management Actions */}
            <TramiteCardEnhancedGrid
              tramites={filteredServices}
              loading={loading}
              error={error}
              context="admin"
              showManagementActions={true}
              actions={managementActions}
              userRole="admin"
              loadingStates={actionLoadingStates}
              errorStates={actionErrorStates}
              permissions={adminPermissions}
              defaultExpanded={false}
              emptyState={{
                title: 'No se encontraron servicios',
                description: 'Intenta ajustar los filtros de búsqueda para encontrar más resultados.',
                action: (
                  <Button variant="primary" onClick={clearFilters}>
                    Limpiar Filtros
                  </Button>
                )
              }}
              data-testid="admin-services-grid"
            />
          </div>
        </div>

        {/* Edit Service Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedService(null)
          }}
          title={selectedService ? `Editar ${selectedService.tipo === 'tramite' ? 'Trámite' : 'OPA'}: ${selectedService.nombre}` : 'Editar Servicio'}
          size="xl"
        >
          {selectedService && (
            <UnifiedServiceForm
              mode="edit"
              serviceType={selectedService.tipo} // FIXED: Use correct field name
              initialData={{
                id: selectedService.id,
                tipo: selectedService.tipo, // FIXED: Use correct field name
                codigo: selectedService.codigo,
                nombre: selectedService.nombre,
                descripcion: selectedService.descripcion,
                tiempo_respuesta: selectedService.tiempo_respuesta,
                tiene_pago: selectedService.requiere_pago,
                dependencia_id: selectedService.dependencia_id, // Add dependencia_id
                subdependencia_id: selectedService.subdependencia_id,
                categoria: selectedService.categoria || 'atencion_ciudadana',
                activo: selectedService.activo,
                requisitos: selectedService.requisitos,
                instrucciones: selectedService.instrucciones, // Include instrucciones
                formulario: selectedService.formulario,
                visualizacion_suit: selectedService.url_suit,
                visualizacion_gov: selectedService.url_gov
              }}
              dependencias={dependencias}
              subdependencias={subdependencias}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedService(null)
              }}
              loading={formLoading}
            />
          )}
        </Modal>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={
            <div className="flex items-center space-x-2">
              <span className="text-xl">➕</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Servicio</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Crea un nuevo trámite o servicio administrativo (OPA)
                </p>
              </div>
            </div>
          }
          size="xl"
        >
          <UnifiedServiceForm
            mode="create"
            dependencias={dependencias}
            subdependencias={subdependencias}
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={formLoading}
          />
        </Modal>

        {/* Export Modal */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          services={services}
          onExportComplete={() => {
            toast.showSuccess('Servicios exportados correctamente')
          }}
        />

        {/* Import Modal */}
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={() => {
            toast.showSuccess('Servicios importados correctamente')
            // Refresh the services list
            fetchServices()
          }}
        />

      </div>
    </RoleGuard>
  )
}

export default AdminServiciosPage
