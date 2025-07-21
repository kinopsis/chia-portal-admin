'use client'

import React, { useState, memo, useMemo } from 'react'
import { Button, Spinner } from '@/components/atoms'
import { MetricCard, RoleFilter } from '@/components/molecules'
import { useSystemMetrics } from '@/hooks'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'

export interface DashboardStatsProps {
  className?: string
  showRefreshButton?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  showRoleFilter?: boolean
}



const DashboardStats: React.FC<DashboardStatsProps> = ({
  className,
  showRefreshButton = true,
  autoRefresh = true,
  refreshInterval = 30000,
  showRoleFilter = true,
}) => {
  const { userProfile } = useAuth()
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['ciudadano', 'funcionario', 'admin'])
  const { metrics, loading, error, refreshMetrics } = useSystemMetrics(
    autoRefresh,
    refreshInterval
  )

  // Memoize visible stats calculation for performance - must be before conditional returns
  const visibleStats = useMemo(() => {
    if (!metrics) return []

    const baseStats = []

    // Users stats - filtered by selected roles
    if (selectedRoles.length > 0) {
      const filteredUserCount = selectedRoles.reduce((total, role) => {
        return total + (metrics.users.byRole[role as keyof typeof metrics.users.byRole] || 0)
      }, 0)

      baseStats.push({
        title: 'Usuarios Filtrados',
        value: filteredUserCount.toLocaleString(),
        subtitle: `${selectedRoles.join(', ')}`,
        icon: 'Users',
        color: 'blue' as const,
        trend: {
          value: Math.round((filteredUserCount / metrics.users.total) * 100),
          isPositive: filteredUserCount > 0,
          label: 'del total'
        }
      })
    } else {
      baseStats.push({
        title: 'Total Usuarios',
        value: metrics.users.total.toLocaleString(),
        subtitle: `${metrics.users.active} activos`,
        icon: 'Users',
        color: 'blue' as const,
        trend: {
          value: Math.round((metrics.users.newThisMonth / metrics.users.total) * 100),
          isPositive: metrics.users.newThisMonth > 0,
          label: 'este mes'
        }
      })
    }

    baseStats.push({
      title: 'Trámites',
      value: metrics.tramites.total.toLocaleString(),
      subtitle: `${metrics.tramites.active} activos`,
      icon: 'Docs',
      color: 'green' as const,
      trend: {
        value: Math.round((metrics.tramites.thisMonth / metrics.tramites.total) * 100),
        isPositive: metrics.tramites.thisMonth > 0,
        label: 'este mes'
      }
    })

    baseStats.push({
      title: 'OPAs',
      value: metrics.opas.total.toLocaleString(),
      subtitle: `${metrics.opas.active} activas`,
      icon: 'OPA',
      color: 'yellow' as const,
      trend: {
        value: Math.round((metrics.opas.thisMonth / metrics.opas.total) * 100),
        isPositive: metrics.opas.thisMonth > 0,
        label: 'este mes'
      }
    })

    baseStats.push({
      title: 'FAQs',
      value: metrics.faqs.total.toLocaleString(),
      subtitle: `${metrics.faqs.published} publicadas`,
      icon: 'FAQ',
      color: 'purple' as const,
      trend: {
        value: Math.round((metrics.faqs.thisMonth / metrics.faqs.total) * 100),
        isPositive: metrics.faqs.thisMonth > 0,
        label: 'este mes'
      }
    })

    // Add admin-only stats
    if (userProfile?.rol === 'admin') {
      baseStats.push({
        title: 'Dependencias',
        value: metrics.dependencias.total.toLocaleString(),
        subtitle: `${metrics.dependencias.active} activas`,
        icon: 'Building',
        color: 'indigo' as const,
      })

      baseStats.push({
        title: 'Actividad Hoy',
        value: metrics.activity.todayActions.toLocaleString(),
        subtitle: `${metrics.activity.weekActions} esta semana`,
        icon: 'Chart',
        color: 'red' as const,
        trend: {
          value: Math.round((metrics.activity.todayActions / metrics.activity.weekActions) * 100),
          isPositive: metrics.activity.todayActions > 0,
          label: 'del total semanal'
        }
      })
    }

    return baseStats
  }, [metrics, selectedRoles, userProfile?.rol])

  if (loading && !metrics) {
    return (
      <div className={clsx('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando métricas del sistema...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={clsx('text-center py-12', className)}>
        <div className="text-red-600 mb-4">
          <span className="text-4xl">!</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error al cargar métricas
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refreshMetrics} variant="primary">
          Reintentar
        </Button>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className={clsx('text-center py-12', className)}>
        <p className="text-gray-600">No hay métricas disponibles</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Métricas del Sistema</h2>
            <p className="text-gray-600">Resumen de actividad y estadísticas</p>
          </div>

          {showRefreshButton && (
            <div className="flex items-center space-x-2">
              {loading && <Spinner size="sm" />}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMetrics}
                disabled={loading}
              >
                Actualizar
              </Button>
            </div>
          )}
        </div>

        {/* Role Filter */}
        {showRoleFilter && userProfile?.rol === 'admin' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por roles:
            </label>
            <RoleFilter
              selectedRoles={selectedRoles}
              onRoleChange={setSelectedRoles}
              variant="pills"
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleStats.map((stat, index) => (
          <MetricCard
            key={`${stat.title}-${index}`} // More stable key
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

      {/* Last Updated */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Última actualización: {new Date().toLocaleString('es-CO')}
          {autoRefresh && ` • Se actualiza cada ${refreshInterval / 1000}s`}
        </p>
      </div>
    </div>
  )
}

// Memoize the component for performance optimization
export default memo(DashboardStats)
