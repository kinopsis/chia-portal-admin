'use client'

import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/components/organisms'
import { Modal, ConfirmDialog, Button, Badge, Card } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { RoleGuard } from '@/components/auth'
import { faqsClientService } from '@/services/faqs'
import { supabase } from '@/lib/supabase'
import { FAQ, FormField, Dependencia, Subdependencia } from '@/types'
import { formatDate } from '@/utils'
import type { Column } from '@/components/organisms/DataTable'

export default function FAQsAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data functions
  const loadFaqs = useCallback(async () => {
    try {
      const response = await faqsClientService.getAll()
      setFaqs(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading FAQs')
      console.error('Error loading FAQs:', err)
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
        await Promise.all([
          loadFaqs(),
          loadDependencias(),
          loadSubdependencias()
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [loadFaqs, loadDependencias, loadSubdependencias])

  // Handle dependencia change for hierarchical selection
  const handleDependenciaChange = (dependenciaValue: string) => {
    console.log('handleDependenciaChange called with:', dependenciaValue)

    // Find the dependencia by ID
    const dependencia = dependencias.find(dep => dep.id === dependenciaValue)

    if (dependencia) {
      console.log('Found dependencia:', dependencia)
      setSelectedDependenciaId(dependencia.id)
      const filtered = subdependencias.filter(sub => sub.dependencia_id === dependencia.id)
      console.log('Filtered subdependencias:', filtered)
      setFilteredSubdependencias(filtered)
    } else {
      console.log('No dependencia found for:', dependenciaValue)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    }
  }

  // Table columns
  const columns: Column<FAQ>[] = [
    {
      key: 'pregunta',
      title: 'Pregunta',
      sortable: true,
      render: (value, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 line-clamp-2">{record?.pregunta || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'jerarquia',
      title: 'Jerarquía',
      sortable: true,
      render: (value, record) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {record?.dependencias?.nombre || 'Sin dependencia'}
          </div>
          <div className="text-xs text-gray-500">
            {record?.subdependencias?.nombre || 'Sin subdependencia'}
          </div>
        </div>
      ),
    },
    {
      key: 'tema',
      title: 'Temas',
      sortable: true,
      width: '140px',
      render: (value, record) => (
        <Badge variant="outline" size="sm">
          {record?.tema || 'Sin tema'}
        </Badge>
      ),
    },
    {
      key: 'respuesta',
      title: 'Respuesta',
      sortable: false,
      render: (value, record) => (
        <div className="text-sm text-gray-600 line-clamp-3 max-w-md">
          {record?.respuesta || 'N/A'}
        </div>
      ),
    },
    {
      key: 'categoria',
      title: 'Categoría',
      sortable: true,
      width: '140px',
      render: (value, record) => (
        <Badge variant="outline" size="sm">
          {record?.categoria || 'Sin categoría'}
        </Badge>
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
      key: 'orden',
      title: 'Orden',
      sortable: true,
      width: '80px',
      render: (value, record) => (
        <div className="text-sm text-gray-500 text-center">
          {record?.orden || 0}
        </div>
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

  // Form fields
  const getFormFields = (): FormField[] => [
    {
      name: 'pregunta',
      label: 'Pregunta',
      type: 'text',
      required: true,
      placeholder: 'Escriba la pregunta frecuente',
    },
    {
      name: 'respuesta',
      label: 'Respuesta',
      type: 'textarea',
      required: true,
      placeholder: 'Escriba la respuesta detallada',
      rows: 4,
    },
    {
      name: 'dependencia_id',
      label: 'Dependencia',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar dependencia', disabled: true },
        ...dependencias.map(dep => ({
          value: dep.id,
          label: dep.nombre,
        }))
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
          label: selectedDependenciaId ? 'Seleccionar subdependencia' : 'Primero seleccione una dependencia',
          disabled: true
        },
        ...filteredSubdependencias.map(sub => ({
          value: sub.id,
          label: sub.nombre,
        }))
      ],
      disabled: !selectedDependenciaId,
      placeholder: 'Seleccionar subdependencia',
    },
    {
      name: 'tema',
      label: 'Tema',
      type: 'text',
      required: false,
      placeholder: 'Ej: Certificados, Consultas, etc.',
      helperText: 'Tema o categoría específica para agrupar preguntas relacionadas',
    },
    {
      name: 'palabras_clave',
      label: 'Palabras Clave',
      type: 'text',
      required: false,
      placeholder: 'certificado, residencia, documento (separadas por comas)',
      helperText: 'Palabras clave para mejorar la búsqueda, separadas por comas',
    },
    {
      name: 'categoria',
      label: 'Categoría',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar categoría', disabled: true },
        { value: 'general', label: 'General' },
        { value: 'tramites', label: 'Trámites' },
        { value: 'pagos', label: 'Pagos' },
        { value: 'citas', label: 'Citas' },
        { value: 'documentos', label: 'Documentos' },
        { value: 'servicios', label: 'Servicios' },
        { value: 'otros', label: 'Otros' },
      ],
    },
    {
      name: 'orden',
      label: 'Orden de visualización',
      type: 'number',
      required: false,
      placeholder: '0',
      helperText: 'Orden en que aparecerá la FAQ (menor número = mayor prioridad)',
      min: 0,
      max: 999,
    },
    {
      name: 'activo',
      label: 'Activo',
      type: 'checkbox',
      defaultValue: true,
    },
  ]

  // Event handlers
  const handleCreate = () => {
    setSelectedFAQ(null)
    // Reset form state for new FAQ
    setSelectedDependenciaId('')
    setFilteredSubdependencias([])
    setIsCreateModalOpen(true)
  }

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq)

    // Set the dependencia and filter subdependencias for editing
    if (faq.dependencia_id) {
      setSelectedDependenciaId(faq.dependencia_id)
      const filtered = subdependencias.filter(sub => sub.dependencia_id === faq.dependencia_id)
      setFilteredSubdependencias(filtered)
    } else {
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    }

    setIsEditModalOpen(true)
  }

  const handleDelete = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitCreate = async (formData: Record<string, any>, isValid: boolean) => {
    if (!isValid) return

    try {
      setIsSubmitting(true)

      // Process palabras_clave from comma-separated string to array
      const palabrasClaveArray = formData.palabras_clave
        ? (formData.palabras_clave as string).split(',').map(word => word.trim()).filter(Boolean)
        : []

      const faqData = {
        pregunta: formData.pregunta as string,
        respuesta: formData.respuesta as string,
        dependencia_id: formData.dependencia_id as string,
        subdependencia_id: formData.subdependencia_id as string,
        tema: formData.tema as string || null,
        palabras_clave: palabrasClaveArray.length > 0 ? palabrasClaveArray : null,
        categoria: formData.categoria as string,
        orden: parseInt(formData.orden as string) || 0,
        activo: Boolean(formData.activo),
      }

      await faqsClientService.create(faqData)
      await loadFaqs()
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Error creating FAQ:', err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEdit = async (formData: Record<string, any>, isValid: boolean) => {
    if (!selectedFAQ || !isValid) return

    try {
      setIsSubmitting(true)

      // Process palabras_clave from comma-separated string to array
      const palabrasClaveArray = formData.palabras_clave
        ? (formData.palabras_clave as string).split(',').map(word => word.trim()).filter(Boolean)
        : []

      const updates = {
        pregunta: formData.pregunta as string,
        respuesta: formData.respuesta as string,
        dependencia_id: formData.dependencia_id as string,
        subdependencia_id: formData.subdependencia_id as string,
        tema: formData.tema as string || null,
        palabras_clave: palabrasClaveArray.length > 0 ? palabrasClaveArray : null,
        categoria: formData.categoria as string,
        orden: parseInt(formData.orden as string) || 0,
        activo: Boolean(formData.activo),
      }

      await faqsClientService.update(selectedFAQ.id, updates)
      await loadFaqs()
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Error updating FAQ:', err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedFAQ) return

    try {
      setIsSubmitting(true)
      await faqsClientService.delete(selectedFAQ.id)
      await loadFaqs()
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error('Error deleting FAQ:', err)
      throw err
    } finally {
      setIsSubmitting(false)
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
  const filteredFaqs = faqs.filter(faq =>
    (faq.pregunta || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (faq.respuesta || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (faq.categoria || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (faq.dependencias?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (faq.subdependencias?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (faq.tema || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <RoleGuard allowedRoles={['admin', 'funcionario']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de FAQs</h1>
            <p className="text-gray-600">Administrar Preguntas Frecuentes</p>
          </div>
          <Button
            variant="primary"
            onClick={handleCreate}
            className="flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Nueva FAQ</span>
          </Button>
        </div>

        {/* Data Table */}
        <Card>
          <DataTable
            data={filteredFaqs}
            columns={columns}
            loading={loading}
            error={error}
            rowActions={rowActions}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar FAQs..."
            showSearchAndFilters
            emptyStateProps={{
              title: 'No hay FAQs',
              description: 'No se encontraron preguntas frecuentes. Crea la primera FAQ.',
              action: (
                <Button
                  variant="primary"
                  onClick={handleCreate}
                >
                  Crear FAQ
                </Button>
              ),
            }}
          />
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear Nueva FAQ"
          size="lg"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="create-faq-form"
                variant="primary"
                isLoading={isSubmitting}
              >
                Crear FAQ
              </Button>
            </>
          }
        >
          <Form
            id="create-faq-form"
            fields={getFormFields()}
            onSubmit={handleSubmitCreate}
            initialData={{ activo: true, orden: 0 }}
            validateOnChange
            validateOnBlur
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar FAQ"
          size="lg"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="edit-faq-form"
                variant="primary"
                isLoading={isSubmitting}
              >
                Guardar Cambios
              </Button>
            </>
          }
        >
          {selectedFAQ && (
            <Form
              id="edit-faq-form"
              fields={getFormFields()}
              initialData={{
                pregunta: selectedFAQ.pregunta,
                respuesta: selectedFAQ.respuesta,
                dependencia_id: selectedFAQ.dependencia_id,
                subdependencia_id: selectedFAQ.subdependencia_id,
                tema: selectedFAQ.tema || '',
                palabras_clave: selectedFAQ.palabras_clave ? selectedFAQ.palabras_clave.join(', ') : '',
                categoria: selectedFAQ.categoria,
                orden: selectedFAQ.orden,
                activo: selectedFAQ.activo,
              }}
              onSubmit={handleSubmitEdit}
              validateOnChange
              validateOnBlur
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar FAQ"
          confirmText="Eliminar"
          cancelText="Cancelar"
          confirmVariant="danger"
          loading={isSubmitting}
        >
          {selectedFAQ && (
            <>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar la FAQ{' '}
                <strong>"{selectedFAQ.pregunta}"</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </>
          )}
        </ConfirmDialog>
      </div>
    </RoleGuard>
  )
}
