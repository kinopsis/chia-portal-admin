'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { logSupabaseError, getUserFriendlyErrorMessage } from '@/lib/errors'

export interface FuncionarioMetrics {
  tramites: {
    total: number
    active: number
    pending: number
    thisMonth: number
  }
  opas: {
    total: number
    active: number
    pending: number
    thisMonth: number
  }
  faqs: {
    total: number
    published: number
    thisMonth: number
  }
  subdependencias: {
    total: number
    active: number
  }
  activity: {
    totalActions: number
    todayActions: number
    weekActions: number
  }
}

export interface FuncionarioMetricsFilters {
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface UseFuncionarioMetricsReturn {
  metrics: FuncionarioMetrics | null
  loading: boolean
  error: string | null
  refreshMetrics: () => Promise<void>
}

export default function useFuncionarioMetrics(
  filters: FuncionarioMetricsFilters = {}
): UseFuncionarioMetricsReturn {
  const [metrics, setMetrics] = useState<FuncionarioMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userProfile } = useAuth()

  const fetchMetrics = useCallback(async () => {
    if (!userProfile?.dependencia_id) {
      setError('Usuario sin dependencia asignada')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const dependenciaId = userProfile.dependencia_id
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Fetch trámites data for this dependencia
      const { data: tramitesData, error: tramitesError } = await supabase
        .from('tramites')
        .select('id, activo, created_at')
        .eq('dependencia_id', dependenciaId)

      if (tramitesError) {
        throw tramitesError
      }

      // Fetch OPAs data for this dependencia
      const { data: opasData, error: opasError } = await supabase
        .from('opas')
        .select('id, estado, created_at')
        .eq('dependencia_id', dependenciaId)

      if (opasError) {
        throw opasError
      }

      // Fetch FAQs data for this dependencia
      const { data: faqsData, error: faqsError } = await supabase
        .from('faqs')
        .select('id, activo, created_at')
        .eq('dependencia_id', dependenciaId)

      if (faqsError) {
        throw faqsError
      }

      // Fetch subdependencias for this dependencia
      const { data: subdependenciasData, error: subdependenciasError } = await supabase
        .from('subdependencias')
        .select('id, activo')
        .eq('dependencia_id', dependenciaId)

      if (subdependenciasError) {
        throw subdependenciasError
      }

      // Process trámites metrics
      const tramitesMetrics = {
        total: tramitesData?.length || 0,
        active: tramitesData?.filter(t => t.activo).length || 0,
        pending: tramitesData?.filter(t => !t.activo).length || 0,
        thisMonth: tramitesData?.filter(t => new Date(t.created_at) >= startOfMonth).length || 0,
      }

      // Process OPAs metrics
      const opasMetrics = {
        total: opasData?.length || 0,
        active: opasData?.filter(o => o.estado === 'aprobada').length || 0,
        pending: opasData?.filter(o => ['borrador', 'en_revision'].includes(o.estado)).length || 0,
        thisMonth: opasData?.filter(o => new Date(o.created_at) >= startOfMonth).length || 0,
      }

      // Process FAQs metrics
      const faqsMetrics = {
        total: faqsData?.length || 0,
        published: faqsData?.filter(f => f.activo).length || 0,
        thisMonth: faqsData?.filter(f => new Date(f.created_at) >= startOfMonth).length || 0,
      }

      // Process subdependencias metrics
      const subdependenciasMetrics = {
        total: subdependenciasData?.length || 0,
        active: subdependenciasData?.filter(s => s.activo).length || 0,
      }

      // Calculate activity metrics
      const totalActions = (tramitesData?.length || 0) + (opasData?.length || 0) + (faqsData?.length || 0)
      
      const todayActions = [
        ...(tramitesData || []),
        ...(opasData || []),
        ...(faqsData || [])
      ].filter(item => new Date(item.created_at) >= startOfToday).length

      const weekActions = [
        ...(tramitesData || []),
        ...(opasData || []),
        ...(faqsData || [])
      ].filter(item => new Date(item.created_at) >= startOfWeek).length

      const activityMetrics = {
        totalActions,
        todayActions,
        weekActions,
      }

      const funcionarioMetrics: FuncionarioMetrics = {
        tramites: tramitesMetrics,
        opas: opasMetrics,
        faqs: faqsMetrics,
        subdependencias: subdependenciasMetrics,
        activity: activityMetrics,
      }

      setMetrics(funcionarioMetrics)
    } catch (err) {
      logSupabaseError('Error fetching funcionario metrics', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [userProfile?.dependencia_id, filters])

  const refreshMetrics = useCallback(async () => {
    await fetchMetrics()
  }, [fetchMetrics])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
  }
}
