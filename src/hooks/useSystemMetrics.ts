'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase/client'
import {
  logSupabaseError,
  getUserFriendlyErrorMessage,
  isMissingTableError,
  withRetry,
  analyzeNetworkError,
} from '@/lib/errors'

export interface SystemMetrics {
  users: {
    total: number
    active: number
    newThisMonth: number
    byRole: {
      ciudadano: number
      funcionario: number
      admin: number
    }
  }
  tramites: {
    total: number
    pending: number
    completed: number
    thisMonth: number
  }
  opas: {
    total: number
    pending: number
    approved: number
    thisMonth: number
  }
  faqs: {
    total: number
    published: number
    thisMonth: number
  }
  dependencias: {
    total: number
    active: number
  }
  activity: {
    totalActions: number
    todayActions: number
    weekActions: number
  }
}

export interface MetricsFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  dependenciaId?: string
  userRole?: string
}

interface UseSystemMetricsReturn {
  metrics: SystemMetrics | null
  loading: boolean
  error: string | null
  refreshMetrics: () => Promise<void>
  applyFilters: (filters: MetricsFilters) => void
  filters: MetricsFilters
}

export function useSystemMetrics(
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
): UseSystemMetricsReturn {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MetricsFilters>({})
  const { userProfile } = useAuth()

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current date for filtering
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Initialize default metrics in case some queries fail
      let usersData: any[] = []
      let tramitesData: any[] = []
      let opasData: any[] = []
      let faqsData: any[] = []
      let dependenciasData: any[] = []

      // Fetch users metrics with error handling and retry logic
      try {
        usersData = await withRetry(
          async () => {
            const { data, error } = await supabase.from('users').select('rol, activo, created_at')

            if (error) throw error
            return data || []
          },
          { maxRetries: 2, baseDelay: 500 }
        )
      } catch (err) {
        logSupabaseError('Error fetching users metrics', err)
      }

      // Fetch tramites metrics with error handling and retry logic
      try {
        tramitesData = await withRetry(
          async () => {
            const { data, error } = await supabase.from('tramites').select('activo, created_at')

            if (error) throw error
            return data || []
          },
          { maxRetries: 2, baseDelay: 500 }
        )
      } catch (err) {
        logSupabaseError('Error fetching tramites metrics', err)
      }

      // Fetch OPAs metrics with error handling and retry logic
      try {
        opasData = await withRetry(
          async () => {
            const { data, error } = await supabase.from('opas').select('activo, created_at')

            if (error) throw error
            return data || []
          },
          { maxRetries: 2, baseDelay: 500 }
        )
      } catch (err) {
        logSupabaseError('Error fetching OPAs metrics', err)
      }

      // Fetch FAQs metrics with error handling
      try {
        const { data, error } = await supabase.from('faqs').select('activo, created_at')

        if (error) throw error
        faqsData = data || []
      } catch (err) {
        logSupabaseError('Error fetching FAQs metrics', err)
      }

      // Fetch dependencias metrics with error handling
      try {
        const { data, error } = await supabase.from('dependencias').select('activo')

        if (error) throw error
        dependenciasData = data || []
      } catch (err) {
        logSupabaseError('Error fetching dependencias metrics', err)
      }

      // Process users metrics
      const usersMetrics = {
        total: usersData?.length || 0,
        active: usersData?.filter((u) => u.activo).length || 0,
        newThisMonth: usersData?.filter((u) => new Date(u.created_at) >= startOfMonth).length || 0,
        byRole: {
          ciudadano: usersData?.filter((u) => u.rol === 'ciudadano').length || 0,
          funcionario: usersData?.filter((u) => u.rol === 'funcionario').length || 0,
          admin: usersData?.filter((u) => u.rol === 'admin').length || 0,
        },
      }

      // Process tramites metrics
      const tramitesMetrics = {
        total: tramitesData?.length || 0,
        active: tramitesData?.filter((t) => t.activo).length || 0,
        inactive: tramitesData?.filter((t) => !t.activo).length || 0,
        thisMonth: tramitesData?.filter((t) => new Date(t.created_at) >= startOfMonth).length || 0,
      }

      // Process OPAs metrics
      const opasMetrics = {
        total: opasData?.length || 0,
        active: opasData?.filter((o) => o.activo).length || 0,
        inactive: opasData?.filter((o) => !o.activo).length || 0,
        thisMonth: opasData?.filter((o) => new Date(o.created_at) >= startOfMonth).length || 0,
      }

      // Process FAQs metrics
      const faqsMetrics = {
        total: faqsData?.length || 0,
        published: faqsData?.filter((f) => f.activo).length || 0,
        thisMonth: faqsData?.filter((f) => new Date(f.created_at) >= startOfMonth).length || 0,
      }

      // Process dependencias metrics
      const dependenciasMetrics = {
        total: dependenciasData?.length || 0,
        active: dependenciasData?.filter((d) => d.activo).length || 0,
      }

      // Calculate activity metrics (simplified for now)
      const totalActions = (tramitesData?.length || 0) + (opasData?.length || 0)
      const todayActions = [...(tramitesData || []), ...(opasData || [])].filter(
        (item) => new Date(item.created_at) >= startOfToday
      ).length

      const weekActions = [...(tramitesData || []), ...(opasData || [])].filter(
        (item) => new Date(item.created_at) >= startOfWeek
      ).length

      const activityMetrics = {
        totalActions,
        todayActions,
        weekActions,
      }

      const systemMetrics: SystemMetrics = {
        users: usersMetrics,
        tramites: tramitesMetrics,
        opas: opasMetrics,
        faqs: faqsMetrics,
        dependencias: dependenciasMetrics,
        activity: activityMetrics,
      }

      setMetrics(systemMetrics)
    } catch (err) {
      logSupabaseError('Error fetching system metrics', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filters])

  const refreshMetrics = useCallback(async () => {
    await fetchMetrics()
  }, [fetchMetrics])

  const applyFilters = useCallback((newFilters: MetricsFilters) => {
    setFilters(newFilters)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchMetrics])

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
    applyFilters,
    filters,
  }
}

export default useSystemMetrics
