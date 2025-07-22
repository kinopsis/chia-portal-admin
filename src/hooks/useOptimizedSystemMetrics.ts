'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase/client'
import type { SystemMetrics, MetricsFilters } from './useSystemMetrics'

interface UseOptimizedSystemMetricsReturn {
  metrics: SystemMetrics | null
  loading: boolean
  error: string | null
  refreshMetrics: () => Promise<void>
  applyFilters: (filters: MetricsFilters) => void
  filters: MetricsFilters
}

// Cache for metrics data
const metricsCache = new Map<string, { data: SystemMetrics; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useOptimizedSystemMetrics(
  autoRefresh = true,
  refreshInterval = 30000
): UseOptimizedSystemMetricsReturn {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MetricsFilters>({})
  const { userProfile } = useAuth()

  // Generate cache key based on filters and user role
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      filters,
      userRole: userProfile?.rol,
      timestamp: Math.floor(Date.now() / CACHE_DURATION), // Round to cache duration
    })
  }, [filters, userProfile?.rol])

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null)

      // Check cache first
      const cached = metricsCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setMetrics(cached.data)
        setLoading(false)
        return
      }

      setLoading(true)

      // Optimize queries by fetching only necessary data
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Use Promise.allSettled for better error handling and parallel execution
      const [usersResult, tramitesResult, opasResult, faqsResult, dependenciasResult] =
        await Promise.allSettled([
          // Optimized user query - only fetch necessary fields
          supabase
            .from('user_profiles')
            .select('rol, activo, created_at')
            .order('created_at', { ascending: false }),

          // Optimized tramites query with date filtering
          supabase
            .from('tramites')
            .select('estado, created_at, updated_at')
            .gte('created_at', startOfWeek.toISOString())
            .order('updated_at', { ascending: false }),

          // Optimized OPAs query with date filtering
          supabase
            .from('opas')
            .select('estado, created_at, updated_at')
            .gte('created_at', startOfWeek.toISOString())
            .order('updated_at', { ascending: false }),

          // FAQs query - only for admin users
          userProfile?.rol === 'admin'
            ? supabase
                .from('faqs')
                .select('activo, created_at, updated_at')
                .order('updated_at', { ascending: false })
                .limit(100)
            : Promise.resolve({ data: [], error: null }),

          // Dependencias query - only for admin/funcionario
          ['admin', 'funcionario'].includes(userProfile?.rol || '')
            ? supabase.from('dependencias').select('activo')
            : Promise.resolve({ data: [], error: null }),
        ])

      // Process results and handle errors
      const usersData = usersResult.status === 'fulfilled' ? usersResult.value.data : []
      const tramitesData = tramitesResult.status === 'fulfilled' ? tramitesResult.value.data : []
      const opasData = opasResult.status === 'fulfilled' ? opasResult.value.data : []
      const faqsData = faqsResult.status === 'fulfilled' ? faqsResult.value.data : []
      const dependenciasData =
        dependenciasResult.status === 'fulfilled' ? dependenciasResult.value.data : []

      // Check for errors
      const errors = [usersResult, tramitesResult, opasResult, faqsResult, dependenciasResult]
        .filter((result) => result.status === 'rejected')
        .map((result) => (result as PromiseRejectedResult).reason)

      if (errors.length > 0) {
        throw new Error(`Failed to fetch some metrics: ${errors.join(', ')}`)
      }

      // Process metrics with memoized calculations
      const processedMetrics = processMetricsData({
        usersData: usersData || [],
        tramitesData: tramitesData || [],
        opasData: opasData || [],
        faqsData: faqsData || [],
        dependenciasData: dependenciasData || [],
        startOfMonth,
        startOfToday,
        startOfWeek,
      })

      // Cache the results
      metricsCache.set(cacheKey, {
        data: processedMetrics,
        timestamp: Date.now(),
      })

      setMetrics(processedMetrics)
    } catch (err) {
      console.error('Error fetching system metrics:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [cacheKey, userProfile])

  const refreshMetrics = useCallback(async () => {
    // Clear cache for this key to force refresh
    metricsCache.delete(cacheKey)
    await fetchMetrics()
  }, [fetchMetrics, cacheKey])

  const applyFilters = useCallback((newFilters: MetricsFilters) => {
    setFilters(newFilters)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Auto refresh with cleanup
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchMetrics])

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      // Clean old cache entries
      const now = Date.now()
      for (const [key, value] of metricsCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION * 2) {
          metricsCache.delete(key)
        }
      }
    }
  }, [])

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
    applyFilters,
    filters,
  }
}

// Memoized metrics processing function
function processMetricsData({
  usersData,
  tramitesData,
  opasData,
  faqsData,
  dependenciasData,
  startOfMonth,
  startOfToday,
  startOfWeek,
}: {
  usersData: any[]
  tramitesData: any[]
  opasData: any[]
  faqsData: any[]
  dependenciasData: any[]
  startOfMonth: Date
  startOfToday: Date
  startOfWeek: Date
}): SystemMetrics {
  // Process users metrics
  const usersMetrics = {
    total: usersData.length,
    active: usersData.filter((u) => u.activo).length,
    newThisMonth: usersData.filter((u) => new Date(u.created_at) >= startOfMonth).length,
    byRole: {
      ciudadano: usersData.filter((u) => u.rol === 'ciudadano').length,
      funcionario: usersData.filter((u) => u.rol === 'funcionario').length,
      admin: usersData.filter((u) => u.rol === 'admin').length,
    },
  }

  // Process tramites metrics
  const tramitesMetrics = {
    total: tramitesData.length,
    pending: tramitesData.filter((t) => t.estado === 'pendiente').length,
    completed: tramitesData.filter((t) => t.estado === 'completado').length,
    thisMonth: tramitesData.filter((t) => new Date(t.created_at) >= startOfMonth).length,
  }

  // Process OPAs metrics
  const opasMetrics = {
    total: opasData.length,
    pending: opasData.filter((o) => o.estado === 'pendiente').length,
    approved: opasData.filter((o) => o.estado === 'aprobada').length,
    thisMonth: opasData.filter((o) => new Date(o.created_at) >= startOfMonth).length,
  }

  // Process FAQs metrics
  const faqsMetrics = {
    total: faqsData.length,
    published: faqsData.filter((f) => f.activa).length,
    thisMonth: faqsData.filter((f) => new Date(f.created_at) >= startOfMonth).length,
  }

  // Process dependencias metrics
  const dependenciasMetrics = {
    total: dependenciasData.length,
    active: dependenciasData.filter((d) => d.activa).length,
  }

  // Calculate activity metrics
  const totalActions = tramitesData.length + opasData.length
  const todayActions = [...tramitesData, ...opasData].filter(
    (item) => new Date(item.created_at) >= startOfToday
  ).length

  const weekActions = [...tramitesData, ...opasData].filter(
    (item) => new Date(item.created_at) >= startOfWeek
  ).length

  const activityMetrics = {
    totalActions,
    todayActions,
    weekActions,
  }

  return {
    users: usersMetrics,
    tramites: tramitesMetrics,
    opas: opasMetrics,
    faqs: faqsMetrics,
    dependencias: dependenciasMetrics,
    activity: activityMetrics,
  }
}

export default useOptimizedSystemMetrics
