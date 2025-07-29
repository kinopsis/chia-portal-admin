'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  PageHeader, 
  DataTable, 
  Button, 
  Card,
  Modal,
  ConfirmDialog,
  Spinner,
  ErrorBoundary
} from '@/components'
import { useAuth, useFuncionarioBreadcrumbs } from '@/hooks'
import { supabase } from '@/lib/supabase/client'
import { logSupabaseError, getUserFriendlyErrorMessage } from '@/lib/errors'
import type { Column } from '@/components/organisms/DataTable/DataTable'

interface Tramite {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  requisitos: string
  costo: number
  tiempo_estimado_dias: number
  tipo_pago: 'gratuito' | 'pago'
  activo: boolean
  subdependencia_id: string
  subdependencia?: {
    nombre: string
    dependencia?: {
      nombre: string
    }
  }
  created_at: string
  updated_at: string
}

function FuncionarioTramitesPage() {
  const { userProfile } = useAuth()
  const breadcrumbs = useFuncionarioBreadcrumbs()
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tramiteToDelete, setTramiteToDelete] = useState<Tramite | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTramites = async () => {
    if (!userProfile?.dependencia_id) {
      setError('Usuario sin dependencia asignada')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('tramites')
        .select(`
          *,
          subdependencia:subdependencias(
            nombre,
            dependencia:dependencias(nombre)
          )
        `)
        .eq('dependencia_id', userProfile.dependencia_id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setTramites(data || [])
    } catch (err) {
      logSupabaseError('Error fetching tramites', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTramites()
  }, [userProfile?.dependencia_id])

  const columns: Column<Tramite>[] = useMemo(() => [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      searchable: true,
      width: 120,
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      searchable: true,
    },
    {
      key: 'subdependencia.nombre',
      title: 'Subdependencia',
      sortable: true,
      searchable: true,
      render: (_, record) => record.subdependencia?.nombre || 'N/A',
    },
    {
      key: 'tipo_pago',
      title: 'Tipo',
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'gratuito'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value === 'gratuito' ? 'Gratuito' : 'Pago'}
        </span>
      ),
    },
    {
      key: 'costo',
      title: 'Costo',
      sortable: true,
      render: (value) => value > 0 ? `$${value.toLocaleString()}` : 'Gratuito',
    },
    {
      key: 'tiempo_estimado_dias',
      title: 'Tiempo Est.',
      sortable: true,
      render: (value) => `${value} días`,
    },
    {
      key: 'activo',
      title: 'Estado',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ], [])

  const handleCreate = () => {
    setSelectedTramite(null)
    setIsModalOpen(true)
  }

  const handleEdit = (tramite: Tramite) => {
    setSelectedTramite(tramite)
    setIsModalOpen(true)
  }

  const handleDelete = (tramite: Tramite) => {
    setTramiteToDelete(tramite)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!tramiteToDelete) return

    try {
      setIsSubmitting(true)
      
      const { error: deleteError } = await supabase
        .from('tramites')
        .delete()
        .eq('id', tramiteToDelete.id)

      if (deleteError) {
        throw deleteError
      }

      await fetchTramites()
      setIsDeleteDialogOpen(false)
      setTramiteToDelete(null)
    } catch (err) {
      logSupabaseError('Error deleting tramite', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const rowActions = [
    {
      label: 'Editar',
      onClick: handleEdit,
      icon: 'Edit',
      variant: 'ghost' as const,
    },
    {
      label: 'Eliminar',
      onClick: handleDelete,
      icon: 'Trash',
      variant: 'ghost' as const,
      className: 'text-red-600 hover:text-red-700',
    },
  ]

  if (!userProfile?.dependencia_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin Dependencia Asignada
          </h3>
          <p className="text-gray-600">
            Contacta al administrador para que te asigne una dependencia.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Gestión de Trámites"
          subtitle={`Administra los trámites de ${userProfile?.dependencia?.nombre || 'tu dependencia'}`}
          breadcrumbs={breadcrumbs}
          actions={
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              Nuevo Trámite
            </Button>
          }
        />

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <Card.Content className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-red-600 mr-3">⚠️</div>
                  <div>
                    <h4 className="text-red-800 font-medium">Error</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTramites}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Reintentar
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <DataTable
            data={tramites}
            columns={columns}
            loading={loading}
            rowActions={rowActions}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: true,
            }}
            searchable={true}
            sortable={true}
            emptyText="No hay trámites registrados para tu dependencia"
            className="border-0"
          />
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Eliminar Trámite"
          message={`¿Estás seguro de que deseas eliminar el trámite "${tramiteToDelete?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          loading={isSubmitting}
        />
      </div>
    </ErrorBoundary>
  )
}

export default FuncionarioTramitesPage
