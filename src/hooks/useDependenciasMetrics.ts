import { useState, useEffect } from 'react'
import type { Dependencia } from '@/types'

interface DependenciasMetrics {
  dependencias: number
  subdependencias: number
  tramites: number
  opas: number
}

interface UseDependenciasMetricsReturn {
  metrics: DependenciasMetrics
  loading: boolean
  error: string | null
}

export function useDependenciasMetrics(dependencias: Dependencia[]): UseDependenciasMetricsReturn {
  const [metrics, setMetrics] = useState<DependenciasMetrics>({
    dependencias: 0,
    subdependencias: 0,
    tramites: 0,
    opas: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      if (!dependencias || dependencias.length === 0) {
        setMetrics({
          dependencias: 0,
          subdependencias: 0,
          tramites: 0,
          opas: 0
        })
        setLoading(false)
        return
      }

      // Calculate metrics from dependencias data
      const calculatedMetrics = dependencias.reduce(
        (acc, dep) => {
          acc.dependencias += 1
          acc.subdependencias += dep.subdependencias_count || 0
          acc.tramites += dep.tramites_count || 0
          acc.opas += dep.opas_count || 0
          return acc
        },
        {
          dependencias: 0,
          subdependencias: 0,
          tramites: 0,
          opas: 0
        }
      )

      setMetrics(calculatedMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating metrics')
    } finally {
      setLoading(false)
    }
  }, [dependencias])

  return { metrics, loading, error }
}
