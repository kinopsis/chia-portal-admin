'use client'

import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/components/organisms'
import { Modal, ConfirmDialog, Button, Badge } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { opasClientService } from '@/services/opas'
import { dependenciasClientService } from '@/services/dependencias'
import { subdependenciasClientService } from '@/services/subdependencias'
import { OPA, FormField, Dependencia, Subdependencia } from '@/types'
import { formatDate } from '@/utils'
import type { Column } from '@/components/organisms/DataTable'

interface OPAWithRelations extends OPA {
  subdependencias?: {
    id: string
    codigo: string
    nombre: string
    dependencia_id: string
    dependencias?: {
      id: string
      codigo: string
      nombre: string
    }
  }
}

export default function TestOPAsPage() {
  const [opas, setOpas] = useState<OPAWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOPA, setSelectedOPA] = useState<OPAWithRelations | null>(null)

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [subdependencias, setSubdependencias] = useState<Subdependencia[]>([])
  const [filteredSubdependencias, setFilteredSubdependencias] = useState<Subdependencia[]>([])
  const [selectedDependenciaId, setSelectedDependenciaId] = useState<string>('')

  // Load data
  const loadOpas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading OPAs data...')
      const response = await opasClientService.getAll()
      console.log('OPAs response:', response)
      console.log('First OPA data structure:', JSON.stringify(response.data[0], null, 2))
      console.log('OPAs data length:', response.data.length)
      console.log('First OPA subdependencias:', response.data[0]?.subdependencias)
      console.log('First OPA dependencias:', response.data[0]?.subdependencias?.dependencias)
      setOpas(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading OPAs')
      console.error('Error loading OPAs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDependencias = useCallback(async () => {
    try {
      console.log('Loading dependencias...')
      // Load ALL dependencias without pagination limit
      const response = await dependenciasClientService.getAll({ limit: 1000 })
      console.log('Dependencias loaded:', response.data.length)
      setDependencias(response.data)
    } catch (err) {
      console.error('Error loading dependencias:', err)
    }
  }, [])

  const loadSubdependencias = useCallback(async () => {
    try {
      console.log('Loading subdependencias...')
      // Load ALL subdependencias without pagination limit
      const response = await subdependenciasClientService.getAll({ limit: 1000 })
      console.log('Subdependencias loaded:', response.data.length)
      setSubdependencias(response.data)
    } catch (err) {
      console.error('Error loading subdependencias:', err)
    }
  }, [])

  useEffect(() => {
    console.log('Data loading completed')
    loadOpas()
    loadDependencias()
    loadSubdependencias()
  }, [loadOpas, loadDependencias, loadSubdependencias])

  // Table columns
  const columns: Column<OPAWithRelations>[] = [
    {
      key: 'codigo_opa',
      title: 'Código OPA',
      sortable: true,
      width: '140px',
      render: (value, record) => (
        <div className="font-mono text-sm">{record?.codigo_opa || 'N/A'}</div>
      ),
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 line-clamp-2">{record?.nombre || 'N/A'}</div>
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
            {record?.subdependencias?.dependencias?.nombre || 'Sin dependencia'}
          </div>
          <div className="text-xs text-gray-500">
            {record?.subdependencias?.nombre || 'Sin subdependencia'}
          </div>
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
    {
      key: 'actions',
      title: 'Acciones',
      width: '120px',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(record)} aria-label="Editar">
            ✏️
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(record)}
            aria-label="Eliminar"
          >
            🗑️
          </Button>
        </div>
      ),
    },
  ]

  // Handle dependencia selection change
  const handleDependenciaChange = (dependenciaValue: string) => {
    console.log('handleDependenciaChange called with:', dependenciaValue)

    // Find the dependencia by ID (if it's an ID) or by name (if it's a name)
    let dependencia = dependencias.find((dep) => dep.id === dependenciaValue)
    if (!dependencia) {
      dependencia = dependencias.find((dep) => dep.nombre === dependenciaValue)
    }

    if (dependencia) {
      console.log('Found dependencia:', dependencia)
      console.log('All subdependencias:', subdependencias)
      console.log('Subdependencias sample:', subdependencias.slice(0, 3))
      console.log('Looking for dependencia_id:', dependencia.id)

      setSelectedDependenciaId(dependencia.id)
      const filtered = subdependencias.filter((sub) => {
        console.log(
          `Checking subdependencia ${sub.nombre}: dependencia_id=${sub.dependencia_id} vs target=${dependencia.id}`
        )
        return sub.dependencia_id === dependencia.id
      })
      console.log('Filtered subdependencias:', filtered)
      setFilteredSubdependencias(filtered)
    } else {
      console.log('No dependencia found for:', dependenciaValue)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    }
  }

  // Form fields
  const getFormFields = (isEdit = false): FormField[] => [
    {
      name: 'codigo_opa',
      label: 'Código OPA',
      type: 'text',
      required: true,
      placeholder: 'Ej: 010-015-001',
      helperText: 'Código único de la OPA',
      disabled: isEdit,
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Nombre de la OPA',
    },
    {
      name: 'dependencia_id',
      label: 'Dependencia',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar dependencia', disabled: true },
        ...dependencias.map((dep) => ({
          value: dep.id,
          label: dep.nombre,
        })),
      ],
      onChange: handleDependenciaChange,
    },
    {
      name: 'subdependencia_id',
      label: 'Subdependencia',
      type: 'select',
      required: true,
      disabled: !selectedDependenciaId,
      options: [
        {
          value: '',
          label: selectedDependenciaId
            ? 'Seleccionar subdependencia'
            : 'Primero seleccione una dependencia',
          disabled: true,
        },
        ...filteredSubdependencias.map((sub) => ({
          value: sub.id,
          label: sub.nombre,
        })),
      ],
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
    setSelectedOPA(null)
    setSelectedDependenciaId('')
    setFilteredSubdependencias([])
    setIsCreateModalOpen(true)
  }

  const handleEdit = (opa: OPAWithRelations) => {
    console.log('Action started: edit', opa)
    setSelectedOPA(opa)
    // Set dependencia for edit mode
    if (opa.subdependencias?.dependencia_id) {
      setSelectedDependenciaId(opa.subdependencias.dependencia_id)
      const filtered = subdependencias.filter(
        (sub) => sub.dependencia_id === opa.subdependencias?.dependencia_id
      )
      setFilteredSubdependencias(filtered)
    }
    setIsEditModalOpen(true)
    console.log('Action completed: edit', opa)
  }

  const handleDelete = (opa: OPAWithRelations) => {
    console.log('Action started: delete', opa)
    setSelectedOPA(opa)
    setIsDeleteDialogOpen(true)
    console.log('Action completed: delete', opa)
  }

  const handleSubmitCreate = async (formData: Record<string, any>, isValid: boolean) => {
    if (!isValid) return

    try {
      setIsSubmitting(true)
      console.log('Creating OPA:', formData)

      const opaData = {
        codigo_opa: formData.codigo_opa as string,
        nombre: formData.nombre as string,
        subdependencia_id: formData.subdependencia_id as string,
        activo: Boolean(formData.activo),
      }

      await opasClientService.create(opaData)
      await loadOpas()
      setIsCreateModalOpen(false)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    } catch (err) {
      console.error('Error creating OPA:', err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEdit = async (formData: Record<string, any>, isValid: boolean) => {
    if (!selectedOPA || !isValid) return

    try {
      setIsSubmitting(true)
      console.log('Updating OPA:', formData)

      const updates = {
        nombre: formData.nombre as string,
        subdependencia_id: formData.subdependencia_id as string,
        activo: Boolean(formData.activo),
      }

      await opasClientService.update(selectedOPA.id, updates)
      await loadOpas()
      setIsEditModalOpen(false)
      setSelectedDependenciaId('')
      setFilteredSubdependencias([])
    } catch (err) {
      console.error('Error updating OPA:', err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedOPA) return

    try {
      setIsSubmitting(true)
      console.log('Deleting OPA:', selectedOPA)

      await opasClientService.delete(selectedOPA.id)
      await loadOpas()
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error('Error deleting OPA:', err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter data based on search
  const filteredOpas = opas.filter(
    (opa) =>
      opa.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opa.codigo_opa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opa.subdependencias?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opa.subdependencias?.dependencias?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de OPAs (Test)</h1>
              <p className="mt-2 text-gray-600">Prueba de la interfaz CRUD de OPAs</p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <span>➕</span>
              <span>Nueva OPA</span>
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={filteredOpas}
            columns={columns}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar en la tabla"
            emptyMessage="No se encontraron OPAs"
          />
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear Nueva OPA"
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
                form="create-opa-form"
                variant="primary"
                isLoading={isSubmitting}
              >
                Crear OPA
              </Button>
            </>
          }
        >
          <Form
            id="create-opa-form"
            fields={getFormFields()}
            onSubmit={handleSubmitCreate}
            initialData={{ activo: true }}
            validateOnChange
            validateOnBlur
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar OPA"
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
              <Button type="submit" form="edit-opa-form" variant="primary" isLoading={isSubmitting}>
                Guardar Cambios
              </Button>
            </>
          }
        >
          {selectedOPA && (
            <Form
              id="edit-opa-form"
              fields={getFormFields(true)}
              initialData={{
                codigo_opa: selectedOPA.codigo_opa,
                nombre: selectedOPA.nombre,
                dependencia_id: selectedOPA.subdependencias?.dependencia_id || '',
                subdependencia_id: selectedOPA.subdependencia_id,
                activo: selectedOPA.activo,
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
          title="Eliminar OPA"
          confirmText="Eliminar"
          cancelText="Cancelar"
          confirmVariant="danger"
          loading={isSubmitting}
        >
          {selectedOPA && (
            <>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar la OPA <strong>{selectedOPA.nombre}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
            </>
          )}
        </ConfirmDialog>
      </div>
    </div>
  )
}
