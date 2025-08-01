'use client'

import React, { useState, memo, useMemo } from 'react'
import { Button, Spinner } from '@/components/atoms'
import { MetricCard } from '@/components/molecules'
import { useFuncionarioMetrics } from '@/hooks'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'

export interface FuncionarioDashboardStatsProps {
  className?: string
  showRefreshButton?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

const FuncionarioDashboardStats: React.FC<FuncionarioDashboardStatsProps> = ({
  className,
  showRefreshButton = true,
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute for funcionario
}) => {
  const { userProfile } = useAuth()
  const { metrics, loading, error, refreshMetrics } = useFuncionarioMetrics()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh functionality
  React.useEffect(() => {
    if (!autoRefresh || !refreshInterval) return

    const interval = setInterval(() => {
      refreshMetrics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshMetrics])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshMetrics()
    } finally {
      setIsRefreshing(false)
    }
  }

  const visibleStats = useMemo(() => {
    if (!metrics) return []

    const baseStats = [
      {
        title: 'Trámites',
        value: metrics.tramites.total.toLocaleString(),
        subtitle: `${metrics.tramites.active} activos`,
        icon: 'DocumentText',
        color: 'blue' as const,
        trend: {
          value: metrics.tramites.thisMonth,
          isPositive: metrics.tramites.thisMonth > 0,
          label: 'este mes',
        },
      },
      {
        title: 'OPAs',
        value: metrics.opas.total.toLocaleString(),
        subtitle: `${metrics.opas.active} aprobadas`,
        icon: 'Bolt',
        color: 'green' as const,
        trend: {
          value: metrics.opas.thisMonth,
          isPositive: metrics.opas.thisMonth > 0,
          label: 'este mes',
        },
      },
      {
        title: 'FAQs',
        value: metrics.faqs.total.toLocaleString(),
        subtitle: `${metrics.faqs.published} publicadas`,
        icon: 'QuestionMarkCircle',
        color: 'yellow' as const,
        trend: {
          value: metrics.faqs.thisMonth,
          isPositive: metrics.faqs.thisMonth > 0,
          label: 'este mes',
        },
      },
      {
        title: 'Subdependencias',
        value: metrics.subdependencias.total.toLocaleString(),
        subtitle: `${metrics.subdependencias.active} activas`,
        icon: 'BuildingOffice',
        color: 'purple' as const,
      },
      {
        title: 'Actividad Hoy',
        value: metrics.activity.todayActions.toLocaleString(),
        subtitle: `${metrics.activity.weekActions} esta semana`,
        icon: 'Chart',
        color: 'red' as const,
        trend: {
          value: Math.round((metrics.activity.todayActions / Math.max(metrics.activity.weekActions, 1)) * 100),
          isPositive: metrics.activity.todayActions > 0,
          label: 'del total semanal',
        },
      },
    ]

    return baseStats
  }, [metrics])

  if (error) {
    return (
      <div className={clsx('bg-red-50 border border-red-200 rounded-lg p-6', className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-800">Error al cargar métricas</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
          {showRefreshButton && (
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {isRefreshing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Reintentando...
                </>
              ) : (
                'Reintentar'
              )}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Métricas de {userProfile?.dependencia?.nombre || 'Mi Dependencia'}
          </h2>
          <p className="text-gray-600 mt-1">
            Resumen de actividad y contenido gestionado
          </p>
        </div>

        {/* Refresh Button */}
        {showRefreshButton && (
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center"
          >
            {loading || isRefreshing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {loading ? 'Cargando...' : 'Actualizando...'}
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Actualizar
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {visibleStats.map((stat, index) => (
            <MetricCard
              key={`${stat.title}-${index}`}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
              variant="default"
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(FuncionarioDashboardStats)
