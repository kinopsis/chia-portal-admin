'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, Button, Badge, Select } from '@/components/atoms'
import { SearchBar, Breadcrumb, MetricCard } from '@/components/molecules'
import { PageHeader } from '@/components/layout'
import type { BreadcrumbItem } from '@/components/molecules'
import { unifiedSearchService } from '@/services/unifiedSearch'
import type { UnifiedSearchResult, UnifiedSearchFilters } from '@/services/unifiedSearch'
import { statisticsService } from '@/services/statistics'
import type { PortalStatistics } from '@/services/statistics'
import { dependenciasClientService } from '@/services/dependencias'
import { SubdependenciasClientService } from '@/services/subdependencias'
import type { Dependencia, Subdependencia } from '@/types'

// Extended type for Subdependencias with relations
interface SubdependenciaWithRelations extends Subdependencia {
  dependencias?: {
    id: string
    nombre: string
  }
}

// Remove local interface - using the one from unifiedSearch service

// Remove mock data - will use real data from unifiedSearchService

const tipoOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'tramite', label: 'Solo Trámites' },
  { value: 'opa', label: 'Solo OPAs' },
  { value: 'faq', label: 'Solo FAQs' },
]

// NEW: Payment type options (replaces estado)
const tiposPagoOptions = [
  { value: '', label: 'Todos' },
  { value: 'gratuito', label: 'Gratuito' },
  { value: 'con_pago', label: 'Con pago' },
]

