'use client'

import React, { useState, useCallback } from 'react'
import { Card, Button } from '@/components/atoms'
import { RowActions } from '@/components/molecules'
import type { Column, RowAction } from '@/components/organisms/DataTable'
import { clsx } from 'clsx'

export interface MobileDataTableProps<T = any> {
  data: T[]
  columns: Column<T>[]
  rowKey?: string
  selectable?: boolean
  selectedRowKeys?: (string | number)[]
  onSelectionChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
  rowActions?: RowAction<T>[]
  onRowClick?: (record: T, index: number) => void
  onRowDoubleClick?: (record: T, index: number) => void
  layout?: 'card' | 'list' | 'compact'
  showImages?: boolean
  primaryField?: string
  secondaryField?: string
  className?: string
}

const MobileDataTable = <T extends Record<string, any>>({
  data,
  columns,
  rowKey = 'id',
  selectable = false,
  selectedRowKeys = [],
  onSelectionChange,
  rowActions = [],
  onRowClick,
  onRowDoubleClick,
  layout = 'card',
  showImages = false,
  primaryField,
  secondaryField,
  className,
}: MobileDataTableProps<T>) => {
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())

  // Get primary and secondary fields from columns if not specified
  const primaryCol = primaryField ? columns.find((col) => col.key === primaryField) : columns[0]
  const secondaryCol = secondaryField
    ? columns.find((col) => col.key === secondaryField)
    : columns[1]

  // Get visible columns (excluding primary and secondary)
  const detailColumns = columns.filter(
    (col) => col.key !== primaryCol?.key && col.key !== secondaryCol?.key && !col.hidden
  )

  const handleRowSelection = useCallback(
    (record: T, checked: boolean) => {
      if (!onSelectionChange) return

      const recordKey = record[rowKey]
      let newSelectedKeys: (string | number)[]

      if (checked) {
        newSelectedKeys = [...selectedRowKeys, recordKey]
      } else {
        newSelectedKeys = selectedRowKeys.filter((key) => key !== recordKey)
      }

      const newSelectedRows = data.filter((item) => newSelectedKeys.includes(item[rowKey]))
      onSelectionChange(newSelectedKeys, newSelectedRows)
    },
    [data, rowKey, selectedRowKeys, onSelectionChange]
  )

  const toggleRowExpansion = useCallback((recordKey: string | number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(recordKey)) {
        newSet.delete(recordKey)
      } else {
        newSet.add(recordKey)
      }
      return newSet
    })
  }, [])

  const renderFieldValue = (record: T, column: Column<T>) => {
    if (column.render) {
      return column.render(record[column.key], record, data.indexOf(record))
    }

    const value = record[column.key]
    if (value == null) return '-'

    // Format dates
    if (column.dataType === 'date' && value) {
      return new Date(value).toLocaleDateString()
    }

    // Format booleans
    if (typeof value === 'boolean') {
      return value ? '✓' : '✗'
    }

    return String(value)
  }

  const renderCardLayout = (record: T, index: number) => {
    const recordKey = record[rowKey]
    const isSelected = selectedRowKeys.includes(recordKey)
    const isExpanded = expandedRows.has(recordKey)

    return (
      <Card
        key={recordKey}
        className={clsx(
          'mb-3 transition-all duration-200',
          isSelected && 'ring-2 ring-primary-green',
          'hover:shadow-md cursor-pointer'
        )}
        onClick={() => onRowClick?.(record, index)}
        onDoubleClick={() => onRowDoubleClick?.(record, index)}
      >
        <div className="p-4">
          {/* Header with selection and primary info */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start space-x-3 flex-1">
              {selectable && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleRowSelection(record, e.target.checked)
                  }}
                  className="mt-1 h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                />
              )}

              {showImages && record.image && (
                <img src={record.image} alt="" className="w-12 h-12 rounded-full object-cover" />
              )}

              <div className="flex-1 min-w-0">
                {primaryCol && (
                  <div className="font-semibold text-gray-900 truncate">
                    {renderFieldValue(record, primaryCol)}
                  </div>
                )}
                {secondaryCol && (
                  <div className="text-sm text-gray-600 truncate">
                    {renderFieldValue(record, secondaryCol)}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-2">
              {rowActions.length > 0 && (
                <RowActions
                  record={record}
                  index={index}
                  actions={rowActions}
                  variant="menu"
                  size="sm"
                />
              )}

              {detailColumns.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleRowExpansion(recordKey)
                  }}
                  aria-label={isExpanded ? 'Colapsar detalles' : 'Expandir detalles'}
                >
                  {isExpanded ? '⌃' : '⌄'}
                </Button>
              )}
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && detailColumns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-2">
                {detailColumns.map((column) => (
                  <div key={column.key} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">{column.title}:</span>
                    <span className="text-sm text-gray-900 text-right">
                      {renderFieldValue(record, column)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  const renderListLayout = (record: T, index: number) => {
    const recordKey = record[rowKey]
    const isSelected = selectedRowKeys.includes(recordKey)

    return (
      <div
        key={recordKey}
        className={clsx(
          'flex items-center justify-between p-4 border-b border-gray-200 transition-colors duration-200',
          isSelected && 'bg-blue-50',
          'hover:bg-gray-50 cursor-pointer'
        )}
        onClick={() => onRowClick?.(record, index)}
        onDoubleClick={() => onRowDoubleClick?.(record, index)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {selectable && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                handleRowSelection(record, e.target.checked)
              }}
              className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
            />
          )}

          {showImages && record.image && (
            <img src={record.image} alt="" className="w-10 h-10 rounded-full object-cover" />
          )}

          <div className="flex-1 min-w-0">
            {primaryCol && (
              <div className="font-medium text-gray-900 truncate">
                {renderFieldValue(record, primaryCol)}
              </div>
            )}
            {secondaryCol && (
              <div className="text-sm text-gray-600 truncate">
                {renderFieldValue(record, secondaryCol)}
              </div>
            )}
          </div>
        </div>

        {rowActions.length > 0 && (
          <RowActions record={record} index={index} actions={rowActions} variant="menu" size="sm" />
        )}
      </div>
    )
  }

  const renderCompactLayout = (record: T, index: number) => {
    const recordKey = record[rowKey]
    const isSelected = selectedRowKeys.includes(recordKey)

    return (
      <div
        key={recordKey}
        className={clsx(
          'flex items-center justify-between p-3 border-b border-gray-200 transition-colors duration-200',
          isSelected && 'bg-blue-50',
          'hover:bg-gray-50 cursor-pointer'
        )}
        onClick={() => onRowClick?.(record, index)}
        onDoubleClick={() => onRowDoubleClick?.(record, index)}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectable && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                handleRowSelection(record, e.target.checked)
              }}
              className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
            />
          )}

          <div className="flex-1 min-w-0">
            {primaryCol && (
              <div className="text-sm font-medium text-gray-900 truncate">
                {renderFieldValue(record, primaryCol)}
              </div>
            )}
          </div>
        </div>

        {rowActions.length > 0 && (
          <RowActions
            record={record}
            index={index}
            actions={rowActions}
            variant="buttons"
            size="sm"
            maxVisibleActions={1}
          />
        )}
      </div>
    )
  }

  const renderLayout = () => {
    switch (layout) {
      case 'list':
        return data.map(renderListLayout)
      case 'compact':
        return data.map(renderCompactLayout)
      case 'card':
      default:
        return data.map(renderCardLayout)
    }
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className={clsx('mobile-data-table', className)}>
      {layout === 'card' ? (
        <div>{renderLayout()}</div>
      ) : (
        <Card className="overflow-hidden">{renderLayout()}</Card>
      )}
    </div>
  )
}

export default MobileDataTable
