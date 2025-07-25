/**
 * Performance Optimization Utilities
 * 
 * Utilities for optimizing performance including:
 * - Lazy loading
 * - Image optimization
 * - Code splitting
 * - Performance monitoring
 * - Memory management
 */

/**
 * Lazy loading intersection observer
 */
export const createLazyLoadObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry)
      }
    })
  }, defaultOptions)
}

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImage = (img: HTMLImageElement): void => {
  const observer = createLazyLoadObserver((entry) => {
    const image = entry.target as HTMLImageElement
    const src = image.dataset.src
    const srcset = image.dataset.srcset

    if (src) {
      image.src = src
      image.removeAttribute('data-src')
    }

    if (srcset) {
      image.srcset = srcset
      image.removeAttribute('data-srcset')
    }

    image.classList.remove('lazy-loading')
    image.classList.add('lazy-loaded')
    observer.unobserve(image)
  })

  observer.observe(img)
}

/**
 * Lazy load components with dynamic imports
 */
export const lazyLoadComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  return React.lazy(importFn)
}

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Optimize images for different screen sizes
 */
export const generateResponsiveImageSizes = (
  baseSrc: string,
  sizes: { width: number; suffix?: string }[]
): string => {
  return sizes
    .map(({ width, suffix = '' }) => {
      const extension = baseSrc.split('.').pop()
      const baseName = baseSrc.replace(`.${extension}`, '')
      return `${baseName}${suffix}-${width}w.${extension} ${width}w`
    })
    .join(', ')
}

/**
 * Preload critical resources
 */
export const preloadResource = (
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch',
  crossorigin?: 'anonymous' | 'use-credentials'
): void => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (crossorigin) link.crossOrigin = crossorigin
  document.head.appendChild(link)
}

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Measure component render time
   */
  measureRender: (componentName: string, renderFn: () => void): void => {
    if (typeof window === 'undefined') return

    const startTime = performance.now()
    renderFn()
    const endTime = performance.now()
    const renderTime = endTime - startTime

    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`)

    // Report to analytics if available
    if ('gtag' in window) {
      ;(window as any).gtag('event', 'timing_complete', {
        name: 'component_render',
        value: Math.round(renderTime),
        custom_parameter: componentName,
      })
    }
  },

  /**
   * Measure Core Web Vitals
   */
  measureWebVitals: (): void => {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log('CLS:', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  },

  /**
   * Monitor memory usage
   */
  monitorMemory: (): void => {
    if (typeof window === 'undefined' || !('memory' in performance)) return

    const memory = (performance as any).memory
    console.log('Memory usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`,
    })
  },
}

/**
 * Code splitting utilities
 */
export const codeSplitting = {
  /**
   * Lazy load route components
   */
  lazyRoute: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return React.lazy(importFn)
  },

  /**
   * Preload route components
   */
  preloadRoute: (importFn: () => Promise<any>): void => {
    // Preload on hover or focus
    const preload = () => {
      importFn().catch(() => {
        // Handle preload errors silently
      })
    }

    // Add event listeners for preloading
    document.addEventListener('mouseover', preload, { once: true, passive: true })
    document.addEventListener('focus', preload, { once: true, passive: true })
  },
}

/**
 * Bundle optimization utilities
 */
export const bundleOptimization = {
  /**
   * Tree shake unused code
   */
  importOnlyUsed: <T extends Record<string, any>>(
    module: T,
    used: (keyof T)[]
  ): Partial<T> => {
    const result: Partial<T> = {}
    used.forEach((key) => {
      if (key in module) {
        result[key] = module[key]
      }
    })
    return result
  },

  /**
   * Dynamic import with error handling
   */
  dynamicImport: async <T>(
    importFn: () => Promise<T>,
    fallback?: T
  ): Promise<T> => {
    try {
      return await importFn()
    } catch (error) {
      console.warn('Dynamic import failed:', error)
      if (fallback) return fallback
      throw error
    }
  },
}

/**
 * Memory management utilities
 */
export const memoryManagement = {
  /**
   * Clean up event listeners
   */
  cleanupEventListeners: (
    element: Element,
    events: { type: string; listener: EventListener }[]
  ): void => {
    events.forEach(({ type, listener }) => {
      element.removeEventListener(type, listener)
    })
  },

  /**
   * Clean up intersection observers
   */
  cleanupObservers: (observers: IntersectionObserver[]): void => {
    observers.forEach((observer) => {
      observer.disconnect()
    })
  },

  /**
   * Weak reference cache for preventing memory leaks
   */
  createWeakCache: <K extends object, V>(): {
    get: (key: K) => V | undefined
    set: (key: K, value: V) => void
    delete: (key: K) => boolean
  } => {
    const cache = new WeakMap<K, V>()
    return {
      get: (key: K) => cache.get(key),
      set: (key: K, value: V) => cache.set(key, value),
      delete: (key: K) => cache.delete(key),
    }
  },
}

/**
 * Initialize performance optimizations
 */
export const initializePerformanceOptimizations = (): void => {
  if (typeof window === 'undefined') return

  // Start performance monitoring
  performanceMonitor.measureWebVitals()

  // Monitor memory usage periodically
  setInterval(() => {
    performanceMonitor.monitorMemory()
  }, 30000) // Every 30 seconds

  // Note: Inter font is loaded via next/font/google in layout.tsx
  // No need to preload manually as Next.js handles font optimization automatically

  // Add performance observer for navigation timing
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Navigation timing:', entry)
        }
      })
    })
    observer.observe({ entryTypes: ['navigation'] })
  }
}

export default {
  createLazyLoadObserver,
  lazyLoadImage,
  lazyLoadComponent,
  debounce,
  throttle,
  generateResponsiveImageSizes,
  preloadResource,
  performanceMonitor,
  codeSplitting,
  bundleOptimization,
  memoryManagement,
  initializePerformanceOptimizations,
}