export default function TramitesPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  // Service instances
  const subdependenciasService = new SubdependenciasClientService()

  const [data, setData] = useState<UnifiedSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedDependencia, setSelectedDependencia] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')
  const [selectedSubdependencia, setSelectedSubdependencia] = useState('')  // NEW
  const [selectedTipoPago, setSelectedTipoPago] = useState('')  // NEW (replaces selectedEstado)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [statistics, setStatistics] = useState<PortalStatistics | null>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(true)
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [dependenciasLoading, setDependenciasLoading] = useState(true)
  const [subdependencias, setSubdependencias] = useState<SubdependenciaWithRelations[]>([])  // NEW
  const [filteredSubdependencias, setFilteredSubdependencias] = useState<SubdependenciaWithRelations[]>([])  // NEW
  const [subdependenciasLoading, setSubdependenciasLoading] = useState(true)  // NEW
  const itemsPerPage = 10

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Búsqueda Global', href: '/tramites' },
  ]

  // Fetch data from unified search service
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const filters: UnifiedSearchFilters = {
          query: searchQuery,
          tipo: selectedTipo as any,
          dependencia: selectedDependencia,
          subdependenciaId: selectedSubdependencia,  // NEW - using ID instead of name
          tipoPago: selectedTipoPago as any,         // NEW (replaces estado)
          page: currentPage,
          limit: itemsPerPage
        }

        const result = await unifiedSearchService.search(filters)

        setData(result.data)
        setTotalPages(result.pagination.totalPages)
        setTotalResults(result.pagination.total)

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos'
        setError(errorMessage)
        console.error('Error fetching unified search data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery, selectedDependencia, selectedTipo, selectedSubdependencia, selectedTipoPago, currentPage])

  // Load dependencias on component mount
  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        setDependenciasLoading(true)
        const result = await dependenciasClientService.getAll({ activo: true, limit: 1000 })
        setDependencias(result.data)
      } catch (err) {
        console.error('Error fetching dependencias:', err)
        setDependencias([])
      } finally {
        setDependenciasLoading(false)
      }
    }

    fetchDependencias()
  }, [])

  // Load subdependencias on component mount
  useEffect(() => {
    const fetchSubdependencias = async () => {
      try {
        setSubdependenciasLoading(true)
        const result = await subdependenciasService.getAll({ limit: 1000 }) // Get all subdependencias

        // Extract data from paginated response
        const subdependenciasArray = result?.data || []
        setSubdependencias(subdependenciasArray)
        setFilteredSubdependencias(subdependenciasArray) // Initially show all
      } catch (err) {
        console.error('Error fetching subdependencias:', err)
        // Set empty arrays on error
        setSubdependencias([])
        setFilteredSubdependencias([])
      } finally {
        setSubdependenciasLoading(false)
      }
    }

    fetchSubdependencias()
  }, [])

  // Filter subdependencias based on selected dependencia
  useEffect(() => {
    if (!selectedDependencia) {
      setFilteredSubdependencias(subdependencias)
      setSelectedSubdependencia('') // Clear subdependencia selection
    } else {
      const filtered = subdependencias.filter(sub => {
        // Use the proper type structure
        const dependenciaNombre = sub.dependencias?.nombre
        return dependenciaNombre === selectedDependencia
      })
      setFilteredSubdependencias(filtered)
      setSelectedSubdependencia('') // Clear subdependencia selection when dependencia changes
    }
  }, [selectedDependencia, subdependencias])

  // Fetch portal statistics separately (only once on mount)
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setStatisticsLoading(true)
        const stats = await statisticsService.getPortalStatistics()
        setStatistics(stats)
      } catch (err) {
        console.error('Error fetching portal statistics:', err)
        // Set fallback statistics
        setStatistics({
          dependencias: 14,
          subdependencias: 75,
          tramites: 108,
          tramitesActivos: 108,
          opas: 722,
          opasActivas: 722,
          faqs: 330,
          faqsActivas: 330,
          totalResults: 1160
        })
      } finally {
        setStatisticsLoading(false)
      }
    }

    fetchStatistics()
  }, []) // Only run once on mount

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDependencia('')
    setSelectedTipo('')
    setSelectedSubdependencia('')  // NEW
    setSelectedTipoPago('')        // NEW (replaces selectedEstado)
  }

  // Statistics - use real database counts instead of filtered results
  const tramitesCount = statistics?.tramites || 0
  const opasCount = statistics?.opas || 0
  const faqsCount = statistics?.faqs || 0
  const dependenciasCount = statistics?.dependencias || 0
  const totalResultsCount = statistics?.totalResults || totalResults

  // Prepare options for dropdowns
  const dependenciasOptions = [
    { value: '', label: 'Todas las dependencias' },
    ...dependencias.map(dep => ({ value: dep.nombre, label: dep.nombre }))
  ]

  const subdependenciasOptions = [
    { value: '', label: 'Todas las subdependencias' },
    ...(Array.isArray(filteredSubdependencias) ? filteredSubdependencias.map(sub => ({
      value: sub.id, // Use ID as value to ensure uniqueness
      label: sub.nombre // Display name as label
    })) : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Búsqueda Global - Portal Ciudadano"
        description="Encuentra trámites, OPAs y respuestas en un solo lugar"
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <MetricCard
              title="Trámites"
              value={tramitesCount}
              icon="📄"
              color="blue"
              description="Disponibles"
              loading={statisticsLoading}
            />
            <MetricCard
              title="OPAs"
              value={opasCount}
              icon="⚡"
              color="green"
              description="Activas"
              loading={statisticsLoading}
            />
            <MetricCard
              title="FAQs"
              value={faqsCount}
              icon="❓"
              color="yellow"
              description="Publicadas"
              loading={statisticsLoading}
            />
            <MetricCard
              title="Dependencias"
              value={dependenciasCount}
              icon="🏛️"
              color="purple"
              description="Con servicios"
              loading={statisticsLoading}
            />
            <MetricCard
              title="Total Resultados"
              value={totalResultsCount}
              icon="🔍"
              color="primary"
              description="Encontrados"
              loading={statisticsLoading}
            />
          </div>

          {/* Search and Filters */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Búsqueda y Filtros
            </h3>
            
            {/* Search Bar */}
            <div className="mb-4">
              <SearchBar
                placeholder="Buscar por nombre, código, descripción..."
                onSearch={handleSearch}
              />
            </div>

            {/* Filters - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                value={selectedDependencia}
                onChange={(e) => setSelectedDependencia(e.target.value)}
                options={dependenciasOptions}
                placeholder={dependenciasLoading ? "Cargando dependencias..." : "Filtrar por dependencia"}
                disabled={dependenciasLoading}
              />
              <Select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                options={tipoOptions}
                placeholder="Filtrar por tipo"
              />
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                🔄 Limpiar Filtros
              </Button>
            </div>

            {/* Filters - Row 2 (NEW) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                value={selectedSubdependencia}
                onChange={(e) => setSelectedSubdependencia(e.target.value)}
                options={subdependenciasOptions}
                placeholder={subdependenciasLoading ? "Cargando subdependencias..." : "Filtrar por subdependencia"}
                disabled={subdependenciasLoading || !selectedDependencia}
              />
              <Select
                value={selectedTipoPago}
                onChange={(e) => setSelectedTipoPago(e.target.value)}
                options={tiposPagoOptions}
                placeholder="Filtrar por tipo de pago"
              />
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-600">
              {loading ? (
                'Cargando resultados...'
              ) : error ? (
                `Error: ${error}`
              ) : (
                <>
                  Mostrando {data.length} de {totalResults} resultados
                  {searchQuery && ` para "${searchQuery}"`}
                </>
              )}
            </div>
          </Card>

          {/* Results */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Resultados Unificados
            </h3>

            {loading ? (
              <div className="space-y-4">
                {/* Loading skeleton */}
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-6 w-20 bg-gray-200 rounded"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
                        <div className="flex space-x-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Error al cargar datos
                </h3>
                <p className="text-gray-600 mb-4">
                  {error}
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </Button>
              </Card>
            ) : data.length > 0 ? (
              <div className="space-y-4">
                {data.map(item => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge
                            variant={
                              item.tipo === 'tramite'
                                ? 'primary'
                                : item.tipo === 'opa'
                                ? 'secondary'
                                : 'success'
                            }
                            className="text-xs"
                          >
                            {item.tipo === 'tramite'
                              ? '📄 TRÁMITE'
                              : item.tipo === 'opa'
                              ? '⚡ OPA'
                              : '❓ FAQ'}
                          </Badge>
                          <Badge variant="secondary" size="sm">
                            {item.codigo}
                          </Badge>
                          <Badge
                            variant={item.estado === 'activo' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {item.estado}
                          </Badge>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.nombre}
                        </h4>
                        
                        <p className="text-gray-600 mb-3">
                          {item.descripcion}
                        </p>

                        {/* NEW: Requisitos Section - Only for trámites */}
                        {item.tipo === 'tramite' && item.originalData && (item.originalData as any).requisitos && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                              📋 Requisitos
                            </h5>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {((item.originalData as any).requisitos || []).map((requisito: string, index: number) => (
                                <li key={`${item.id}-req-${index}`} className="flex items-start">
                                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                                  <span>{requisito}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* NEW: Government Portal Links - Only for trámites */}
                        {item.tipo === 'tramite' && item.originalData && (
                          <div className="mb-4 flex items-center space-x-3">
                            {/* SUIT Portal Link - Only show if URL exists and is valid */}
                            {(item.originalData as any).visualizacion_suit &&
                             typeof (item.originalData as any).visualizacion_suit === 'string' &&
                             (item.originalData as any).visualizacion_suit.trim() !== '' && (
                              <a
                                href={(item.originalData as any).visualizacion_suit}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                                title="Ver en portal SUIT - Sistema Único de Información de Trámites"
                              >
                                <span className="mr-1.5">🏛️</span>
                                SUIT
                                <span className="ml-1">↗</span>
                              </a>
                            )}

                            {/* GOV.CO Portal Link - Only show if URL exists and is valid */}
                            {(item.originalData as any).visualizacion_gov &&
                             typeof (item.originalData as any).visualizacion_gov === 'string' &&
                             (item.originalData as any).visualizacion_gov.trim() !== '' && (
                              <a
                                href={(item.originalData as any).visualizacion_gov}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200"
                                title="Ver en portal GOV.CO - Portal Único del Estado Colombiano"
                              >
                                <span className="mr-1.5">🌐</span>
                                GOV.CO
                                <span className="ml-1">↗</span>
                              </a>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>🏛️ {item.dependencia}</span>
                          {item.subdependencia && <span>📂 {item.subdependencia}</span>}
                          {item.categoria && <span>🏷️ {item.categoria}</span>}
                          {item.costo !== undefined && (
                            <span className="text-primary-green">
                              💰 {item.costo === 0 ? 'Gratuito' : `$${item.costo.toLocaleString()}`}
                            </span>
                          )}
                          {item.tiempo_estimado && (
                            <span>⏱️ {item.tiempo_estimado}</span>
                          )}
                          {item.vistas && (
                            <span>👁️ {item.vistas} vistas</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={`${item.id}-tag-${index}`} variant="neutral" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <Button variant="primary" size="sm">
                          {item.tipo === 'faq' ? 'Ver respuesta →' : 'Ver detalles →'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600 mb-4">
                  No hay trámites, OPAs o FAQs que coincidan con los filtros seleccionados.
                </p>
                <Button variant="primary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ◀ Anterior
                </Button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente ▶
                </Button>
                
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages} ({totalResults} resultados)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
