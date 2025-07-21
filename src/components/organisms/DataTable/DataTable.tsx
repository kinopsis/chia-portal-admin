'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Card,
  Button,
  Spinner,
  ErrorBoundary,
  LoadingOverlay,
  EmptyState,
  Skeleton,
} from '@/components/atoms'
import {
  Pagination,
  SearchAndFilters,
  applyAdvancedFilters,
  TableSkeleton,
  RowActions,
  BulkActions,
  MobileDataTable,
  SwipeActions,
} from '@/components/molecules'
import type {
  FilterConfig,
  FilterValue,
  FilterPreset,
  AdvancedFilterConfig,
  FilterGroup,
  RowAction,
  BulkAction,
  SwipeAction,
} from '@/components/molecules'
import { useBreakpoint } from '@/hooks'
import { clsx } from 'clsx'

export interface SortConfig<T = any> {
  key: keyof T | string
  direction: 'asc' | 'desc'
  priority: number
}

export interface Column<T = any> {
  key: keyof T | string
  title: string
  width?: string | number
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  className?: string
  sorter?: boolean | ((a: T, b: T) => number)
  defaultSortOrder?: 'asc' | 'desc'
  sortDirections?: ('asc' | 'desc')[]
  hidden?: boolean
  dataType?: string
}

export interface DataTableProps<T = any> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  error?: string | null

  // Enhanced loading states
  loadingType?: 'skeleton' | 'overlay' | 'spinner'
  loadingMessage?: string
  progress?: number
  showProgress?: boolean

  // Error handling
  onRetry?: () => void
  showErrorDetails?: boolean
  errorBoundary?: boolean

  // Pagination
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    showTotal?: boolean
    showFirstLast?: boolean
    pageSizeOptions?: number[]
    position?: 'top' | 'bottom' | 'both'
    size?: 'small' | 'default'
    simple?: boolean
    hideOnSinglePage?: boolean
    onChange?: (page: number, pageSize: number) => void
    onShowSizeChange?: (current: number, size: number) => void
  }

  // Sorting
  sortable?: boolean
  defaultSort?: {
    key: keyof T | string
    direction: 'asc' | 'desc'
  }
  multiSort?: boolean
  sortConfig?: SortConfig<T>[]
  onSort?: (sortConfig: SortConfig<T>[]) => void

  // Selection
  selectable?: boolean
  selectedRowKeys?: (string | number)[]
  onSelectionChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
  rowKey?: keyof T | ((record: T) => string | number)

  // Row actions (legacy)
  actions?: {
    render: (record: T, index: number) => React.ReactNode
    width?: string | number
    fixed?: 'left' | 'right'
  }

  // Enhanced row actions
  rowActions?: RowAction<T>[]
  rowActionsConfig?: {
    variant?: 'buttons' | 'dropdown' | 'menu'
    maxVisibleActions?: number
    width?: string | number
    fixed?: 'left' | 'right'
  }

  // Bulk actions
  bulkActions?: BulkAction<T>[]
  bulkActionsConfig?: {
    variant?: 'bar' | 'dropdown'
    position?: 'top' | 'bottom' | 'floating'
  }

  // Styling
  size?: 'small' | 'medium' | 'large'
  bordered?: boolean
  striped?: boolean
  hover?: boolean
  className?: string

  // Events
  onRowClick?: (record: T, index: number) => void
  onRowDoubleClick?: (record: T, index: number) => void

  // Empty state
  emptyText?: string
  emptyIcon?: React.ReactNode
  emptyMessage?: string
  emptyStateProps?: {
    title?: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
  }

  // Search and Filters
  showSearchAndFilters?: boolean
  searchable?: boolean
  searchValue?: string
  searchQuery?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  filterValues?: FilterValue
  onFiltersChange?: (filters: FilterValue) => void
  filterPresets?: FilterPreset[]
  onFilterPresetSelect?: (preset: FilterPreset) => void
  onFilterPresetSave?: (name: string, filters: FilterValue) => void

  // Advanced filters
  showAdvancedFilters?: boolean
  advancedFilterFields?: AdvancedFilterConfig[]
  advancedFilterGroup?: FilterGroup
  onAdvancedFiltersChange?: (filterGroup: FilterGroup) => void
  onAdvancedFilterValidate?: (filterGroup: FilterGroup) => string[]

  // Responsive
  responsive?: boolean
  scrollX?: number | string
  scrollY?: number | string

  // Mobile responsiveness
  mobileBreakpoint?: number
  mobileLayout?: 'card' | 'list' | 'compact' | 'table'
  mobileColumns?: {
    primary?: string
    secondary?: string
    hidden?: string[]
  }
  swipeActions?: {
    left?: SwipeAction[]
    right?: SwipeAction[]
  }
  touchOptimized?: boolean
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  loadingType = 'skeleton',
  loadingMessage = 'Cargando datos...',
  progress,
  showProgress = false,
  onRetry,
  showErrorDetails = false,
  errorBoundary = true,
  pagination,
  sortable = true,
  defaultSort,
  multiSort = false,
  sortConfig: externalSortConfig,
  onSort,
  selectable = false,
  selectedRowKeys = [],
  onSelectionChange,
  rowKey = 'id',
  actions,
  rowActions = [],
  rowActionsConfig = { variant: 'buttons', maxVisibleActions: 3 },
  bulkActions = [],
  bulkActionsConfig = { variant: 'bar', position: 'floating' },
  size = 'medium',
  bordered = true,
  striped = true,
  hover = true,
  className,
  onRowClick,
  onRowDoubleClick,
  emptyText = 'No hay datos disponibles',
  emptyIcon,
  showSearchAndFilters = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  filters = [],
  filterValues = {},
  onFiltersChange,
  filterPresets = [],
  onFilterPresetSelect,
  onFilterPresetSave,
  showAdvancedFilters = false,
  advancedFilterFields = [],
  advancedFilterGroup,
  onAdvancedFiltersChange,
  onAdvancedFilterValidate,
  responsive = true,
  scrollX,
  scrollY,
  mobileBreakpoint = 768,
  mobileLayout = 'card',
  mobileColumns,
  swipeActions,
  touchOptimized = true,
}: DataTableProps<T>) => {
  const { width, isMobile } = useBreakpoint({ md: mobileBreakpoint })
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig<T>[]>(
    defaultSort ? [{ ...defaultSort, priority: 0 }] : []
  )

  // Use external sort config if provided, otherwise use internal
  const currentSortConfig = externalSortConfig || internalSortConfig

  // Get row key function
  const getRowKey = useCallback(
    (record: T, index: number): string | number => {
      if (typeof rowKey === 'function') {
        return rowKey(record)
      }
      return record[rowKey] ?? index
    },
    [rowKey]
  )

  // Handle sorting with multi-column support
  const handleSort = useCallback(
    (key: keyof T | string, event?: React.MouseEvent) => {
      if (!sortable) return

      const isMultiSort = multiSort && event?.shiftKey
      let newSortConfig: SortConfig<T>[]

      if (isMultiSort) {
        // Multi-column sorting
        const existingSort = currentSortConfig.find((sort) => sort.key === key)

        if (existingSort) {
          // Update existing sort direction or remove if cycling through
          if (existingSort.direction === 'asc') {
            newSortConfig = currentSortConfig.map((sort) =>
              sort.key === key ? { ...sort, direction: 'desc' as const } : sort
            )
          } else {
            // Remove this sort
            newSortConfig = currentSortConfig.filter((sort) => sort.key !== key)
          }
        } else {
          // Add new sort
          newSortConfig = [
            ...currentSortConfig,
            { key, direction: 'asc' as const, priority: currentSortConfig.length },
          ]
        }
      } else {
        // Single column sorting
        const existingSort = currentSortConfig.find((sort) => sort.key === key)
        const newDirection = existingSort?.direction === 'asc' ? 'desc' : 'asc'

        newSortConfig = [{ key, direction: newDirection, priority: 0 }]
      }

      // Update internal state if not controlled
      if (!externalSortConfig) {
        setInternalSortConfig(newSortConfig)
      }

      // Call external handler
      if (onSort) {
        onSort(newSortConfig)
      }
    },
    [sortable, multiSort, currentSortConfig, externalSortConfig, onSort]
  )

  // Handle selection
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!selectable || !onSelectionChange) return

      if (checked) {
        const allKeys = data.map((record, index) => getRowKey(record, index))
        onSelectionChange(allKeys, data)
      } else {
        onSelectionChange([], [])
      }
    },
    [selectable, onSelectionChange, data, getRowKey]
  )

  const handleSelectRow = useCallback(
    (record: T, index: number, checked: boolean) => {
      if (!selectable || !onSelectionChange) return

      const key = getRowKey(record, index)
      let newSelectedKeys: (string | number)[]
      let newSelectedRows: T[]

      if (checked) {
        newSelectedKeys = [...selectedRowKeys, key]
        newSelectedRows = [
          ...data.filter((_, i) => selectedRowKeys.includes(getRowKey(data[i], i))),
          record,
        ]
      } else {
        newSelectedKeys = selectedRowKeys.filter((k) => k !== key)
        newSelectedRows = data.filter((_, i) => newSelectedKeys.includes(getRowKey(data[i], i)))
      }

      onSelectionChange(newSelectedKeys, newSelectedRows)
    },
    [selectable, onSelectionChange, selectedRowKeys, data, getRowKey]
  )

  // Memoized filtered data based on search and filters
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase().trim()
      result = result.filter((record) => {
        return columns.some((column) => {
          const value = record[column.key]
          if (value == null) return false
          return String(value).toLowerCase().includes(searchTerm)
        })
      })
    }

    // Apply column filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value === '' || value == null) return

      const filter = filters.find((f) => f.key === key)
      if (!filter) return

      result = result.filter((record) => {
        const recordValue = record[key]

        switch (filter.type) {
          case 'text':
            return (
              recordValue != null &&
              String(recordValue).toLowerCase().includes(String(value).toLowerCase())
            )

          case 'select':
          case 'boolean':
            return recordValue === value

          case 'number':
            return recordValue === Number(value)

          case 'date':
            if (!recordValue) return false
            const recordDate = new Date(recordValue).toISOString().split('T')[0]
            return recordDate === value

          case 'dateRange':
            if (!recordValue || !value.start || !value.end) return false
            const date = new Date(recordValue)
            const start = new Date(value.start)
            const end = new Date(value.end)
            return date >= start && date <= end

          default:
            return true
        }
      })
    })

    // Apply advanced filters
    if (advancedFilterGroup) {
      result = applyAdvancedFilters(result, advancedFilterGroup)
    }

    return result
  }, [data, searchValue, filterValues, columns, filters, advancedFilterGroup])

  // Memoized sorted data with multi-column support
  const sortedData = useMemo(() => {
    if (!currentSortConfig.length || !sortable) return filteredData

    return [...filteredData].sort((a, b) => {
      // Sort by each column in priority order
      for (const sort of currentSortConfig.sort((x, y) => x.priority - y.priority)) {
        const column = columns.find((col) => col.key === sort.key)
        let aValue = a[sort.key]
        let bValue = b[sort.key]

        // Use custom sorter if provided
        if (column?.sorter && typeof column.sorter === 'function') {
          const result = column.sorter(a, b)
          if (result !== 0) {
            return sort.direction === 'asc' ? result : -result
          }
          continue
        }

        // Handle null/undefined values
        if (aValue == null && bValue == null) continue
        if (aValue == null) return 1
        if (bValue == null) return -1

        // Convert to comparable values
        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()

        if (aValue === bValue) continue

        const comparison = aValue < bValue ? -1 : 1
        return sort.direction === 'asc' ? comparison : -comparison
      }
      return 0
    })
  }, [filteredData, currentSortConfig, sortable, columns])

  // Memoized paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, pagination])

  // Use paginated data for rendering, or all data if no pagination
  const displayData = pagination ? paginatedData : sortedData

  // Size classes
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }

  const cellPaddingClasses = {
    small: 'px-2 py-1',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  }

  // Check if all rows are selected
  const isAllSelected = data.length > 0 && selectedRowKeys.length === data.length
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < data.length

  // Render enhanced sort icon with priority
  const renderSortIcon = (columnKey: keyof T | string) => {
    if (!sortable) return null

    const sortInfo = currentSortConfig.find((sort) => sort.key === columnKey)
    const isActive = !!sortInfo
    const direction = sortInfo?.direction
    const priority = sortInfo?.priority

    return (
      <span className="ml-2 inline-flex items-center space-x-1">
        <span className="inline-flex flex-col">
          <span
            className={clsx(
              'text-xs leading-none transition-colors',
              isActive && direction === 'asc' ? 'text-primary-green' : 'text-gray-400'
            )}
          >
            ▲
          </span>
          <span
            className={clsx(
              'text-xs leading-none transition-colors',
              isActive && direction === 'desc' ? 'text-primary-green' : 'text-gray-400'
            )}
          >
            ▼
          </span>
        </span>
        {/* Show priority number for multi-sort */}
        {multiSort && isActive && currentSortConfig.length > 1 && (
          <span className="text-xs bg-primary-green text-white rounded-full w-4 h-4 flex items-center justify-center font-medium">
            {priority + 1}
          </span>
        )}
      </span>
    )
  }

  // Loading state with different types
  if (loading && loadingType === 'skeleton') {
    return (
      <TableSkeleton
        rows={pagination?.pageSize || 10}
        columns={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
        showHeader={true}
        showPagination={!!pagination}
        showFilters={showSearchAndFilters}
        size={size}
        className={className}
      />
    )
  }

  if (loading && loadingType === 'spinner') {
    return (
      <Card className={clsx('p-8', className)}>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">{loadingMessage}</p>
            {showProgress && typeof progress === 'number' && (
              <div className="mt-4 w-64 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
                <div className="text-xs text-gray-600 mt-1">{Math.round(progress)}%</div>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Error state with retry functionality
  if (error) {
    const errorIcon = (
      <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    )

    return (
      <Card className={clsx(className)}>
        <EmptyState
          icon={errorIcon}
          title="Error al cargar datos"
          description={error}
          action={
            onRetry
              ? {
                  label: 'Reintentar',
                  onClick: onRetry,
                  variant: 'primary',
                }
              : undefined
          }
          secondaryAction={{
            label: 'Recargar página',
            onClick: () => window.location.reload(),
            variant: 'outline',
          }}
        />
        {showErrorDetails && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <details>
              <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                Ver detalles del error
              </summary>
              <div className="mt-2 text-xs text-red-800 font-mono">{error}</div>
            </details>
          </div>
        )}
      </Card>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    const defaultEmptyIcon = (
      <svg
        className="w-16 h-16 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    )

    return (
      <Card className={clsx(className)}>
        <EmptyState
          icon={emptyIcon || defaultEmptyIcon}
          title="No hay datos disponibles"
          description={emptyText}
        />
      </Card>
    )
  }

  // Determine if we should use mobile layout
  const shouldUseMobileLayout = isMobile && mobileLayout !== 'table'

  // Filter columns for mobile if specified
  const mobileVisibleColumns =
    shouldUseMobileLayout && mobileColumns?.hidden
      ? columns.filter((col) => !mobileColumns.hidden!.includes(String(col.key)))
      : columns

  // Convert row actions to swipe actions for mobile
  const mobileSwipeActions =
    shouldUseMobileLayout && swipeActions
      ? {
          left: swipeActions.left || [],
          right:
            swipeActions.right ||
            rowActions.slice(0, 2).map((action) => ({
              key: action.key,
              label: action.label,
              icon: action.icon,
              color: action.variant === 'danger' ? ('red' as const) : ('blue' as const),
              onClick: () => action.onClick(displayData[0], 0), // This will be properly handled in the mobile component
            })),
        }
      : undefined

  const tableContent = (
    <LoadingOverlay
      isVisible={loading && loadingType === 'overlay'}
      message={loadingMessage}
      progress={progress}
      showProgress={showProgress}
      backdrop={true}
    >
      <Card className={clsx('overflow-hidden', className)}>
        {/* Search and Filters */}
        {showSearchAndFilters && (
          <div className="p-4 border-b border-gray-200">
            <SearchAndFilters
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              searchPlaceholder={searchPlaceholder}
              filters={filters}
              filterValues={filterValues}
              onFiltersChange={onFiltersChange}
              presets={filterPresets}
              onPresetSelect={onFilterPresetSelect}
              onPresetSave={onFilterPresetSave}
              showAdvancedFilters={showAdvancedFilters}
              advancedFilterFields={advancedFilterFields}
              advancedFilterGroup={advancedFilterGroup}
              onAdvancedFiltersChange={onAdvancedFiltersChange}
              onAdvancedFilterValidate={onAdvancedFilterValidate}
              showAdvancedFilterExport={true}
              loading={loading}
              size={size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'}
            />
          </div>
        )}

        {/* Top Pagination */}
        {pagination && (pagination.position === 'top' || pagination.position === 'both') && (
          <div className="p-4 border-b border-gray-200">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total || sortedData.length}
              showSizeChanger={pagination.showSizeChanger}
              showQuickJumper={pagination.showQuickJumper}
              showTotal={pagination.showTotal}
              showFirstLast={pagination.showFirstLast}
              pageSizeOptions={pagination.pageSizeOptions}
              size={pagination.size}
              simple={pagination.simple}
              hideOnSinglePage={pagination.hideOnSinglePage}
              disabled={loading}
              onChange={pagination.onChange}
              onShowSizeChange={pagination.onShowSizeChange}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {bulkActions.length > 0 &&
          selectedRowKeys.length > 0 &&
          (bulkActionsConfig.position === 'top' || bulkActionsConfig.position === 'floating') && (
            <div className="p-4 border-b border-gray-200">
              <BulkActions
                selectedRecords={displayData.filter((record) =>
                  selectedRowKeys.includes(record[rowKey])
                )}
                selectedKeys={selectedRowKeys}
                actions={bulkActions}
                variant={bulkActionsConfig.variant}
                position={bulkActionsConfig.position}
                onActionStart={(action, selectedRecords) => {
                  console.log('Bulk action started:', action.key, selectedRecords)
                }}
                onActionComplete={(action, selectedRecords, result) => {
                  console.log('Bulk action completed:', action.key, selectedRecords, result)
                }}
                onActionError={(action, selectedRecords, error) => {
                  console.error('Bulk action error:', action.key, selectedRecords, error)
                }}
                onClearSelection={() => {
                  if (onSelectionChange) {
                    onSelectionChange([], [])
                  }
                }}
              />
            </div>
          )}

        {/* Mobile Layout */}
        {shouldUseMobileLayout ? (
          <div className="p-4">
            <MobileDataTable
              data={displayData}
              columns={mobileVisibleColumns}
              rowKey={rowKey}
              selectable={selectable}
              selectedRowKeys={selectedRowKeys}
              onSelectionChange={onSelectionChange}
              rowActions={rowActions}
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
              layout={mobileLayout}
              primaryField={mobileColumns?.primary}
              secondaryField={mobileColumns?.secondary}
              showImages={true}
            />
          </div>
        ) : (
          /* Desktop Table Layout */
          <div
            className={clsx('overflow-auto', responsive && 'w-full')}
            style={{ maxHeight: scrollY }}
          >
            <table
              className={clsx(
                'w-full table-auto',
                sizeClasses[size],
                bordered && 'border-collapse'
              )}
              style={{ minWidth: scrollX }}
            >
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  {/* Selection column */}
                  {selectable && (
                    <th
                      className={clsx(
                        'text-left font-medium text-gray-900',
                        cellPaddingClasses[size],
                        bordered && 'border border-gray-200'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                      />
                    </th>
                  )}

                  {/* Data columns */}
                  {columns.map((column, index) => (
                    <th
                      key={String(column.key) + index}
                      className={clsx(
                        'font-medium text-gray-900',
                        cellPaddingClasses[size],
                        bordered && 'border border-gray-200',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.align === 'left' && 'text-left',
                        !column.align && 'text-left',
                        column.sortable !== false && sortable && 'cursor-pointer hover:bg-gray-100',
                        column.className
                      )}
                      style={{ width: column.width }}
                      onClick={(e) => column.sortable !== false && handleSort(column.key, e)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && column.sortable !== false) {
                          e.preventDefault()
                          handleSort(column.key, e)
                        }
                      }}
                      tabIndex={column.sortable !== false ? 0 : -1}
                      role={column.sortable !== false ? 'button' : undefined}
                      aria-label={
                        column.sortable !== false
                          ? `Ordenar por ${column.title}${multiSort ? '. Mantén Shift para ordenamiento múltiple' : ''}`
                          : undefined
                      }
                    >
                      <div className="flex items-center">
                        <span>{column.title}</span>
                        {column.sortable !== false && renderSortIcon(column.key)}
                      </div>
                    </th>
                  ))}

                  {/* Actions column (legacy) */}
                  {actions && (
                    <th
                      className={clsx(
                        'text-center font-medium text-gray-900',
                        cellPaddingClasses[size],
                        bordered && 'border border-gray-200'
                      )}
                      style={{ width: actions.width }}
                    >
                      Acciones
                    </th>
                  )}

                  {/* Enhanced row actions column */}
                  {rowActions.length > 0 && (
                    <th
                      className={clsx(
                        'text-center font-medium text-gray-900',
                        cellPaddingClasses[size],
                        bordered && 'border border-gray-200'
                      )}
                      style={{ width: rowActionsConfig.width || '120px' }}
                    >
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {displayData.map((record, index) => {
                  const key = getRowKey(record, index)
                  const isSelected = selectedRowKeys.includes(key)

                  return (
                    <tr
                      key={String(key)}
                      className={clsx(
                        'transition-colors',
                        striped && index % 2 === 0 && 'bg-white',
                        striped && index % 2 === 1 && 'bg-gray-50',
                        hover && 'hover:bg-gray-100',
                        isSelected && 'bg-primary-green/10',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(record, index)}
                      onDoubleClick={() => onRowDoubleClick?.(record, index)}
                    >
                      {/* Selection cell */}
                      {selectable && (
                        <td
                          className={clsx(
                            cellPaddingClasses[size],
                            bordered && 'border border-gray-200'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(record, index, e.target.checked)}
                            className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                          />
                        </td>
                      )}

                      {/* Data cells */}
                      {columns.map((column, colIndex) => (
                        <td
                          key={String(column.key) + colIndex}
                          className={clsx(
                            cellPaddingClasses[size],
                            bordered && 'border border-gray-200',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.align === 'left' && 'text-left',
                            !column.align && 'text-left',
                            column.className
                          )}
                        >
                          {column.render
                            ? column.render(record[column.key], record, index)
                            : String(record[column.key] ?? '')}
                        </td>
                      ))}

                      {/* Actions cell (legacy) */}
                      {actions && (
                        <td
                          className={clsx(
                            'text-center',
                            cellPaddingClasses[size],
                            bordered && 'border border-gray-200'
                          )}
                        >
                          {actions.render(record, index)}
                        </td>
                      )}

                      {/* Enhanced row actions cell */}
                      {rowActions.length > 0 && (
                        <td
                          className={clsx(
                            'text-center',
                            cellPaddingClasses[size],
                            bordered && 'border border-gray-200'
                          )}
                        >
                          <RowActions
                            record={record}
                            index={index}
                            actions={rowActions}
                            variant={rowActionsConfig.variant}
                            maxVisibleActions={rowActionsConfig.maxVisibleActions}
                            size={size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'}
                            onActionStart={(action, record) => {
                              console.log('Action started:', action.key, record)
                            }}
                            onActionComplete={(action, record, result) => {
                              console.log('Action completed:', action.key, record, result)
                            }}
                            onActionError={(action, record, error) => {
                              console.error('Action error:', action.key, record, error)
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination &&
          (pagination.position === 'bottom' ||
            pagination.position === 'both' ||
            !pagination.position) && (
            <div className="p-4 border-t border-gray-200">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total || sortedData.length}
                showSizeChanger={pagination.showSizeChanger}
                showQuickJumper={pagination.showQuickJumper}
                showTotal={pagination.showTotal}
                showFirstLast={pagination.showFirstLast}
                pageSizeOptions={pagination.pageSizeOptions}
                size={pagination.size}
                simple={pagination.simple}
                hideOnSinglePage={pagination.hideOnSinglePage}
                disabled={loading}
                onChange={pagination.onChange}
                onShowSizeChange={pagination.onShowSizeChange}
              />
            </div>
          )}

        {/* Bottom Bulk Actions */}
        {bulkActions.length > 0 &&
          selectedRowKeys.length > 0 &&
          bulkActionsConfig.position === 'bottom' && (
            <div className="p-4 border-t border-gray-200">
              <BulkActions
                selectedRecords={displayData.filter((record) =>
                  selectedRowKeys.includes(record[rowKey])
                )}
                selectedKeys={selectedRowKeys}
                actions={bulkActions}
                variant={bulkActionsConfig.variant}
                position={bulkActionsConfig.position}
                onActionStart={(action, selectedRecords) => {
                  console.log('Bulk action started:', action.key, selectedRecords)
                }}
                onActionComplete={(action, selectedRecords, result) => {
                  console.log('Bulk action completed:', action.key, selectedRecords, result)
                }}
                onActionError={(action, selectedRecords, error) => {
                  console.error('Bulk action error:', action.key, selectedRecords, error)
                }}
                onClearSelection={() => {
                  if (onSelectionChange) {
                    onSelectionChange([], [])
                  }
                }}
              />
            </div>
          )}
      </Card>
    </LoadingOverlay>
  )

  if (errorBoundary) {
    return (
      <ErrorBoundary
        showDetails={showErrorDetails}
        onError={(error, errorInfo) => {
          console.error('DataTable Error:', error, errorInfo)
        }}
      >
        {tableContent}
      </ErrorBoundary>
    )
  }

  return tableContent
}

export default DataTable
