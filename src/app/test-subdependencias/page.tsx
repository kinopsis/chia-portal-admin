'use client'

import React, { useState, useCallback } from 'react'
import { Card, Button, Modal, ConfirmDialog } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { DataTable } from '@/components/organisms'
import { validateForm, commonValidationRules } from '@/lib/validation'
import type { FormField } from '@/types'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate } from '@/utils'

// Mock data types
interface MockSubdependencia {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  dependencia_id: string
  activa: boolean
  created_at: string
  updated_at: string
  dependencias?: {
    id: string
    nombre: string
  }
  tramites_count?: number
  opas_count?: number
}

interface MockDependencia {
  id: string
  nombre: string
}

// Mock dependencias data
const mockDependencias: MockDependencia[] = [
  { id: '1', nombre: 'Alcaldía Municipal' },
  { id: '2', nombre: 'Secretaría de Planeación' },
  { id: '3', nombre: 'Secretaría de Hacienda' },
  { id: '4', nombre: 'Secretaría de Obras Públicas' }
]

// Mock subdependencias data
const mockSubdependencias: MockSubdependencia[] = [
  {
    id: '1',
    codigo: 'SUB-001',
    nombre: 'Secretaría General',
    descripcion: 'Coordinación administrativa y secretarial del despacho',
    dependencia_id: '1',
    activa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dependencias: { id: '1', nombre: 'Alcaldía Municipal' },
    tramites_count: 8,
    opas_count: 4
  },
  {
    id: '2',
    codigo: 'SUB-002',
    nombre: 'Planeación Municipal',
    descripcion: 'Desarrollo urbano y ordenamiento territorial',
    dependencia_id: '2',
    activa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dependencias: { id: '2', nombre: 'Secretaría de Planeación' },
    tramites_count: 12,
    opas_count: 6
  },
  {
    id: '3',
    codigo: 'SUB-003',
    nombre: 'Tesorería Municipal',
    descripcion: 'Gestión de ingresos y pagos del municipio',
    dependencia_id: '3',
    activa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dependencias: { id: '3', nombre: 'Secretaría de Hacienda' },
    tramites_count: 15,
    opas_count: 10
  },
  {
    id: '4',
    codigo: 'SUB-004',
    nombre: 'Mantenimiento Vial',
    descripcion: 'Mantenimiento y reparación de vías públicas',
    dependencia_id: '4',
    activa: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dependencias: { id: '4', nombre: 'Secretaría de Obras Públicas' },
    tramites_count: 5,
    opas_count: 2
  }
]

