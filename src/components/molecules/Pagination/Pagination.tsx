'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/atoms'
import { clsx } from 'clsx'

export interface PaginationProps {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  showFirstLast?: boolean
  pageSizeOptions?: number[]
  size?: 'small' | 'default'
  simple?: boolean
  hideOnSinglePage?: boolean
  disabled?: boolean
  className?: string
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
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

  // Generate page numbers to show
  const getVisiblePages = useMemo(() => {
    const delta = 2 // Number of pages to show on each side of current page
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Add ellipsis if needed
      if (current > delta + 2) {
        pages.push('...')
      }

      // Add pages around current
      const start = Math.max(2, current - delta)
      const end = Math.min(totalPages - 1, current + delta)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (current < totalPages - delta - 1) {
        pages.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }, [current, totalPages])

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === current || disabled) return
    onChange?.(page, pageSize)
  }, [current, totalPages, pageSize, disabled, onChange])

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    if (newPageSize === pageSize || disabled) return
    
    // Calculate new current page to maintain position
    const newCurrent = Math.ceil((startRecord - 1) / newPageSize) + 1
    onShowSizeChange?.(newCurrent, newPageSize)
    onChange?.(newCurrent, newPageSize)
  }, [pageSize, startRecord, disabled, onShowSizeChange, onChange])

  // Handle quick jump
  const handleQuickJump = useCallback(() => {
    const page = parseInt(quickJumpValue, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page)
      setQuickJumpValue('')
    }
  }, [quickJumpValue, totalPages, handlePageChange])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }, [])

  const buttonSize = size === 'small' ? 'sm' : 'md'
  const textSize = size === 'small' ? 'text-xs' : 'text-sm'

  if (simple) {
    return (
      <div className={clsx('flex items-center justify-between', className)}>
        {showTotal && (
          <span className={clsx('text-gray-600', textSize)}>
            {startRecord}-{endRecord} de {total}
          </span>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageChange(current - 1)}
            disabled={disabled || current <= 1}
            aria-label="Página anterior"
          >
            ← Anterior
          </Button>
          <span className={clsx('text-gray-600', textSize)}>
            {current} / {totalPages}
          </span>
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageChange(current + 1)}
            disabled={disabled || current >= totalPages}
            aria-label="Página siguiente"
          >
            Siguiente →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      {/* Total info and page size selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {showTotal && (
          <span className={clsx('text-gray-600', textSize)}>
            Mostrando {startRecord}-{endRecord} de {total} registros
          </span>
        )}
        
        {showSizeChanger && (
          <div className="flex items-center space-x-2">
            <span className={clsx('text-gray-600', textSize)}>
              Mostrar:
            </span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={disabled}
              className={clsx(
                'border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                textSize,
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Registros por página"
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className={clsx('text-gray-600', textSize)}>
              por página
            </span>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageChange(1)}
            disabled={disabled || current <= 1}
            onKeyDown={(e) => handleKeyDown(e, () => handlePageChange(1))}
            aria-label="Primera página"
            title="Primera página"
          >
            ⟪
          </Button>
        )}

        {/* Previous page button */}
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(current - 1)}
          disabled={disabled || current <= 1}
          onKeyDown={(e) => handleKeyDown(e, () => handlePageChange(current - 1))}
          aria-label="Página anterior"
          title="Página anterior"
        >
          ⟨
        </Button>

        {/* Page numbers */}
        {getVisiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={clsx('px-2 text-gray-400', textSize)}>
                ...
              </span>
            ) : (
              <Button
                variant={page === current ? 'primary' : 'outline'}
                size={buttonSize}
                onClick={() => handlePageChange(page as number)}
                disabled={disabled}
                onKeyDown={(e) => handleKeyDown(e, () => handlePageChange(page as number))}
                aria-label={`Página ${page}`}
                aria-current={page === current ? 'page' : undefined}
                className={clsx(
                  page === current && 'font-semibold'
                )}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next page button */}
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(current + 1)}
          disabled={disabled || current >= totalPages}
          onKeyDown={(e) => handleKeyDown(e, () => handlePageChange(current + 1))}
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          ⟩
        </Button>

        {/* Last page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || current >= totalPages}
            onKeyDown={(e) => handleKeyDown(e, () => handlePageChange(totalPages))}
            aria-label="Última página"
            title="Última página"
          >
            ⟫
          </Button>
        )}

        {/* Quick jumper */}
        {showQuickJumper && (
          <div className="flex items-center space-x-2 ml-4">
            <span className={clsx('text-gray-600', textSize)}>
              Ir a:
            </span>
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
                'w-16 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                textSize,
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              placeholder="1"
              aria-label="Ir a página"
            />
            <Button
              variant="outline"
              size={buttonSize}
              onClick={handleQuickJump}
              disabled={disabled || !quickJumpValue}
              aria-label="Ir a página especificada"
            >
              Ir
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pagination
