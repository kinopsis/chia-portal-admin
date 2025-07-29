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

interface FAQ {
  id: string
  pregunta: string
  respuesta: string
  activo: boolean
  orden: number
  dependencia_id: string
  dependencia?: {
    nombre: string
  }
  created_at: string
  updated_at: string
}

function FuncionarioFAQsPage() {
  const { userProfile } = useAuth()
  const breadcrumbs = useFuncionarioBreadcrumbs()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFAQs = async () => {
    if (!userProfile?.dependencia_id) {
      setError('Usuario sin dependencia asignada')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('faqs')
        .select(`
          *,
          dependencia:dependencias(nombre)
        `)
        .eq('dependencia_id', userProfile.dependencia_id)
        .order('orden', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setFaqs(data || [])
    } catch (err) {
      logSupabaseError('Error fetching FAQs', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFAQs()
  }, [userProfile?.dependencia_id])

  const columns: Column<FAQ>[] = useMemo(() => [
    {
      key: 'orden',
      title: 'Orden',
      sortable: true,
      width: 80,
    },
    {
      key: 'pregunta',
      title: 'Pregunta',
      sortable: true,
      searchable: true,
      render: (value) => (
        <div className="max-w-md">
          <p className="truncate" title={value}>
            {value}
          </p>
        </div>
      ),
    },
    {
      key: 'respuesta',
      title: 'Respuesta',
      searchable: true,
      render: (value) => (
        <div className="max-w-md">
          <p className="truncate text-gray-600" title={value}>
            {value}
          </p>
        </div>
      ),
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

  const handleCreate = () => {
    // TODO: Implement create FAQ modal
    console.log('Create FAQ')
  }

  const handleEdit = (faq: FAQ) => {
    // TODO: Implement edit FAQ modal
    console.log('Edit FAQ:', faq)
  }

  const handleDelete = (faq: FAQ) => {
    // TODO: Implement delete FAQ
    console.log('Delete FAQ:', faq)
  }

  const handleToggleStatus = async (faq: FAQ) => {
    try {
      const { error: updateError } = await supabase
        .from('faqs')
        .update({ activo: !faq.activo })
        .eq('id', faq.id)

      if (updateError) {
        throw updateError
      }

      await fetchFAQs()
    } catch (err) {
      logSupabaseError('Error updating FAQ status', err)
      setError(getUserFriendlyErrorMessage(err))
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
      label: (faq: FAQ) => faq.activo ? 'Desactivar' : 'Activar',
      onClick: handleToggleStatus,
      icon: (faq: FAQ) => faq.activo ? 'EyeSlash' : 'Eye',
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
          title="Gestión de FAQs"
          subtitle={`Administra las preguntas frecuentes de ${userProfile?.dependencia?.nombre || 'tu dependencia'}`}
          breadcrumbs={breadcrumbs}
          actions={
            <Button onClick={handleCreate} className="bg-yellow-600 hover:bg-yellow-700">
              Nueva FAQ
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
                  onClick={fetchFAQs}
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
            data={faqs}
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
            emptyText="No hay FAQs registradas para tu dependencia"
            className="border-0"
          />
        </Card>
      </div>
    </ErrorBoundary>
  )
}

export default FuncionarioFAQsPage
