'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal, ConfirmDialog } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { DataTable } from '@/components/organisms'
import { PageHeader } from '@/components/layout'
import { TramitesClientService } from '@/services/tramites'
import { supabase } from '@/lib/supabase/client'
import type { FormField, Tramite, Dependencia, Subdependencia } from '@/types'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate, formatCurrency } from '@/utils'
import { useAdminBreadcrumbs } from '@/hooks'

const tramitesService = new TramitesClientService()

// Real API functions using Supabase
const fetchTramites = async () => {
  try {
    console.log('Fetching real tramites from database...')
    const response = await tramitesService.getAll({ limit: 50 })
    console.log('Tramites response:', response)
    return response
  } catch (error) {
    console.error('Error fetching tramites:', error)
    throw error
  }
}

const fetchDependencias = async () => {
  try {
    console.log('Fetching dependencias from database...')
    const { data, error } = await supabase
      .from('dependencias')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) throw error

    console.log('Dependencias loaded:', data?.length || 0)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching dependencias:', error)
    throw error
  }
}

const fetchSubdependencias = async () => {
  try {
    console.log('Fetching subdependencias from database...')
    const { data, error } = await supabase
      .from('subdependencias')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) throw error

    console.log('Subdependencias loaded:', data?.length || 0)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching subdependencias:', error)
    throw error
  }
}

