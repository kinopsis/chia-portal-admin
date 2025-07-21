'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal, ConfirmDialog } from '@/components/atoms'
import { Form, FormField } from '@/components/molecules'
import { DataTable } from '@/components/organisms'
import { RoleGuard } from '@/components/auth'
import { subdependenciasClientService, dependenciasClientService } from '@/services'
import { validateForm, commonValidationRules } from '@/lib/validation'
import type { Subdependencia, Dependencia } from '@/types'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'

// Extended type for Subdependencias with relations
interface SubdependenciaWithRelations extends Subdependencia {
  dependencias?: {
    id: string
    nombre: string
  }
  tramites_count?: number
  opas_count?: number
}

const SubdependenciasAdminPage: React.FC = () => {
  const { user } = useAuth()
  const [subdependencias, setSubdependencias] = useState<SubdependenciaWithRelations[]>([])
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSubdependencia, setSelectedSubdependencia] =
    useState<SubdependenciaWithRelations | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load both subdependencias and dependencias
      const [subdependenciasResponse, dependenciasResponse] = await Promise.all([
        subdependenciasClientService.getAll(),
        dependenciasClientService.getAll(),
      ])

      // Add default counts for display and ensure data structure is correct
      const subdependenciasWithCounts = (subdependenciasResponse.data || []).map((sub) => ({
        ...sub,
        tramites_count: 0, // TODO: Implement actual count query
        opas_count: 0, // TODO: Implement actual count query
      }))

      setSubdependencias(subdependenciasWithCounts)
      setDependencias(dependenciasResponse.data || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(
        `Error al cargar los datos: ${err instanceof Error ? err.message : 'Error desconocido'}`
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Form fields for Subdependencia
  const formFields: FormField[] = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text',
      required: true,
      placeholder: 'Código único de la subdependencia (ej: SUB-001)',
      helperText: 'Código único identificador de la subdependencia',
      validation: {
        ...commonValidationRules.required,
        pattern: {
          value: /^[A-Z0-9-]+$/,
          message: 'El código debe contener solo letras mayúsculas, números y guiones',
        },
      },
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Nombre de la subdependencia',
      validation: commonValidationRules.required,
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción de la subdependencia y sus funciones',
      helperText: 'Descripción detallada de las funciones y responsabilidades',
    },
    {
      name: 'dependencia_id',
      label: 'Dependencia',
      type: 'select',
      required: true,
      options: dependencias.map((dep) => ({
        value: dep.id,
        label: dep.nombre,
      })),
      placeholder: 'Seleccionar dependencia',
      validation: commonValidationRules.required,
    },
    {
      name: 'activa',
      label: 'Activa',
      type: 'checkbox',
      defaultValue: true,
      helperText: 'Indica si la subdependencia está activa en el sistema',
    },
  ]

  // Table columns
  const columns: Column<SubdependenciaWithRelations>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      render: (value, record) => <span className="font-mono text-sm">{record.codigo}</span>,
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{record.nombre}</div>
          {record.descripcion && (
            <div className="text-sm text-gray-500 truncate max-w-xs">{record.descripcion}</div>
          )}
        </div>
      ),
    },
    {
      key: 'dependencias',
      title: 'Dependencia',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium text-sm">{record.dependencias?.nombre || 'Sin asignar'}</div>
        </div>
      ),
    },
    {
      key: 'tramites_count',
      title: 'Trámites',
      render: (value, record) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {record.tramites_count || 0}
        </span>
      ),
    },
    {
      key: 'activa',
      title: 'Estado',
      sortable: true,
      render: (value, record) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            record.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {record.activa ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: 'Actualizado',
      sortable: true,
      render: (value, record) => (
        <span className="text-sm text-gray-500">{formatDate(record.updated_at)}</span>
      ),
    },
  ]

  // Handle create
  const handleCreate = async (formData: Record<string, any>) => {
    try {
      setFormLoading(true)

      const validation = validateForm(formData, formFields)
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0])
      }

      await subdependenciasClientService.create({
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        dependencia_id: formData.dependencia_id,
        activa: formData.activa ?? true,
      })

      setIsCreateModalOpen(false)
      await loadData()
    } catch (err) {
      console.error('Error creating subdependencia:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  // Handle edit
  const handleEdit = async (formData: Record<string, any>) => {
    if (!selectedSubdependencia) return

    try {
      setFormLoading(true)

      const validation = validateForm(formData, formFields)
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0])
      }

      await subdependenciasClientService.update(selectedSubdependencia.id, {
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        dependencia_id: formData.dependencia_id,
        activa: formData.activa ?? true,
      })

      setIsEditModalOpen(false)
      setSelectedSubdependencia(null)
      await loadData()
    } catch (err) {
      console.error('Error updating subdependencia:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedSubdependencia) return

    try {
      setFormLoading(true)
      await subdependenciasClientService.delete(selectedSubdependencia.id)
      setIsDeleteModalOpen(false)
      setSelectedSubdependencia(null)
      await loadData()
    } catch (err) {
      console.error('Error deleting subdependencia:', err)
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
      onClick: (record: SubdependenciaWithRelations) => {
        setSelectedSubdependencia(record)
        setIsEditModalOpen(true)
      },
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      variant: 'danger' as const,
      onClick: (record: SubdependenciaWithRelations) => {
        setSelectedSubdependencia(record)
        setIsDeleteModalOpen(true)
      },
    },
  ]

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={loadData} className="mt-4">
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'funcionario']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Subdependencias</h1>
            <p className="text-gray-600">Administra las subdependencias organizacionales</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <span>➕</span>
            <span>Nueva Subdependencia</span>
          </Button>
        </div>

        {/* Data Table */}
        <Card>
          <DataTable
            data={subdependencias}
            columns={columns}
            loading={loading}
            error={error}
            rowActions={rowActions}
            searchPlaceholder="Buscar subdependencias..."
            showSearchAndFilters
            emptyStateProps={{
              title: 'No hay subdependencias',
              description: 'No se encontraron subdependencias. Crea la primera subdependencia.',
              action: (
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  Crear Subdependencia
                </Button>
              ),
            }}
          />
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear Nueva Subdependencia"
          size="lg"
        >
          <Form
            fields={formFields}
            onSubmit={handleCreate}
            loading={formLoading}
            submitLabel="Crear Subdependencia"
            cancelLabel="Cancelar"
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedSubdependencia(null)
          }}
          title="Editar Subdependencia"
          size="lg"
        >
          {selectedSubdependencia && (
            <Form
              fields={formFields}
              initialData={selectedSubdependencia}
              onSubmit={handleEdit}
              loading={formLoading}
              submitLabel="Guardar Cambios"
              cancelLabel="Cancelar"
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedSubdependencia(null)
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedSubdependencia(null)
          }}
          onConfirm={handleDelete}
          title="Eliminar Subdependencia"
          message={
            selectedSubdependencia ? (
              <>
                ¿Estás seguro de que deseas eliminar la subdependencia{' '}
                <strong>{selectedSubdependencia.nombre}</strong>?
              </>
            ) : (
              ''
            )
          }
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          loading={formLoading}
          variant="danger"
        />
      </div>
    </RoleGuard>
  )
}

export default SubdependenciasAdminPage
