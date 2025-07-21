'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/atoms'
import { clsx } from 'clsx'

export interface RowAction<T = any> {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  onClick: (record: T, index: number) => void | Promise<void>
  disabled?: boolean | ((record: T, index: number) => boolean)
  hidden?: boolean | ((record: T, index: number) => boolean)
  loading?: boolean
  tooltip?: string
  confirmMessage?: string
  confirmTitle?: string
  shortcut?: string
}

export interface RowActionsProps<T = any> {
  record: T
  index: number
  actions: RowAction<T>[]
  variant?: 'buttons' | 'dropdown' | 'menu'
  size?: 'sm' | 'md' | 'lg'
  maxVisibleActions?: number
  className?: string
  onActionStart?: (action: RowAction<T>, record: T) => void
  onActionComplete?: (action: RowAction<T>, record: T, result?: any) => void
  onActionError?: (action: RowAction<T>, record: T, error: Error) => void
}

const RowActions = <T extends Record<string, any>>({
  record,
  index,
  actions,
  variant = 'buttons',
  size = 'md',
  maxVisibleActions = 3,
  className,
  onActionStart,
  onActionComplete,
  onActionError,
}: RowActionsProps<T>) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())
  const [showConfirm, setShowConfirm] = useState<{
    action: RowAction<T>
    show: boolean
  } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter visible actions
  const visibleActions = actions.filter(action => {
    if (typeof action.hidden === 'function') {
      return !action.hidden(record, index)
    }
    return !action.hidden
  })

  // Split actions for dropdown variant
  const primaryActions = variant === 'dropdown' 
    ? visibleActions.slice(0, maxVisibleActions)
    : visibleActions

  const dropdownActions = variant === 'dropdown' 
    ? visibleActions.slice(maxVisibleActions)
    : []

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when this row is focused or selected
      const target = event.target as HTMLElement
      const isInThisRow = target.closest('tr')?.contains(dropdownRef.current)
      
      if (!isInThisRow) return

      visibleActions.forEach(action => {
        if (action.shortcut && event.key === action.shortcut) {
          event.preventDefault()
          handleActionClick(action)
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visibleActions, record, index])

  const handleActionClick = async (action: RowAction<T>) => {
    // Check if action is disabled
    const isDisabled = typeof action.disabled === 'function' 
      ? action.disabled(record, index)
      : action.disabled

    if (isDisabled || loadingActions.has(action.key)) return

    // Show confirmation if required
    if (action.confirmMessage) {
      setShowConfirm({ action, show: true })
      return
    }

    await executeAction(action)
  }

  const executeAction = async (action: RowAction<T>) => {
    try {
      setLoadingActions(prev => new Set(prev).add(action.key))
      onActionStart?.(action, record)

      const result = await action.onClick(record, index)
      
      onActionComplete?.(action, record, result)
    } catch (error) {
      console.error(`Error executing action ${action.key}:`, error)
      onActionError?.(action, record, error as Error)
    } finally {
      setLoadingActions(prev => {
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

  const renderActionButton = (action: RowAction<T>, isInDropdown = false) => {
    const isDisabled = typeof action.disabled === 'function' 
      ? action.disabled(record, index)
      : action.disabled

    const isLoading = loadingActions.has(action.key) || action.loading

    const buttonProps = {
      variant: action.variant || 'ghost',
      size: size,
      disabled: isDisabled || isLoading,
      onClick: () => handleActionClick(action),
      title: action.tooltip || action.label,
      'aria-label': action.label,
      className: clsx(
        isInDropdown && 'w-full justify-start',
        action.variant === 'danger' && 'text-red-600 hover:text-red-700 hover:bg-red-50'
      ),
    }

    if (isInDropdown) {
      return (
        <button
          key={action.key}
          {...buttonProps}
          className={clsx(
            'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2',
            isDisabled && 'opacity-50 cursor-not-allowed',
            action.variant === 'danger' && 'text-red-600 hover:bg-red-50'
          )}
        >
          {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
          <span>{action.label}</span>
          {action.shortcut && (
            <span className="ml-auto text-xs text-gray-400">
              {action.shortcut}
            </span>
          )}
        </button>
      )
    }

    return (
      <Button key={action.key} {...buttonProps}>
        {isLoading ? (
          <span className="animate-spin">⟳</span>
        ) : (
          action.icon || action.label
        )}
      </Button>
    )
  }

  if (variant === 'menu') {
    return (
      <div className={clsx('relative', className)} ref={dropdownRef}>
        <Button
          variant="ghost"
          size={size}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-label="Abrir menú de acciones"
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
        >
          ⋮
        </Button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1" role="menu">
              {visibleActions.map(action => renderActionButton(action, true))}
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirm?.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showConfirm.action.confirmTitle || 'Confirmar acción'}
              </h3>
              <p className="text-gray-600 mb-6">
                {showConfirm.action.confirmMessage}
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant={showConfirm.action.variant === 'danger' ? 'primary' : 'primary'}
                  onClick={handleConfirmAction}
                  className={showConfirm.action.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'dropdown' && dropdownActions.length > 0) {
    return (
      <div className={clsx('flex items-center space-x-1', className)} ref={dropdownRef}>
        {/* Primary actions */}
        {primaryActions.map(action => renderActionButton(action))}

        {/* Dropdown for additional actions */}
        <div className="relative">
          <Button
            variant="ghost"
            size={size}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Más acciones"
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
          >
            ⋯
          </Button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1" role="menu">
                {dropdownActions.map(action => renderActionButton(action, true))}
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirm?.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showConfirm.action.confirmTitle || 'Confirmar acción'}
              </h3>
              <p className="text-gray-600 mb-6">
                {showConfirm.action.confirmMessage}
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant={showConfirm.action.variant === 'danger' ? 'primary' : 'primary'}
                  onClick={handleConfirmAction}
                  className={showConfirm.action.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default buttons variant
  return (
    <div className={clsx('flex items-center space-x-1', className)}>
      {visibleActions.map(action => renderActionButton(action))}

      {/* Confirmation Dialog */}
      {showConfirm?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showConfirm.action.confirmTitle || 'Confirmar acción'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showConfirm.action.confirmMessage}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                variant={showConfirm.action.variant === 'danger' ? 'primary' : 'primary'}
                onClick={handleConfirmAction}
                className={showConfirm.action.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RowActions
