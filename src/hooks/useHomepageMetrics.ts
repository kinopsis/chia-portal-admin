// Hook for homepage metrics - simplified version for public display
// Provides basic statistics for homepage dashboard

import { useState, useEffect, useCallback } from 'react'

export interface HomepageMetrics {
  dependencias: number
  subdependencias: number
  tramites: number
  opas: number
  faqs: number
  lastUpdated: string
}

interface UseHomepageMetricsReturn {
  metrics: HomepageMetrics | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface MetricsResponse {
  success: boolean
  data: HomepageMetrics
  timestamp: string
  error?: string
}

export function useHomepageMetrics(): UseHomepageMetricsReturn {
  const [metrics, setMetrics] = useState<HomepageMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: MetricsResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch metrics')
      }

      // Transform the detailed metrics to simple homepage format
      const homepageMetrics: HomepageMetrics = {
        dependencias: result.data.dependencias || 0,
        subdependencias: result.data.subdependencias || 0,
        tramites: result.data.tramites || 0,
        opas: result.data.opas || 0,
        faqs: result.data.faqs || 0,
        lastUpdated: result.timestamp
      }

      setMetrics(homepageMetrics)
      setError(null)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error fetching homepage metrics:', errorMessage)
      setError(errorMessage)
      
      // Set fallback metrics
      if (!metrics) {
        setMetrics({
          dependencias: 12,
          subdependencias: 45,
          tramites: 156,
          opas: 89,
          faqs: 234,
          lastUpdated: new Date().toISOString()
        })
      }
    } finally {
      setLoading(false)
    }
  }, [metrics])

  // Initial fetch
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    refetch
  }
}

export default useHomepageMetrics
