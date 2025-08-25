'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal, ConfirmDialog, Badge } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { SectionedForm } from '@/components/molecules/SectionedForm'
import { DataTable } from '@/components/organisms'
import { RoleGuard } from '@/components/auth'
import { TramitesClientService } from '@/services/tramites'
import { supabase } from '@/lib/supabase/client'
import { normalizeSpanishText } from '@/lib/utils'
import type { FormField, Tramite, Dependencia, Subdependencia } from '@/types'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate, formatCurrency } from '@/utils'

const tramitesService = new TramitesClientService()

// Business validation rules for funcionarios
const validateTramiteData = (formData: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Required field validation
  if (!formData.codigo_unico?.trim()) {
    errors.push('El código único es obligatorio')
  }
  if (!formData.nombre?.trim()) {
    errors.push('El nombre del trámite es obligatorio')
  }
  if (!formData.categoria?.trim()) {
    errors.push('La categoría es obligatoria')
  }
  if (!formData.modalidad?.trim()) {
    errors.push('La modalidad es obligatoria')
  }
  if (!formData.subdependencia_id?.trim()) {
    errors.push('La subdependencia es obligatoria')
  }

  // Business logic validation
  if (formData.codigo_unico && !/^\d{3}-\d{3}-\d{3}$/.test(formData.codigo_unico)) {
    errors.push('El código único debe tener el formato XXX-XXX-XXX (ej: 080-081-001)')
  }

  if (formData.tiempo_respuesta && formData.tiempo_respuesta.length > 100) {
    errors.push('El tiempo de respuesta no puede exceder 100 caracteres')
  }

  // URL validation
  const urlPattern = /^https?:\/\/.+/
  if (formData.url_suit && !urlPattern.test(formData.url_suit)) {
    errors.push('La URL del portal SUIT debe ser válida (comenzar con http:// o https://)')
  }
  if (formData.url_gov && !urlPattern.test(formData.url_gov)) {
    errors.push('La URL del portal GOV.CO debe ser válida (comenzar con http:// o https://)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export default function FuncionariosTramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [subdependencias, setSubdependencias] = useState<Subdependencia[]>([])
  const [filteredSubdependencias, setFilteredSubdependencias] = useState<Subdependencia[]>([])
  const [selectedDependenciaId, setSelectedDependenciaId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTramite, setSelectedTramite] = useState<any>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Load data functions
  const loadTramites = useCallback(async () => {
    try {
      const response = await tramitesService.getAll({ limit: 50 })
      if (response.success && response.data) {
        setTramites(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading trámites')
      console.error('Error loading trámites:', err)
    }
  }, [])

  const loadDependencias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dependencias')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true })

      if (error) throw error
      setDependencias(data || [])
    } catch (err) {
      console.error('Error loading dependencias:', err)
    }
  }, [])

  const loadSubdependencias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subdependencias')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true })

      if (error) throw error
      setSubdependencias(data || [])
    } catch (err) {
      console.error('Error loading subdependencias:', err)
    }
  }, [])

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        setError(null)
        await Promise.all([loadTramites(), loadDependencias(), loadSubdependencias()])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [loadTramites, loadDependencias, loadSubdependencias])

  // Handle dependencia change for hierarchical selection
  const handleDependenciaChange = (dependenciaValue: string) => {
    const dependencia = dependencias.find((dep) => dep.id === dependenciaValue)

    if (dependencia) {
      setSelectedDependenciaId(dependencia.id)
      const filtered = subdependencias.filter((sub) => sub.dependencia_id === dependencia.id)
      setFilteredSubdependencias(filtered)
    } else {
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    }
  }

  // Table columns
  const columns: Column<Tramite>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      width: '120px',
      render: (value, record) => (
        <div className="font-mono text-sm font-medium text-blue-600">
          {record?.codigo || 'N/A'}
        </div>
      ),
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 line-clamp-2">{record?.nombre || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            {record?.dependencias?.nombre || 'Sin dependencia'} → {record?.subdependencias?.nombre || 'Sin subdependencia'}
          </div>
        </div>
      ),
    },
    {
      key: 'tipo_pago',
      title: 'Tipo de Pago',
      sortable: true,
      width: '140px',
      render: (value, record) => (
        <Badge 
          variant={record?.tipo_pago === 'gratuito' ? 'success' : 'warning'} 
          size="sm"
        >
          {record?.tipo_pago === 'gratuito' ? 'Gratuito' : 'Pago'}
        </Badge>
      ),
    },
    {
      key: 'valor',
      title: 'Valor',
      sortable: true,
      width: '120px',
      render: (value, record) => (
        <div className="text-sm font-medium">
          {record?.tipo_pago === 'gratuito' ? 'Gratuito' : formatCurrency(record?.valor || 0)}
        </div>
      ),
    },
    {
      key: 'tiempo_estimado',
      title: 'Tiempo Est.',
      sortable: true,
      width: '120px',
      render: (value, record) => (
        <div className="text-sm text-gray-600">
          {record?.tiempo_estimado || 'N/A'}
        </div>
      ),
    },
    {
      key: 'activo',
      title: 'Estado',
      sortable: true,
      width: '100px',
      render: (value, record) => (
        <Badge variant={record?.activo ? 'success' : 'secondary'} size="sm">
          {record?.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'updated_at',
      title: 'Actualizado',
      sortable: true,
      render: (value, record) => (
        <div className="text-sm text-gray-500">
          {record?.updated_at ? formatDate(record.updated_at) : 'N/A'}
        </div>
      ),
    },
  ]

  // Enhanced form fields with logical grouping and improved UX
  const getFormFields = (): FormField[] => [
    // SECTION 1: Basic Information (Most Important)
    {
      name: 'codigo_unico',
      label: 'Código Único del Trámite',
      type: 'text',
      required: true,
      placeholder: 'Ej: 080-081-001',
      helperText: 'Código único identificador del trámite según normativa',
      section: 'Información Básica',
    },
    {
      name: 'nombre',
      label: 'Nombre del Trámite',
      type: 'text',
      required: true,
      placeholder: 'Nombre completo y descriptivo del trámite',
      helperText: 'Nombre oficial del trámite tal como aparece en la normativa',
      section: 'Información Básica',
    },
    {
      name: 'formulario',
      label: 'Descripción del Formulario',
      type: 'textarea',
      required: false,
      placeholder: 'Descripción del formulario o proceso a seguir...',
      rows: 3,
      helperText: 'Información sobre el formulario requerido o proceso general',
      section: 'Información Básica',
    },

    // SECTION 2: Classification and Processing
    {
      name: 'categoria',
      label: 'Categoría Temática',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar categoría' },
        { value: 'impuestos', label: '💰 Impuestos y Tasas' },
        { value: 'licencias', label: '📋 Licencias y Permisos' },
        { value: 'informativo', label: '📄 Informativo y Certificados' },
        { value: 'salud', label: '🏥 Salud y Sanidad' },
        { value: 'movilidad', label: '🚗 Movilidad y Tránsito' },
        { value: 'ambiental', label: '🌱 Ambiental' },
        { value: 'general', label: '📁 General' },
      ],
      helperText: 'Categoría que facilita la búsqueda y organización',
      section: 'Clasificación y Procesamiento',
    },
    {
      name: 'modalidad',
      label: 'Modalidad de Atención',
      type: 'select',
      required: true,
      options: [
        { value: 'presencial', label: '🏢 Presencial (Oficina)' },
        { value: 'virtual', label: '💻 Virtual (En línea)' },
        { value: 'mixto', label: '🔄 Mixto (Híbrido)' },
      ],
      defaultValue: 'presencial',
      helperText: 'Modalidad en que se puede realizar el trámite',
      section: 'Clasificación y Procesamiento',
    },
    {
      name: 'tiempo_respuesta',
      label: 'Tiempo de Respuesta',
      type: 'text',
      required: false,
      placeholder: 'Ej: 5 días hábiles, 2 semanas, 1 mes',
      helperText: 'Tiempo estimado para completar el trámite',
      section: 'Clasificación y Procesamiento',
    },

    // SECTION 3: Organizational Assignment
    {
      name: 'dependencia_id',
      label: 'Dependencia Responsable',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar dependencia' },
        ...dependencias.map((dep) => ({
          value: dep.id,
          label: dep.nombre,
        })),
      ],
      onChange: handleDependenciaChange,
      helperText: 'Dependencia principal responsable del trámite',
      section: 'Asignación Organizacional',
    },
    {
      name: 'subdependencia_id',
      label: 'Subdependencia Específica',
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
      helperText: 'Subdependencia específica que gestiona el trámite',
      section: 'Asignación Organizacional',
    },

    // SECTION 4: Payment Information
    {
      name: 'tiene_pago',
      label: 'Requiere Pago',
      type: 'checkbox',
      helperText: 'Marcar si el trámite tiene costo asociado',
      section: 'Información de Pago',
    },

    // SECTION 5: Requirements and Instructions
    {
      name: 'requisitos',
      label: 'Requisitos Necesarios',
      type: 'textarea',
      required: false,
      placeholder: 'Ingrese cada requisito en una línea separada...\nEj:\nCédula de ciudadanía original y copia\nFormulario de solicitud diligenciado\nComprobante de pago',
      rows: 5,
      helperText: 'Lista de documentos y requisitos necesarios (uno por línea)',
      section: 'Requisitos e Instrucciones',
    },
    {
      name: 'instructivo',
      label: 'Instructivo Paso a Paso',
      type: 'textarea',
      required: false,
      placeholder: 'Ingrese cada paso en una línea separada...\nEj:\n1. Diríjase a la oficina de atención al ciudadano\n2. Presente los documentos requeridos\n3. Realice el pago correspondiente\n4. Reciba su certificado',
      rows: 6,
      helperText: 'Instrucciones detalladas para completar el trámite (un paso por línea)',
      section: 'Requisitos e Instrucciones',
    },

    // SECTION 6: Government Portals
    {
      name: 'url_suit',
      label: 'URL Portal SUIT',
      type: 'text',
      required: false,
      placeholder: 'https://www.suit.gov.co/tramite/codigo-tramite',
      helperText: 'Enlace al trámite en el portal SUIT del gobierno',
      section: 'Portales Gubernamentales',
    },
    {
      name: 'visualizacion_suit',
      label: 'Mostrar enlace SUIT',
      type: 'checkbox',
      required: false,
      helperText: 'Activa para mostrar el enlace SUIT cuando la URL sea válida',
      section: 'Portales Gubernamentales',
    },
    {
      name: 'url_gov',
      label: 'URL Portal GOV.CO',
      type: 'text',
      required: false,
      placeholder: 'https://www.gov.co/tramites-y-servicios/codigo-tramite',
      helperText: 'Enlace al trámite en el portal GOV.CO',
      section: 'Portales Gubernamentales',
    },
    {
      name: 'visualizacion_gov',
      label: 'Mostrar enlace GOV.CO',
      type: 'checkbox',
      required: false,
      helperText: 'Activa para mostrar el enlace GOV.CO cuando la URL sea válida',
      section: 'Portales Gubernamentales',
    },

    // SECTION 7: Additional Information
    {
      name: 'observaciones',
      label: 'Observaciones Adicionales',
      type: 'textarea',
      required: false,
      placeholder: 'Información adicional, excepciones, consideraciones especiales...',
      rows: 3,
      helperText: 'Información adicional no cubierta por los campos anteriores',
      section: 'Información Adicional',
    },
    {
      name: 'activo',
      label: 'Trámite Activo',
      type: 'checkbox',
      helperText: 'Desmarcar para desactivar temporalmente el trámite',
      section: 'Información Adicional',
    },
  ]

  // Event handlers
  const handleCreate = () => {
    setSelectedTramite(null)
    setSelectedDependenciaId('')
    setFilteredSubdependencias([])
    setIsCreateModalOpen(true)
  }

  const handleEdit = (tramite: Tramite) => {
    setSelectedTramite(tramite)

    // Set up dependencia and subdependencia selection
    if (tramite.subdependencias?.dependencias?.id) {
      const dependenciaId = tramite.subdependencias.dependencias.id
      setSelectedDependenciaId(dependenciaId)
      const filtered = subdependencias.filter((sub) => sub.dependencia_id === dependenciaId)
      setFilteredSubdependencias(filtered)
    } else {
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    }

    setIsEditModalOpen(true)
  }

  const handleDelete = (tramite: Tramite) => {
    setSelectedTramite(tramite)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitCreate = async (formData: Record<string, any>, isValid: boolean) => {
    if (!isValid) return

    // Additional business validation
    const validation = validateTramiteData(formData)
    if (!validation.isValid) {
      setError(`Errores de validación: ${validation.errors.join(', ')}`)
      return
    }

    try {
      setFormLoading(true)
      setError(null)

      // Process array fields (requisitos and instructivo)
      const processArrayField = (field: string): string[] | null => {
        if (!formData[field]) return null
        return formData[field]
          .split('\n')
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0)
      }

      const tramiteData = {
        codigo_unico: formData.codigo_unico as string,
        nombre: formData.nombre as string,
        formulario: (formData.formulario as string) || null,
        tiempo_respuesta: (formData.tiempo_respuesta as string) || null,
        tiene_pago: Boolean(formData.tiene_pago),
        subdependencia_id: formData.subdependencia_id as string,
        activo: Boolean(formData.activo),

        // New enhanced fields
        requisitos: processArrayField('requisitos'),
        instructivo: processArrayField('instructivo'),
        modalidad: formData.modalidad as 'virtual' | 'presencial' | 'mixto',
        categoria: (formData.categoria as string) || null,
        observaciones: (formData.observaciones as string) || null,
        url_suit: (formData.url_suit as string) || null,
        visualizacion_suit: Boolean(formData.visualizacion_suit) || false,
        url_gov: (formData.url_gov as string) || null,
        visualizacion_gov: Boolean(formData.visualizacion_gov) || false,
      }

      await tramitesService.create(tramiteData)
      await loadTramites()
      setIsCreateModalOpen(false)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    } catch (err) {
      console.error('Error creating trámite:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmitEdit = async (formData: Record<string, any>, isValid: boolean) => {
    if (!selectedTramite || !isValid) return

    // Additional business validation
    const validation = validateTramiteData(formData)
    if (!validation.isValid) {
      setError(`Errores de validación: ${validation.errors.join(', ')}`)
      return
    }

    try {
      setFormLoading(true)
      setError(null)

      // Process array fields (requisitos and instructivo)
      const processArrayField = (field: string): string[] | null => {
        if (!formData[field]) return null
        return formData[field]
          .split('\n')
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0)
      }

      const updates = {
        codigo_unico: formData.codigo_unico as string,
        nombre: formData.nombre as string,
        formulario: (formData.formulario as string) || null,
        tiempo_respuesta: (formData.tiempo_respuesta as string) || null,
        tiene_pago: Boolean(formData.tiene_pago),
        subdependencia_id: formData.subdependencia_id as string,
        activo: Boolean(formData.activo),

        // New enhanced fields
        requisitos: processArrayField('requisitos'),
        instructivo: processArrayField('instructivo'),
        modalidad: formData.modalidad as 'virtual' | 'presencial' | 'mixto',
        categoria: (formData.categoria as string) || null,
        observaciones: (formData.observaciones as string) || null,
        url_suit: (formData.url_suit as string) || null,
        visualizacion_suit: Boolean(formData.visualizacion_suit) || false,
        url_gov: (formData.url_gov as string) || null,
        visualizacion_gov: Boolean(formData.visualizacion_gov) || false,
      }

      await tramitesService.update(selectedTramite.id, updates)
      await loadTramites()
      setIsEditModalOpen(false)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    } catch (err) {
      console.error('Error updating trámite:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedTramite) return

    try {
      setFormLoading(true)
      await tramitesService.delete(selectedTramite.id)
      await loadTramites()
      setIsDeleteModalOpen(false)
    } catch (err) {
      console.error('Error deleting trámite:', err)
      throw err
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
      onClick: handleEdit,
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      variant: 'danger' as const,
      onClick: handleDelete,
    },
  ]

  // Filter data based on search
  // UX-001: Enhanced search with accent normalization
  const filteredTramites = tramites.filter((tramite) => {
    if (!searchQuery) return true

    const normalizedQuery = normalizeSpanishText(searchQuery)
    const normalizedCodigo = normalizeSpanishText(tramite.codigo || '')
    const normalizedNombre = normalizeSpanishText(tramite.nombre || '')
    const normalizedDescripcion = normalizeSpanishText(tramite.descripcion || '')
    const normalizedDependencia = normalizeSpanishText(tramite.dependencias?.nombre || '')
    const normalizedSubdependencia = normalizeSpanishText(tramite.subdependencias?.nombre || '')

    return normalizedCodigo.includes(normalizedQuery) ||
           normalizedNombre.includes(normalizedQuery) ||
           normalizedDescripcion.includes(normalizedQuery) ||
           normalizedDependencia.includes(normalizedQuery) ||
           normalizedSubdependencia.includes(normalizedQuery)
  })

  return (
    <RoleGuard allowedRoles={['funcionario']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Trámites</h1>
            <p className="text-gray-600">Administrar trámites y procedimientos</p>
          </div>
          <Button variant="primary" onClick={handleCreate} className="flex items-center space-x-2">
            <span>➕</span>
            <span>Nuevo Trámite</span>
          </Button>
        </div>

        {/* Data Table */}
        <Card>
          <DataTable
            data={filteredTramites}
            columns={columns}
            loading={loading}
            error={error}
            rowActions={rowActions}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar trámites..."
            showSearchAndFilters
            emptyStateProps={{
              title: 'No hay trámites',
              description: 'No se encontraron trámites. Crea el primer trámite.',
              action: (
                <Button variant="primary" onClick={handleCreate}>
                  Crear Trámite
                </Button>
              ),
            }}
          />
        </Card>

        {/* Create Modal - Enhanced UX */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={
            <div className="flex items-center space-x-2">
              <span className="text-xl">➕</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Trámite</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Complete la información del nuevo trámite
                </p>
              </div>
            </div>
          }
          size="xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-gray-500">
                💡 Los campos marcados con * son obligatorios
              </div>
              <div className="flex space-x-3">
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
                  ✨ Crear Trámite
                </Button>
              </div>
            </div>
          }
        >
          <SectionedForm
            id="create-tramite-form"
            fields={getFormFields()}
            onSubmit={handleSubmitCreate}
            initialData={{
              activo: true,
              tiene_pago: false,
              modalidad: 'presencial',
              categoria: '',
            }}
            validateOnChange
            validateOnBlur
          />
        </Modal>

        {/* Edit Modal - Enhanced UX */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={
            <div className="flex items-center space-x-2">
              <span className="text-xl">✏️</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Editar Trámite</h3>
                {selectedTramite && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedTramite.codigo_unico} - {selectedTramite.nombre}
                  </p>
                )}
              </div>
            </div>
          }
          size="xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-gray-500">
                💡 Los campos marcados con * son obligatorios
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="neutral"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" form="edit-tramite-form" variant="primary" isLoading={formLoading}>
                  💾 Guardar Cambios
                </Button>
              </div>
            </div>
          }
        >
          {selectedTramite && (
            <SectionedForm
              id="edit-tramite-form"
              fields={getFormFields()}
              initialData={{
                // Basic Information
                codigo_unico: selectedTramite.codigo_unico || '',
                nombre: selectedTramite.nombre || '',
                formulario: selectedTramite.formulario || '',

                // Classification and Processing
                categoria: selectedTramite.categoria || '',
                modalidad: selectedTramite.modalidad || 'presencial',
                tiempo_respuesta: selectedTramite.tiempo_respuesta || '',

                // Organizational Assignment
                dependencia_id: selectedTramite.subdependencias?.dependencias?.id || '',
                subdependencia_id: selectedTramite.subdependencia_id || '',

                // Payment Information
                tiene_pago: selectedTramite.tiene_pago || false,

                // Requirements and Instructions
                requisitos: Array.isArray(selectedTramite.requisitos)
                  ? selectedTramite.requisitos.join('\n')
                  : (selectedTramite.requisitos || ''),
                instructivo: Array.isArray(selectedTramite.instructivo)
                  ? selectedTramite.instructivo.join('\n')
                  : (selectedTramite.instructivo || ''),

                // Government Portals
                url_suit: selectedTramite.url_suit || '',
                visualizacion_suit: Boolean(selectedTramite.visualizacion_suit),
                url_gov: selectedTramite.url_gov || '',
                visualizacion_gov: Boolean(selectedTramite.visualizacion_gov),

                // Additional Information
                observaciones: selectedTramite.observaciones || '',
                activo: selectedTramite.activo || false,
              }}
              onSubmit={handleSubmitEdit}
              validateOnChange
              validateOnBlur
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar Trámite"
          confirmText="Eliminar"
          cancelText="Cancelar"
          confirmVariant="danger"
          loading={formLoading}
        >
          {selectedTramite && (
            <>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar el trámite{' '}
                <strong>&quot;{selectedTramite.nombre}&quot;</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
            </>
          )}
        </ConfirmDialog>
      </div>
    </RoleGuard>
  )
}
