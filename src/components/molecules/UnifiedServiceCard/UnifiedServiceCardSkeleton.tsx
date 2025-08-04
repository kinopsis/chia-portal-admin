'use client'

/**
 * UnifiedServiceCardSkeleton Component
 * 
 * Loading skeleton that matches the UnifiedServiceCard structure
 * for consistent loading states across all service listings.
 */

import React from 'react'
import { clsx } from 'clsx'
import { Card } from '@/components/atoms'

export interface UnifiedServiceCardSkeletonProps {
  /** Show management actions skeleton */
  showManagementActions?: boolean
  /** Show shimmer animation */
  showShimmer?: boolean
  /** Additional CSS classes */
  className?: string
  /** Test ID for testing */
  'data-testid'?: string
}

export const UnifiedServiceCardSkeleton: React.FC<UnifiedServiceCardSkeletonProps> = ({
  showManagementActions = false,
  showShimmer = true,
  className,
  'data-testid': testId,
}) => {
  // Shimmer animation classes
  const shimmerClasses = showShimmer
    ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
    : ''

  // Base skeleton element classes
  const skeletonBase = clsx(
    'bg-gray-200 rounded animate-pulse',
    shimmerClasses
  )

  return (
    <Card className={clsx('p-4', className)} data-testid={testId}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header Section Skeleton */}
          <div className="mb-4">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <div className={clsx(skeletonBase, 'h-6 w-24 rounded-full')} />
              <div className={clsx(skeletonBase, 'h-5 w-20 rounded-full')} />
              {showManagementActions && (
                <div className={clsx(skeletonBase, 'h-5 w-16 rounded-full')} />
              )}
            </div>

            {/* Title */}
            <div className={clsx(skeletonBase, 'h-6 w-3/4 mb-2')} />

            {/* Dependency */}
            <div className="mb-3">
              <div className="bg-gray-50 px-3 py-2 rounded-md border-l-4 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={clsx(skeletonBase, 'h-4 w-4 rounded')} />
                  <div className={clsx(skeletonBase, 'h-4 w-48')} />
                </div>
              </div>
            </div>
          </div>

          {/* Description Section Skeleton */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={clsx(skeletonBase, 'h-4 w-4 rounded')} />
                <div className={clsx(skeletonBase, 'h-4 w-20')} />
              </div>
              <div className={clsx(skeletonBase, 'h-4 w-full')} />
              <div className={clsx(skeletonBase, 'h-4 w-2/3')} />
            </div>
          </div>

          {/* Requirements Section Skeleton */}
          <div className="mb-4">
            <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={clsx(skeletonBase, 'h-4 w-4 rounded')} />
                  <div className={clsx(skeletonBase, 'h-4 w-32')} />
                </div>
                <div className={clsx(skeletonBase, 'h-4 w-4 rounded')} />
              </div>
            </div>
          </div>

          {/* Estimated Time Skeleton */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
            <div className="flex items-center gap-2">
              <div className={clsx(skeletonBase, 'h-4 w-4 rounded')} />
              <div className={clsx(skeletonBase, 'h-4 w-32')} />
            </div>
          </div>

          {/* Additional Info Skeleton */}
          <div className="space-y-2">
            <div className={clsx(skeletonBase, 'h-3 w-24')} />
            {showManagementActions && (
              <div className={clsx(skeletonBase, 'h-3 w-32')} />
            )}
          </div>
        </div>

        {/* Management Actions Skeleton */}
        {showManagementActions && (
          <div className="ml-4 flex flex-col gap-2 min-w-0">
            {/* Toggle Switch */}
            <div className="flex items-center gap-2">
              <div className={clsx(skeletonBase, 'h-6 w-12 rounded-full')} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              {[...Array(4)].map((_, index) => (
                <div key={index} className={clsx(skeletonBase, 'h-7 w-20 rounded')} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default UnifiedServiceCardSkeleton
