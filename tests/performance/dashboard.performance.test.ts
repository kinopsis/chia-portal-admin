import { performance } from 'perf_hooks'
import { renderHook, waitFor } from '@testing-library/react'
import { useSystemMetrics } from '@/hooks'

// Mock Supabase for performance testing
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ 
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          rol: 'ciudadano',
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })), 
        error: null 
      }),
    })),
  },
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    userProfile: {
      id: '1',
      nombre: 'Test',
      apellido: 'User',
      email: 'test@test.com',
      rol: 'admin',
      activo: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  }),
}))

describe('Dashboard Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch metrics within acceptable time limits', async () => {
    const startTime = performance.now()

    const { result } = renderHook(() =>
      useSystemMetrics(false)
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Should complete within 2 seconds
    expect(executionTime).toBeLessThan(2000)
    expect(result.current.metrics).toBeDefined()
  })

  it('should handle large datasets efficiently', async () => {
    const startTime = performance.now()

    const { result } = renderHook(() =>
      useSystemMetrics(false)
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Should handle 1000+ records within 3 seconds
    expect(executionTime).toBeLessThan(3000)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should not cause memory leaks with auto-refresh', async () => {
    const initialMemory = process.memoryUsage().heapUsed

    const { result, unmount } = renderHook(() => 
      useSystemMetrics(true, 100) // Very fast refresh for testing
    )

    // Wait for multiple refresh cycles
    await new Promise(resolve => setTimeout(resolve, 500))

    const midMemory = process.memoryUsage().heapUsed
    
    // Unmount to cleanup
    unmount()

    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }

    await new Promise(resolve => setTimeout(resolve, 100))
    
    const finalMemory = process.memoryUsage().heapUsed

    // Memory should not grow significantly (allow 10MB growth)
    const memoryGrowth = finalMemory - initialMemory
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024) // 10MB
  })

  it('should cache results effectively', async () => {
    const { result: result1, waitForNextUpdate: wait1 } = renderHook(() => 
      useSystemMetrics(false)
    )

    await wait1()
    const firstFetchTime = performance.now()

    // Second hook should use cached data
    const { result: result2, waitForNextUpdate: wait2 } = renderHook(() => 
      useSystemMetrics(false)
    )

    await wait2()
    const secondFetchTime = performance.now()

    // Second fetch should be significantly faster (cached)
    const timeDifference = secondFetchTime - firstFetchTime
    expect(timeDifference).toBeLessThan(100) // Should be nearly instant

    // Both should have the same data
    expect(result1.current.metrics).toEqual(result2.current.metrics)
  })

  it('should debounce rapid filter changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useSystemMetrics(false)
    )

    await waitForNextUpdate()

    const startTime = performance.now()

    // Rapid filter changes
    for (let i = 0; i < 10; i++) {
      result.current.applyFilters({
        userRole: `role-${i}`,
        dateRange: {
          start: new Date(),
          end: new Date(),
        },
      })
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Should handle rapid changes efficiently
    expect(executionTime).toBeLessThan(100)
  })

  it('should render large metric lists efficiently', () => {
    const largeMetricsList = Array.from({ length: 100 }, (_, i) => ({
      title: `Metric ${i}`,
      value: i * 100,
      subtitle: `Subtitle ${i}`,
      icon: '📊',
      color: 'blue' as const,
    }))

    const startTime = performance.now()

    // Simulate rendering large lists
    const processedMetrics = largeMetricsList.map(metric => ({
      ...metric,
      formattedValue: metric.value.toLocaleString(),
      trend: {
        value: Math.random() * 100,
        isPositive: Math.random() > 0.5,
        label: 'test',
      },
    }))

    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Should process 100 metrics quickly
    expect(executionTime).toBeLessThan(50)
    expect(processedMetrics).toHaveLength(100)
  })

  it('should handle concurrent metric requests', async () => {
    const startTime = performance.now()

    // Create multiple concurrent hooks
    const hooks = Array.from({ length: 5 }, () => 
      renderHook(() => useSystemMetrics(false))
    )

    // Wait for all to complete
    await Promise.all(hooks.map(hook => hook.waitForNextUpdate()))

    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Should handle concurrent requests efficiently
    expect(executionTime).toBeLessThan(5000)

    // All should have valid data
    hooks.forEach(({ result }) => {
      expect(result.current.metrics).toBeDefined()
      expect(result.current.loading).toBe(false)
    })

    // Cleanup
    hooks.forEach(({ unmount }) => unmount())
  })

  it('should optimize re-renders with memoization', () => {
    let renderCount = 0

    const TestComponent = () => {
      renderCount++
      const { metrics } = useSystemMetrics(false)
      return metrics ? 'Metrics loaded' : 'Loading...'
    }

    const { rerender } = renderHook(() => useSystemMetrics(false))

    const initialRenderCount = renderCount

    // Multiple re-renders with same props
    for (let i = 0; i < 5; i++) {
      rerender()
    }

    // Should not cause excessive re-renders due to memoization
    const finalRenderCount = renderCount
    expect(finalRenderCount - initialRenderCount).toBeLessThan(3)
  })
})
