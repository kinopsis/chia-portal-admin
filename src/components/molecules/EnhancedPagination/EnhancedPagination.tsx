'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/atoms'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface EnhancedPaginationProps {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  showFirstLast?: boolean
  pageSizeOptions?: number[]
  size?: 'small' | 'default' | 'large'
  simple?: boolean
  hideOnSinglePage?: boolean
  disabled?: boolean
  className?: string
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}

const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  current,
  pageSize,
  total,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  showFirstLast = true,
  pageSizeOptions = [10, 25, 50, 100],
  size = 'default',
  simple = false,
  hideOnSinglePage = false,
  disabled = false,
  className,
  onChange,
  onShowSizeChange,
}) => {
  const [quickJumpValue, setQuickJumpValue] = useState('')

  // Calculate pagination info
  const totalPages = Math.ceil(total / pageSize)
  const startRecord = total === 0 ? 0 : (current - 1) * pageSize + 1
  const endRecord = Math.min(current * pageSize, total)

  // Hide pagination if only one page and hideOnSinglePage is true
  if (hideOnSinglePage && totalPages <= 1) {
    return null
  }

  // Size configurations
  const sizeConfig = {
    small: {
      button: 'h-8 w-8 text-sm',
      text: 'text-sm',
      gap: 'gap-1',
    },
    default: {
      button: 'h-10 w-10 text-sm',
      text: 'text-sm',
      gap: 'gap-2',
    },
    large: {
      button: 'h-12 w-12 text-base',
      text: 'text-base',
      gap: 'gap-3',
    },
  }

  const config = sizeConfig[size]

  // Generate visible page numbers
  const getVisiblePages = () => {
    const delta = 2
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (current > delta + 2) {
        pages.push('...')
      }

      const start = Math.max(2, current - delta)
      const end = Math.min(totalPages - 1, current + delta)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (current < totalPages - delta - 1) {
        pages.push('...')
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === current || disabled) return
      onChange?.(page, pageSize)
    },
    [current, totalPages, pageSize, disabled, onChange]
  )

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      if (newPageSize === pageSize || disabled) return
      const newCurrent = Math.ceil((startRecord - 1) / newPageSize) + 1
      onShowSizeChange?.(newCurrent, newPageSize)
      onChange?.(newCurrent, newPageSize)
    },
    [pageSize, startRecord, disabled, onShowSizeChange, onChange]
  )

  // Handle quick jump
  const handleQuickJump = useCallback(() => {
    const page = parseInt(quickJumpValue, 10)
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page)
      setQuickJumpValue('')
    }
  }, [quickJumpValue, totalPages, handlePageChange])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        action()
      }
    },
    []
  )

  if (simple) {
    return (
      <div className={clsx('flex items-center justify-between', className)}>
        <Button
          variant="outline"
          size={size}
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1 || disabled}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        <span className={clsx('font-medium', config.text)}>
          {current} / {totalPages}
        </span>
        
        <Button
          variant="outline"
          size={size}
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages || disabled}
          className="flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Results Summary */}
      {showTotal && (
        <div className={clsx('text-center', config.text, 'text-gray-600')}>
          Mostrando <span className="font-medium">{startRecord.toLocaleString()}</span> a{' '}
          <span className="font-medium">{endRecord.toLocaleString()}</span> de{' '}
          <span className="font-medium text-primary-green">{total.toLocaleString()}</span> resultados
        </div>
      )}

      {/* Main Pagination Controls */}
      <div className={clsx('flex items-center justify-center', config.gap)}>
        {/* First Page */}
        {showFirstLast && totalPages > 7 && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageChange(1)}
            disabled={current === 1 || disabled}
            className={clsx(config.button, 'flex items-center justify-center')}
            aria-label="Primera página"
            title="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous Page */}
        <Button
          variant="outline"
          size={size}
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1 || disabled}
          className={clsx(config.button, 'flex items-center justify-center')}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={clsx('flex items-center justify-center', config.button, 'text-gray-400')}>
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                variant={page === current ? 'default' : 'outline'}
                size={size}
                onClick={() => handlePageChange(page as number)}
                disabled={disabled}
                onKeyDown={(e) => handleKeyDown(e, () => handlePageChange(page as number))}
                aria-label={`Página ${page}`}
                aria-current={page === current ? 'page' : undefined}
                className={clsx(
                  config.button,
                  'flex items-center justify-center font-medium',
                  page === current && 'bg-primary-green text-white border-primary-green hover:bg-primary-green/90'
                )}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next Page */}
        <Button
          variant="outline"
          size={size}
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages || disabled}
          className={clsx(config.button, 'flex items-center justify-center')}
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        {showFirstLast && totalPages > 7 && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageChange(totalPages)}
            disabled={current === totalPages || disabled}
            className={clsx(config.button, 'flex items-center justify-center')}
            aria-label="Última página"
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Controls */}
      {(showSizeChanger || showQuickJumper) && (
        <div className="flex items-center justify-center gap-6 pt-2">
          {/* Page Size Changer */}
          {showSizeChanger && (
            <div className="flex items-center gap-2">
              <span className={clsx(config.text, 'text-gray-600')}>Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                disabled={disabled}
                className={clsx(
                  'border border-gray-300 rounded-md px-3 py-1 bg-white',
                  config.text,
                  'focus:ring-2 focus:ring-primary-green focus:border-primary-green',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className={clsx(config.text, 'text-gray-600')}>por página</span>
            </div>
          )}

          {/* Quick Jumper */}
          {showQuickJumper && (
            <div className="flex items-center gap-2">
              <span className={clsx(config.text, 'text-gray-600')}>Ir a:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={quickJumpValue}
                onChange={(e) => setQuickJumpValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleQuickJump()
                  }
                }}
                disabled={disabled}
                className={clsx(
                  'w-16 border border-gray-300 rounded-md px-2 py-1 text-center',
                  config.text,
                  'focus:ring-2 focus:ring-primary-green focus:border-primary-green',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                placeholder="1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickJump}
                disabled={disabled || !quickJumpValue}
                className="px-3"
              >
                Ir
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EnhancedPagination
