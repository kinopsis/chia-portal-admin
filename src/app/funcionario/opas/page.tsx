'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  PageHeader, 
  DataTable, 
  Button, 
  Card,
  ErrorBoundary
} from '@/components'
import { useAuth, useFuncionarioBreadcrumbs } from '@/hooks'
import { supabase } from '@/lib/supabase/client'
import { logSupabaseError, getUserFriendlyErrorMessage } from '@/lib/errors'
import type { Column } from '@/components/organisms/DataTable/DataTable'

interface OPA {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  objetivo: string
  estado: 'borrador' | 'en_revision' | 'aprobada' | 'rechazada'
  version: number
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

function FuncionarioOPAsPage() {
  const { userProfile } = useAuth()
  const breadcrumbs = useFuncionarioBreadcrumbs()
  const [opas, setOpas] = useState<OPA[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOPAs = async () => {
    if (!userProfile?.dependencia_id) {
      setError('Usuario sin dependencia asignada')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('opas')
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

      setOpas(data || [])
    } catch (err) {
      logSupabaseError('Error fetching OPAs', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOPAs()
  }, [userProfile?.dependencia_id])

  const columns: Column<OPA>[] = useMemo(() => [
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
      key: 'estado',
      title: 'Estado',
      sortable: true,
      searchable: true,
      render: (value) => {
        const statusConfig = {
          borrador: { color: 'bg-gray-100 text-gray-800', label: 'Borrador' },
          en_revision: { color: 'bg-yellow-100 text-yellow-800', label: 'En Revisión' },
          aprobada: { color: 'bg-green-100 text-green-800', label: 'Aprobada' },
          rechazada: { color: 'bg-red-100 text-red-800', label: 'Rechazada' },
        }
        const config = statusConfig[value as keyof typeof statusConfig]
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'version',
      title: 'Versión',
      sortable: true,
      render: (value) => `v${value}`,
    },
    {
      key: 'updated_at',
      title: 'Última Actualización',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('es-CO'),
    },
  ], [])

  const handleCreate = () => {
    // TODO: Implement create OPA modal
    console.log('Create OPA')
  }

  const handleEdit = (opa: OPA) => {
    // TODO: Implement edit OPA modal
    console.log('Edit OPA:', opa)
  }

  const handleDelete = (opa: OPA) => {
    // TODO: Implement delete OPA
    console.log('Delete OPA:', opa)
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
          title="Gestión de OPAs"
          subtitle={`Administra las OPAs de ${userProfile?.dependencia?.nombre || 'tu dependencia'}`}
          breadcrumbs={breadcrumbs}
          actions={
            <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
              Nueva OPA
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
                  onClick={fetchOPAs}
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
            data={opas}
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
            emptyText="No hay OPAs registradas para tu dependencia"
            className="border-0"
          />
        </Card>
      </div>
    </ErrorBoundary>
  )
}

export default FuncionarioOPAsPage
