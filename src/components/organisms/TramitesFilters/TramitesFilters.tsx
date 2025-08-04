// UX-004: Enhanced Trámites Filters with Interactive Chips
// Modern filter interface with chips, multi-selection, and result counter

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { FilterChips, FilterOption } from '@/components/molecules/FilterChips/FilterChips'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SearchBar from '@/components/molecules/SearchBar/SearchBar'
import { RotateCcw, Filter, ChevronDown, ChevronUp } from 'lucide-react'

export interface TramitesFiltersProps {
  // Search
  searchQuery: string
  onSearchChange: (query: string) => void
  
  // Filter options
  dependenciasOptions: FilterOption[]
  subdependenciasOptions: FilterOption[]
  tipoOptions: FilterOption[]
  tiposPagoOptions: FilterOption[]
  
  // Selected values
  selectedDependencias: string[]
  selectedSubdependencias: string[]
  selectedTipos: string[]
  selectedTiposPago: string[]
  
  // Change handlers
  onDependenciasChange: (values: string[]) => void
  onSubdependenciasChange: (values: string[]) => void
  onTiposChange: (values: string[]) => void
  onTiposPagoChange: (values: string[]) => void
  
  // Loading states
  dependenciasLoading?: boolean
  subdependenciasLoading?: boolean
  
  // Results
  totalResults?: number
  
  // Actions
  onClearFilters: () => void
  
  className?: string
}

