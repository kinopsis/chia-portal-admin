'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge } from '@/components/atoms'
import { SearchBar, Breadcrumb, MetricCard } from '@/components/molecules'
import { PageHeader } from '@/components/layout'
import type { BreadcrumbItem } from '@/components/molecules'
import { dependenciasClientService } from '@/services/dependencias'
import type { Dependencia } from '@/types'
import { useDependenciasMetrics } from '@/hooks/useDependenciasMetrics'

// Remove local interfaces - using types from @/types

// Remove mock data - will use real data from dependenciasClientService

export default function DependenciasPage() {
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDependencia, setExpandedDependencia] = useState<string>('')
  const [expandedSubdependencia, setExpandedSubdependencia] = useState<string>('')

  // Use metrics hook
  const { metrics, loading: metricsLoading } = useDependenciasMetrics(dependencias)

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Dependencias', href: '/dependencias' },
  ]

  // Fetch dependencias data
  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await dependenciasClientService.getAll({
          includeSubdependencias: true,
          includeTramites: true,
          includeOPAs: true,
          activo: true,
        })

        setDependencias(result.data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar dependencias'
        setError(errorMessage)

        // Enhanced error logging with detailed context
        console.error('Error fetching dependencias:', {
          error: err,
          message: errorMessage,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
          stack: err instanceof Error ? err.stack : undefined,
          type: err instanceof Error ? err.constructor.name : typeof err,
          filters: {
            includeSubdependencias: true,
            includeTramites: true,
            includeOPAs: true,
            activo: true,
          },
        })

        // Optional: Report to error tracking service in production
        if (process.env.NODE_ENV === 'production') {
          // reportError('dependencias_fetch_error', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDependencias()
  }, [])

  // Filter dependencias based on search
  const filteredDependencias = searchQuery
    ? dependencias.filter(
        (dep) =>
          (dep.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dep.descripcion || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          dep.subdependencias?.some(
            (sub) =>
              (sub.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.tramites?.some((t) =>
                (t.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())
              ) ||
              sub.opas?.some((o) =>
                (o.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())
              )
          )
      )
    : dependencias

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const toggleDependencia = (depId: string) => {
    setExpandedDependencia(expandedDependencia === depId ? '' : depId)
    setExpandedSubdependencia('') // Close subdependencias when switching
  }

  const toggleSubdependencia = (subId: string) => {
    setExpandedSubdependencia(expandedSubdependencia === subId ? '' : subId)
  }

  // Metrics are now calculated by the hook

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Dependencias Municipales"
        description="Explora las áreas y servicios de la alcaldía"
        breadcrumbs={breadcrumbs}
      />

      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Statistics */}
          {loading || metricsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-background rounded-lg p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-background-secondary rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-background-secondary rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-background-secondary rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <MetricCard
                title="Dependencias"
                value={metrics.dependencias}
                icon="🏛️"
                color="blue"
                description="Activas"
              />
              <MetricCard
                title="Subdependencias"
                value={metrics.subdependencias}
                icon="📂"
                color="green"
                description="Organizacionales"
              />
              <MetricCard
                title="Trámites"
                value={metrics.tramites}
                icon="📄"
                color="yellow"
                description="Disponibles"
              />
              <MetricCard
                title="OPAs"
                value={metrics.opas}
                icon="⚡"
                color="purple"
                description="Gestionadas"
              />
            </div>
          )}

          {/* Search */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Buscar Dependencias y Servicios
            </h3>
            <SearchBar
              placeholder="Buscar dependencia, subdependencia, trámite..."
              onSearch={handleSearch}
              className="mb-4"
            />
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-text-muted">Sugerencias:</span>
              {['Planeación', 'Hacienda', 'Salud', 'Ambiente', 'Obras'].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </Card>

          {/* Dependencias List - Cinta Layout */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-primary">Lista de Dependencias</h3>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-background-secondary rounded"></div>
                          <div>
                            <div className="h-6 w-48 bg-background-secondary rounded mb-2"></div>
                            <div className="h-4 w-64 bg-background-secondary rounded"></div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-12 bg-background-secondary rounded"></div>
                          <div className="h-6 w-12 bg-background-secondary rounded"></div>
                          <div className="h-6 w-12 bg-background-secondary rounded"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Error al cargar dependencias
                </h3>
                <p className="text-text-muted mb-4">{error}</p>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </Card>
            ) : filteredDependencias.length > 0 ? (
              filteredDependencias.map((dependencia) => (
                <Card key={dependencia.id} className="overflow-hidden">
                  {/* Dependencia Header */}
                  <div
                    className="cursor-pointer hover:bg-background-secondary transition-colors duration-200"
                    onClick={() => toggleDependencia(dependencia.id)}
                  >
                    <div className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">🏛️</div>
                        <div>
                          <h4 className="text-lg font-semibold text-text-primary">
                            [{dependencia.codigo}] {dependencia.nombre}
                          </h4>
                          <p className="text-text-muted">{dependencia.nombre} - Alcaldía de Chía</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          <Badge variant="secondary">
                            📂 {dependencia.subdependencias_count || 0}
                          </Badge>
                          <Badge variant="secondary">📄 {dependencia.tramites_count || 0}</Badge>
                          <Badge variant="secondary">⚡ {dependencia.opas_count || 0}</Badge>
                        </div>
                        <div className="text-xl">
                          {expandedDependencia === dependencia.id ? '⌃' : '⌄'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subdependencias */}
                  {expandedDependencia === dependencia.id && dependencia.subdependencias && (
                    <div className="border-t border-border-light bg-background-secondary">
                      <div className="p-6 space-y-4">
                        {dependencia.subdependencias.map((subdependencia) => (
                          <div
                            key={subdependencia.id}
                            className="bg-background rounded-lg border border-border"
                          >
                            {/* Subdependencia Header */}
                            <div
                              className="cursor-pointer hover:bg-background-tertiary transition-colors duration-200"
                              onClick={() => toggleSubdependencia(subdependencia.id)}
                            >
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="text-xl">📂</div>
                                  <div>
                                    <h5 className="font-semibold text-text-primary">
                                      [{subdependencia.codigo}] {subdependencia.nombre}
                                    </h5>
                                    <p className="text-sm text-text-muted">
                                      {subdependencia.sigla || subdependencia.nombre}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Badge variant="secondary">
                                    📄 {subdependencia.tramites_count || 0}
                                  </Badge>
                                  <Badge variant="secondary">
                                    ⚡ {subdependencia.opas_count || 0}
                                  </Badge>
                                  <div className="text-lg">
                                    {expandedSubdependencia === subdependencia.id ? '⌃' : '⌄'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Trámites y OPAs */}
                            {expandedSubdependencia === subdependencia.id && (
                              <div className="border-t border-border-light p-4 bg-background-tertiary">
                                {/* Trámites */}
                                {subdependencia.tramites && subdependencia.tramites.length > 0 && (
                                  <div className="mb-4">
                                    <h6 className="font-semibold text-text-primary mb-2">
                                      TRÁMITES:
                                    </h6>
                                    <div className="space-y-2">
                                      {subdependencia.tramites.map((tramite) => (
                                        <div
                                          key={tramite.id}
                                          className="flex items-center justify-between bg-background p-3 rounded border border-border"
                                        >
                                          <div>
                                            <h6 className="font-medium text-text-primary">
                                              📄 [{tramite.codigo_unico}] {tramite.nombre}
                                            </h6>
                                            <p className="text-sm text-text-muted">
                                              {tramite.formulario || 'Trámite disponible'}
                                            </p>
                                            {tramite.tiene_pago && (
                                              <p className="text-sm text-primary-green">
                                                💰 Con pago | ⏱️{' '}
                                                {tramite.tiempo_respuesta || 'Consultar'}
                                              </p>
                                            )}
                                          </div>
                                          <Button size="sm" variant="outline">
                                            Ver detalles →
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* OPAs */}
                                {subdependencia.opas && subdependencia.opas.length > 0 && (
                                  <div>
                                    <h6 className="font-semibold text-text-primary mb-2">OPAS:</h6>
                                    <div className="space-y-2">
                                      {subdependencia.opas.map((opa) => (
                                        <div
                                          key={opa.id}
                                          className="flex items-center justify-between bg-background p-3 rounded border border-border"
                                        >
                                          <div>
                                            <h6 className="font-medium text-text-primary">
                                              ⚡ [{opa.codigo_opa}] {opa.nombre}
                                            </h6>
                                            <p className="text-sm text-text-muted">
                                              OPA disponible
                                            </p>
                                          </div>
                                          <Button size="sm" variant="outline">
                                            Ver detalles →
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No se encontraron dependencias
                </h3>
                <p className="text-text-muted mb-4">
                  No hay dependencias que coincidan con tu búsqueda.
                </p>
                <Button variant="primary" onClick={() => setSearchQuery('')}>
                  Limpiar búsqueda
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
