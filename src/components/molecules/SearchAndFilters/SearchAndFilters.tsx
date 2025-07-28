'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Button } from '@/components/atoms'
import { AdvancedFilterBuilder } from '@/components/molecules'
import type { FilterGroup, AdvancedFilterConfig } from '@/components/molecules'
import { clsx } from 'clsx'

export interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean'
  options?: { label: string; value: any }[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

export interface FilterValue {
  [key: string]: any
}

export interface FilterPreset {
  id: string
  name: string
  filters: FilterValue
  isDefault?: boolean
}

export interface SearchAndFiltersProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  showSearch?: boolean

  filters?: FilterConfig[]
  filterValues?: FilterValue
  onFiltersChange?: (filters: FilterValue) => void

  presets?: FilterPreset[]
  onPresetSelect?: (preset: FilterPreset) => void
  onPresetSave?: (name: string, filters: FilterValue) => void

  showClearAll?: boolean
  onClearAll?: () => void

  loading?: boolean
  className?: string
  size?: 'small' | 'medium' | 'large'
  layout?: 'horizontal' | 'vertical' | 'compact'

  // Advanced features
  debounceMs?: number
  showFilterCount?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean

  // Advanced filters
  showAdvancedFilters?: boolean
  advancedFilterFields?: AdvancedFilterConfig[]
  advancedFilterGroup?: FilterGroup
  onAdvancedFiltersChange?: (filterGroup: FilterGroup) => void
  onAdvancedFilterValidate?: (filterGroup: FilterGroup) => string[]
  showAdvancedFilterExport?: boolean
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  showSearch = true,

  filters = [],
  filterValues = {},
  onFiltersChange,

  presets = [],
  onPresetSelect,
  onPresetSave,

  showClearAll = true,
  onClearAll,

  loading = false,
  className,
  size = 'medium',
  layout = 'horizontal',

  debounceMs = 300,
  showFilterCount = true,
  collapsible = false,
  defaultCollapsed = false,

  // Advanced filters
  showAdvancedFilters = false,
  advancedFilterFields = [],
  advancedFilterGroup,
  onAdvancedFiltersChange,
  onAdvancedFilterValidate,
  showAdvancedFilterExport = false,
}) => {
  const [internalSearchValue, setInternalSearchValue] = useState(searchValue)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [savePresetName, setSavePresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && internalSearchValue !== searchValue) {
        onSearchChange(internalSearchValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [internalSearchValue, debounceMs, onSearchChange, searchValue])

  // Update internal search when external value changes
  useEffect(() => {
    setInternalSearchValue(searchValue)
  }, [searchValue])

  // Handle filter change
  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      if (!onFiltersChange) return

      const newFilters = { ...filterValues }

      if (value === '' || value === null || value === undefined) {
        delete newFilters[key]
      } else {
        newFilters[key] = value
      }

      onFiltersChange(newFilters)
    },
    [filterValues, onFiltersChange]
  )

  // Handle clear all
  const handleClearAll = useCallback(() => {
    setInternalSearchValue('')
    if (onSearchChange) onSearchChange('')
    if (onFiltersChange) onFiltersChange({})
    if (onClearAll) onClearAll()
  }, [onSearchChange, onFiltersChange, onClearAll])

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (preset: FilterPreset) => {
      if (onFiltersChange) onFiltersChange(preset.filters)
      if (onPresetSelect) onPresetSelect(preset)
    },
    [onFiltersChange, onPresetSelect]
  )

  // Handle save preset
  const handleSavePreset = useCallback(() => {
    if (savePresetName.trim() && onPresetSave) {
      onPresetSave(savePresetName.trim(), filterValues)
      setSavePresetName('')
      setShowSavePreset(false)
    }
  }, [savePresetName, filterValues, onPresetSave])

  // Count active filters (including advanced filters)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchValue.trim()) count++
    count += Object.keys(filterValues).length

    // Count advanced filter conditions
    if (advancedFilterGroup) {
      const countConditions = (group: FilterGroup): number => {
        let conditionCount = group.conditions.length
        group.groups.forEach((nestedGroup) => {
          conditionCount += countConditions(nestedGroup)
        })
        return conditionCount
      }
      count += countConditions(advancedFilterGroup)
    }

    return count
  }, [searchValue, filterValues, advancedFilterGroup])

  // Size classes
  const sizeClasses = {
    small: {
      input: 'px-2 py-1 text-xs',
      button: 'px-2 py-1 text-xs',
      spacing: 'space-x-2 space-y-2',
    },
    medium: {
      input: 'px-3 py-2 text-sm',
      button: 'px-3 py-2 text-sm',
      spacing: 'space-x-3 space-y-3',
    },
    large: {
      input: 'px-4 py-3 text-base',
      button: 'px-4 py-3 text-base',
      spacing: 'space-x-4 space-y-4',
    },
  }

  const classes = sizeClasses[size]

  // Render filter input based on type
  const renderFilterInput = (filter: FilterConfig) => {
    const value = filterValues[filter.key] || ''

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            {...(loading && { })}
            className={clsx(
              'border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
              classes.input,
              loading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Filtrar por ${filter.label}`}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            {...(loading && { })}
            className={clsx(
              'border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
              classes.input,
              loading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Filtrar por ${filter.label}`}
          >
            <option value="">Todos</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) =>
              handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : '')
            }
            placeholder={filter.placeholder}
            min={filter.min}
            max={filter.max}
            step={filter.step}
            {...(loading && { })}
            className={clsx(
              'border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
              classes.input,
              loading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Filtrar por ${filter.label}`}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            {...(loading && { })}
            className={clsx(
              'border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
              classes.input,
              loading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Filtrar por ${filter.label}`}
          />
        )

      case 'dateRange':
        const rangeValue = value || { start: '', end: '' }
        return (
          <div className="flex space-x-2">
            <input
              type="date"
              value={rangeValue.start || ''}
              onChange={(e) =>
                handleFilterChange(filter.key, { ...rangeValue, start: e.target.value })
              }
              {...(loading && { })}
              className={clsx(
                'border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                classes.input,
                loading && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={`${filter.label} - Fecha inicio`}
            />
            <span className="self-center text-gray-500">-</span>
            <input
              type="date"
              value={rangeValue.end || ''}
              onChange={(e) =>
                handleFilterChange(filter.key, { ...rangeValue, end: e.target.value })
              }
              {...(loading && { })}
              className={clsx(
                'border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                classes.input,
                loading && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={`${filter.label} - Fecha fin`}
            />
          </div>
        )

      case 'boolean':
        return (
          <select
            value={value === true ? 'true' : value === false ? 'false' : ''}
            onChange={(e) => {
              const val = e.target.value === 'true' ? true : e.target.value === 'false' ? false : ''
              handleFilterChange(filter.key, val)
            }}
            {...(loading && { })}
            className={clsx(
              'border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
              classes.input,
              loading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Filtrar por ${filter.label}`}
          >
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        )

      default:
        return null
    }
  }

  if (collapsible && isCollapsed) {
    return (
      <div
        className={clsx('flex items-center justify-between p-4 bg-gray-50 rounded-lg', className)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filtros</span>
          {showFilterCount && activeFilterCount > 0 && (
            <span className="bg-primary-green text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          aria-label="Expandir filtros"
        >
          ⌄
        </Button>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white border border-gray-200 rounded-lg p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Búsqueda y Filtros</h3>
          {showFilterCount && activeFilterCount > 0 && (
            <span className="bg-primary-green text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount} activos
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              aria-label="Colapsar filtros"
            >
              ⌃
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={internalSearchValue}
              onChange={(e) => setInternalSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              {...(loading && { })}
              className={clsx(
                'w-full pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                classes.input,
                loading && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Buscar en la tabla"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>
      )}

      {/* Presets */}
      {presets.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Filtros Predefinidos:
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                disabled={loading}
                className={clsx(preset.isDefault && 'border-primary-green text-primary-green')}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <div
          className={clsx(
            'grid gap-4',
            layout === 'horizontal' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            layout === 'vertical' && 'grid-cols-1',
            layout === 'compact' && 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6'
          )}
        >
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">{filter.label}:</label>
              {renderFilterInput(filter)}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {showClearAll && activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll} disabled={loading}>
              Limpiar Todo
            </Button>
          )}

          {onPresetSave && activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSavePreset(!showSavePreset)}
              disabled={loading}
            >
              Guardar Filtro
            </Button>
          )}

          {showAdvancedFilters && advancedFilterFields.length > 0 && (
            <Button
              variant={showAdvancedBuilder ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowAdvancedBuilder(!showAdvancedBuilder)}
              disabled={loading}
            >
              {showAdvancedBuilder ? 'Ocultar' : 'Filtros'} Avanzados
            </Button>
          )}
        </div>

        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="animate-spin">⟳</span>
            <span>Filtrando...</span>
          </div>
        )}
      </div>

      {/* Save Preset */}
      {showSavePreset && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={savePresetName}
              onChange={(e) => setSavePresetName(e.target.value)}
              placeholder="Nombre del filtro"
              className={clsx('flex-1', classes.input, 'border border-gray-300 rounded')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSavePreset()
                }
              }}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSavePreset}
              disabled={!savePresetName.trim()}
            >
              Guardar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSavePreset(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Filter Builder */}
      {showAdvancedFilters && showAdvancedBuilder && advancedFilterFields.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <AdvancedFilterBuilder
            fields={advancedFilterFields}
            filterGroup={advancedFilterGroup}
            onChange={onAdvancedFiltersChange}
            onValidate={onAdvancedFilterValidate}
            disabled={loading}
            showExportImport={showAdvancedFilterExport}
            onExport={(filterGroup) => {
              // Export functionality
              const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                filterGroup,
              }
              const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `filtros-avanzados-${new Date().toISOString().split('T')[0]}.json`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default SearchAndFilters
