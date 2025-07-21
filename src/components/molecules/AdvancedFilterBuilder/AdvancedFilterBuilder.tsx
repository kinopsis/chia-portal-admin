'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/atoms'
import { clsx } from 'clsx'

export type FilterOperator = 
  | 'equals' | 'not_equals' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
  | 'greater_equal' | 'less_equal' | 'between' | 'not_between'
  | 'is_null' | 'is_not_null' | 'in' | 'not_in'

export type LogicalOperator = 'AND' | 'OR'

export interface FilterCondition {
  id: string
  field: string
  operator: FilterOperator
  value: any
  dataType: 'string' | 'number' | 'date' | 'boolean'
}

export interface FilterGroup {
  id: string
  operator: LogicalOperator
  conditions: FilterCondition[]
  groups: FilterGroup[]
}

export interface AdvancedFilterConfig {
  field: string
  label: string
  dataType: 'string' | 'number' | 'date' | 'boolean'
  operators?: FilterOperator[]
  options?: { label: string; value: any }[]
}

export interface AdvancedFilterBuilderProps {
  fields: AdvancedFilterConfig[]
  filterGroup?: FilterGroup
  onChange?: (filterGroup: FilterGroup) => void
  onValidate?: (filterGroup: FilterGroup) => string[]
  className?: string
  disabled?: boolean
  maxDepth?: number
  showExportImport?: boolean
  onExport?: (filterGroup: FilterGroup) => void
  onImport?: (filterGroup: FilterGroup) => void
}

const DEFAULT_OPERATORS: Record<string, FilterOperator[]> = {
  string: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_null', 'is_not_null'],
  number: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'is_null', 'is_not_null'],
  date: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'is_null', 'is_not_null'],
  boolean: ['equals', 'not_equals', 'is_null', 'is_not_null'],
}

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Igual a',
  not_equals: 'No igual a',
  contains: 'Contiene',
  not_contains: 'No contiene',
  starts_with: 'Comienza con',
  ends_with: 'Termina con',
  greater_than: 'Mayor que',
  less_than: 'Menor que',
  greater_equal: 'Mayor o igual que',
  less_equal: 'Menor o igual que',
  between: 'Entre',
  not_between: 'No entre',
  is_null: 'Es nulo',
  is_not_null: 'No es nulo',
  in: 'En lista',
  not_in: 'No en lista',
}

