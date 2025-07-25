'use client'

/**
 * Performance Provider
 * 
 * Provides performance optimizations and monitoring:
 * - Initializes performance monitoring
 * - Provides lazy loading utilities
 * - Handles code splitting
 * - Monitors Core Web Vitals
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializePerformanceOptimizations, performanceMonitor } from '@/utils/performanceOptimization'

interface PerformanceContextType {
  isInitialized: boolean
  webVitals: {
    lcp?: number
    fid?: number
    cls?: number
  }
  memoryUsage?: {
    used: number
    total: number
    limit: number
  }
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

interface PerformanceProviderProps {
  children: React.ReactNode
  enableMonitoring?: boolean
}

export function PerformanceProvider({ 
  children, 
  enableMonitoring = true 
}: PerformanceProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [webVitals, setWebVitals] = useState<{
    lcp?: number
    fid?: number
    cls?: number
  }>({})
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number
    total: number
    limit: number
  }>()

  useEffect(() => {
    if (!enableMonitoring) return

    // Initialize performance optimizations
    initializePerformanceOptimizations()
    setIsInitialized(true)

    // Monitor Core Web Vitals
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        setWebVitals(prev => ({ ...prev, lcp: lastEntry.startTime }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          const fid = entry.processingStart - entry.startTime
          setWebVitals(prev => ({ ...prev, fid }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        setWebVitals(prev => ({ ...prev, cls: clsValue }))
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Memory monitoring
      const monitorMemory = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory
          setMemoryUsage({
            used: Math.round(memory.usedJSHeapSize / 1048576),
            total: Math.round(memory.totalJSHeapSize / 1048576),
            limit: Math.round(memory.jsHeapSizeLimit / 1048576),
          })
        }
      }

      // Monitor memory every 30 seconds
      const memoryInterval = setInterval(monitorMemory, 30000)
      monitorMemory() // Initial check

      // Cleanup
      return () => {
        lcpObserver.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
        clearInterval(memoryInterval)
      }
    }
  }, [enableMonitoring])

  const value: PerformanceContextType = {
    isInitialized,
    webVitals,
    memoryUsage,
  }

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  )
}

/**
 * Hook to use performance context
 */
export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

/**
 * Performance monitoring component for development
 */
export function PerformanceMonitor() {
  const { webVitals, memoryUsage, isInitialized } = usePerformance()

  if (!isInitialized || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-bold">Performance Metrics</div>
      <div className="space-y-1">
        {webVitals.lcp && (
          <div className={`${webVitals.lcp > 2500 ? 'text-red-400' : webVitals.lcp > 1200 ? 'text-yellow-400' : 'text-green-400'}`}>
            LCP: {Math.round(webVitals.lcp)}ms
          </div>
        )}
        {webVitals.fid && (
          <div className={`${webVitals.fid > 300 ? 'text-red-400' : webVitals.fid > 100 ? 'text-yellow-400' : 'text-green-400'}`}>
            FID: {Math.round(webVitals.fid)}ms
          </div>
        )}
        {webVitals.cls && (
          <div className={`${webVitals.cls > 0.25 ? 'text-red-400' : webVitals.cls > 0.1 ? 'text-yellow-400' : 'text-green-400'}`}>
            CLS: {webVitals.cls.toFixed(3)}
          </div>
        )}
        {memoryUsage && (
          <div className={`${memoryUsage.used / memoryUsage.limit > 0.8 ? 'text-red-400' : memoryUsage.used / memoryUsage.limit > 0.6 ? 'text-yellow-400' : 'text-green-400'}`}>
            Memory: {memoryUsage.used}MB / {memoryUsage.limit}MB
          </div>
        )}
      </div>
    </div>
  )
}

export default PerformanceProvider
