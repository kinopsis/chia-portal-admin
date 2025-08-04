/**
 * Unified Filters Component
 * Advanced filtering interface for both Trámites and OPAs
 * 
 * Features:
 * - Service type selection
 * - Advanced search
 * - Dependency filtering
 * - Payment type filtering
 * - Status filtering
 * - Filter presets
 * - Clear all functionality
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, Button, Select, Badge } from '@/components/atoms'
import { SearchBar } from '@/components/molecules'
import type { UnifiedSearchFilters } from '@/services/unifiedServices'
import type { Dependencia, Subdependencia } from '@/types'
import { clsx } from 'clsx'

export interface UnifiedFiltersProps {
  filters: UnifiedSearchFilters
  onFiltersChange: (filters: Partial<UnifiedSearchFilters>) => void
  onClearFilters: () => void
  dependencias: Dependencia[]
  subdependencias: Subdependencia[]
  loading?: boolean
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  hideSearch?: boolean
}

/**
 * UnifiedFilters component for advanced filtering
 */
export const UnifiedFilters: React.FC<UnifiedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  dependencias,
  subdependencias,
  loading = false,
  className,
  collapsible = true,
  defaultCollapsed = false,
  hideSearch = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // Filter subdependencias based on selected dependencia
  const filteredSubdependencias = useMemo(() => {
    if (!filters.dependencia_id) return subdependencias
    return subdependencias.filter(sub => sub.dependencia_id === filters.dependencia_id)
  }, [subdependencias, filters.dependencia_id])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    onFiltersChange({ query, page: 1 })
  }, [onFiltersChange])

  // Handle service type change
  const handleServiceTypeChange = useCallback((serviceType: string) => {
    onFiltersChange({ 
      serviceType: serviceType as 'tramite' | 'opa' | 'both',
      page: 1 
    })
  }, [onFiltersChange])

  // Handle dependencia change
  const handleDependenciaChange = useCallback((dependencia_id: string) => {
    onFiltersChange({ 
      dependencia_id,
      subdependencia_id: '', // Reset subdependencia when dependencia changes
      page: 1 
    })
  }, [onFiltersChange])

  // Handle subdependencia change
  const handleSubdependenciaChange = useCallback((subdependencia_id: string) => {
    onFiltersChange({ subdependencia_id, page: 1 })
  }, [onFiltersChange])

  // Handle payment type change
  const handleTipoPagoChange = useCallback((tipoPago: string) => {
    onFiltersChange({ 
      tipoPago: tipoPago as 'gratuito' | 'con_pago' | 'both',
      page: 1 
    })
  }, [onFiltersChange])

  // Handle status change
  const handleStatusChange = useCallback((activo: string) => {
    const activoValue = activo === 'both' ? undefined : activo === 'true'
    onFiltersChange({ activo: activoValue, page: 1 })
  }, [onFiltersChange])

  // Count active filters (excluding search if hidden)
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (!hideSearch && filters.query) count++
    if (filters.serviceType && filters.serviceType !== 'both') count++
    if (filters.dependencia_id) count++
    if (filters.subdependencia_id) count++
    if (filters.tipoPago && filters.tipoPago !== 'both') count++
    if (filters.activo !== undefined) count++
    return count
  }, [filters, hideSearch])

  // Service type options
  const serviceTypeOptions = [
    { value: 'both', label: 'Todos los servicios' },
    { value: 'tramite', label: 'Solo Trámites' },
    { value: 'opa', label: 'Solo OPAs' }
  ]

  // Dependencia options
  const dependenciaOptions = [
    { value: '', label: 'Todas las dependencias' },
    ...dependencias.map(dep => ({
      value: dep.id,
      label: dep.nombre
    }))
  ]

  // Subdependencia options
  const subdependenciaOptions = [
    { value: '', label: 'Todas las subdependencias' },
    ...filteredSubdependencias.map(sub => ({
      value: sub.id,
      label: sub.nombre
    }))
  ]

  // Payment type options
  const tipoPagoOptions = [
    { value: 'both', label: 'Todos los tipos' },
    { value: 'gratuito', label: 'Solo gratuitos' },
    { value: 'con_pago', label: 'Solo con pago' }
  ]

  // Status options
  const statusOptions = [
    { value: 'both', label: 'Todos los estados' },
    { value: 'true', label: 'Solo activos' },
    { value: 'false', label: 'Solo inactivos' }
  ]

  return (
    <Card className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {hideSearch ? 'Filtros Avanzados' : 'Búsqueda y Filtros'}
          </h3>
          {activeFiltersCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="neutral"
              size="sm"
              onClick={onClearFilters}
              disabled={loading}
            >
              Limpiar filtros
            </Button>
          )}
          
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              disabled={loading}
            >
              {isCollapsed ? '👁️ Mostrar' : '🙈 Ocultar'}
            </Button>
          )}
        </div>
      </div>

      {/* Filters Content */}
      {!isCollapsed && (
        <div className="space-y-4">
          {/* Search Bar - Only show if not hidden */}
          {!hideSearch && (
            <div>
              <SearchBar
                placeholder="Buscar por nombre, código, descripción..."
                onSearch={handleSearch}
                defaultValue={filters.query}
                disabled={loading}
              />
            </div>
          )}

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Servicio
              </label>
              <Select
                value={filters.serviceType || 'both'}
                onChange={handleServiceTypeChange}
                options={serviceTypeOptions}
                disabled={loading}
              />
            </div>

            {/* Dependencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dependencia
              </label>
              <Select
                value={filters.dependencia_id || ''}
                onChange={handleDependenciaChange}
                options={dependenciaOptions}
                disabled={loading}
              />
            </div>

            {/* Subdependencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subdependencia
              </label>
              <Select
                value={filters.subdependencia_id || ''}
                onChange={handleSubdependenciaChange}
                options={subdependenciaOptions}
                disabled={loading || !filters.dependencia_id}
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Pago
              </label>
              <Select
                value={filters.tipoPago || 'both'}
                onChange={handleTipoPagoChange}
                options={tipoPagoOptions}
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select
                value={filters.activo === undefined ? 'both' : filters.activo.toString()}
                onChange={handleStatusChange}
                options={statusOptions}
                disabled={loading}
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Filtros activos:
                </span>

                {!hideSearch && filters.query && (
                  <Badge variant="secondary" size="sm">
                    Búsqueda: "{filters.query}"
                  </Badge>
                )}
                
                {filters.serviceType && filters.serviceType !== 'both' && (
                  <Badge variant="secondary" size="sm">
                    Tipo: {filters.serviceType === 'tramite' ? 'Trámites' : 'OPAs'}
                  </Badge>
                )}
                
                {filters.dependencia_id && (
                  <Badge variant="secondary" size="sm">
                    Dependencia: {dependencias.find(d => d.id === filters.dependencia_id)?.nombre}
                  </Badge>
                )}
                
                {filters.subdependencia_id && (
                  <Badge variant="secondary" size="sm">
                    Subdependencia: {subdependencias.find(s => s.id === filters.subdependencia_id)?.nombre}
                  </Badge>
                )}
                
                {filters.tipoPago && filters.tipoPago !== 'both' && (
                  <Badge variant="secondary" size="sm">
                    Pago: {filters.tipoPago === 'gratuito' ? 'Gratuito' : 'Con pago'}
                  </Badge>
                )}
                
                {filters.activo !== undefined && (
                  <Badge variant="secondary" size="sm">
                    Estado: {filters.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default UnifiedFilters
