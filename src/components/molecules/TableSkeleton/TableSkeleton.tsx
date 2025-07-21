import React from 'react'
import { Skeleton } from '@/components/atoms'
import { clsx } from 'clsx'

export interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  showPagination?: boolean
  showFilters?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  showPagination = true,
  showFilters = false,
  size = 'medium',
  className,
}) => {
  const sizeClasses = {
    small: {
      padding: 'px-2 py-1',
      height: 'h-8',
    },
    medium: {
      padding: 'px-4 py-3',
      height: 'h-12',
    },
    large: {
      padding: 'px-6 py-4',
      height: 'h-16',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className={clsx('bg-white border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Filters skeleton */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton width="200px" height="24px" />
            <Skeleton width="100px" height="32px" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton width="80px" height="16px" />
                <Skeleton height="40px" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table skeleton */}
      <div className="overflow-hidden">
        <table className="w-full">
          {/* Header skeleton */}
          {showHeader && (
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th
                    key={index}
                    className={clsx('text-left border-b border-gray-200', classes.padding)}
                  >
                    <div className="flex items-center space-x-2">
                      <Skeleton
                        width={index === 0 ? '120px' : index === columns - 1 ? '80px' : '100px'}
                        height="16px"
                      />
                      <Skeleton width="16px" height="16px" variant="rectangular" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* Body skeleton */}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={clsx(
                  'border-b border-gray-200',
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                )}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className={clsx(classes.padding)}>
                    {colIndex === 0 ? (
                      // First column - more complex content
                      <div className="space-y-1">
                        <Skeleton width="140px" height="16px" />
                        <Skeleton width="100px" height="14px" />
                      </div>
                    ) : colIndex === columns - 1 ? (
                      // Last column - actions
                      <div className="flex space-x-2">
                        <Skeleton width="24px" height="24px" variant="rectangular" />
                        <Skeleton width="24px" height="24px" variant="rectangular" />
                        <Skeleton width="24px" height="24px" variant="rectangular" />
                      </div>
                    ) : (
                      // Regular columns
                      <Skeleton width={`${60 + Math.random() * 40}%`} height="16px" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      {showPagination && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left side - info and page size */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Skeleton width="180px" height="16px" />
              <div className="flex items-center space-x-2">
                <Skeleton width="60px" height="16px" />
                <Skeleton width="80px" height="32px" />
                <Skeleton width="80px" height="16px" />
              </div>
            </div>

            {/* Right side - pagination controls */}
            <div className="flex items-center space-x-1">
              <Skeleton width="32px" height="32px" variant="rectangular" />
              <Skeleton width="32px" height="32px" variant="rectangular" />
              <Skeleton width="32px" height="32px" variant="rectangular" />
              <Skeleton width="32px" height="32px" variant="rectangular" />
              <Skeleton width="32px" height="32px" variant="rectangular" />
              <Skeleton width="32px" height="32px" variant="rectangular" />
              <Skeleton width="32px" height="32px" variant="rectangular" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableSkeleton
