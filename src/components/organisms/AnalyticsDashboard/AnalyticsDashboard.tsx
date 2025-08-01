'use client'

/**
 * UX-008: Analytics Dashboard Component
 * Admin dashboard for viewing usage metrics and analytics
 */

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/atoms'
import { useAnalytics } from '@/hooks/useAnalytics'
import { searchAnalyticsService } from '@/services/searchAnalytics'

interface AnalyticsDashboardProps {
  className?: string
  timeRange?: 7 | 30 | 90
}

interface DashboardMetrics {
  pageViews: number
  uniqueVisitors: number
  averageTimeOnPage: number
  bounceRate: number
  topPages: Array<{ page: string; views: number }>
  searchMetrics: any
  heatmapData: any[]
  performanceMetrics: any
}

export function AnalyticsDashboard({ 
  className = '',
  timeRange = 7
}: AnalyticsDashboardProps) {
  const { getAnalyticsSummary } = useAnalytics()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'heatmap' | 'performance'>('overview')

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [generalAnalytics, searchAnalytics] = await Promise.all([
        getAnalyticsSummary(selectedTimeRange),
        searchAnalyticsService.getAnalyticsSummary(selectedTimeRange)
      ])

      setMetrics({
        pageViews: generalAnalytics?.totalPageViews || 0,
        uniqueVisitors: generalAnalytics?.totalInteractions || 0,
        averageTimeOnPage: generalAnalytics?.averageTimeOnPage || 0,
        bounceRate: generalAnalytics?.bounceRate || 0,
        topPages: generalAnalytics?.topPages || [],
        searchMetrics: searchAnalytics,
        heatmapData: generalAnalytics?.heatmapData || [],
        performanceMetrics: generalAnalytics?.performanceMetrics || {}
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard de Analytics
        </h1>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(Number(e.target.value) as 7 | 30 | 90)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-green"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-primary-green text-white rounded-md text-sm hover:bg-green-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'search', label: 'Búsquedas' },
            { id: 'heatmap', label: 'Heatmap' },
            { id: 'performance', label: 'Rendimiento' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-green text-primary-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Páginas Vistas</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.pageViews || 0)}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Interacciones</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.uniqueVisitors || 0)}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatTime(metrics?.averageTimeOnPage || 0)}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Tasa de Rebote</p>
                  <p className="text-2xl font-bold text-gray-900">{(metrics?.bounceRate || 0).toFixed(1)}%</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Pages */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Páginas Más Visitadas</h3>
            <div className="space-y-3">
              {metrics?.topPages?.slice(0, 10).map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm text-gray-900">{page.page}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{formatNumber(page.views)} vistas</span>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No hay datos disponibles</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Búsquedas</h3>
              <p className="text-3xl font-bold text-primary-green">{metrics?.searchMetrics?.totalSearches || 0}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Consultas Únicas</h3>
              <p className="text-3xl font-bold text-blue-600">{metrics?.searchMetrics?.uniqueQueries || 0}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasa Sin Resultados</h3>
              <p className="text-3xl font-bold text-red-600">{(metrics?.searchMetrics?.noResultsRate || 0).toFixed(1)}%</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Términos Más Buscados</h3>
            <div className="space-y-3">
              {metrics?.searchMetrics?.popularTerms?.slice(0, 10).map((term: any, index: number) => (
                <div key={term.term} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm text-gray-900">{term.term}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{term.count} búsquedas</span>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No hay datos de búsqueda disponibles</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapa de Calor de Interacciones</h3>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-600 mb-2">Visualización de Heatmap</p>
            <p className="text-sm text-gray-500">
              {metrics?.heatmapData?.length || 0} puntos de interacción registrados
            </p>
            <p className="text-xs text-gray-400 mt-2">
              La visualización completa del heatmap se implementará en una versión futura
            </p>
          </div>
        </Card>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Rendimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Web Vitals</h4>
                {metrics?.performanceMetrics?.webVitals ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>DOM Content Loaded:</span>
                      <span className="font-medium">{metrics.performanceMetrics.webVitals.domContentLoaded}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Load Complete:</span>
                      <span className="font-medium">{metrics.performanceMetrics.webVitals.loadComplete}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>First Paint:</span>
                      <span className="font-medium">{metrics.performanceMetrics.webVitals.firstPaint}ms</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hay datos de Web Vitals disponibles</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Recursos Lentos</h4>
                {metrics?.performanceMetrics?.slowResources?.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {metrics.performanceMetrics.slowResources.slice(0, 5).map((resource: any, index: number) => (
                      <div key={index} className="text-xs">
                        <div className="font-medium truncate">{resource.name.split('/').pop()}</div>
                        <div className="text-gray-500">{resource.duration.toFixed(0)}ms</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No se detectaron recursos lentos</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
