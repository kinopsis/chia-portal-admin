'use client'

import React, { useState } from 'react'
import { Button } from '@/components/atoms'
import { clsx } from 'clsx'

export interface BulkAction<T = any> {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  onClick: (selectedRecords: T[], selectedKeys: (string | number)[]) => void | Promise<void>
  disabled?: boolean | ((selectedRecords: T[], selectedKeys: (string | number)[]) => boolean)
  hidden?: boolean | ((selectedRecords: T[], selectedKeys: (string | number)[]) => boolean)
  loading?: boolean
  confirmMessage?: string
  confirmTitle?: string
  minSelection?: number
  maxSelection?: number
}

export interface BulkActionsProps<T = any> {
  selectedRecords: T[]
  selectedKeys: (string | number)[]
  actions: BulkAction<T>[]
  className?: string
  variant?: 'bar' | 'dropdown'
  position?: 'top' | 'bottom' | 'floating'
  onActionStart?: (action: BulkAction<T>, selectedRecords: T[]) => void
  onActionComplete?: (action: BulkAction<T>, selectedRecords: T[], result?: any) => void
  onActionError?: (action: BulkAction<T>, selectedRecords: T[], error: Error) => void
  onClearSelection?: () => void
}

const BulkActions = <T extends Record<string, any>>({
  selectedRecords,
  selectedKeys,
  actions,
  className,
  variant = 'bar',
  position = 'floating',
  onActionStart,
  onActionComplete,
  onActionError,
  onClearSelection,
}: BulkActionsProps<T>) => {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())
  const [showConfirm, setShowConfirm] = useState<{
    action: BulkAction<T>
    show: boolean
  } | null>(null)

  const selectedCount = selectedRecords.length

  // Filter visible actions
  const visibleActions = actions.filter((action) => {
    // Check if action should be hidden
    if (typeof action.hidden === 'function') {
      if (action.hidden(selectedRecords, selectedKeys)) return false
    } else if (action.hidden) {
      return false
    }

    // Check min/max selection requirements
    if (action.minSelection && selectedCount < action.minSelection) return false
    if (action.maxSelection && selectedCount > action.maxSelection) return false

    return true
  })

  const handleActionClick = async (action: BulkAction<T>) => {
    // Check if action is disabled
    const isDisabled =
      typeof action.disabled === 'function'
        ? action.disabled(selectedRecords, selectedKeys)
        : action.disabled

    if (isDisabled || loadingActions.has(action.key)) return

    // Show confirmation if required
    if (action.confirmMessage) {
      setShowConfirm({ action, show: true })
      return
    }

    await executeAction(action)
  }

  const executeAction = async (action: BulkAction<T>) => {
    try {
      setLoadingActions((prev) => new Set(prev).add(action.key))
      onActionStart?.(action, selectedRecords)

      const result = await action.onClick(selectedRecords, selectedKeys)

      onActionComplete?.(action, selectedRecords, result)
    } catch (error) {
      console.error(`Error executing bulk action ${action.key}:`, error)
      onActionError?.(action, selectedRecords, error as Error)
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(action.key)
        return newSet
      })
      setShowConfirm(null)
    }
  }

  const handleConfirmAction = async () => {
    if (showConfirm) {
      await executeAction(showConfirm.action)
    }
  }

  const renderActionButton = (action: BulkAction<T>) => {
    const isDisabled =
      typeof action.disabled === 'function'
        ? action.disabled(selectedRecords, selectedKeys)
        : action.disabled

    const isLoading = loadingActions.has(action.key) || action.loading

    return (
      <Button
        key={action.key}
        variant={action.variant || 'outline'}
        size="sm"
        disabled={isDisabled || isLoading}
        onClick={() => handleActionClick(action)}
        className={clsx(
          action.variant === 'danger' && 'border-red-300 text-red-600 hover:bg-red-50'
        )}
      >
        {isLoading ? (
          <span className="animate-spin mr-2">⟳</span>
        ) : (
          action.icon && <span className="mr-2">{action.icon}</span>
        )}
        {action.label}
      </Button>
    )
  }

  if (selectedCount === 0 || visibleActions.length === 0) {
    return null
  }

  const containerClasses = clsx(
    'bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-200',
    position === 'floating' && 'shadow-lg',
    className
  )

  return (
    <>
      <div className={containerClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-blue-800">
              {selectedCount} elemento{selectedCount !== 1 ? 's' : ''} seleccionado
              {selectedCount !== 1 ? 's' : ''}
            </div>

            {variant === 'bar' && (
              <div className="flex items-center space-x-2">
                {visibleActions.map((action) => renderActionButton(action))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {variant === 'dropdown' && visibleActions.length > 0 && (
              <div className="flex items-center space-x-2">
                {visibleActions.map((action) => renderActionButton(action))}
              </div>
            )}

            {onClearSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-blue-600 hover:text-blue-700"
              >
                Limpiar selección
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showConfirm.action.confirmTitle || 'Confirmar acción masiva'}
            </h3>
            <p className="text-gray-600 mb-4">{showConfirm.action.confirmMessage}</p>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción afectará a {selectedCount} elemento{selectedCount !== 1 ? 's' : ''}.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant={showConfirm.action.variant === 'danger' ? 'primary' : 'primary'}
                onClick={handleConfirmAction}
                className={
                  showConfirm.action.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''
                }
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BulkActions
