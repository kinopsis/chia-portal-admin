'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/organisms'
import { Button, Input, Textarea, Select, Modal } from '@/components/atoms'
import { FAQsClientService } from '@/services/faqs'
import type { FAQ, Dependencia, Subdependencia } from '@/types'
import { supabase } from '@/lib/supabase'

const faqsService = new FAQsClientService()

interface FAQFormData {
  pregunta: string
  respuesta: string
  dependencia_id: string
  subdependencia_id: string
  tema?: string
  palabras_clave?: string[]
  activo: boolean
}

export default function TestFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [subdependencias, setSubdependencias] = useState<Subdependencia[]>([])
  const [filteredSubdependencias, setFilteredSubdependencias] = useState<Subdependencia[]>([])
  const [selectedDependenciaId, setSelectedDependenciaId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState<FAQFormData>({
    pregunta: '',
    respuesta: '',
    dependencia_id: '',
    subdependencia_id: '',
    tema: '',
    palabras_clave: [],
    activo: true,
  })
  const [tagsInput, setTagsInput] = useState('')

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      console.log('Starting to load FAQs data...')

      // Load FAQs with detailed error handling
      try {
        console.log('Calling faqsService.getAll...')
        const faqsResponse = await faqsService.getAll({ limit: 100 })
        console.log('FAQs response:', faqsResponse)
        setFaqs(faqsResponse.data)
      } catch (faqError) {
        console.error('Error loading FAQs:', faqError)
        // Continue loading dependencias even if FAQs fail
        setFaqs([])
      }

      // Load dependencias
      try {
        console.log('Loading dependencias...')
        const { data: dependenciasData, error: dependenciasError } = await supabase
          .from('dependencias')
          .select('id, codigo, nombre, activo')
          .eq('activo', true)
          .order('nombre')

        if (dependenciasError) throw dependenciasError
        console.log('Dependencias loaded:', dependenciasData?.length || 0)
        setDependencias(dependenciasData || [])
      } catch (depError) {
        console.error('Error loading dependencias:', depError)
        setDependencias([])
      }

      // Load subdependencias
      try {
        console.log('Loading subdependencias...')
        const { data: subdependenciasData, error: subdependenciasError } = await supabase
          .from('subdependencias')
          .select(
            `
            id,
            nombre,
            dependencia_id,
            activo,
            dependencias (
              id,
              nombre
            )
          `
          )
          .eq('activo', true)
          .order('nombre')

        if (subdependenciasError) throw subdependenciasError
        console.log('Subdependencias loaded:', subdependenciasData?.length || 0)
        setSubdependencias(subdependenciasData || [])
      } catch (subError) {
        console.error('Error loading subdependencias:', subError)
        setSubdependencias([])
      }
    } catch (error) {
      console.error('General error loading data:', error)
    } finally {
      setLoading(false)
      console.log('Data loading completed')
    }
  }

  // Handle dependencia selection change
  const handleDependenciaChange = (dependenciaId: string) => {
    setSelectedDependenciaId(dependenciaId)

    // Filter subdependencias by selected dependencia
    const filtered = subdependencias.filter((sub) => sub.dependencia_id === dependenciaId)
    setFilteredSubdependencias(filtered)

    // Update form data with dependencia_id and reset subdependencia selection
    setFormData((prev) => ({
      ...prev,
      dependencia_id: dependenciaId,
      subdependencia_id: '',
    }))
  }

  // Handle create
  const handleCreate = () => {
    setFormData({
      pregunta: '',
      respuesta: '',
      dependencia_id: '',
      subdependencia_id: '',
      tema: '',
      palabras_clave: [],
      activo: true,
    })
    setTagsInput('')
    setSelectedDependenciaId('')
    setFilteredSubdependencias([])
    setShowCreateModal(true)
  }

  const handleCreateSubmit = async () => {
    try {
      console.log('Creating FAQ with data:', formData)

      // Process palabras_clave from tagsInput
      const palabras_clave = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const newFaq = await faqsService.create({
        ...formData,
        palabras_clave,
      })

      console.log('FAQ created successfully:', newFaq)
      setFaqs((prev) => [newFaq, ...prev])
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Error creating FAQ:', error)
    }
  }

  // Handle edit
  const handleEdit = (faq: FAQ) => {
    console.log('Editing FAQ:', faq)
    setSelectedFaq(faq)

    // Use the dependencia_id directly from the FAQ
    const dependenciaId = faq.dependencia_id

    setSelectedDependenciaId(dependenciaId)

    // Filter subdependencias for the selected dependencia
    const filtered = subdependencias.filter((sub) => sub.dependencia_id === dependenciaId)
    setFilteredSubdependencias(filtered)

    setFormData({
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
      dependencia_id: faq.dependencia_id,
      subdependencia_id: faq.subdependencia_id,
      tema: faq.tema || '',
      palabras_clave: faq.palabras_clave || [],
      activo: faq.activo,
    })
    setTagsInput((faq.palabras_clave || []).join(', '))
    setShowEditModal(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedFaq) return

    try {
      console.log('Updating FAQ with data:', formData)

      // Process palabras_clave from tagsInput
      const palabras_clave = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const updatedFaq = await faqsService.update(selectedFaq.id, {
        ...formData,
        palabras_clave,
      })

      console.log('FAQ updated successfully:', updatedFaq)
      setFaqs((prev) => prev.map((faq) => (faq.id === selectedFaq.id ? updatedFaq : faq)))
      setShowEditModal(false)
      resetForm()
    } catch (error) {
      console.error('Error updating FAQ:', error)
    }
  }

  // Handle delete
  const handleDelete = (faq: FAQ) => {
    console.log('Deleting FAQ:', faq)
    setSelectedFaq(faq)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedFaq) return

    try {
      console.log('Confirming delete for FAQ:', selectedFaq.id)
      await faqsService.delete(selectedFaq.id)

      console.log('FAQ deleted successfully')
      setFaqs((prev) => prev.filter((faq) => faq.id !== selectedFaq.id))
      setShowDeleteModal(false)
      setSelectedFaq(null)
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      pregunta: '',
      respuesta: '',
      dependencia_id: '',
      subdependencia_id: '',
      tema: '',
      palabras_clave: [],
      activo: true,
    })
    setTagsInput('')
    setSelectedFaq(null)
    setSelectedDependenciaId('')
    setFilteredSubdependencias([])
  }

  // Table columns
  const columns = [
    {
      key: 'pregunta',
      title: 'Pregunta',
      sortable: true,
      render: (value: any, faq: FAQ) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{faq.pregunta}</div>
        </div>
      ),
    },
    {
      key: 'respuesta',
      title: 'Respuesta',
      sortable: false,
      render: (value: any, faq: FAQ) => (
        <div className="max-w-sm">
          <div className="text-gray-600 text-sm line-clamp-2">{faq.respuesta}</div>
        </div>
      ),
    },
    {
      key: 'jerarquia',
      title: 'Dependencia > Subdependencia',
      sortable: false,
      render: (value: any, faq: FAQ) => {
        const dependencia = faq.dependencias
        const subdependencia = faq.subdependencias
        return (
          <div className="text-sm space-y-1">
            <div className="text-gray-900 font-medium">
              {dependencia?.nombre || 'Sin dependencia'}
            </div>
            <div className="text-gray-600">{subdependencia?.nombre || 'Sin subdependencia'}</div>
          </div>
        )
      },
    },
    {
      key: 'tema',
      title: 'Tema',
      sortable: true,
      render: (value: any, faq: FAQ) => (
        <div className="text-sm">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {faq.tema || 'Sin tema'}
          </span>
        </div>
      ),
    },
    {
      key: 'palabras_clave',
      title: 'Palabras Clave',
      sortable: false,
      render: (value: any, faq: FAQ) => (
        <div className="flex flex-wrap gap-1">
          {(faq.palabras_clave || []).slice(0, 3).map((palabra, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {palabra}
            </span>
          ))}
          {(faq.palabras_clave || []).length > 3 && (
            <span className="text-xs text-gray-500">
              +{(faq.palabras_clave || []).length - 3} más
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'activo',
      title: 'Estado',
      sortable: true,
      render: (value: any, faq: FAQ) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            faq.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {faq.activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: 'Actualizado',
      sortable: true,
      render: (value: any, faq: FAQ) => (
        <div className="text-sm text-gray-500">
          {new Date(faq.updated_at).toLocaleDateString('es-CO')}
        </div>
      ),
    },
  ]

  const actions = [
    {
      label: 'Editar',
      icon: '✏️',
      onClick: handleEdit,
    },
    {
      label: 'Eliminar',
      icon: '🗑️',
      onClick: handleDelete,
      variant: 'danger' as const,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando FAQs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de FAQs (Test)</h1>
              <p className="mt-2 text-gray-600">Prueba de la interfaz CRUD de FAQs</p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <span className="mr-2">➕</span>
              Nueva FAQ
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={faqs}
          columns={columns}
          rowActions={actions}
          loading={loading}
          searchable
          sortable
          pagination={{
            current: 1,
            pageSize: 10,
            total: faqs.length,
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} registros`,
          }}
        />

        {/* Create Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nueva FAQ">
          <div className="space-y-4">
            <Input
              label="Pregunta"
              value={formData.pregunta}
              onChange={(e) => setFormData((prev) => ({ ...prev, pregunta: e.target.value }))}
              placeholder="Ingrese la pregunta frecuente"
              required
            />

            <Textarea
              label="Respuesta"
              value={formData.respuesta}
              onChange={(e) => setFormData((prev) => ({ ...prev, respuesta: e.target.value }))}
              placeholder="Ingrese la respuesta detallada"
              rows={4}
              required
            />

            <Select
              label="Dependencia"
              value={selectedDependenciaId}
              onChange={(e) => handleDependenciaChange(e.target.value)}
              placeholder="Seleccione una dependencia"
              options={[
                ...dependencias.map((dep) => ({
                  value: dep.id,
                  label: `${dep.nombre} (${dep.codigo})`,
                })),
              ]}
              required
            />

            <Select
              label="Subdependencia"
              value={formData.subdependencia_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subdependencia_id: e.target.value }))
              }
              placeholder="Seleccione una subdependencia"
              options={[
                ...filteredSubdependencias.map((sub) => ({
                  value: sub.id,
                  label: sub.nombre,
                })),
              ]}
              required
              disabled={!selectedDependenciaId}
            />

            <Input
              label="Tema"
              value={formData.tema || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, tema: e.target.value }))}
              placeholder="ej: Certificados, Trámites, Documentos"
            />

            <Input
              label="Palabras Clave (separadas por comas)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ej: certificado, residencia, documentos, tramites"
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activa-create"
                checked={formData.activo}
                onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="activa-create" className="text-sm font-medium text-gray-700">
                FAQ Activa
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateSubmit}
                disabled={
                  !formData.pregunta ||
                  !formData.respuesta ||
                  !formData.dependencia_id ||
                  !formData.subdependencia_id
                }
              >
                Crear FAQ
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar FAQ">
          <div className="space-y-4">
            <Input
              label="Pregunta"
              value={formData.pregunta}
              onChange={(e) => setFormData((prev) => ({ ...prev, pregunta: e.target.value }))}
              placeholder="Ingrese la pregunta frecuente"
              required
            />

            <Textarea
              label="Respuesta"
              value={formData.respuesta}
              onChange={(e) => setFormData((prev) => ({ ...prev, respuesta: e.target.value }))}
              placeholder="Ingrese la respuesta detallada"
              rows={4}
              required
            />

            <Select
              label="Dependencia"
              value={selectedDependenciaId}
              onChange={(e) => handleDependenciaChange(e.target.value)}
              placeholder="Seleccione una dependencia"
              options={[
                ...dependencias.map((dep) => ({
                  value: dep.id,
                  label: `${dep.nombre} (${dep.codigo})`,
                })),
              ]}
              required
            />

            <Select
              label="Subdependencia"
              value={formData.subdependencia_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subdependencia_id: e.target.value }))
              }
              placeholder="Seleccione una subdependencia"
              options={[
                ...filteredSubdependencias.map((sub) => ({
                  value: sub.id,
                  label: sub.nombre,
                })),
              ]}
              required
              disabled={!selectedDependenciaId}
            />

            <Input
              label="Tema"
              value={formData.tema || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, tema: e.target.value }))}
              placeholder="ej: Certificados, Trámites, Documentos"
            />

            <Input
              label="Palabras Clave (separadas por comas)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ej: certificado, residencia, documentos, tramites"
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activa-edit"
                checked={formData.activo}
                onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="activa-edit" className="text-sm font-medium text-gray-700">
                FAQ Activa
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={
                  !formData.pregunta ||
                  !formData.respuesta ||
                  !formData.dependencia_id ||
                  !formData.subdependencia_id
                }
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Eliminar FAQ"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img src="/warning-icon.svg" alt="Warning" className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Eliminar FAQ</h3>
                <p className="text-sm text-gray-600">¿Estás seguro de que deseas continuar?</p>
              </div>
            </div>

            {selectedFaq && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{selectedFaq.pregunta}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedFaq.respuesta.substring(0, 100)}...
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