const TestSubdependenciasPage: React.FC = () => {
  const [subdependencias, setSubdependencias] = useState<MockSubdependencia[]>(mockSubdependencias)
  const [loading, setLoading] = useState(false)
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSubdependencia, setSelectedSubdependencia] = useState<MockSubdependencia | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form fields for Subdependencia
  const formFields: FormField[] = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text',
      required: true,
      placeholder: 'Código único de la subdependencia (ej: SUB-001)',
      helpText: 'Código único identificador de la subdependencia',
      validation: {
        ...commonValidationRules.required,
        pattern: {
          value: /^[A-Z0-9-]+$/,
          message: 'El código debe contener solo letras mayúsculas, números y guiones'
        }
      }
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Nombre de la subdependencia',
      validation: commonValidationRules.required
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción de la subdependencia y sus funciones',
      helpText: 'Descripción detallada de las funciones y responsabilidades'
    },
    {
      name: 'dependencia_id',
      label: 'Dependencia',
      type: 'select',
      required: true,
      options: mockDependencias.map(dep => ({
        value: dep.id,
        label: dep.nombre
      })),
      placeholder: 'Seleccionar dependencia',
      validation: commonValidationRules.required
    },
    {
      name: 'activa',
      label: 'Activa',
      type: 'checkbox',
      defaultValue: true,
      helpText: 'Indica si la subdependencia está activa en el sistema'
    }
  ]

  // Table columns
  const columns: Column<MockSubdependencia>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      render: (value, subdependencia) => (
        <span className="font-mono text-sm">{subdependencia.codigo}</span>
      )
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value, subdependencia) => (
        <div>
          <div className="font-medium">{subdependencia.nombre}</div>
          {subdependencia.descripcion && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {subdependencia.descripcion}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'dependencias',
      title: 'Dependencia',
      sortable: true,
      render: (value, subdependencia) => (
        <div>
          <div className="font-medium text-sm">
            {subdependencia.dependencias?.nombre || 'Sin asignar'}
          </div>
        </div>
      )
    },
    {
      key: 'tramites_count',
      title: 'Trámites',
      render: (value, subdependencia) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {subdependencia.tramites_count || 0}
        </span>
      )
    },
    {
      key: 'opas_count',
      title: 'OPAs',
      render: (value, subdependencia) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {subdependencia.opas_count || 0}
        </span>
      )
    },
    {
      key: 'activa',
      title: 'Estado',
      sortable: true,
      render: (value, subdependencia) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          subdependencia.activa
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {subdependencia.activa ? 'Activa' : 'Inactiva'}
        </span>
      )
    },
    {
      key: 'updated_at',
      title: 'Actualizado',
      sortable: true,
      render: (value, subdependencia) => (
        <span className="text-sm text-gray-500">
          {formatDate(subdependencia.updated_at)}
        </span>
      )
    }
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
      await new Promise(resolve => setTimeout(resolve, 1000))

      const selectedDep = mockDependencias.find(dep => dep.id === formData.dependencia_id)
      
      const newSubdependencia: MockSubdependencia = {
        id: Date.now().toString(),
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        dependencia_id: formData.dependencia_id,
        activa: formData.activa ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dependencias: selectedDep ? { id: selectedDep.id, nombre: selectedDep.nombre } : undefined,
        tramites_count: 0,
        opas_count: 0
      }

      setSubdependencias(prev => [...prev, newSubdependencia])
      setIsCreateModalOpen(false)
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const selectedDep = mockDependencias.find(dep => dep.id === formData.dependencia_id)

      setSubdependencias(prev => prev.map(sub => 
        sub.id === selectedSubdependencia.id 
          ? {
              ...sub,
              codigo: formData.codigo,
              nombre: formData.nombre,
              descripcion: formData.descripcion || undefined,
              dependencia_id: formData.dependencia_id,
              activa: formData.activa ?? true,
              updated_at: new Date().toISOString(),
              dependencias: selectedDep ? { id: selectedDep.id, nombre: selectedDep.nombre } : undefined
            }
          : sub
      ))

      setIsEditModalOpen(false)
      setSelectedSubdependencia(null)
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSubdependencias(prev => prev.filter(sub => sub.id !== selectedSubdependencia.id))
      setIsDeleteModalOpen(false)
      setSelectedSubdependencia(null)
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
      onClick: (record: MockSubdependencia) => {
        console.log(`Action started: edit`, record)
        setSelectedSubdependencia(record)
        setIsEditModalOpen(true)
        console.log(`Action completed: edit`, record)
      },
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      variant: 'danger' as const,
      onClick: (record: MockSubdependencia) => {
        console.log(`Action started: delete`, record)
        setSelectedSubdependencia(record)
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Subdependencias (Test)</h1>
          <p className="text-gray-600">Prueba de la interfaz CRUD de subdependencias</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
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
          rowActions={rowActions}
          searchPlaceholder="Buscar subdependencias..."
          showSearchAndFilters
          emptyStateProps={{
            title: 'No hay subdependencias',
            description: 'No se encontraron subdependencias. Crea la primera subdependencia.',
            action: (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
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
          ) : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={formLoading}
        variant="danger"
      />
    </div>
  )
}

export default TestSubdependenciasPage
