'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, Button, Badge, Select } from '@/components/atoms'
import { SearchBar, Breadcrumb } from '@/components/molecules'
import { PageHeader } from '@/components/layout'
import type { BreadcrumbItem } from '@/components/molecules'
import { unifiedSearchService } from '@/services/unifiedSearch'
import type { UnifiedSearchResult, UnifiedSearchFilters } from '@/services/unifiedSearch'

import { dependenciasClientService } from '@/services/dependencias'
import { SubdependenciasClientService } from '@/services/subdependencias'
import type { Dependencia, Subdependencia } from '@/types'
// UX-004: Import new filter components
import { TramitesFilters } from '@/components/organisms/TramitesFilters/TramitesFilters'
import { FilterOption } from '@/components/molecules/FilterChips/FilterChips'
// UX-005: Import enhanced loading components
import { TramiteCardSkeletonGrid } from '@/components/molecules/TramiteCardSkeleton/TramiteCardSkeleton'
import { useLoadingStates, LoadingPresets } from '@/hooks/useLoadingStates'
// Enhanced pagination component
import EnhancedPagination from '@/components/molecules/EnhancedPagination/EnhancedPagination'
// Unified service card components
import { UnifiedServiceCardGrid } from '@/components/molecules/UnifiedServiceCard'
import type { UnifiedServiceData } from '@/components/molecules/UnifiedServiceCard'
import { getServiceDescription, truncateByChars, isMeaningfulText } from '@/utils/textUtils'

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
 * - Clean layout without statistics display for improved focus on search functionality
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
  // UX-004: Updated to arrays for multi-selection
  const [selectedDependencias, setSelectedDependencias] = useState<string[]>([])
  const [selectedTipos, setSelectedTipos] = useState<string[]>([])
  const [selectedSubdependencias, setSelectedSubdependencias] = useState<string[]>([])
  const [selectedTiposPago, setSelectedTiposPago] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [dependenciasLoading, setDependenciasLoading] = useState(true)
  const [subdependencias, setSubdependencias] = useState<SubdependenciaWithRelations[]>([])  // NEW
  const [filteredSubdependencias, setFilteredSubdependencias] = useState<SubdependenciaWithRelations[]>([])  // NEW
  const [subdependenciasLoading, setSubdependenciasLoading] = useState(true)  // NEW

  // UX-005: Enhanced loading states
  const loadingStates = useLoadingStates({
    stages: LoadingPresets.standard.stages,
    autoProgress: false, // Manual control for realistic timing
    onComplete: () => {
      console.log('Loading completed')
    }
  })

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
        // UX-005: Start enhanced loading sequence
        loadingStates.startLoading()

        // UX-004: Convert arrays to single values for API compatibility
        // For now, use first selected value. Future: extend API to support arrays
        const filters: UnifiedSearchFilters = {
          query: searchQuery,
          tipo: selectedTipos.length > 0 ? selectedTipos[0] as any : '',
          dependencia: selectedDependencias.length > 0 ? selectedDependencias[0] : '',
          subdependenciaId: selectedSubdependencias.length > 0 ? selectedSubdependencias[0] : '',
          tipoPago: selectedTiposPago.length > 0 ? selectedTiposPago[0] as any : '',
          page: currentPage,
          limit: itemsPerPage
        }

        // UX-005: Progress to basic info stage
        setTimeout(() => loadingStates.goToStage('basic-info'), 400)

        // Use optimized search method that excludes FAQs for better performance
        const result = await unifiedSearchService.searchTramitesAndOpas(filters)

        // UX-005: Progress to details stage
        loadingStates.goToStage('details')

        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 300))

        setData(result.data)
        setTotalPages(result.pagination.totalPages)
        setTotalResults(result.pagination.total)

        // UX-005: Complete loading
        loadingStates.stopLoading()

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos'
        setError(errorMessage)
        loadingStates.setError(errorMessage)
        console.error('Error fetching unified search data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery, selectedDependencias, selectedTipos, selectedSubdependencias, selectedTiposPago, currentPage])

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

  // UX-004: Filter subdependencias based on selected dependencias (arrays)
  useEffect(() => {
    if (selectedDependencias.length === 0) {
      setFilteredSubdependencias(subdependencias)
      setSelectedSubdependencias([]) // Clear subdependencia selection
    } else {
      const filtered = subdependencias.filter(sub => {
        // Use the proper type structure
        const dependenciaNombre = sub.dependencias?.nombre
        return dependenciaNombre && selectedDependencias.includes(dependenciaNombre)
      })
      setFilteredSubdependencias(filtered)
      // Keep only subdependencias that belong to selected dependencias
      setSelectedSubdependencias(prev =>
        prev.filter(subId =>
          filtered.some(sub => sub.id === subId)
        )
      )
    }
  }, [selectedDependencias, subdependencias])



  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // UX-004: Updated clear filters for arrays
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDependencias([])
    setSelectedTipos([])
    setSelectedSubdependencias([])
    setSelectedTiposPago([])
  }

  // Convert search results to unified service data format
  const convertToUnifiedServiceData = (items: UnifiedSearchResult[]): UnifiedServiceData[] => {
    return items.map(item => ({
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: getServiceDescription(item),
      tipo: item.tipo as 'tramite' | 'opa',
      activo: true, // Public search only shows active services
      dependencia: item.dependencia,
      subdependencia: item.subdependencia,
      tiempo_estimado: item.tiempo_estimado,
      vistas: item.vistas,
      created_at: item.created_at,
      updated_at: item.updated_at,
      originalData: item.originalData
    }))
  }

  // UX-004: Create filter options for chip components
  // Note: Statistics counts removed for cleaner interface focused on search functionality
  const dependenciasOptions: FilterOption[] = dependencias.map(dep => ({
    value: dep.nombre,
    label: dep.nombre,
    count: dep.tramites_count || 0
  }))

  const subdependenciasOptions: FilterOption[] = filteredSubdependencias.map(sub => ({
    value: sub.id,
    label: sub.nombre,
    count: sub.tramites_count || 0
  }))

  const tipoOptions: FilterOption[] = [
    { value: 'tramite', label: 'Trámites' },
    { value: 'opa', label: 'OPAs' }
  ]

  const tiposPagoOptions: FilterOption[] = [
    { value: 'gratuito', label: 'Gratuito', count: 0 },
    { value: 'con_pago', label: 'Con Pago', count: 0 }
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
          {/* UX-004: New Chip-Based Filters */}
          <TramitesFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            dependenciasOptions={dependenciasOptions}
            subdependenciasOptions={subdependenciasOptions}
            tipoOptions={tipoOptions}
            tiposPagoOptions={tiposPagoOptions}
            selectedDependencias={selectedDependencias}
            selectedSubdependencias={selectedSubdependencias}
            selectedTipos={selectedTipos}
            selectedTiposPago={selectedTiposPago}
            onDependenciasChange={setSelectedDependencias}
            onSubdependenciasChange={setSelectedSubdependencias}
            onTiposChange={setSelectedTipos}
            onTiposPagoChange={setSelectedTiposPago}
            dependenciasLoading={dependenciasLoading}
            subdependenciasLoading={subdependenciasLoading}
            totalResults={totalResults}
            onClearFilters={clearFilters}
          />

          {/* Results */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Resultados Unificados
            </h3>

            {loading ? (
              <div>
                {/* UX-005: Enhanced loading with progress indicator */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      {loadingStates.currentStageInfo.label}
                    </span>
                    <span className="text-xs text-blue-700">
                      {Math.round(loadingStates.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${loadingStates.progress}%` }}
                    />
                  </div>
                </div>

                {/* Enhanced skeleton cards */}
                <TramiteCardSkeletonGrid
                  count={6}
                  showShimmer={true}
                  variant="default"
                  staggered={true}
                  data-testid="tramites-loading-skeleton"
                />
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
              <UnifiedServiceCardGrid
                services={convertToUnifiedServiceData(data)}
                context="public"
                userRole="ciudadano"
                data-testid="tramites-results-grid"
              />
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

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <EnhancedPagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={totalResults}
                  showSizeChanger={true}
                  showQuickJumper={true}
                  showTotal={true}
                  showFirstLast={true}
                  pageSizeOptions={[10, 25, 50, 100]}
                  size="default"
                  hideOnSinglePage={true}
                  onChange={(page, size) => {
                    setCurrentPage(page)
                    if (size !== itemsPerPage) {
                      setItemsPerPage(size)
                    }
                  }}
                  onShowSizeChange={(page, size) => {
                    setCurrentPage(page)
                    setItemsPerPage(size)
                  }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
                />
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
