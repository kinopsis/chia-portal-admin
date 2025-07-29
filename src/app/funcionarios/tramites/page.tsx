'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal, ConfirmDialog, Badge } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { DataTable } from '@/components/organisms'
import { RoleGuard } from '@/components/auth'
import { TramitesClientService } from '@/services/tramites'
import { supabase } from '@/lib/supabase/client'
import type { FormField, Tramite, Dependencia, Subdependencia } from '@/types'
import type { Column } from '@/components/organisms/DataTable'
import { formatDate, formatCurrency } from '@/utils'

const tramitesService = new TramitesClientService()

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

  // Form fields
  const getFormFields = (): FormField[] => [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text',
      required: true,
      placeholder: 'Ej: TR-001',
    },
    {
      name: 'nombre',
      label: 'Nombre del Trámite',
      type: 'text',
      required: true,
      placeholder: 'Nombre descriptivo del trámite',
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      placeholder: 'Descripción detallada del trámite',
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
      placeholder: 'Ej: 5 días hábiles',
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
    setSelectedTramite(null)
    setSelectedDependenciaId('')
    setFilteredSubdependencias([])
    setIsCreateModalOpen(true)
  }

  const handleEdit = (tramite: Tramite) => {
    setSelectedTramite(tramite)

    if (tramite.dependencia_id) {
      setSelectedDependenciaId(tramite.dependencia_id)
      const filtered = subdependencias.filter((sub) => sub.dependencia_id === tramite.dependencia_id)
      setFilteredSubdependencias(filtered)
    }

    setIsEditModalOpen(true)
  }

  const handleDelete = (tramite: Tramite) => {
    setSelectedTramite(tramite)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitCreate = async (formData: Record<string, any>, isValid: boolean) => {
    if (!isValid) return

    try {
      setFormLoading(true)

      const tramiteData = {
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

      await tramitesService.create(tramiteData)
      await loadTramites()
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Error creating trámite:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmitEdit = async (formData: Record<string, any>, isValid: boolean) => {
    if (!selectedTramite || !isValid) return

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

      await tramitesService.update(selectedTramite.id, updates)
      await loadTramites()
      setIsEditModalOpen(false)
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
  const filteredTramites = tramites.filter(
    (tramite) =>
      (tramite.codigo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tramite.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tramite.descripcion || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tramite.dependencias?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tramite.subdependencias?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          title="Editar Trámite"
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
              <Button type="submit" form="edit-tramite-form" variant="primary" isLoading={formLoading}>
                Guardar Cambios
              </Button>
            </>
          }
        >
          {selectedTramite && (
            <Form
              id="edit-tramite-form"
              fields={getFormFields()}
              initialData={{
                codigo: selectedTramite.codigo,
                nombre: selectedTramite.nombre,
                descripcion: selectedTramite.descripcion,
                dependencia_id: selectedTramite.dependencia_id,
                subdependencia_id: selectedTramite.subdependencia_id,
                tipo_pago: selectedTramite.tipo_pago,
                valor: selectedTramite.valor,
                tiempo_estimado: selectedTramite.tiempo_estimado || '',
                requisitos: selectedTramite.requisitos || '',
                activo: selectedTramite.activo,
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
