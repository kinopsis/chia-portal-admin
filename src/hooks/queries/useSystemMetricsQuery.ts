// React Query hook for system metrics with caching and background updates
// Replaces useHomepageMetrics with optimized data fetching

import { useQuery } from '@tanstack/react-query'
import type { SystemMetrics } from '@/app/api/metrics/route'

interface MetricsResponse {
  success: boolean
  data: SystemMetrics
  timestamp: string
  error?: string
}

// Query key factory for metrics
export const metricsKeys = {
  all: ['metrics'] as const,
  system: () => [...metricsKeys.all, 'system'] as const,
}

async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const response = await fetch('/api/metrics', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: MetricsResponse = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch metrics')
  }

  return result.data
}

export function useSystemMetricsQuery() {
  return useQuery({
    queryKey: metricsKeys.system(),
    queryFn: fetchSystemMetrics,
    // Refetch every 5 minutes for fresh metrics
    refetchInterval: 5 * 60 * 1000,
    // Keep data fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry on error
    retry: 3,
    // Provide fallback data on error
    placeholderData: {
      dependencias: 0,
      subdependencias: 0,
      tramites: 0,
      opas: 0,
      faqs: 0,
      usuarios: 0,
      tramitesActivos: 0,
      opasActivas: 0,
      faqsActivas: 0,
      lastUpdated: new Date().toISOString()
    },
  })
}

// Hook for formatted metrics (similar to useFormattedMetric)
export function useFormattedMetricQuery(
  metricKey: keyof SystemMetrics,
  format: 'number' | 'percentage' | 'compact' = 'number'
) {
  const { data: metrics, isLoading, error } = useSystemMetricsQuery()

  const formattedValue = (() => {
    if (!metrics || isLoading || error) return '---'

    const value = metrics[metricKey]
    if (typeof value !== 'number') return String(value)

    switch (format) {
      case 'compact':
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
        return value.toString()
      
      case 'percentage':
        return `${value.toFixed(1)}%`
      
      case 'number':
      default:
        return value.toLocaleString()
    }
  })()

  return {
    value: formattedValue,
    rawValue: metrics?.[metricKey],
    isLoading,
    error: error?.message || null
  }
}

// Hook for metrics comparison
export function useMetricsComparisonQuery() {
  const { data: metrics, isLoading, error } = useSystemMetricsQuery()

  const comparison = (() => {
    if (!metrics || isLoading || error) return null

    return {
      totalContent: metrics.tramites + metrics.opas + metrics.faqs,
      activeContent: metrics.tramitesActivos + metrics.opasActivas + metrics.faqsActivas,
      activePercentage: ((metrics.tramitesActivos + metrics.opasActivas + metrics.faqsActivas) / 
                        (metrics.tramites + metrics.opas + metrics.faqs)) * 100,
      
      contentByType: {
        tramites: {
          total: metrics.tramites,
          active: metrics.tramitesActivos,
          percentage: (metrics.tramitesActivos / metrics.tramites) * 100
        },
        opas: {
          total: metrics.opas,
          active: metrics.opasActivas,
          percentage: (metrics.opasActivas / metrics.opas) * 100
        },
        faqs: {
          total: metrics.faqs,
          active: metrics.faqsActivas,
          percentage: (metrics.faqsActivas / metrics.faqs) * 100
        }
      },

      organizationalStructure: {
        dependencias: metrics.dependencias,
        subdependencias: metrics.subdependencias,
        avgSubdependenciasPerDependencia: metrics.subdependencias / metrics.dependencias
      }
    }
  })()

  return {
    comparison,
    isLoading,
    error: error?.message || null
  }
}
