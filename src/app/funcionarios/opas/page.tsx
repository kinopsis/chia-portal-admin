'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal, ConfirmDialog, Badge } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { DataTable } from '@/components/organisms'
import { RoleGuard } from '@/components/auth'
import { opasClientService } from '@/services/opas'
import { supabase } from '@/lib/supabase/client'
import { normalizeSpanishText } from '@/lib/utils'
import type { FormField, OPA, Dependencia, Subdependencia } from '@/types'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate, formatCurrency } from '@/utils'

export default function FuncionariosOPAsPage() {
  const [opas, setOpas] = useState<OPA[]>([])
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
  const [selectedOPA, setSelectedOPA] = useState<any>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Load data functions
  const loadOpas = useCallback(async () => {
    try {
      const response = await opasClientService.getAll()
      setOpas(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading OPAs')
      console.error('Error loading OPAs:', err)
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
        await Promise.all([loadOpas(), loadDependencias(), loadSubdependencias()])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [loadOpas, loadDependencias, loadSubdependencias])

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
  const columns: Column<OPA>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      width: '120px',
      render: (value, record) => (
        <div className="font-mono text-sm font-medium text-purple-600">
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

  // Form fields
  const getFormFields = (): FormField[] => [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text',
      required: true,
      placeholder: 'Ej: OPA-001',
    },
    {
      name: 'nombre',
      label: 'Nombre de la OPA',
      type: 'text',
      required: true,
      placeholder: 'Nombre descriptivo de la OPA',
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      placeholder: 'Descripción detallada de la OPA',
      rows: 3,
    },
    {
      name: 'dependencia_id',
      label: 'Dependencia',
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
    },
    {
      name: 'tipo_pago',
      label: 'Tipo de Pago',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar tipo de pago' },
        { value: 'gratuito', label: 'Gratuito' },
        { value: 'pago', label: 'Pago' },
      ],
    },
    {
      name: 'valor',
      label: 'Valor (COP)',
      type: 'number',
      required: false,
      placeholder: '0',
      min: 0,
    },
    {
      name: 'tiempo_estimado',
      label: 'Tiempo Estimado',
      type: 'text',
      required: false,
      placeholder: 'Ej: 3 días hábiles',
    },
    {
      name: 'requisitos',
      label: 'Requisitos',
      type: 'textarea',
      required: false,
      placeholder: 'Lista de requisitos necesarios',
      rows: 3,
    },
    {
      name: 'activo',
      label: 'Activo',
      type: 'checkbox',
    },
  ]

  // Event handlers
  const handleCreate = () => {
    setSelectedOPA(null)
    setSelectedDependenciaId('')
    setFilteredSubdependencias([])
    setIsCreateModalOpen(true)
  }

  const handleEdit = (opa: OPA) => {
    setSelectedOPA(opa)

    if (opa.dependencia_id) {
      setSelectedDependenciaId(opa.dependencia_id)
      const filtered = subdependencias.filter((sub) => sub.dependencia_id === opa.dependencia_id)
      setFilteredSubdependencias(filtered)
    }

    setIsEditModalOpen(true)
  }

  const handleDelete = (opa: OPA) => {
    setSelectedOPA(opa)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitCreate = async (formData: Record<string, any>, isValid: boolean) => {
    if (!isValid) return

    try {
      setFormLoading(true)

      const opaData = {
        codigo: formData.codigo as string,
        nombre: formData.nombre as string,
        descripcion: formData.descripcion as string,
        dependencia_id: formData.dependencia_id as string,
        subdependencia_id: formData.subdependencia_id as string,
        tipo_pago: formData.tipo_pago as string,
        valor: formData.tipo_pago === 'gratuito' ? 0 : (parseInt(formData.valor as string) || 0),
        tiempo_estimado: (formData.tiempo_estimado as string) || null,
        requisitos: (formData.requisitos as string) || null,
        activo: Boolean(formData.activo),
      }

      await opasClientService.create(opaData)
      await loadOpas()
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Error creating OPA:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmitEdit = async (formData: Record<string, any>, isValid: boolean) => {
    if (!selectedOPA || !isValid) return

    try {
      setFormLoading(true)

      const updates = {
        codigo: formData.codigo as string,
        nombre: formData.nombre as string,
        descripcion: formData.descripcion as string,
        dependencia_id: formData.dependencia_id as string,
        subdependencia_id: formData.subdependencia_id as string,
        tipo_pago: formData.tipo_pago as string,
        valor: formData.tipo_pago === 'gratuito' ? 0 : (parseInt(formData.valor as string) || 0),
        tiempo_estimado: (formData.tiempo_estimado as string) || null,
        requisitos: (formData.requisitos as string) || null,
        activo: Boolean(formData.activo),
      }

      await opasClientService.update(selectedOPA.id, updates)
      await loadOpas()
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Error updating OPA:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedOPA) return

    try {
      setFormLoading(true)
      await opasClientService.delete(selectedOPA.id)
      await loadOpas()
      setIsDeleteModalOpen(false)
    } catch (err) {
      console.error('Error deleting OPA:', err)
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
  const filteredOpas = opas.filter((opa) => {
    if (!searchQuery) return true

    const normalizedQuery = normalizeSpanishText(searchQuery)
    const normalizedCodigo = normalizeSpanishText(opa.codigo || '')
    const normalizedNombre = normalizeSpanishText(opa.nombre || '')
    const normalizedDescripcion = normalizeSpanishText(opa.descripcion || '')
    const normalizedDependencia = normalizeSpanishText(opa.dependencias?.nombre || '')
    const normalizedSubdependencia = normalizeSpanishText(opa.subdependencias?.nombre || '')

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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de OPAs</h1>
            <p className="text-gray-600">Administrar Órdenes de Pago y Autorización</p>
          </div>
          <Button variant="primary" onClick={handleCreate} className="flex items-center space-x-2">
            <span>➕</span>
            <span>Nueva OPA</span>
          </Button>
        </div>

        {/* Data Table */}
        <Card>
          <DataTable
            data={filteredOpas}
            columns={columns}
            loading={loading}
            error={error}
            rowActions={rowActions}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar OPAs..."
            showSearchAndFilters
            emptyStateProps={{
              title: 'No hay OPAs',
              description: 'No se encontraron OPAs. Crea la primera OPA.',
              action: (
                <Button variant="primary" onClick={handleCreate}>
                  Crear OPA
                </Button>
              ),
            }}
          />
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear Nueva OPA"
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
                form="create-opa-form"
                variant="primary"
                isLoading={formLoading}
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
            initialData={{ activo: true, tipo_pago: 'gratuito', valor: 0 }}
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
                variant="neutral"
                onClick={() => setIsEditModalOpen(false)}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" form="edit-opa-form" variant="primary" isLoading={formLoading}>
                Guardar Cambios
              </Button>
            </>
          }
        >
          {selectedOPA && (
            <Form
              id="edit-opa-form"
              fields={getFormFields()}
              initialData={{
                codigo: selectedOPA.codigo,
                nombre: selectedOPA.nombre,
                descripcion: selectedOPA.descripcion,
                dependencia_id: selectedOPA.dependencia_id,
                subdependencia_id: selectedOPA.subdependencia_id,
                tipo_pago: selectedOPA.tipo_pago,
                valor: selectedOPA.valor,
                tiempo_estimado: selectedOPA.tiempo_estimado || '',
                requisitos: selectedOPA.requisitos || '',
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
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar OPA"
          confirmText="Eliminar"
          cancelText="Cancelar"
          confirmVariant="danger"
          loading={formLoading}
        >
          {selectedOPA && (
            <>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar la OPA{' '}
                <strong>&quot;{selectedOPA.nombre}&quot;</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
            </>
          )}
        </ConfirmDialog>
      </div>
    </RoleGuard>
  )
}