const TramitesAdminPage: React.FC = () => {
  const breadcrumbs = useAdminBreadcrumbs('Trámites')
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [subdependencias, setSubdependencias] = useState<Subdependencia[]>([])
  const [filteredSubdependencias, setFilteredSubdependencias] = useState<Subdependencia[]>([])
  const [selectedDependenciaId, setSelectedDependenciaId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTramite, setSelectedTramite] = useState<any>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('Loading Tramites data...')

        const [tramitesResponse, dependenciasResponse, subdependenciasResponse] = await Promise.all(
          [fetchTramites(), fetchDependencias(), fetchSubdependencias()]
        )

        console.log('Tramites response:', tramitesResponse)
        console.log('Dependencias loaded:', dependenciasResponse.data?.length || 0)
        console.log('Subdependencias loaded:', subdependenciasResponse.data?.length || 0)

        if (tramitesResponse.success && tramitesResponse.data) {
          console.log('Tramites data length:', tramitesResponse.data.length)
          if (tramitesResponse.data.length > 0) {
            console.log(
              'First Tramite data structure:',
              JSON.stringify(tramitesResponse.data[0], null, 2)
            )
            console.log('First Tramite subdependencias:', tramitesResponse.data[0].subdependencias)
            console.log(
              'First Tramite dependencias:',
              tramitesResponse.data[0].subdependencias?.dependencias
            )
          }
          setTramites(tramitesResponse.data)
        }

        if (dependenciasResponse.success && dependenciasResponse.data) {
          setDependencias(dependenciasResponse.data)
        }

        if (subdependenciasResponse.success && subdependenciasResponse.data) {
          setSubdependencias(subdependenciasResponse.data)
        }

        console.log('Data loading completed')
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Error loading data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle dependencia change for hierarchical selection
  const handleDependenciaChange = (dependenciaValue: string) => {
    console.log('handleDependenciaChange called with:', dependenciaValue)

    // Find the dependencia by ID (if it's an ID) or by name (if it's a name)
    let dependencia = dependencias.find((dep) => dep.id === dependenciaValue)
    if (!dependencia) {
      dependencia = dependencias.find((dep) => dep.nombre === dependenciaValue)
    }

    if (dependencia) {
      console.log('Found dependencia:', dependencia)
      setSelectedDependenciaId(dependencia.id)
      const filtered = subdependencias.filter((sub) => sub.dependencia_id === dependencia.id)
      console.log('Filtered subdependencias:', filtered)
      setFilteredSubdependencias(filtered)
    } else {
      console.log('No dependencia found for:', dependenciaValue)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    }
  }

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'codigo_unico',
      label: 'Código Trámite',
      type: 'text',
      required: true,
      placeholder: '080-081-001',
      helperText: 'Código único del trámite (ej: 080-081-001)',
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Certificado de Residencia',
    },
    {
      name: 'formulario',
      label: 'Formulario',
      type: 'textarea',
      placeholder: 'Información del formulario o proceso...',
      rows: 4,
    },
    {
      name: 'dependencia_id',
      label: 'Dependencia',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar dependencia', },
        ...dependencias.map((dep) => ({
          value: dep.id,
          label: dep.nombre,
        })),
      ],
      placeholder: 'Seleccionar dependencia',
      onChange: handleDependenciaChange,
    },
    {
      name: 'subdependencia_id',
      label: 'Subdependencia',
      type: 'select',
      required: true,
      options: [
        {
          value: '',
          label: selectedDependenciaId
            ? 'Seleccionar subdependencia'
            : 'Primero seleccione una dependencia',
          },
        ...filteredSubdependencias.map((sub) => ({
          value: sub.id,
          label: sub.nombre,
        })),
      ],
      disabled: !selectedDependenciaId,
      placeholder: 'Seleccionar subdependencia',
    },
    {
      name: 'tiempo_respuesta',
      label: 'Tiempo de Respuesta',
      type: 'text',
      placeholder: '5 días hábiles',
      helperText: 'Tiempo estimado de procesamiento',
    },
    {
      name: 'tiene_pago',
      label: 'Tiene Pago',
      type: 'checkbox',
      helperText: 'Marcar si el trámite tiene costo',
    },
    {
      name: 'requisitos',
      label: 'Requisitos',
      type: 'textarea',
      placeholder: 'Ingrese cada requisito en una línea separada...',
      rows: 6,
      helperText: 'Un requisito por línea. Ejemplo:\nCédula de ciudadanía original y copia\nFormulario de solicitud diligenciado',
    },
    {
      name: 'visualizacion_suit',
      label: 'URL Portal SUIT',
      type: 'text',
      placeholder: 'https://www.suit.gov.co/tramite/codigo-tramite',
      helperText: 'URL completa del trámite en el portal SUIT',
    },
    {
      name: 'visualizacion_gov',
      label: 'URL Portal GOV.CO',
      type: 'text',
      placeholder: 'https://www.gov.co/tramites-y-servicios/codigo-tramite',
      helperText: 'URL completa del trámite en el portal GOV.CO',
    },
    {
      name: 'instructivo',
      label: 'Instructivo',
      type: 'textarea',
      placeholder: 'Ingrese cada paso en una línea separada...',
      rows: 6,
      helperText: 'Instrucciones paso a paso para completar el trámite (una por línea)',
    },
    {
      name: 'modalidad',
      label: 'Modalidad',
      type: 'select',
      required: true,
      options: [
        { value: 'virtual', label: 'Virtual (En línea)' },
        { value: 'presencial', label: 'Presencial (Oficina)' },
        { value: 'mixto', label: 'Mixto (Híbrido)' },
      ],
      defaultValue: 'presencial',
      helperText: 'Modalidad de procesamiento del trámite',
    },
    {
      name: 'categoria',
      label: 'Categoría',
      type: 'select',
      options: [
        { value: '', label: 'Seleccionar categoría' },
        { value: 'impuestos', label: 'Impuestos y Tasas' },
        { value: 'licencias', label: 'Licencias y Permisos' },
        { value: 'informativo', label: 'Informativo y Certificados' },
        { value: 'salud', label: 'Salud y Sanidad' },
        { value: 'movilidad', label: 'Movilidad y Tránsito' },
        { value: 'ambiental', label: 'Ambiental' },
        { value: 'general', label: 'General' },
      ],
      helperText: 'Categoría temática del trámite',
    },
    {
      name: 'observaciones',
      label: 'Observaciones',
      type: 'textarea',
      placeholder: 'Información adicional sobre el trámite...',
      rows: 3,
      helperText: 'Información adicional no cubierta por el proceso estándar',
    },
    {
      name: 'activo',
      label: 'Activo',
      type: 'checkbox',
    },
  ]

  // Table columns
  const columns: Column<any>[] = [
    {
      key: 'codigo_unico',
      title: 'Código',
      sortable: true,
      width: 120,
      render: (value, record) => (
        <span className="font-mono text-sm text-gray-900">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900">{value || 'N/A'}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {record.formulario || 'Sin información de formulario'}
          </div>
        </div>
      ),
    },
    {
      key: 'subdependencias',
      title: 'Jerarquía',
      render: (value, record) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {value?.dependencias?.nombre || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">{value?.nombre || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'tiene_pago',
      title: 'Pago',
      align: 'center',
      render: (value, record) => (
        <span className={value ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
          {value ? 'Con costo' : 'Gratuito'}
        </span>
      ),
    },
    {
      key: 'tiempo_respuesta',
      title: 'Tiempo Respuesta',
      render: (value, record) => (
        <span className="text-sm text-gray-600">{value || 'No especificado'}</span>
      ),
    },
    {
      key: 'activo',
      title: 'Estado',
      align: 'center',
      render: (value, record) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: 'Actualizado',
      sortable: true,
      render: (value, record) => <span className="text-sm text-gray-500">{formatDate(value)}</span>,
    },
  ]

  // Mock CRUD operations for testing
  const handleCreate = async (formData: any, isValid: boolean) => {
    if (!isValid) return

    try {
      setFormLoading(true)
      console.log('Creating tramite with data:', formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newTramite = {
        id: String(tramites.length + 1),
        ...formData,
        requisitos: formData.requisitos
          ? formData.requisitos.split('\n').filter((req: string) => req.trim())
          : [],
        instructivo: formData.instructivo
          ? formData.instructivo.split('\n').filter((inst: string) => inst.trim())
          : [],
        modalidad: formData.modalidad || 'presencial',
        categoria: formData.categoria || null,
        observaciones: formData.observaciones || null,
        costo: formData.costo || 0,
        activo: formData.activo || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdependencias: subdependencias.find((s) => s.id === formData.subdependencia_id),
      }

      setTramites((prev) => [...prev, newTramite])
      setIsCreateModalOpen(false)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    } catch (err) {
      console.error('Error creating tramite:', err)
      setError('Error creating trámite')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (formData: any, isValid: boolean) => {
    if (!isValid || !selectedTramite) return

    try {
      setFormLoading(true)
      console.log('Updating tramite with data:', formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedTramite = {
        ...selectedTramite,
        ...formData,
        requisitos: formData.requisitos
          ? formData.requisitos.split('\n').filter((req: string) => req.trim())
          : [],
        costo: formData.costo || 0,
        updated_at: new Date().toISOString(),
        subdependencias: subdependencias.find((s) => s.id === formData.subdependencia_id),
      }

      setTramites((prev) => prev.map((t) => (t.id === selectedTramite.id ? updatedTramite : t)))
      setIsEditModalOpen(false)
      setSelectedTramite(null)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    } catch (err) {
      console.error('Error updating tramite:', err)
      setError('Error updating trámite')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTramite) return

    try {
      setFormLoading(true)
      console.log('Deleting tramite:', selectedTramite.id)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTramites((prev) => prev.filter((t) => t.id !== selectedTramite.id))
      setIsDeleteModalOpen(false)
      setSelectedTramite(null)
    } catch (err) {
      console.error('Error deleting tramite:', err)
      setError('Error deleting trámite')
    } finally {
      setFormLoading(false)
    }
  }

  // Row actions
  const rowActions = [
    {
      key: 'edit',
      label: 'Editar',
      icon: '✏️',
      onClick: (record: any) => {
        setSelectedTramite(record)
        setIsEditModalOpen(true)
      },
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      variant: 'danger' as const,
      onClick: (record: any) => {
        setSelectedTramite(record)
        setIsDeleteModalOpen(true)
      },
    },
  ]

  // Prepare initial data for edit form
  const getEditInitialData = () => {
    if (!selectedTramite) return {}

    // Set the dependencia for hierarchical selection
    if (selectedTramite.subdependencias?.dependencia_id) {
      setSelectedDependenciaId(selectedTramite.subdependencias.dependencia_id)
      const filtered = subdependencias.filter(
        (sub) => sub.dependencia_id === selectedTramite.subdependencias.dependencia_id
      )
      setFilteredSubdependencias(filtered)
    }

    return {
      ...selectedTramite,
      dependencia_id: selectedTramite.subdependencias?.dependencia_id || '',
      requisitos: Array.isArray(selectedTramite.requisitos)
        ? selectedTramite.requisitos.join('\n')
        : selectedTramite.requisitos || '',
    }
  }

  return (
    <>
      <PageHeader
        title="Gestión de Trámites"
        description="Administra los trámites municipales"
        breadcrumbs={breadcrumbs}
        variant="admin"
        actions={
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Nuevo Trámite</span>
          </Button>
        }
      />
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <Card>
          <DataTable
            data={tramites}
            columns={columns}
            loading={loading}
            error={error}
            rowActions={rowActions}
            searchPlaceholder="Buscar trámites..."
            showSearchAndFilters
            emptyStateProps={{
              title: 'No hay trámites',
              description: 'No se encontraron trámites. Crea el primer trámite.',
              action: (
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  Crear Trámite
                </Button>
              ),
            }}
          />
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear Nuevo Trámite"
          size="lg"
          footer={
            <>
              <Button
                variant="neutral"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="create-tramite-form"
                variant="primary"
                isLoading={formLoading}
              >
                Crear Trámite
              </Button>
            </>
          }
        >
          <Form
            id="create-tramite-form"
            fields={formFields}
            onSubmit={handleCreate}
            initialData={{ activo: true }}
            validateOnChange
            validateOnBlur
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedTramite(null)
          }}
          title="Editar Trámite"
          size="lg"
          footer={
            <>
              <Button
                variant="neutral"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedTramite(null)
                }}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="edit-tramite-form"
                variant="primary"
                isLoading={formLoading}
              >
                Guardar Cambios
              </Button>
            </>
          }
        >
          <Form
            id="edit-tramite-form"
            fields={formFields}
            onSubmit={handleEdit}
            initialData={getEditInitialData()}
            validateOnChange
            validateOnBlur
          />
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedTramite(null)
          }}
          onConfirm={handleDelete}
          title="Eliminar Trámite"
          confirmText="Eliminar"
          confirmVariant="danger"
          loading={formLoading}
        >
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar el trámite{' '}
            <strong>{selectedTramite?.nombre}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
        </ConfirmDialog>
      </div>
    </>
  )
}

export default TramitesAdminPage
