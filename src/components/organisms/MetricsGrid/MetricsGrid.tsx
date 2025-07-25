'use client'

/**
 * MetricsGrid Component
 * 
 * Displays system metrics in a responsive grid layout with:
 * - Animated counters
 * - Loading states
 * - Responsive design
 * - Dark mode support
 * - Accessibility features
 */

import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { ResponsiveContainer, ResponsivePresets } from '@/components/atoms/ResponsiveContainer'
import MetricCard from '@/components/molecules/MetricCard'
import type { MetricCardProps } from '@/components/molecules/MetricCard'

export interface MetricData {
  id: string
  title: string
  value: number
  subtitle?: string
  description?: string
  icon: string
  color?: MetricCardProps['color']
  trend?: {
    value: number
    isPositive: boolean
    label: string
    period?: string
  }
  href?: string
}

export interface MetricsGridProps {
  /** Metrics data to display */
  metrics: MetricData[]
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string | null
  /** Grid layout configuration */
  layout?: 'auto' | 'fixed' | 'responsive'
  /** Number of columns for fixed layout */
  columns?: number
  /** Card size */
  size?: 'sm' | 'md' | 'lg'
  /** Card variant */
  variant?: 'default' | 'gradient' | 'outlined' | 'minimal'
  /** Enable animated counters */
  animated?: boolean
  /** Animation duration in milliseconds */
  animationDuration?: number
  /** Additional CSS classes */
  className?: string
  /** Click handler for metrics */
  onMetricClick?: (metric: MetricData) => void
}

/**
 * Hook for animated counter effect with CLS prevention
 */
const useAnimatedCounter = (
  endValue: number,
  duration: number = 2000,
  enabled: boolean = true
) => {
  // Start with final value to prevent layout shifts, then animate
  const [currentValue, setCurrentValue] = useState(endValue)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setCurrentValue(endValue)
      return
    }

    // Delay animation start to prevent initial layout shift
    const startDelay = setTimeout(() => {
      setHasStarted(true)
      let startTime: number
      let animationFrame: number

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const value = Math.floor(easeOutQuart * endValue)

        setCurrentValue(value)

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      // Start from 0 after the delay
      setCurrentValue(0)
      animationFrame = requestAnimationFrame(animate)

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }
      }
    }, 100) // Small delay to prevent initial CLS

    return () => {
      clearTimeout(startDelay)
    }
  }, [endValue, duration, enabled])

  return currentValue
}

/**
 * Individual animated metric card with fixed dimensions to prevent CLS
 */
const AnimatedMetricCard: React.FC<{
  metric: MetricData
  size: MetricsGridProps['size']
  variant: MetricsGridProps['variant']
  animated: boolean
  animationDuration: number
  onClick?: (metric: MetricData) => void
}> = ({ metric, size, variant, animated, animationDuration, onClick }) => {
  const animatedValue = useAnimatedCounter(metric.value, animationDuration, animated)

  // Fixed heights to prevent layout shifts
  const getFixedHeight = () => {
    switch (size) {
      case 'sm': return 'min-h-[120px]'
      case 'lg': return 'min-h-[180px]'
      default: return 'min-h-[150px]' // md
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick(metric)
    } else if (metric.href) {
      window.location.href = metric.href
    }
  }

  return (
    <div className={`${getFixedHeight()} w-full`}>
      <MetricCard
        title={metric.title}
        value={animated ? animatedValue.toLocaleString() : metric.value.toLocaleString()}
        subtitle={metric.subtitle}
        description={metric.description}
        icon={metric.icon}
        color={metric.color}
        trend={metric.trend}
        size={size}
        variant={variant}
        onClick={onClick || metric.href ? handleClick : undefined}
      />
    </div>
  )
}

/**
 * Loading skeleton for metrics grid with fixed dimensions to prevent CLS
 */
const MetricsGridSkeleton: React.FC<{
  count: number
  size: MetricsGridProps['size']
  layout: MetricsGridProps['layout']
  columns?: number
}> = ({ count, size, layout, columns }) => {
  // Fixed heights to prevent layout shifts
  const getFixedHeight = () => {
    switch (size) {
      case 'sm': return 'min-h-[120px]'
      case 'lg': return 'min-h-[180px]'
      default: return 'min-h-[150px]' // md
    }
  }

  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <div key={index} className={`${getFixedHeight()} w-full`}>
      <MetricCard
        title=""
        value=""
        icon=""
        size={size}
        loading={true}
      />
    </div>
  ))

  const getGridConfig = () => {
    switch (layout) {
      case 'fixed':
        return {
          gridCols: { xs: 1, sm: Math.min(2, columns || 3), md: columns || 3 }
        }
      case 'responsive':
        return ResponsivePresets.metricsGrid
      default:
        return {
          gridCols: { xs: 2, sm: 3, md: Math.min(5, count) }
        }
    }
  }

  return (
    <ResponsiveContainer
      layout="grid"
      {...getGridConfig()}
      gap="md"
      padding="none"
    >
      {skeletonItems}
    </ResponsiveContainer>
  )
}

/**
 * Error state component
 */
const MetricsGridError: React.FC<{ error: string }> = ({ error }) => (
  <div className="text-center py-8">
    <div className="text-red-500 text-4xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      Error al cargar métricas
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      {error}
    </p>
  </div>
)

/**
 * MetricsGrid component
 */
export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  loading = false,
  error = null,
  layout = 'auto',
  columns = 5,
  size = 'md',
  variant = 'default',
  animated = true,
  animationDuration = 2000,
  className,
  onMetricClick,
}) => {
  // Handle loading state
  if (loading) {
    return (
      <div className={className}>
        <MetricsGridSkeleton
          count={columns}
          size={size}
          layout={layout}
          columns={columns}
        />
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className={className}>
        <MetricsGridError error={error} />
      </div>
    )
  }

  // Handle empty state
  if (!metrics || metrics.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No hay métricas disponibles
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Las métricas se mostrarán aquí cuando estén disponibles.
        </p>
      </div>
    )
  }

  // Get grid configuration based on layout
  const getGridConfig = () => {
    switch (layout) {
      case 'fixed':
        return {
          gridCols: { 
            xs: 1, 
            sm: Math.min(2, columns), 
            md: Math.min(columns, metrics.length) 
          }
        }
      case 'responsive':
        return ResponsivePresets.metricsGrid
      default:
        return {
          gridCols: { 
            xs: 2, 
            sm: 3, 
            md: Math.min(5, metrics.length) 
          }
        }
    }
  }

  return (
    <div className={className}>
      <ResponsiveContainer
        layout="grid"
        {...getGridConfig()}
        gap="md"
        padding="none"
        className="w-full"
      >
        {metrics.map((metric) => (
          <AnimatedMetricCard
            key={metric.id}
            metric={metric}
            size={size}
            variant={variant}
            animated={animated}
            animationDuration={animationDuration}
            onClick={onMetricClick}
          />
        ))}
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Preset configurations for common metric layouts
 */
export const MetricsGridPresets = {
  homepage: {
    layout: 'auto' as const,
    size: 'md' as const,
    variant: 'default' as const,
    animated: true,
    animationDuration: 2000,
  },
  
  dashboard: {
    layout: 'responsive' as const,
    size: 'lg' as const,
    variant: 'gradient' as const,
    animated: true,
    animationDuration: 1500,
  },
  
  compact: {
    layout: 'fixed' as const,
    columns: 3,
    size: 'sm' as const,
    variant: 'minimal' as const,
    animated: false,
  },
} as const

export default MetricsGrid
