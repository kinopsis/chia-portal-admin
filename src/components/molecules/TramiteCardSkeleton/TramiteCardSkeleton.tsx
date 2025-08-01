// UX-005: Enhanced Skeleton Loader for Trámite Cards
// Realistic loading states that match the actual card structure

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export interface TramiteCardSkeletonProps {
  className?: string
  showShimmer?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  'data-testid'?: string
}

export const TramiteCardSkeleton: React.FC<TramiteCardSkeletonProps> = ({
  className,
  showShimmer = true,
  variant = 'default',
  'data-testid': testId,
}) => {
  // Shimmer animation classes
  const shimmerClasses = showShimmer
    ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
    : ''

  // Base skeleton element classes
  const skeletonBase = cn(
    'bg-gray-200 rounded animate-pulse',
    shimmerClasses
  )

  // Variant-specific configurations
  const variantConfig = {
    default: {
      showRequirements: true,
      showEstimatedTime: true,
      showExtraInfo: true,
    },
    compact: {
      showRequirements: false,
      showEstimatedTime: true,
      showExtraInfo: false,
    },
    detailed: {
      showRequirements: true,
      showEstimatedTime: true,
      showExtraInfo: true,
    },
  }

  const config = variantConfig[variant]

  return (
    <Card 
      className={cn(
        'hover:shadow-lg transition-shadow duration-200 animate-pulse',
        className
      )}
      data-testid={testId}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header Section: Badges + Title */}
          <div className="mb-4">
            {/* Type and Payment badges */}
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(skeletonBase, 'h-6 w-16')} />
              <div className={cn(skeletonBase, 'h-6 w-20')} />
            </div>
            
            {/* Title with code */}
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(skeletonBase, 'h-6 w-20')} />
              <div className={cn(skeletonBase, 'h-6 w-48')} />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4 space-y-2">
            <div className={cn(skeletonBase, 'h-4 w-full')} />
            <div className={cn(skeletonBase, 'h-4 w-3/4')} />
          </div>

          {/* Dependency Information */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn(skeletonBase, 'h-4 w-4 rounded-full')} />
              <div className={cn(skeletonBase, 'h-4 w-32')} />
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(skeletonBase, 'h-4 w-4 rounded-full')} />
              <div className={cn(skeletonBase, 'h-4 w-40')} />
            </div>
          </div>

          {/* Requirements Section (if enabled) */}
          {config.showRequirements && (
            <div className="mb-4">
              <div className={cn(skeletonBase, 'h-5 w-24 mb-2')} />
              <div className="space-y-1">
                <div className={cn(skeletonBase, 'h-3 w-full')} />
                <div className={cn(skeletonBase, 'h-3 w-5/6')} />
                <div className={cn(skeletonBase, 'h-3 w-4/5')} />
              </div>
            </div>
          )}

          {/* Cost and Time Information */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className={cn(skeletonBase, 'h-4 w-4 rounded-full')} />
              <div className={cn(skeletonBase, 'h-4 w-16')} />
            </div>
            {config.showEstimatedTime && (
              <div className="flex items-center gap-2">
                <div className={cn(skeletonBase, 'h-4 w-4 rounded-full')} />
                <div className={cn(skeletonBase, 'h-4 w-20')} />
              </div>
            )}
          </div>

          {/* Government Links (if enabled) */}
          {config.showExtraInfo && (
            <div className="flex items-center gap-4">
              <div className={cn(skeletonBase, 'h-8 w-24 rounded')} />
              <div className={cn(skeletonBase, 'h-8 w-28 rounded')} />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="ml-4">
          <div className={cn(skeletonBase, 'h-10 w-24 rounded')} />
        </div>
      </div>
    </Card>
  )
}

// Multiple skeleton cards for loading states
export interface TramiteCardSkeletonGridProps {
  count?: number
  className?: string
  showShimmer?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  staggered?: boolean
  'data-testid'?: string
}

export const TramiteCardSkeletonGrid: React.FC<TramiteCardSkeletonGridProps> = ({
  count = 6,
  className,
  showShimmer = true,
  variant = 'default',
  staggered = true,
  'data-testid': testId,
}) => {
  return (
    <div className={cn('space-y-4', className)} data-testid={testId}>
      {Array.from({ length: count }).map((_, index) => (
        <TramiteCardSkeleton
          key={index}
          showShimmer={showShimmer}
          variant={variant}
          className={staggered ? `animate-delay-${index * 100}` : undefined}
          data-testid={`skeleton-card-${index}`}
        />
      ))}
    </div>
  )
}

// Progressive loading skeleton that reveals content gradually
export interface ProgressiveTramiteSkeletonProps {
  loadingStage: 'initial' | 'basic-info' | 'details' | 'complete'
  className?: string
  'data-testid'?: string
}

export const ProgressiveTramiteSkeleton: React.FC<ProgressiveTramiteSkeletonProps> = ({
  loadingStage,
  className,
  'data-testid': testId,
}) => {
  const shimmerClasses = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
  const skeletonBase = cn('bg-gray-200 rounded animate-pulse', shimmerClasses)
  const loadedBase = 'bg-green-100 border border-green-200 rounded'

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-500', className)} data-testid={testId}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                loadingStage === 'initial' ? skeletonBase : loadedBase,
                'h-6 w-16 transition-all duration-300'
              )} />
              <div className={cn(
                loadingStage === 'initial' ? skeletonBase : loadedBase,
                'h-6 w-20 transition-all duration-300'
              )} />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                ['initial'].includes(loadingStage) ? skeletonBase : loadedBase,
                'h-6 w-20 transition-all duration-300'
              )} />
              <div className={cn(
                ['initial'].includes(loadingStage) ? skeletonBase : loadedBase,
                'h-6 w-48 transition-all duration-300'
              )} />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4 space-y-2">
            <div className={cn(
              ['initial', 'basic-info'].includes(loadingStage) ? skeletonBase : loadedBase,
              'h-4 w-full transition-all duration-300'
            )} />
            <div className={cn(
              ['initial', 'basic-info'].includes(loadingStage) ? skeletonBase : loadedBase,
              'h-4 w-3/4 transition-all duration-300'
            )} />
          </div>

          {/* Dependency Information */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                ['initial', 'basic-info'].includes(loadingStage) ? skeletonBase : loadedBase,
                'h-4 w-4 rounded-full transition-all duration-300'
              )} />
              <div className={cn(
                ['initial', 'basic-info'].includes(loadingStage) ? skeletonBase : loadedBase,
                'h-4 w-32 transition-all duration-300'
              )} />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                ['initial', 'basic-info', 'details'].includes(loadingStage) ? skeletonBase : loadedBase,
                'h-4 w-4 rounded-full transition-all duration-300'
              )} />
              <div className={cn(
                ['initial', 'basic-info', 'details'].includes(loadingStage) ? skeletonBase : loadedBase,
                'h-4 w-16 transition-all duration-300'
              )} />
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                ['initial', 'basic-info', 'details'].includes(loadingStage) ? skeletonBase : loadedBase,
                'h-4 w-4 rounded-full transition-all duration-300'
              )} />
              <div className={cn(
                ['initial', 'basic-info', 'details'].includes(loadingStage) ? skeletonBase : loadedBase,
                'h-4 w-20 transition-all duration-300'
              )} />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="ml-4">
          <div className={cn(
            loadingStage !== 'complete' ? skeletonBase : loadedBase,
            'h-10 w-24 rounded transition-all duration-300'
          )} />
        </div>
      </div>
    </Card>
  )
}
