/**
 * Funcionarios Services Management Page
 * Enhanced version using the same layout structure as /tramites page
 * with streamlined management actions for funcionarios
 *
 * Features:
 * - Visual consistency with public tramites page
 * - Core management actions (edit, delete, toggle)
 * - Inline editing modal (consistent with other funcionario pages)
 * - Advanced filtering system
 * - Role-based permissions
 * - Simplified interface focusing on essential workflow
 */

'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal } from '@/components/atoms'
import { TramiteCardEnhancedGrid, ServiceEnhanced, TramiteManagementActions } from '@/components/molecules/TramiteCardEnhanced'
import { TramitesFilters } from '@/components/organisms/TramitesFilters/TramitesFilters'
import { UnifiedServiceForm } from '@/components/organisms/UnifiedServiceForm'
import ServiceFormErrorBoundary from '@/components/organisms/ServiceFormErrorBoundary/ServiceFormErrorBoundary'
import { FilterOption } from '@/components/molecules/FilterChips/FilterChips'
import { PageHeader } from '@/components/layout'
import { RoleGuard } from '@/components/auth'
import type { BreadcrumbItem } from '@/components/molecules'
import { unifiedServicesService } from '@/services/unifiedServices'
import type { UpdateServiceData, CreateServiceData } from '@/services/unifiedServices'
import { normalizeSpanishText } from '@/lib/utils'
import { dependenciasClientService } from '@/services/dependencias'
import { subdependenciasClientService } from '@/services/subdependencias'
import { useFuncionarioBreadcrumbs, useAuth } from '@/hooks'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { transformUnifiedServiceToServiceEnhanced } from '@/utils/serviceTransformers'
import type { Dependencia, Subdependencia } from '@/types'