export const TramitesFilters: React.FC<TramitesFiltersProps> = ({
  searchQuery,
  onSearchChange,
  dependenciasOptions,
  subdependenciasOptions,
  tipoOptions,
  tiposPagoOptions,
  selectedDependencias,
  selectedSubdependencias,
  selectedTipos,
  selectedTiposPago,
  onDependenciasChange,
  onSubdependenciasChange,
  onTiposChange,
  onTiposPagoChange,
  dependenciasLoading = false,
  subdependenciasLoading = false,
  totalResults,
  onClearFilters,
  className,
}) => {
  // Calculate total active filters
  const activeFiltersCount =
    selectedDependencias.length +
    selectedSubdependencias.length +
    selectedTipos.length +
    selectedTiposPago.length

  const hasActiveFilters = activeFiltersCount > 0 || searchQuery.trim() !== ''

  return (
    <div className={cn('space-y-6', className)} data-testid="tramites-filters">
      {/* Hero Search Box - Prominent and Separate - Responsive */}
      <div className="bg-gradient-to-r from-primary-green/5 to-primary-yellow/5 rounded-2xl p-4 sm:p-6 lg:p-8 border border-primary-green/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Encuentra tu trámite o servicio
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Busca por nombre, código, palabras clave o requisitos
          </p>

          {/* Enhanced Search Bar */}
          <div className="relative">
            <SearchBar
              placeholder="Ej: certificado residencia, licencia construcción..."
              onSearch={onSearchChange}
              value={searchQuery}
              className="w-full text-base sm:text-lg"
              enableSmartSuggestions={true}
              showPopularSearches={true}
              showRecentSearches={true}
              data-testid="hero-search-bar"
            />

            {/* Real-time Results Counter */}
            {totalResults !== undefined && searchQuery.trim() && (
              <div className="mt-3 text-sm text-gray-600 animate-fade-in">
                <span className="font-medium text-primary-green">{totalResults.toLocaleString()}</span>
                {' '}resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progressive Disclosure Filter System */}
      <ProgressiveFilters
        activeFiltersCount={activeFiltersCount}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      >
        {/* Filter Chips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Row 1: Dependencias and Tipos */}
          <FilterChips
            label="Dependencias"
            options={dependenciasOptions}
            selectedValues={selectedDependencias}
            onChange={onDependenciasChange}
            placeholder={dependenciasLoading ? "Cargando dependencias..." : "Seleccionar dependencias"}
            loading={dependenciasLoading}
            allowMultiple={true}
            showCount={true}
            maxVisible={2}
            data-testid="dependencias-filter"
          />

          <FilterChips
            label="Tipo de Servicio"
            options={tipoOptions}
            selectedValues={selectedTipos}
            onChange={onTiposChange}
            placeholder="Seleccionar tipos"
            allowMultiple={true}
            showCount={true}
            maxVisible={2}
            data-testid="tipos-filter"
          />

          {/* Row 2: Subdependencias and Tipos de Pago */}
          <FilterChips
            label="Subdependencias"
            options={subdependenciasOptions}
            selectedValues={selectedSubdependencias}
            onChange={onSubdependenciasChange}
            placeholder={subdependenciasLoading ? "Cargando subdependencias..." : "Seleccionar subdependencias"}
            loading={subdependenciasLoading}
            disabled={selectedDependencias.length === 0}
            allowMultiple={true}
            showCount={true}
            maxVisible={2}
            data-testid="subdependencias-filter"
            helperText={selectedDependencias.length === 0 ? "Selecciona una dependencia primero" : undefined}
          />

          <FilterChips
            label="Tipo de Pago"
            options={tiposPagoOptions}
            selectedValues={selectedTiposPago}
            onChange={onTiposPagoChange}
            placeholder="Seleccionar tipos de pago"
            allowMultiple={true}
            showCount={true}
            maxVisible={2}
            data-testid="tipos-pago-filter"
          />
        </div>
      </ProgressiveFilters>

    </div>
  )
}

// Progressive Filters Component with Toggle Functionality
interface ProgressiveFiltersProps {
  children: React.ReactNode
  activeFiltersCount: number
  hasActiveFilters: boolean
  onClearFilters: () => void
}

const ProgressiveFilters: React.FC<ProgressiveFiltersProps> = ({
  children,
  activeFiltersCount,
  hasActiveFilters,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isPinned, setIsPinned] = React.useState(false)

  // Load pinned state from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('tramites_filters_pinned')
      if (stored === 'true') {
        setIsPinned(true)
        setIsExpanded(true)
      }
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [])

  // Save pinned state to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('tramites_filters_pinned', isPinned.toString())
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [isPinned])

  // Auto-expand only if filters are active AND pinned, or if user manually expanded
  React.useEffect(() => {
    if (hasActiveFilters && isPinned && !isExpanded) {
      setIsExpanded(true)
    }
  }, [hasActiveFilters, isPinned, isExpanded])

  // Handle pin toggle
  const handlePinToggle = React.useCallback(() => {
    setIsPinned(prev => {
      const newPinned = !prev
      if (!newPinned) {
        // If unpinning, collapse the filters
        setIsExpanded(false)
      }
      return newPinned
    })
  }, [])

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 transition-all duration-200',
            isExpanded && 'bg-primary-green/5 border-primary-green/20'
          )}
          data-testid="filters-toggle"
        >
          <Filter className="h-4 w-4" />
          <span>Filtros Avanzados</span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-green text-white">
              {activeFiltersCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Quick Actions */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid="quick-clear-filters"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Expandable Filter Panel */}
      {isExpanded && (
        <Card className={cn(
          'p-6 transition-all duration-300 ease-in-out',
          'animate-in slide-in-from-top-2 fade-in-0'
        )}>
          {/* Filter Panel Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Filtros de Búsqueda
              </h3>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Pin Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePinToggle}
                className={cn(
                  'text-xs',
                  isPinned && 'bg-primary-green/10 text-primary-green'
                )}
                title={isPinned ? 'Desanclar filtros - se ocultarán al cerrar' : 'Mantener filtros abiertos siempre'}
              >
                📌 {isPinned ? 'Anclado' : 'Anclar'}
              </Button>

              {/* Close Button */}
              {!isPinned && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Cerrar filtros"
                >
                  ✕
                </Button>
              )}
            </div>
          </div>

          {/* Filter Content */}
          {children}

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                className={cn(
                  'flex items-center gap-2',
                  hasActiveFilters && 'hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                )}
                data-testid="clear-filters-button"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar Filtros
              </Button>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="text-sm text-gray-600">
                  {activeFiltersCount > 0 && (
                    <span>
                      {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} aplicado{activeFiltersCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Filter Status */}
            <div className="text-xs text-gray-500">
              {hasActiveFilters ? (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Filtros activos
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  Sin filtros
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
