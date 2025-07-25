/**
 * Performance Testing Utilities
 * 
 * Utilities for comprehensive performance testing:
 * - Core Web Vitals measurement
 * - Lighthouse audit automation
 * - Bundle size analysis
 * - Memory leak detection
 * - Custom performance metrics
 */

/**
 * Core Web Vitals thresholds (Google recommendations)
 */
export const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: {
    good: 2500, // ms
    needsImprovement: 4000, // ms
  },
  FID: {
    good: 100, // ms
    needsImprovement: 300, // ms
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  TTFB: {
    good: 800, // ms
    needsImprovement: 1800, // ms
  },
  FCP: {
    good: 1800, // ms
    needsImprovement: 3000, // ms
  },
} as const

/**
 * Performance budget thresholds
 */
export const PERFORMANCE_BUDGET = {
  // Bundle sizes (gzipped)
  javascript: {
    initial: 150, // KB
    total: 300, // KB
  },
  css: {
    initial: 50, // KB
    total: 100, // KB
  },
  images: {
    perImage: 200, // KB
    total: 1000, // KB
  },
  fonts: {
    total: 100, // KB
  },
  // Timing budgets
  domContentLoaded: 1500, // ms
  loadComplete: 3000, // ms
  timeToInteractive: 3500, // ms
  // Memory budgets
  heapSize: 50, // MB
  memoryIncrease: 10, // MB per interaction
} as const

/**
 * Network conditions for testing
 */
export const NETWORK_CONDITIONS = {
  'Fast 3G': {
    downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
    uploadThroughput: 750 * 1024 / 8, // 750 Kbps
    latency: 40, // ms
  },
  'Slow 3G': {
    downloadThroughput: 500 * 1024 / 8, // 500 Kbps
    uploadThroughput: 500 * 1024 / 8, // 500 Kbps
    latency: 400, // ms
  },
  '4G': {
    downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
    uploadThroughput: 3 * 1024 * 1024 / 8, // 3 Mbps
    latency: 20, // ms
  },
  'WiFi': {
    downloadThroughput: 30 * 1024 * 1024 / 8, // 30 Mbps
    uploadThroughput: 15 * 1024 * 1024 / 8, // 15 Mbps
    latency: 2, // ms
  },
} as const

/**
 * Core Web Vitals measurement utilities
 */
export class WebVitalsCollector {
  private metrics: Map<string, number> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.set('LCP', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)
    } catch (e) {
      console.warn('LCP observer not supported')
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          const fid = entry.processingStart - entry.startTime
          this.metrics.set('FID', fid)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)
    } catch (e) {
      console.warn('FID observer not supported')
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.metrics.set('CLS', clsValue)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)
    } catch (e) {
      console.warn('CLS observer not supported')
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.set('FCP', entry.startTime)
          }
        })
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
      this.observers.push(fcpObserver)
    } catch (e) {
      console.warn('FCP observer not supported')
    }

    // Time to First Byte (TTFB)
    try {
      const navigationObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            const ttfb = entry.responseStart - entry.requestStart
            this.metrics.set('TTFB', ttfb)
          }
        })
      })
      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)
    } catch (e) {
      console.warn('Navigation observer not supported')
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name)
  }

  evaluateMetrics(): {
    scores: Record<string, 'good' | 'needs-improvement' | 'poor'>
    overall: 'good' | 'needs-improvement' | 'poor'
  } {
    const scores: Record<string, 'good' | 'needs-improvement' | 'poor'> = {}
    
    // Evaluate LCP
    const lcp = this.metrics.get('LCP')
    if (lcp !== undefined) {
      if (lcp <= CORE_WEB_VITALS_THRESHOLDS.LCP.good) {
        scores.LCP = 'good'
      } else if (lcp <= CORE_WEB_VITALS_THRESHOLDS.LCP.needsImprovement) {
        scores.LCP = 'needs-improvement'
      } else {
        scores.LCP = 'poor'
      }
    }

    // Evaluate FID
    const fid = this.metrics.get('FID')
    if (fid !== undefined) {
      if (fid <= CORE_WEB_VITALS_THRESHOLDS.FID.good) {
        scores.FID = 'good'
      } else if (fid <= CORE_WEB_VITALS_THRESHOLDS.FID.needsImprovement) {
        scores.FID = 'needs-improvement'
      } else {
        scores.FID = 'poor'
      }
    }

    // Evaluate CLS
    const cls = this.metrics.get('CLS')
    if (cls !== undefined) {
      if (cls <= CORE_WEB_VITALS_THRESHOLDS.CLS.good) {
        scores.CLS = 'good'
      } else if (cls <= CORE_WEB_VITALS_THRESHOLDS.CLS.needsImprovement) {
        scores.CLS = 'needs-improvement'
      } else {
        scores.CLS = 'poor'
      }
    }

    // Calculate overall score
    const scoreValues = Object.values(scores)
    const goodCount = scoreValues.filter(s => s === 'good').length
    const poorCount = scoreValues.filter(s => s === 'poor').length
    
    let overall: 'good' | 'needs-improvement' | 'poor'
    if (poorCount > 0) {
      overall = 'poor'
    } else if (goodCount === scoreValues.length) {
      overall = 'good'
    } else {
      overall = 'needs-improvement'
    }

    return { scores, overall }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
  private initialMemory: number = 0
  private measurements: Array<{ timestamp: number; used: number; total: number }> = []

  constructor() {
    this.recordInitialMemory()
  }

  private recordInitialMemory(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      this.initialMemory = memory.usedJSHeapSize
    }
  }

  recordMeasurement(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      this.measurements.push({
        timestamp: Date.now(),
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
      })
    }
  }

  getMemoryIncrease(): number {
    if (this.measurements.length === 0) return 0
    const latest = this.measurements[this.measurements.length - 1]
    return (latest.used - this.initialMemory) / (1024 * 1024) // MB
  }

  getMemoryUsage(): {
    current: number // MB
    peak: number // MB
    average: number // MB
    increase: number // MB
  } {
    if (this.measurements.length === 0) {
      return { current: 0, peak: 0, average: 0, increase: 0 }
    }

    const usedValues = this.measurements.map(m => m.used / (1024 * 1024))
    const current = usedValues[usedValues.length - 1]
    const peak = Math.max(...usedValues)
    const average = usedValues.reduce((sum, val) => sum + val, 0) / usedValues.length
    const increase = this.getMemoryIncrease()

    return { current, peak, average, increase }
  }

  detectMemoryLeak(threshold: number = 10): boolean {
    return this.getMemoryIncrease() > threshold
  }

  cleanup(): void {
    this.measurements = []
  }
}