const FuncionariosServiciosPage: React.FC = () => {
  // State management - handles both tramites and OPAs
  const [services, setServices] = useState<ServiceEnhanced[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceEnhanced[]>([])
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

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceEnhanced | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Dependencies for form
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [subdependencias, setSubdependencias] = useState<Subdependencia[]>([])
  const [dependenciasFormLoading, setDependenciasFormLoading] = useState(false)

  // Management actions state
  const [actionLoadingStates, setActionLoadingStates] = useState<{
    [serviceId: string]: {
      toggle?: boolean
      edit?: boolean
      delete?: boolean
      view?: boolean
      duplicate?: boolean
    }
  }>({})

  const [actionErrorStates, setActionErrorStates] = useState<{
    [serviceId: string]: {
      toggle?: string
      edit?: string
      delete?: string
      view?: string
      duplicate?: string
    }
  }>({})

  // Breadcrumbs and auth
  const breadcrumbs = useFuncionarioBreadcrumbs()
  const { user } = useAuth()

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

  // Fetch unified services data (tramites and OPAs)
  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use unified service to get both tramites and OPAs from servicios table
      const result = await unifiedServicesService.getAll({
        serviceType: 'both',
        activo: true,
        limit: 1000 // Get all active services for management
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

  // Fetch dependencies for form
  const fetchDependencies = async () => {
    try {
      setDependenciasFormLoading(true)

      const [depResponse, subResponse] = await Promise.all([
        dependenciasClientService.getAll(),
        subdependenciasClientService.getAll({ limit: 1000 })
      ])

      setDependencias(depResponse.data)
      setSubdependencias(subResponse.data)
    } catch (err) {
      console.error('Error fetching dependencies:', err)
    } finally {
      setDependenciasFormLoading(false)
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
    fetchDependencies()
  }, [])

  // Filter services based on selected criteria
  useEffect(() => {
    try {
      let filtered = [...services]

      // Search query filter
      if (searchQuery.trim()) {
        const normalizedQuery = normalizeSpanishText(searchQuery.toLowerCase())
        filtered = filtered.filter(service => {
          const normalizedNombre = normalizeSpanishText(service.nombre.toLowerCase())
          const normalizedDescripcion = normalizeSpanishText((service.descripcion || '').toLowerCase())
          const normalizedCodigo = normalizeSpanishText((service.codigo || '').toLowerCase())
          // Fix field name: use service.dependencia instead of service.dependencia_nombre
          const normalizedDependencia = normalizeSpanishText((service.dependencia || '').toLowerCase())
          const normalizedSubdependencia = normalizeSpanishText((service.subdependencia || '').toLowerCase())

          return normalizedNombre.includes(normalizedQuery) ||
                 normalizedDescripcion.includes(normalizedQuery) ||
                 normalizedCodigo.includes(normalizedQuery) ||
                 normalizedDependencia.includes(normalizedQuery) ||
                 normalizedSubdependencia.includes(normalizedQuery)
        })
      }

      // Dependencias filter with error handling
      if (selectedDependencias.length > 0 && !selectedDependencias.includes('')) {
        filtered = filtered.filter(service => {
          const serviceDependenciaId = service.dependencia_id || ''
          const isMatch = selectedDependencias.includes(serviceDependenciaId)

          // Debug logging for filter issues
          if (process.env.NODE_ENV === 'development' && !isMatch && serviceDependenciaId) {
            console.log('🔍 Filter debug - Service not matching:', {
              serviceName: service.nombre,
              serviceDependenciaId,
              selectedDependencias,
              dependenciaName: service.dependencia
            })
          }

          return isMatch
        })
      }

      // Subdependencias filter with error handling
      if (selectedSubdependencias.length > 0 && !selectedSubdependencias.includes('')) {
        filtered = filtered.filter(service => {
          const serviceSubdependenciaId = service.subdependencia_id || ''
          return selectedSubdependencias.includes(serviceSubdependenciaId)
        })
      }

      // Tipo filter with error handling
      if (selectedTipos.length > 0 && !selectedTipos.includes('')) {
        filtered = filtered.filter(service => {
          // Fix field name: use service.tipo instead of service.tipo_servicio for ServiceEnhanced
          const serviceTipo = service.tipo || service.tipo_servicio || ''
          return selectedTipos.includes(serviceTipo)
        })
      }

      // Tipo pago filter with error handling
      if (selectedTiposPago.length > 0 && !selectedTiposPago.includes('')) {
        filtered = filtered.filter(service => {
          const tienePago = service.tiene_pago || service.requiere_pago || false
          return selectedTiposPago.includes(tienePago.toString())
        })
      }

      setFilteredServices(filtered)
    } catch (error) {
      console.error('Error filtering services:', error)
      // On error, show all services to prevent empty state
      setFilteredServices(services)
    }
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

  // Handle edit form submission
  const handleEditSubmit = useCallback(async (data: UpdateServiceData) => {
    if (!selectedService) {
      console.error('❌ No service selected for update')
      return
    }

    try {
      setFormLoading(true)
      console.log('🔧 Starting service update...')
      console.log('🔧 Selected service ID:', selectedService.id)
      console.log('🔧 Update data:', data)

      // Ensure the ID is included in the update data
      const updateDataWithId = {
        ...data,
        id: selectedService.id
      }

      // Update service using unified service
      const updatedUnifiedService = await unifiedServicesService.update(updateDataWithId)
      console.log('✅ Service updated successfully (raw):', updatedUnifiedService)

      // Transform to ServiceEnhanced format to prevent React rendering errors
      const updatedService = transformUnifiedServiceToServiceEnhanced(updatedUnifiedService)
      console.log('✅ Service transformed to ServiceEnhanced:', updatedService)

      // Update local state with transformed service
      setServices(prev => prev.map(s =>
        s.id === selectedService.id ? updatedService : s
      ))

      // Close modal and reset state
      setIsEditModalOpen(false)
      setSelectedService(null)

      // Show success notification
      toast.showServiceUpdated(updatedService.nombre)

      console.log('✅ Service update completed successfully')
    } catch (error: any) {
      console.error('❌ Error updating service:', error)

      // Show user-friendly error notification
      const errorMessage = error?.message || 'Error desconocido al actualizar el servicio'
      toast.showServiceError('actualizar', selectedService.nombre, errorMessage)
    } finally {
      setFormLoading(false)
    }
  }, [selectedService, toast])

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
    console.log('Delete service:', service.nombre)
    setActionLoading(service.id, 'delete', true)
    setActionError(service.id, 'delete', undefined)

    try {
      // Remove from local state immediately for better UX
      setServices(prev => prev.filter(s => s.id !== service.id))
      setFilteredServices(prev => prev.filter(s => s.id !== service.id))

      // Real API call to delete service
      await unifiedServicesService.delete(service.id)

      // Show success notification
      toast.showServiceDeleted(service.nombre)
      console.log(`✅ Service "${service.nombre}" deleted successfully`)

    } catch (error: any) {
      console.error('Error deleting service:', error)
      setActionError(service.id, 'delete', 'Error al eliminar el servicio')

      // Show error notification
      const errorMessage = error?.message || 'Error desconocido al eliminar el servicio'
      toast.showServiceError('eliminar', service.nombre, errorMessage)

      // Restore the service in case of error
      setServices(prev => [...prev, service])
      setFilteredServices(prev => [...prev, service])
    } finally {
      setActionLoading(service.id, 'delete', false)
    }
  }, [toast])

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

  // Permissions for funcionarios (simplified to core actions)
  const funcionarioPermissions = {
    edit: true,
    view: false,     // Removed: View functionality not needed in workflow
    duplicate: false, // Removed: Duplicate functionality not needed in workflow
    toggle: true,
    delete: true,    // Funcionarios can delete services with confirmation
  }

  return (
    <RoleGuard allowedRoles={['admin', 'funcionario']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header with funcionario-specific title and breadcrumbs */}
        <PageHeader
          title="Gestión de Servicios - Funcionarios"
          description="Administra trámites y servicios administrativos (OPAs) de tu dependencia"
          breadcrumbs={breadcrumbs}
          variant="admin"
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

            {/* Results with Management Actions */}
            <TramiteCardEnhancedGrid
              tramites={filteredServices}
              loading={loading}
              error={error}
              context="funcionario"
              showManagementActions={true}
              actions={managementActions}
              userRole="funcionario"
              loadingStates={actionLoadingStates}
              errorStates={actionErrorStates}
              permissions={funcionarioPermissions}
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
              data-testid="funcionarios-services-grid"
            />
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedService(null)
          }}
          title={
            <div className="flex items-center space-x-2">
              <span className="text-xl">✏️</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Editar Servicio</h3>
                {selectedService && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedService.codigo} - {selectedService.nombre}
                  </p>
                )}
              </div>
            </div>
          }
          size="xl"
        >
          {selectedService && (
            <ServiceFormErrorBoundary
              onError={(error, errorInfo) => {
                console.error('Service edit form error:', error, errorInfo)
                toast.showError(
                  'Error en el formulario',
                  'Ha ocurrido un error al procesar el formulario de edición'
                )
              }}
              onRetry={() => {
                // Reset form state if needed
                setFormLoading(false)
              }}
              fallbackTitle="Error al Editar Servicio"
              fallbackMessage="Ha ocurrido un error al procesar el formulario de edición. Por favor, intenta de nuevo."
            >
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
                  instrucciones: selectedService.instrucciones,
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
            </ServiceFormErrorBoundary>
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
          <ServiceFormErrorBoundary
            onError={(error, errorInfo) => {
              console.error('Service creation form error:', error, errorInfo)
              toast.showError(
                'Error en el formulario',
                'Ha ocurrido un error al procesar el formulario de creación'
              )
            }}
            onRetry={() => {
              // Reset form state if needed
              setFormLoading(false)
            }}
            fallbackTitle="Error al Crear Servicio"
            fallbackMessage="Ha ocurrido un error al procesar el formulario de creación. Por favor, intenta de nuevo."
          >
            <UnifiedServiceForm
              mode="create"
              dependencias={dependencias}
              subdependencias={subdependencias}
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              loading={formLoading}
            />
          </ServiceFormErrorBoundary>
        </Modal>
      </div>
    </RoleGuard>
  )
}

export default FuncionariosServiciosPage
