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

interface Subdependencia {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  activo: boolean
  dependencia_id: string
  dependencia?: {
    nombre: string
    codigo: string
  }
  created_at: string
  updated_at: string
}

function FuncionarioSubdependenciasPage() {
  const { userProfile } = useAuth()
  const breadcrumbs = useFuncionarioBreadcrumbs()
  const [subdependencias, setSubdependencias] = useState<Subdependencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubdependencias = async () => {
    if (!userProfile?.dependencia_id) {
      setError('Usuario sin dependencia asignada')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('subdependencias')
        .select(`
          *,
          dependencia:dependencias(nombre, codigo)
        `)
        .eq('dependencia_id', userProfile.dependencia_id)
        .order('codigo', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setSubdependencias(data || [])
    } catch (err) {
      logSupabaseError('Error fetching subdependencias', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubdependencias()
  }, [userProfile?.dependencia_id])

  const columns: Column<Subdependencia>[] = useMemo(() => [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      width: 120,
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      searchable: true,
    },
    {
      key: 'descripcion',
      title: 'Descripción',
      searchable: true,
      render: (value) => (
        <div className="max-w-md">
          <p className="truncate text-gray-600" title={value}>
            {value || 'Sin descripción'}
          </p>
        </div>
      ),
    },
    {
      key: 'dependencia.nombre',
      title: 'Dependencia Padre',
      sortable: true,
      render: (_, record) => record.dependencia?.nombre || 'N/A',
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
          {value ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: 'Última Actualización',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('es-CO'),
    },
  ], [])

  const handleView = (subdependencia: Subdependencia) => {
    // TODO: Implement view subdependencia details
    console.log('View subdependencia:', subdependencia)
  }

  const handleToggleStatus = async (subdependencia: Subdependencia) => {
    try {
      const { error: updateError } = await supabase
        .from('subdependencias')
        .update({ activo: !subdependencia.activo })
        .eq('id', subdependencia.id)

      if (updateError) {
        throw updateError
      }

      await fetchSubdependencias()
    } catch (err) {
      logSupabaseError('Error updating subdependencia status', err)
      setError(getUserFriendlyErrorMessage(err))
    }
  }

  const rowActions = [
    {
      label: 'Ver Detalles',
      onClick: handleView,
      icon: 'Eye',
      variant: 'ghost' as const,
    },
    {
      label: (subdependencia: Subdependencia) => subdependencia.activo ? 'Desactivar' : 'Activar',
      onClick: handleToggleStatus,
      icon: (subdependencia: Subdependencia) => subdependencia.activo ? 'EyeSlash' : 'Eye',
      variant: 'ghost' as const,
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
          title="Subdependencias"
          subtitle={`Visualiza las subdependencias de ${userProfile?.dependencia?.nombre || 'tu dependencia'}`}
          breadcrumbs={breadcrumbs}
        />

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <Card.Content className="p-4">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">ℹ️</div>
              <div>
                <h4 className="text-blue-800 font-medium">Información</h4>
                <p className="text-blue-700 text-sm">
                  Como funcionario, puedes visualizar y gestionar el estado de las subdependencias 
                  que pertenecen a tu dependencia asignada.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

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
                  onClick={fetchSubdependencias}
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
            data={subdependencias}
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
            emptyText="No hay subdependencias registradas para tu dependencia"
            className="border-0"
          />
        </Card>
      </div>
    </ErrorBoundary>
  )
}

export default FuncionarioSubdependenciasPage
