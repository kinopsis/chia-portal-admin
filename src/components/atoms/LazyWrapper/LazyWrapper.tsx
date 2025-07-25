'use client'

/**
 * LazyWrapper Component
 * 
 * Provides lazy loading functionality for components:
 * - Intersection observer-based loading
 * - Skeleton loading states
 * - Error boundaries for lazy components
 * - Performance monitoring
 */

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { clsx } from 'clsx'
import { createLazyLoadObserver } from '@/utils/performanceOptimization'

export interface LazyWrapperProps {
  children: React.ReactNode
  /** Loading skeleton component */
  skeleton?: React.ComponentType
  /** Error fallback component */
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
  /** Root margin for intersection observer */
  rootMargin?: string
  /** Threshold for intersection observer */
  threshold?: number
  /** Enable performance monitoring */
  enableMonitoring?: boolean
  /** Component name for monitoring */
  componentName?: string
  /** Additional CSS classes */
  className?: string
  /** Minimum loading time to prevent flashing */
  minLoadingTime?: number
}

/**
 * Default skeleton component
 */
const DefaultSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 w-full" />
  </div>
)

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => (
  <div className="text-center py-8">
    <div className="text-red-500 text-4xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      Error al cargar componente
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      {error.message}
    </p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green-dark transition-colors"
    >
      Reintentar
    </button>
  </div>
)

/**
 * LazyWrapper component
 */
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  skeleton: SkeletonComponent = DefaultSkeleton,
  errorFallback: ErrorFallbackComponent = DefaultErrorFallback,
  rootMargin = '50px',
  threshold = 0.1,
  enableMonitoring = false,
  componentName = 'LazyComponent',
  className,
  minLoadingTime = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [loadStartTime, setLoadStartTime] = useState<number>(0)
  const elementRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!elementRef.current) return

    // Create intersection observer
    observerRef.current = createLazyLoadObserver(
      (entry) => {
        if (entry.isIntersecting) {
          setLoadStartTime(performance.now())
          setIsVisible(true)
          observerRef.current?.unobserve(entry.target)
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    observerRef.current.observe(elementRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [rootMargin, threshold])

  useEffect(() => {
    if (isVisible && isLoading) {
      const handleLoad = async () => {
        try {
          // Ensure minimum loading time to prevent flashing
          if (minLoadingTime > 0) {
            const elapsed = performance.now() - loadStartTime
            const remaining = minLoadingTime - elapsed
            if (remaining > 0) {
              await new Promise(resolve => setTimeout(resolve, remaining))
            }
          }

          setIsLoading(false)

          // Performance monitoring
          if (enableMonitoring) {
            const loadTime = performance.now() - loadStartTime
            console.log(`${componentName} lazy load time: ${loadTime.toFixed(2)}ms`)

            // Report to analytics if available
            if ('gtag' in window) {
              ;(window as any).gtag('event', 'timing_complete', {
                name: 'lazy_load',
                value: Math.round(loadTime),
                custom_parameter: componentName,
              })
            }
          }
        } catch (err) {
          setError(err as Error)
          setIsLoading(false)
        }
      }

      handleLoad()
    }
  }, [isVisible, isLoading, loadStartTime, minLoadingTime, enableMonitoring, componentName])

  const retry = () => {
    setError(null)
    setIsLoading(true)
    setIsVisible(false)
    
    // Re-observe the element
    if (elementRef.current && observerRef.current) {
      observerRef.current.observe(elementRef.current)
    }
  }

  return (
    <div
      ref={elementRef}
      className={clsx(
        'lazy-wrapper',
        isVisible && 'lazy-wrapper--visible',
        isLoading && 'lazy-wrapper--loading',
        error && 'lazy-wrapper--error',
        className
      )}
    >
      {error ? (
        <ErrorFallbackComponent error={error} retry={retry} />
      ) : !isVisible || isLoading ? (
        <SkeletonComponent />
      ) : (
        <Suspense fallback={<SkeletonComponent />}>
          {children}
        </Suspense>
      )}
    </div>
  )
}

/**
 * Hook for lazy loading with intersection observer
 */
export const useLazyLoad = (
  options: {
    rootMargin?: string
    threshold?: number
    onVisible?: () => void
  } = {}
) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = createLazyLoadObserver(
      (entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          options.onVisible?.()
          observer.unobserve(entry.target)
        }
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.1,
      }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [options.rootMargin, options.threshold, options.onVisible])

  return { isVisible, elementRef }
}

/**
 * Higher-order component for lazy loading
 */
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<LazyWrapperProps, 'children'> = {}
) => {
  const LazyComponent = React.forwardRef<any, P>((props, ref) => (
    <LazyWrapper {...options}>
      <Component {...props} ref={ref} />
    </LazyWrapper>
  ))

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`

  return LazyComponent
}

export default LazyWrapper
