'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal, ConfirmDialog } from '@/components/atoms'
import { Form, FormField } from '@/components/molecules'
import { DataTable } from '@/components/organisms'
import { RoleGuard } from '@/components/auth'
import { dependenciasClientService } from '@/services'
import { commonValidationRules } from '@/lib/validation'
import type { Dependencia } from '@/types'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'

// Extended type for Dependencias with stats
interface DependenciaWithStats extends Dependencia {
  subdependencias_count?: number
  tramites_count?: number
  opas_count?: number
}

const DependenciasAdminPage: React.FC = () => {
  const { user } = useAuth()
  const [dependencias, setDependencias] = useState<DependenciaWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDependencia, setSelectedDependencia] = useState<DependenciaWithStats | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Load dependencias
  const loadDependencias = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dependenciasClientService.getAll()
      setDependencias(response.data)
    } catch (err) {
      console.error('Error loading dependencias:', err)
      setError('Error al cargar las dependencias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDependencias()
  }, [loadDependencias])

  // Form fields for Dependencia
  const formFields: FormField[] = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text',
      required: true,
      placeholder: 'Código único de la dependencia (ej: DEP-001)',
      helperText: 'Código único identificador de la dependencia',
      validation: {
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
      placeholder: 'Nombre de la dependencia',

    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción de la dependencia y sus funciones',
      helperText: 'Descripción detallada de las funciones y responsabilidades',
    },
    {
      name: 'activa',
      label: 'Activa',
      type: 'checkbox',
            helperText: 'Indica si la dependencia está activa en el sistema',
    },
  ]

  // Table columns
  const columns: Column<DependenciaWithStats>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      width: '120px',
      render: (value, record) => (
        <span className="font-mono text-sm">{record?.codigo || 'N/A'}</span>
      ),
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{record?.nombre || 'N/A'}</div>
          {record?.descripcion && (
            <div className="text-sm text-text-muted truncate max-w-xs">{record.descripcion}</div>
          )}
        </div>
      ),
    },
    {
      key: 'subdependencias_count',
      title: 'Subdependencias',
      sortable: false,
      width: '140px',
      render: (value, record) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info">
          {record?.subdependencias_count || 0}
        </span>
      ),
    },
    {
      key: 'activa',
      title: 'Estado',
      sortable: true,
      width: '100px',
      render: (value, record) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            record?.activo ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}
        >
          {record?.activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: 'Actualizado',
      sortable: true,
      render: (value, record) => (
        <span className="text-sm text-text-muted">
          {record?.updated_at ? formatDate(record.updated_at) : 'N/A'}
        </span>
      ),
    },
  ]

  // Handle create
  const handleCreate = async (formData: Record<string, any>) => {
    try {
      setFormLoading(true)

      await dependenciasClientService.create({
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        activo: formData.activo ?? true,
      })

      setIsCreateModalOpen(false)
      await loadDependencias()
    } catch (err) {
      console.error('Error creating dependencia:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  // Handle edit
  const handleEdit = async (formData: Record<string, any>) => {
    if (!selectedDependencia) return

    try {
      setFormLoading(true)

      await dependenciasClientService.update(selectedDependencia.id, {
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        activo: formData.activo ?? true,
      })

      setIsEditModalOpen(false)
      setSelectedDependencia(null)
      await loadDependencias()
    } catch (err) {
      console.error('Error updating dependencia:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDependencia) return

    try {
      setFormLoading(true)
      await dependenciasClientService.delete(selectedDependencia.id)
      setIsDeleteModalOpen(false)
      setSelectedDependencia(null)
      await loadDependencias()
    } catch (err) {
      console.error('Error deleting dependencia:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  // Handle actions
  const handleAction = (action: string, dependencia: DependenciaWithStats) => {
    switch (action) {
      case 'edit':
        setSelectedDependencia(dependencia)
        setIsEditModalOpen(true)
        break
      case 'delete':
        setSelectedDependencia(dependencia)
        setIsDeleteModalOpen(true)
        break
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
        <div className="text-center py-8">
            <div className="text-error mb-2">❌</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Error</h3>
            <p className="text-text-secondary">{error}</p>
            <Button onClick={loadDependencias} className="mt-4">
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
            <h1 className="text-2xl font-bold text-text-primary">Gestión de Dependencias</h1>
            <p className="text-text-secondary">Administra las dependencias municipales</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <span>➕</span>
            <span>Nueva Dependencia</span>
          </Button>
        </div>

        {/* Data Table */}
        <Card>
          <DataTable
            data={dependencias}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Buscar dependencias..."
            emptyMessage="No se encontraron dependencias"
            rowActions={[
              {
                key: 'edit',
                label: 'Editar',
                icon: '✏️',
                onClick: (record) => handleAction('edit', record),
              },
              {
                key: 'delete',
                label: 'Eliminar',
                icon: '🗑️',
                variant: 'danger',
                onClick: (record) => handleAction('delete', record),
              },
            ]}
          />
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear Nueva Dependencia"
          size="lg"
        >
          <Form
            fields={formFields}
            onSubmit={handleCreate}
            loading={formLoading}
            submitLabel="Crear Dependencia"
            cancelLabel="Cancelar"
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedDependencia(null)
          }}
          title="Editar Dependencia"
          size="lg"
        >
          {selectedDependencia && (
            <Form
              fields={formFields}
              initialData={selectedDependencia}
              onSubmit={handleEdit}
              loading={formLoading}
              submitLabel="Guardar Cambios"
              cancelLabel="Cancelar"
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedDependencia(null)
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedDependencia(null)
          }}
          onConfirm={handleDelete}
          title="Eliminar Dependencia"
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={formLoading}
          confirmVariant="danger"
        >
          {selectedDependencia && (
            <>
              <p className="text-text-secondary">
                ¿Estás seguro de que deseas eliminar la dependencia{' '}
                <strong>{selectedDependencia.nombre}</strong>?
              </p>
              <p className="text-sm text-error mt-2">Esta acción no se puede deshacer.</p>
            </>
          )}
        </ConfirmDialog>
      </div>
    </RoleGuard>
  )
}

export default DependenciasAdminPage