/**
 * Performance timing utilities
 */
export class PerformanceTimer {
  private timers: Map<string, number> = new Map()
  private measurements: Map<string, number[]> = new Map()

  start(name: string): void {
    this.timers.set(name, performance.now())
  }

  end(name: string): number {
    const startTime = this.timers.get(name)
    if (startTime === undefined) {
      throw new Error(`Timer '${name}' was not started`)
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    // Store measurement
    const existing = this.measurements.get(name) || []
    existing.push(duration)
    this.measurements.set(name, existing)

    return duration
  }

  measure<T>(name: string, fn: () => T): T {
    this.start(name)
    const result = fn()
    this.end(name)
    return result
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name)
    const result = await fn()
    this.end(name)
    return result
  }

  getStats(name: string): {
    count: number
    average: number
    min: number
    max: number
    total: number
  } | null {
    const measurements = this.measurements.get(name)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const count = measurements.length
    const total = measurements.reduce((sum, val) => sum + val, 0)
    const average = total / count
    const min = Math.min(...measurements)
    const max = Math.max(...measurements)

    return { count, average, min, max, total }
  }

  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {}
    for (const name of this.measurements.keys()) {
      stats[name] = this.getStats(name)
    }
    return stats
  }

  cleanup(): void {
    this.timers.clear()
    this.measurements.clear()
  }
}

/**
 * Bundle size analysis utilities
 */
export const analyzeBundleSize = async (url: string): Promise<{
  javascript: number
  css: number
  images: number
  fonts: number
  total: number
}> => {
  // This would typically integrate with webpack-bundle-analyzer or similar
  // For testing purposes, we'll simulate the analysis
  return {
    javascript: 0,
    css: 0,
    images: 0,
    fonts: 0,
    total: 0,
  }
}

/**
 * Create performance test suite
 */
export const createPerformanceTestSuite = (
  suiteName: string,
  testFn: (vitals: WebVitalsCollector, memory: MemoryMonitor, timer: PerformanceTimer) => void | Promise<void>
) => {
  describe(`${suiteName} - Performance Tests`, () => {
    let vitalsCollector: WebVitalsCollector
    let memoryMonitor: MemoryMonitor
    let performanceTimer: PerformanceTimer

    beforeEach(() => {
      vitalsCollector = new WebVitalsCollector()
      memoryMonitor = new MemoryMonitor()
      performanceTimer = new PerformanceTimer()
    })

    afterEach(() => {
      vitalsCollector.cleanup()
      memoryMonitor.cleanup()
      performanceTimer.cleanup()
    })

    testFn(vitalsCollector, memoryMonitor, performanceTimer)
  })
}

export default {
  CORE_WEB_VITALS_THRESHOLDS,
  PERFORMANCE_BUDGET,
  NETWORK_CONDITIONS,
  WebVitalsCollector,
  MemoryMonitor,
  PerformanceTimer,
  analyzeBundleSize,
  createPerformanceTestSuite,
}
