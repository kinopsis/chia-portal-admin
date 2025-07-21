'use client'

import React, { useState, useCallback } from 'react'
import { Card, Button, Modal, ConfirmDialog } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { DataTable } from '@/components/organisms'
import { validateForm, commonValidationRules } from '@/lib/validation'
import type { FormField } from '@/types'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate } from '@/utils'

// Mock data type
interface MockDependencia {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  activa: boolean
  created_at: string
  updated_at: string
  subdependencias_count?: number
  tramites_count?: number
  opas_count?: number
}

// Mock data
const mockDependencias: MockDependencia[] = [
  {
    id: '1',
    codigo: 'DEP-001',
    nombre: 'Alcaldía Municipal',
    descripcion: 'Despacho del Alcalde y coordinación general del municipio',
    activa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subdependencias_count: 3,
    tramites_count: 15,
    opas_count: 8,
  },
  {
    id: '2',
    codigo: 'DEP-002',
    nombre: 'Secretaría de Planeación',
    descripcion: 'Planificación urbana y desarrollo territorial del municipio',
    activa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subdependencias_count: 2,
    tramites_count: 12,
    opas_count: 5,
  },
  {
    id: '3',
    codigo: 'DEP-003',
    nombre: 'Secretaría de Hacienda',
    descripcion: 'Gestión financiera y tributaria del municipio',
    activa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subdependencias_count: 4,
    tramites_count: 20,
    opas_count: 12,
  },
  {
    id: '4',
    codigo: 'DEP-004',
    nombre: 'Secretaría de Obras Públicas',
    descripcion: 'Infraestructura y mantenimiento de obras públicas',
    activa: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subdependencias_count: 1,
    tramites_count: 8,
    opas_count: 3,
  },
]

const TestDependenciasPage: React.FC = () => {
  const [dependencias, setDependencias] = useState<MockDependencia[]>(mockDependencias)
  const [loading, setLoading] = useState(false)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDependencia, setSelectedDependencia] = useState<MockDependencia | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form fields for Dependencia
  const formFields: FormField[] = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text',
      required: true,
      placeholder: 'Código único de la dependencia (ej: DEP-001)',
      helpText: 'Código único identificador de la dependencia',
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
      placeholder: 'Nombre de la dependencia',
      validation: commonValidationRules.required,
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción de la dependencia y sus funciones',
      helpText: 'Descripción detallada de las funciones y responsabilidades',
    },
    {
      name: 'activa',
      label: 'Activa',
      type: 'checkbox',
      defaultValue: true,
      helpText: 'Indica si la dependencia está activa en el sistema',
    },
  ]

  // Table columns
  const columns: Column<MockDependencia>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      render: (value, dependencia) => (
        <span className="font-mono text-sm">{dependencia.codigo}</span>
      ),
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value, dependencia) => (
        <div>
          <div className="font-medium">{dependencia.nombre}</div>
          {dependencia.descripcion && (
            <div className="text-sm text-gray-500 truncate max-w-xs">{dependencia.descripcion}</div>
          )}
        </div>
      ),
    },
    {
      key: 'subdependencias_count',
      title: 'Subdependencias',
      render: (value, dependencia) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {dependencia.subdependencias_count || 0}
        </span>
      ),
    },
    {
      key: 'tramites_count',
      title: 'Trámites',
      render: (value, dependencia) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {dependencia.tramites_count || 0}
        </span>
      ),
    },
    {
      key: 'activa',
      title: 'Estado',
      sortable: true,
      render: (value, dependencia) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            dependencia.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {dependencia.activa ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: 'Actualizado',
      sortable: true,
      render: (value, dependencia) => (
        <span className="text-sm text-gray-500">{formatDate(dependencia.updated_at)}</span>
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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newDependencia: MockDependencia = {
        id: Date.now().toString(),
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        activa: formData.activa ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdependencias_count: 0,
        tramites_count: 0,
        opas_count: 0,
      }

      setDependencias((prev) => [...prev, newDependencia])
      setIsCreateModalOpen(false)
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

      const validation = validateForm(formData, formFields)
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0])
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setDependencias((prev) =>
        prev.map((dep) =>
          dep.id === selectedDependencia.id
            ? {
                ...dep,
                codigo: formData.codigo,
                nombre: formData.nombre,
                descripcion: formData.descripcion || undefined,
                activa: formData.activa ?? true,
                updated_at: new Date().toISOString(),
              }
            : dep
        )
      )

      setIsEditModalOpen(false)
      setSelectedDependencia(null)
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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setDependencias((prev) => prev.filter((dep) => dep.id !== selectedDependencia.id))
      setIsDeleteModalOpen(false)
      setSelectedDependencia(null)
    } catch (err) {
      console.error('Error deleting dependencia:', err)
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
      onClick: (record: MockDependencia) => {
        console.log(`Action started: edit`, record)
        setSelectedDependencia(record)
        setIsEditModalOpen(true)
        console.log(`Action completed: edit`, record)
      },
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      variant: 'danger' as const,
      onClick: (record: MockDependencia) => {
        console.log(`Action started: delete`, record)
        setSelectedDependencia(record)
        setIsDeleteModalOpen(true)
        console.log(`Action completed: delete`, record)
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Dependencias (Test)</h1>
          <p className="text-gray-600">Prueba de la interfaz CRUD de dependencias</p>
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
          rowActions={rowActions}
          searchPlaceholder="Buscar dependencias..."
          showSearchAndFilters
          emptyStateProps={{
            title: 'No hay dependencias',
            description: 'No se encontraron dependencias. Crea la primera dependencia.',
            action: (
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                Crear Dependencia
              </Button>
            ),
          }}
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
        message={
          selectedDependencia ? (
            <>
              ¿Estás seguro de que deseas eliminar la dependencia{' '}
              <strong>{selectedDependencia.nombre}</strong>?
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
  )
}

export default TestDependenciasPage
