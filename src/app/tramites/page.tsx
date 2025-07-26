'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, Suspense } from 'react'
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

/**
 * Trámites y OPAs Page
 *
 * Dedicated search interface for municipal services (Trámites and OPAs only).
 * FAQs are excluded from this page to provide a focused user experience.
 *
 * Features:
 * - Unified search across Trámites and OPAs databases
 * - Advanced filtering by dependencia, subdependencia, and payment type
 * - Enhanced card layouts with dependency hierarchy and contextual labels
 * - Optimized performance with reduced database queries
 */

const tipoOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'tramite', label: 'Solo Trámites' },
  { value: 'opa', label: 'Solo OPAs' },
]

// NEW: Payment type options (replaces estado)
const tiposPagoOptions = [
  { value: '', label: 'Todos' },
  { value: 'gratuito', label: 'Gratuito' },
  { value: 'con_pago', label: 'Con pago' },
]

// Component that uses useSearchParams - needs to be wrapped in Suspense
function TramitesContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams?.get('q') || ''

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
    { label: 'Trámites y OPAs', href: '/tramites' },
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

        // Use optimized search method that excludes FAQs for better performance
        const result = await unifiedSearchService.searchTramitesAndOpas(filters)

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
          faqs: 0, // Excluded from this page
          faqsActivas: 0, // Excluded from this page
          totalResults: 830 // Only Trámites + OPAs
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

  // Statistics - use real database counts instead of filtered results (FAQs excluded)
  const tramitesCount = statistics?.tramites || 0
  const opasCount = statistics?.opas || 0
  const dependenciasCount = statistics?.dependencias || 0
  const totalResultsCount = tramitesCount + opasCount // Only Trámites + OPAs

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
        title="Trámites y OPAs - Portal Ciudadano"
        description="Encuentra trámites y servicios administrativos (OPAs) en un solo lugar"
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
                placeholder="Buscar trámites y OPAs por nombre, código, descripción..."
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
                        {/* 1. HEADER SECTION: Type badge + Payment badge + Code integrated with title */}
                        <div className="mb-4">
                          {/* Type and Payment badges BEFORE title */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge
                              variant={
                                item.tipo === 'tramite'
                                  ? 'primary'
                                  : item.tipo === 'opa'
                                  ? 'secondary'
                                  : 'success'
                              }
                              className="text-sm font-medium px-3 py-1"
                            >
                              {item.tipo === 'tramite'
                                ? `📄 TRÁMITE ${item.codigo}`
                                : `⚡ OPA ${item.codigo}`}
                            </Badge>

                            {/* Payment status badge for trámites */}
                            {item.tipo === 'tramite' && (
                              <Badge
                                variant={
                                  (item.originalData as any)?.tiene_pago === false
                                    ? "success"
                                    : "warning"
                                }
                                className="text-xs font-medium"
                              >
                                {(item.originalData as any)?.tiene_pago === false
                                  ? "🆓 Gratuito"
                                  : "💰 Con pago"}
                              </Badge>
                            )}
                          </div>

                          {/* Title without code (code now in badge) */}
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.nombre}
                          </h4>

                          {/* 1. DEPENDENCY HIERARCHY SUBTITLE */}
                          <div className="mb-3">
                            <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border-l-4 border-blue-400">
                              <span className="text-blue-600 mr-2">🏛️</span>
                              <span className="font-medium">
                                {item.dependencia}
                                {item.subdependencia && (
                                  <>
                                    <span className="mx-2 text-gray-400">›</span>
                                    <span className="text-gray-700">{item.subdependencia}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>


                        </div>

                        {/* 2. CONTEXTUAL DESCRIPTION WITH HORIZONTAL LAYOUT AND VISUAL EMPHASIS */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-medium">
                              {item.tipo === 'tramite' ? '📋 Formulario:' : '📝 Descripción:'}
                            </span>
                            <span className="font-semibold text-gray-800">
                              {item.descripcion}
                            </span>
                          </div>
                        </div>

                        {/* 3. REQUIREMENTS SECTION (Expandible) */}
                        {item.tipo === 'tramite' && item.originalData && (item.originalData as any).requisitos && (
                          <RequisitosSectionExpandibleEnhanced
                            requisitos={(item.originalData as any).requisitos || []}
                            itemId={item.id}
                            suitUrl={(item.originalData as any).visualizacion_suit}
                            govUrl={(item.originalData as any).visualizacion_gov}
                          />
                        )}

                        {/* 4. ESTIMATED TIME - Prominently displayed */}
                        {item.tiempo_estimado && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 font-medium">⏱️ Tiempo estimado:</span>
                              <span className="font-semibold text-gray-800">{item.tiempo_estimado}</span>
                            </div>
                          </div>
                        )}

                        {/* Additional information */}
                        <div className="space-y-2 text-sm text-gray-600">

                          {item.vistas && (
                            <div className="text-xs text-gray-500">
                              👁️ {item.vistas} vistas
                            </div>
                          )}
                        </div>
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
                  No hay trámites u OPAs que coincidan con los filtros seleccionados.
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

// Loading component for Suspense fallback
function TramitesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ✨ MEJORA UX: Componente de requisitos expandible con enlaces gubernamentales
function RequisitosSectionExpandibleEnhanced({
  requisitos,
  itemId,
  suitUrl,
  govUrl
}: {
  requisitos: string[],
  itemId: string,
  suitUrl?: string,
  govUrl?: string
}) {
  // Start collapsed by default
  const [isExpanded, setIsExpanded] = useState(false)
  const hasRequirements = requisitos && requisitos.length > 0

  // Check if government portal links are valid
  const hasSuitUrl = suitUrl && typeof suitUrl === 'string' && suitUrl.trim() !== ''
  const hasGovUrl = govUrl && typeof govUrl === 'string' && govUrl.trim() !== ''

  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      {/* Header with government portal links - always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h5 className="text-sm font-semibold text-blue-800 flex items-center">
            📋 Requisitos
          </h5>

          {/* Government Portal Links in header */}
          <div className="flex items-center gap-2">
            {hasSuitUrl && (
              <a
                href={suitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
                title="Ver en portal SUIT - Sistema Único de Información de Trámites"
              >
                <span className="mr-1">🏛️</span>
                SUIT
                <span className="ml-1">↗</span>
              </a>
            )}

            {hasGovUrl && (
              <a
                href={govUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors duration-200"
                title="Ver en portal GOV.CO - Portal Único del Estado Colombiano"
              >
                <span className="mr-1">🌐</span>
                GOV.CO
                <span className="ml-1">↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Toggle button - always show if there are requirements */}
        {hasRequirements && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <span>Ocultar</span>
                <span>▲</span>
              </>
            ) : (
              <>
                <span>Ver requisitos ({requisitos.length})</span>
                <span>▼</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Requirements content - only show when expanded */}
      {isExpanded && hasRequirements && (
        <div className="mt-3">
          <ul className="text-sm text-blue-700 space-y-1">
            {requisitos.map((requisito: string, index: number) => (
              <li key={`${itemId}-req-${index}`} className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>{requisito}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show message when collapsed and no requirements */}
      {!isExpanded && !hasRequirements && (
        <div className="mt-2 text-xs text-blue-600 italic">
          No hay requisitos específicos disponibles
        </div>
      )}
    </div>
  )
}

// Legacy component for backward compatibility
function RequisitosSectionExpandible({ requisitos, itemId }: { requisitos: string[], itemId: string }) {
  return (
    <RequisitosSectionExpandibleEnhanced
      requisitos={requisitos}
      itemId={itemId}
    />
  )
}

// Main component with Suspense wrapper
export default function TramitesPage() {
  return (
    <Suspense fallback={<TramitesLoading />}>
      <TramitesContent />
    </Suspense>
  )
}
