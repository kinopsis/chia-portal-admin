/**
 * SkeletonLoader Component
 * 
 * Provides skeleton loading states for better perceived performance
 * and accessibility during data loading operations.
 * 
 * Features:
 * - Multiple skeleton variants (text, card, list, etc.)
 * - Responsive sizing
 * - Accessibility-friendly with proper ARIA attributes
 * - Reduced motion support
 * - Customizable animations
 */

'use client'

import React from 'react'
import { clsx } from 'clsx'

export interface SkeletonLoaderProps {
  /** Skeleton variant */
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'image' | 'list' | 'custom'
  /** Width of the skeleton */
  width?: string | number
  /** Height of the skeleton */
  height?: string | number
  /** Number of lines for text variant */
  lines?: number
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none'
  /** Responsive sizing */
  responsive?: boolean
  /** Additional CSS classes */
  className?: string
  /** Custom content for complex skeletons */
  children?: React.ReactNode
}

/**
 * SkeletonLoader component for loading states
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'pulse',
  responsive = true,
  className,
  children,
}) => {
  // Base skeleton classes
  const baseClasses = clsx(
    'bg-gray-200 rounded',
    {
      // Animation classes
      'animate-pulse': animation === 'pulse',
      'animate-pulse-soft': animation === 'wave',
      'reduced-motion:animate-none': true,
    }
  )

  // Generate responsive width/height classes
  const getResponsiveSize = (size: string | number | undefined, property: 'width' | 'height') => {
    if (!size) return ''
    
    if (typeof size === 'number') {
      return responsive 
        ? `${property === 'width' ? 'w' : 'h'}-${Math.min(size, 12)} xs:${property === 'width' ? 'w' : 'h'}-${Math.min(size + 2, 16)} sm:${property === 'width' ? 'w' : 'h'}-${Math.min(size + 4, 20)}`
        : `${property === 'width' ? 'w' : 'h'}-${size}`
    }
    
    return size
  }

  // Render different skeleton variants
  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={clsx(
                  baseClasses,
                  'h-4',
                  index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
                  responsive && 'xs:h-4 sm:h-5',
                  getResponsiveSize(width, 'width')
                )}
                style={{
                  width: typeof width === 'string' ? width : undefined,
                  height: typeof height === 'string' ? height : undefined,
                }}
              />
            ))}
          </div>
        )

      case 'card':
        return (
          <div className="space-y-4">
            {/* Card image */}
            <div
              className={clsx(
                baseClasses,
                'w-full h-32 xs:h-36 sm:h-40 rounded-lg',
                getResponsiveSize(width, 'width')
              )}
              style={{
                width: typeof width === 'string' ? width : undefined,
                height: typeof height === 'string' ? height : undefined,
              }}
            />
            {/* Card content */}
            <div className="space-y-2">
              <div className={clsx(baseClasses, 'h-5 w-3/4')} />
              <div className={clsx(baseClasses, 'h-4 w-full')} />
              <div className={clsx(baseClasses, 'h-4 w-2/3')} />
            </div>
          </div>
        )

      case 'avatar':
        return (
          <div
            className={clsx(
              baseClasses,
              'rounded-full',
              responsive ? 'w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12' : 'w-10 h-10'
            )}
            style={{
              width: typeof width === 'string' ? width : undefined,
              height: typeof height === 'string' ? height : undefined,
            }}
          />
        )

      case 'button':
        return (
          <div
            className={clsx(
              baseClasses,
              'rounded-lg',
              responsive ? 'h-9 w-20 xs:h-10 xs:w-24 sm:h-11 sm:w-28' : 'h-10 w-24'
            )}
            style={{
              width: typeof width === 'string' ? width : undefined,
              height: typeof height === 'string' ? height : undefined,
            }}
          />
        )

      case 'image':
        return (
          <div
            className={clsx(
              baseClasses,
              'rounded-lg',
              responsive ? 'w-full h-32 xs:h-40 sm:h-48' : 'w-full h-40'
            )}
            style={{
              width: typeof width === 'string' ? width : undefined,
              height: typeof height === 'string' ? height : undefined,
            }}
          />
        )

      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={clsx(baseClasses, 'w-8 h-8 xs:w-10 xs:h-10 rounded-full flex-shrink-0')} />
                <div className="flex-1 space-y-2">
                  <div className={clsx(baseClasses, 'h-4 w-3/4')} />
                  <div className={clsx(baseClasses, 'h-3 w-1/2')} />
                </div>
              </div>
            ))}
          </div>
        )

      case 'custom':
        return children || <div className={clsx(baseClasses, 'w-full h-20')} />

      default:
        return <div className={clsx(baseClasses, 'w-full h-4')} />
    }
  }

  return (
    <div
      className={clsx('animate-fade-in', className)}
      role="status"
      aria-label="Cargando contenido"
      aria-live="polite"
    >
      {renderSkeleton()}
      <span className="sr-only">Cargando...</span>
    </div>
  )
}

export default SkeletonLoader

/**
 * Preset configurations for common skeleton patterns
 */
export const SkeletonPresets = {
  // Card grid skeleton
  cardGrid: {
    variant: 'card' as const,
    responsive: true,
    animation: 'pulse' as const,
  },
  
  // User profile skeleton
  userProfile: {
    variant: 'custom' as const,
    children: (
      <div className="flex items-center space-x-4">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1">
          <SkeletonLoader variant="text" lines={2} />
        </div>
      </div>
    ),
  },
  
  // Navigation skeleton
  navigation: {
    variant: 'custom' as const,
    children: (
      <div className="flex space-x-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLoader key={i} variant="button" />
        ))}
      </div>
    ),
  },
  
  // Article skeleton
  article: {
    variant: 'custom' as const,
    children: (
      <div className="space-y-4">
        <SkeletonLoader variant="image" />
        <SkeletonLoader variant="text" lines={1} height="24px" />
        <SkeletonLoader variant="text" lines={3} />
      </div>
    ),
  },
} as const