const AdvancedFilterBuilder: React.FC<AdvancedFilterBuilderProps> = ({
  fields,
  filterGroup,
  onChange,
  onValidate,
  className,
  disabled = false,
  maxDepth = 3,
  showExportImport = false,
  onExport,
  onImport,
}) => {
  const [errors, setErrors] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Create default filter group if none provided
  const currentGroup = useMemo(() => {
    return filterGroup || {
      id: 'root',
      operator: 'AND' as LogicalOperator,
      conditions: [],
      groups: [],
    }
  }, [filterGroup])

  // Generate unique ID
  const generateId = useCallback(() => {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Add new condition
  const addCondition = useCallback((groupId: string) => {
    if (!onChange || disabled) return

    const newCondition: FilterCondition = {
      id: generateId(),
      field: fields[0]?.field || '',
      operator: 'equals',
      value: '',
      dataType: fields[0]?.dataType || 'string',
    }

    const updateGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [...group.conditions, newCondition],
        }
      }
      return {
        ...group,
        groups: group.groups.map(updateGroup),
      }
    }

    onChange(updateGroup(currentGroup))
  }, [onChange, disabled, generateId, fields, currentGroup])

  // Add new group
  const addGroup = useCallback((parentGroupId: string) => {
    if (!onChange || disabled) return

    const newGroup: FilterGroup = {
      id: generateId(),
      operator: 'AND',
      conditions: [],
      groups: [],
    }

    const updateGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === parentGroupId) {
        return {
          ...group,
          groups: [...group.groups, newGroup],
        }
      }
      return {
        ...group,
        groups: group.groups.map(updateGroup),
      }
    }

    onChange(updateGroup(currentGroup))
  }, [onChange, disabled, generateId, currentGroup])

  // Update condition
  const updateCondition = useCallback((conditionId: string, updates: Partial<FilterCondition>) => {
    if (!onChange || disabled) return

    const updateGroup = (group: FilterGroup): FilterGroup => {
      return {
        ...group,
        conditions: group.conditions.map(condition =>
          condition.id === conditionId ? { ...condition, ...updates } : condition
        ),
        groups: group.groups.map(updateGroup),
      }
    }

    onChange(updateGroup(currentGroup))
  }, [onChange, disabled, currentGroup])

  // Remove condition
  const removeCondition = useCallback((conditionId: string) => {
    if (!onChange || disabled) return

    const updateGroup = (group: FilterGroup): FilterGroup => {
      return {
        ...group,
        conditions: group.conditions.filter(condition => condition.id !== conditionId),
        groups: group.groups.map(updateGroup),
      }
    }

    onChange(updateGroup(currentGroup))
  }, [onChange, disabled, currentGroup])

  // Remove group
  const removeGroup = useCallback((groupId: string) => {
    if (!onChange || disabled || groupId === 'root') return

    const updateGroup = (group: FilterGroup): FilterGroup => {
      return {
        ...group,
        groups: group.groups.filter(g => g.id !== groupId).map(updateGroup),
      }
    }

    onChange(updateGroup(currentGroup))
  }, [onChange, disabled, currentGroup])

  // Update group operator
  const updateGroupOperator = useCallback((groupId: string, operator: LogicalOperator) => {
    if (!onChange || disabled) return

    const updateGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === groupId) {
        return { ...group, operator }
      }
      return {
        ...group,
        groups: group.groups.map(updateGroup),
      }
    }

    onChange(updateGroup(currentGroup))
  }, [onChange, disabled, currentGroup])

  // Validate filters
  const validateFilters = useCallback(() => {
    if (!onValidate) return []

    const validationErrors = onValidate(currentGroup)
    setErrors(validationErrors)
    return validationErrors
  }, [onValidate, currentGroup])

  // Get available operators for field
  const getOperatorsForField = useCallback((field: string) => {
    const fieldConfig = fields.find(f => f.field === field)
    if (!fieldConfig) return DEFAULT_OPERATORS.string

    return fieldConfig.operators || DEFAULT_OPERATORS[fieldConfig.dataType] || DEFAULT_OPERATORS.string
  }, [fields])

  // Render value input based on operator and data type
  const renderValueInput = useCallback((condition: FilterCondition) => {
    const fieldConfig = fields.find(f => f.field === condition.field)
    const needsValue = !['is_null', 'is_not_null'].includes(condition.operator)
    const needsTwoValues = ['between', 'not_between'].includes(condition.operator)

    if (!needsValue) return null

    const baseClasses = 'px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm'

    if (needsTwoValues) {
      const values = Array.isArray(condition.value) ? condition.value : ['', '']
      return (
        <div className="flex items-center space-x-2">
          <input
            type={condition.dataType === 'number' ? 'number' : condition.dataType === 'date' ? 'date' : 'text'}
            value={values[0] || ''}
            onChange={(e) => updateCondition(condition.id, { 
              value: [e.target.value, values[1] || ''] 
            })}
            disabled={disabled}
            className={clsx(baseClasses, disabled && 'opacity-50 cursor-not-allowed')}
            placeholder="Valor inicial"
          />
          <span className="text-gray-500">y</span>
          <input
            type={condition.dataType === 'number' ? 'number' : condition.dataType === 'date' ? 'date' : 'text'}
            value={values[1] || ''}
            onChange={(e) => updateCondition(condition.id, { 
              value: [values[0] || '', e.target.value] 
            })}
            disabled={disabled}
            className={clsx(baseClasses, disabled && 'opacity-50 cursor-not-allowed')}
            placeholder="Valor final"
          />
        </div>
      )
    }

    if (condition.dataType === 'boolean') {
      return (
        <select
          value={condition.value}
          onChange={(e) => updateCondition(condition.id, { 
            value: e.target.value === 'true' ? true : e.target.value === 'false' ? false : '' 
          })}
          disabled={disabled}
          className={clsx(baseClasses, disabled && 'opacity-50 cursor-not-allowed')}
        >
          <option value="">Seleccionar...</option>
          <option value="true">Verdadero</option>
          <option value="false">Falso</option>
        </select>
      )
    }

    if (fieldConfig?.options) {
      return (
        <select
          value={condition.value}
          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
          disabled={disabled}
          className={clsx(baseClasses, disabled && 'opacity-50 cursor-not-allowed')}
        >
          <option value="">Seleccionar...</option>
          {fieldConfig.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        type={condition.dataType === 'number' ? 'number' : condition.dataType === 'date' ? 'date' : 'text'}
        value={condition.value || ''}
        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
        disabled={disabled}
        className={clsx(baseClasses, disabled && 'opacity-50 cursor-not-allowed')}
        placeholder="Valor..."
      />
    )
  }, [fields, updateCondition, disabled])

  // Render condition
  const renderCondition = useCallback((condition: FilterCondition, groupId: string) => {
    const fieldConfig = fields.find(f => f.field === condition.field)
    const availableOperators = getOperatorsForField(condition.field)

    return (
      <div
        key={condition.id}
        className={clsx(
          'flex items-center space-x-2 p-3 bg-gray-50 rounded border',
          draggedItem === condition.id && 'opacity-50'
        )}
        draggable={!disabled}
        onDragStart={() => setDraggedItem(condition.id)}
        onDragEnd={() => setDraggedItem(null)}
      >
        {/* Field selector */}
        <select
          value={condition.field}
          onChange={(e) => {
            const newField = fields.find(f => f.field === e.target.value)
            updateCondition(condition.id, {
              field: e.target.value,
              dataType: newField?.dataType || 'string',
              operator: 'equals',
              value: '',
            })
          }}
          disabled={disabled}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green text-sm"
        >
          {fields.map((field) => (
            <option key={field.field} value={field.field}>
              {field.label}
            </option>
          ))}
        </select>

        {/* Operator selector */}
        <select
          value={condition.operator}
          onChange={(e) => updateCondition(condition.id, { 
            operator: e.target.value as FilterOperator,
            value: ['between', 'not_between'].includes(e.target.value) ? ['', ''] : ''
          })}
          disabled={disabled}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-green text-sm"
        >
          {availableOperators.map((op) => (
            <option key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </option>
          ))}
        </select>

        {/* Value input */}
        {renderValueInput(condition)}

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeCondition(condition.id)}
          disabled={disabled}
          className="text-red-600 hover:text-red-700"
          aria-label="Eliminar condición"
        >
          ✕
        </Button>
      </div>
    )
  }, [fields, getOperatorsForField, draggedItem, disabled, updateCondition, removeCondition, renderValueInput])

  // Calculate group depth
  const getGroupDepth = useCallback((group: FilterGroup, currentDepth = 0): number => {
    if (group.groups.length === 0) return currentDepth
    return Math.max(...group.groups.map(g => getGroupDepth(g, currentDepth + 1)))
  }, [])

  // Render group
  const renderGroup = useCallback((group: FilterGroup, depth = 0): React.ReactNode => {
    const canAddGroup = depth < maxDepth
    const isRoot = group.id === 'root'

    return (
      <div
        key={group.id}
        className={clsx(
          'border rounded-lg p-4 space-y-3',
          depth === 0 ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50',
          depth > 0 && 'ml-4'
        )}
      >
        {/* Group header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isRoot && (
              <select
                value={group.operator}
                onChange={(e) => updateGroupOperator(group.id, e.target.value as LogicalOperator)}
                disabled={disabled}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-green"
              >
                <option value="AND">Y (AND)</option>
                <option value="OR">O (OR)</option>
              </select>
            )}
            <span className="text-sm text-gray-600">
              {isRoot ? 'Filtros' : `Grupo ${group.operator}`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCondition(group.id)}
              disabled={disabled}
            >
              + Condición
            </Button>
            {canAddGroup && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => addGroup(group.id)}
                disabled={disabled}
              >
                + Grupo
              </Button>
            )}
            {!isRoot && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGroup(group.id)}
                disabled={disabled}
                className="text-red-600 hover:text-red-700"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Conditions */}
        {group.conditions.map((condition) => renderCondition(condition, group.id))}

        {/* Nested groups */}
        {group.groups.map((nestedGroup) => renderGroup(nestedGroup, depth + 1))}

        {/* Empty state */}
        {group.conditions.length === 0 && group.groups.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No hay condiciones definidas</p>
            <p className="text-xs mt-1">Haz clic en "+ Condición" para agregar filtros</p>
          </div>
        )}
      </div>
    )
  }, [maxDepth, disabled, updateGroupOperator, addCondition, addGroup, removeGroup, renderCondition])

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Constructor de Filtros Avanzados
        </h3>
        
        <div className="flex items-center space-x-2">
          {showExportImport && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.(currentGroup)}
                disabled={disabled}
              >
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // This would typically open a file picker or modal
                  console.log('Import functionality would be implemented here')
                }}
                disabled={disabled}
              >
                Importar
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={validateFilters}
            disabled={disabled}
          >
            Validar
          </Button>
        </div>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <h4 className="text-sm font-medium text-red-800 mb-2">Errores de validación:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter builder */}
      {renderGroup(currentGroup)}

      {/* Help text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p><strong>Consejos:</strong></p>
        <ul className="mt-1 space-y-1">
          <li>• Usa "Y (AND)" cuando todas las condiciones deben cumplirse</li>
          <li>• Usa "O (OR)" cuando al menos una condición debe cumplirse</li>
          <li>• Puedes anidar grupos para crear lógica compleja</li>
          <li>• Arrastra las condiciones para reordenarlas</li>
        </ul>
      </div>
    </div>
  )
}

// Helper function to apply advanced filters to data
export const applyAdvancedFilters = <T extends Record<string, any>>(
  data: T[],
  filterGroup: FilterGroup
): T[] => {
  if (!filterGroup || (filterGroup.conditions.length === 0 && filterGroup.groups.length === 0)) {
    return data
  }

  return data.filter(record => evaluateFilterGroup(record, filterGroup))
}

const evaluateFilterGroup = (record: any, group: FilterGroup): boolean => {
  const conditionResults = group.conditions.map(condition => evaluateCondition(record, condition))
  const groupResults = group.groups.map(nestedGroup => evaluateFilterGroup(record, nestedGroup))

  const allResults = [...conditionResults, ...groupResults]

  if (allResults.length === 0) return true

  return group.operator === 'AND'
    ? allResults.every(result => result)
    : allResults.some(result => result)
}

const evaluateCondition = (record: any, condition: FilterCondition): boolean => {
  const fieldValue = record[condition.field]
  const { operator, value } = condition

  switch (operator) {
    case 'equals':
      return fieldValue === value

    case 'not_equals':
      return fieldValue !== value

    case 'contains':
      return fieldValue != null && String(fieldValue).toLowerCase().includes(String(value).toLowerCase())

    case 'not_contains':
      return fieldValue == null || !String(fieldValue).toLowerCase().includes(String(value).toLowerCase())

    case 'starts_with':
      return fieldValue != null && String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase())

    case 'ends_with':
      return fieldValue != null && String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase())

    case 'greater_than':
      return fieldValue != null && Number(fieldValue) > Number(value)

    case 'less_than':
      return fieldValue != null && Number(fieldValue) < Number(value)

    case 'greater_equal':
      return fieldValue != null && Number(fieldValue) >= Number(value)

    case 'less_equal':
      return fieldValue != null && Number(fieldValue) <= Number(value)

    case 'between':
      if (!Array.isArray(value) || value.length !== 2) return false
      const numValue = Number(fieldValue)
      return numValue >= Number(value[0]) && numValue <= Number(value[1])

    case 'not_between':
      if (!Array.isArray(value) || value.length !== 2) return true
      const numVal = Number(fieldValue)
      return numVal < Number(value[0]) || numVal > Number(value[1])

    case 'is_null':
      return fieldValue == null || fieldValue === ''

    case 'is_not_null':
      return fieldValue != null && fieldValue !== ''

    case 'in':
      return Array.isArray(value) && value.includes(fieldValue)

    case 'not_in':
      return !Array.isArray(value) || !value.includes(fieldValue)

    default:
      return true
  }
}

export default AdvancedFilterBuilder
