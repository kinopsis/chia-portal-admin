/**
 * Unified Metrics Component
 * Displays real-time metrics for both Trámites and OPAs
 * 
 * Features:
 * - Real-time data updates
 * - Service type filtering
 * - Interactive metric cards
 * - Responsive design
 * - Loading states
 */

'use client'

import React from 'react'
import { MetricCard } from '@/components/molecules'
import { Card } from '@/components/atoms'
import type { UnifiedMetrics } from '@/services/unifiedServices'
import { clsx } from 'clsx'

export interface UnifiedMetricsProps {
  metrics: UnifiedMetrics | null
  loading?: boolean
  serviceType?: 'tramite' | 'opa' | 'both'
  onMetricClick?: (metric: string, value: number) => void
  className?: string
  compact?: boolean
}

/**
 * UnifiedMetrics component for displaying service statistics
 */
export const UnifiedMetrics: React.FC<UnifiedMetricsProps> = ({
  metrics,
  loading = false,
  serviceType = 'both',
  onMetricClick,
  className,
  compact = false
}) => {
  // Handle metric click
  const handleMetricClick = (metric: string, value: number) => {
    if (onMetricClick) {
      onMetricClick(metric, value)
    }
  }

  // Get metrics based on service type
  const getDisplayMetrics = () => {
    if (!metrics) return null

    switch (serviceType) {
      case 'tramite':
        return {
          total: metrics.tramites.total,
          activos: metrics.tramites.activos,
          inactivos: metrics.tramites.inactivos,
          conPago: metrics.tramites.conPago,
          gratuitos: metrics.tramites.gratuitos
        }
      case 'opa':
        return {
          total: metrics.opas.total,
          activos: metrics.opas.activos,
          inactivos: metrics.opas.inactivos,
          conPago: metrics.opas.conPago,
          gratuitos: metrics.opas.gratuitos
        }
      default:
        return metrics.combined
    }
  }

  const displayMetrics = getDisplayMetrics()

  // Metric configurations
  const metricConfigs = [
    {
      key: 'total',
      title: serviceType === 'both' ? 'Total Servicios' : 
             serviceType === 'tramite' ? 'Total Trámites' : 'Total OPAs',
      icon: serviceType === 'both' ? '📊' : 
            serviceType === 'tramite' ? '📄' : '⚡',
      color: 'primary' as const,
      description: 'Servicios registrados'
    },
    {
      key: 'activos',
      title: 'Activos',
      icon: '✅',
      color: 'green' as const,
      description: 'Servicios disponibles'
    },
    {
      key: 'inactivos',
      title: 'Inactivos',
      icon: '❌',
      color: 'red' as const,
      description: 'Servicios deshabilitados'
    },
    {
      key: 'conPago',
      title: 'Con Pago',
      icon: '💰',
      color: 'yellow' as const,
      description: 'Servicios con costo'
    },
    {
      key: 'gratuitos',
      title: 'Gratuitos',
      icon: '🆓',
      color: 'blue' as const,
      description: 'Servicios sin costo'
    }
  ]

  // Additional metrics for 'both' service type
  const additionalMetrics = serviceType === 'both' && metrics ? [
    {
      key: 'tramites_total',
      title: 'Trámites',
      value: metrics.tramites.total,
      icon: '📄',
      color: 'purple' as const,
      description: 'Total de trámites'
    },
    {
      key: 'opas_total',
      title: 'OPAs',
      value: metrics.opas.total,
      icon: '⚡',
      color: 'indigo' as const,
      description: 'Total de OPAs'
    },
    {
      key: 'dependencias',
      title: 'Dependencias',
      value: metrics.dependencias,
      icon: '🏛️',
      color: 'gray' as const,
      description: 'Entidades registradas'
    },
    {
      key: 'subdependencias',
      title: 'Subdependencias',
      value: metrics.subdependencias,
      icon: '🏢',
      color: 'slate' as const,
      description: 'Subdivisiones activas'
    }
  ] : []

  if (compact) {
    return (
      <div className={clsx('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
        {metricConfigs.map((config) => {
          const value = displayMetrics?.[config.key as keyof typeof displayMetrics] || 0
          return (
            <MetricCard
              key={config.key}
              title={config.title}
              value={value}
              icon={config.icon}
              color={config.color}
              description={config.description}
              loading={loading}
              onClick={() => handleMetricClick(config.key, value)}
              size="sm"
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {metricConfigs.map((config) => {
          const value = displayMetrics?.[config.key as keyof typeof displayMetrics] || 0
          return (
            <MetricCard
              key={config.key}
              title={config.title}
              value={value}
              icon={config.icon}
              color={config.color}
              description={config.description}
              loading={loading}
              onClick={() => handleMetricClick(config.key, value)}
            />
          )
        })}
      </div>

      {/* Additional Metrics for 'both' service type */}
      {additionalMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {additionalMetrics.map((metric) => (
            <MetricCard
              key={metric.key}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
              description={metric.description}
              loading={loading}
              onClick={() => handleMetricClick(metric.key, metric.value)}
            />
          ))}
        </div>
      )}

      {/* Service Type Breakdown (only for 'both') */}
      {serviceType === 'both' && metrics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Tipo de Servicio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trámites Breakdown */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700 flex items-center">
                <span className="mr-2">📄</span>
                Trámites ({metrics.tramites.total})
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Activos:</span>
                  <span className="font-medium text-green-600">
                    {metrics.tramites.activos}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inactivos:</span>
                  <span className="font-medium text-red-600">
                    {metrics.tramites.inactivos}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Con Pago:</span>
                  <span className="font-medium text-yellow-600">
                    {metrics.tramites.conPago}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gratuitos:</span>
                  <span className="font-medium text-blue-600">
                    {metrics.tramites.gratuitos}
                  </span>
                </div>
              </div>
            </div>

            {/* OPAs Breakdown */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700 flex items-center">
                <span className="mr-2">⚡</span>
                OPAs ({metrics.opas.total})
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Activos:</span>
                  <span className="font-medium text-green-600">
                    {metrics.opas.activos}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inactivos:</span>
                  <span className="font-medium text-red-600">
                    {metrics.opas.inactivos}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Con Pago:</span>
                  <span className="font-medium text-yellow-600">
                    {metrics.opas.conPago}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gratuitos:</span>
                  <span className="font-medium text-blue-600">
                    {metrics.opas.gratuitos}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default UnifiedMetrics
