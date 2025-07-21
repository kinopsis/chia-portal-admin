'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Spinner } from '@/components/atoms'
import { useAuth } from '@/hooks'
import { supabase } from '@/lib/supabase/client'
import {
  logSupabaseError,
  getUserFriendlyErrorMessage,
  isMissingTableError,
  isMissingForeignKeyError,
} from '@/lib/errors'
import { clsx } from 'clsx'

export interface ActivityItem {
  id: string
  type: 'tramite' | 'opa' | 'user' | 'faq' | 'dependencia'
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected' | 'completed'
  title: string
  description: string
  user: {
    name: string
    role: string
  }
  timestamp: string
  metadata?: Record<string, any>
}

export interface ActivityFeedProps {
  title?: string
  maxItems?: number
  autoRefresh?: boolean
  refreshInterval?: number
  showFilters?: boolean
  className?: string
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title = 'Actividad Reciente',
  maxItems = 10,
  autoRefresh = true,
  refreshInterval = 30000,
  showFilters = true,
  className,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const { userProfile } = useAuth()

  const fetchActivities = useCallback(async () => {
    try {
      setError(null)

      // Collect activities from different sources
      const activities: ActivityItem[] = []

      // Fetch recent tramites with error handling
      try {
        const { data: tramitesData, error: tramitesError } = await supabase
          .from('tramites')
          .select(
            `
            id,
            nombre,
            activo,
            created_at,
            updated_at
          `
          )
          .order('updated_at', { ascending: false })
          .limit(5)

        if (tramitesError) throw tramitesError

        tramitesData?.forEach((tramite) => {
          activities.push({
            id: `tramite-${tramite.id}`,
            type: 'tramite',
            action: tramite.activo ? 'activated' : 'updated',
            title: `Trámite: ${tramite.nombre}`,
            description: tramite.activo ? 'Trámite activado' : 'Trámite actualizado',
            user: {
              name: 'Usuario del Sistema',
              role: 'ciudadano',
            },
            timestamp: tramite.updated_at,
            metadata: { activo: tramite.activo },
          })
        })
      } catch (err) {
        logSupabaseError('Error fetching tramites activities', err)
        // Continue with other activities even if tramites fail
      }

      // Fetch recent OPAs with error handling
      try {
        const { data: opasData, error: opasError } = await supabase
          .from('opas')
          .select(
            `
            id,
            nombre,
            activo,
            created_at,
            updated_at
          `
          )
          .order('updated_at', { ascending: false })
          .limit(5)

        if (opasError) throw opasError

        opasData?.forEach((opa) => {
          activities.push({
            id: `opa-${opa.id}`,
            type: 'opa',
            action: opa.activo ? 'activated' : 'updated',
            title: `OPA: ${opa.nombre}`,
            description: opa.activo ? 'OPA activada' : 'OPA actualizada',
            user: {
              name: 'Usuario del Sistema',
              role: 'ciudadano',
            },
            timestamp: opa.updated_at,
            metadata: { activo: opa.activo },
          })
        })
      } catch (err) {
        logSupabaseError('Error fetching OPAs activities', err)
        // Continue with other activities even if OPAs fail
      }

      // Fetch recent FAQs (admin only) with error handling
      if (userProfile?.rol === 'admin') {
        try {
          const { data: faqsData, error: faqsError } = await supabase
            .from('faqs')
            .select('id, pregunta, activo, created_at, updated_at')
            .order('updated_at', { ascending: false })
            .limit(3)

          if (faqsError) throw faqsError

          faqsData?.forEach((faq) => {
            activities.push({
              id: `faq-${faq.id}`,
              type: 'faq',
              action: faq.activo ? 'updated' : 'created',
              title: `FAQ: ${faq.pregunta.substring(0, 50)}...`,
              description: faq.activo ? 'FAQ actualizada' : 'Nueva FAQ creada',
              user: {
                name: 'Sistema',
                role: 'admin',
              },
              timestamp: faq.updated_at,
              metadata: { activo: faq.activo },
            })
          })
        } catch (err) {
          logSupabaseError('Error fetching FAQs activities', err)
          // Continue even if FAQs fail
        }
      }

      // Sort by timestamp and limit
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, maxItems)

      setActivities(sortedActivities)
    } catch (err) {
      logSupabaseError('Error fetching activities', err)
      setError(getUserFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [maxItems, userProfile])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchActivities, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchActivities])

  const getActivityIcon = (type: ActivityItem['type'], action: ActivityItem['action']) => {
    const icons = {
      tramite: {
        created: '📋',
        updated: '📝',
        completed: '✅',
        approved: '✅',
        rejected: '❌',
        deleted: '🗑️',
      },
      opa: {
        created: '⚡',
        updated: '📝',
        completed: '✅',
        approved: '✅',
        rejected: '❌',
        deleted: '🗑️',
      },
      user: {
        created: '👤',
        updated: '👤',
        completed: '👤',
        approved: '👤',
        rejected: '👤',
        deleted: '👤',
      },
      faq: {
        created: '❓',
        updated: '📝',
        completed: '❓',
        approved: '❓',
        rejected: '❓',
        deleted: '🗑️',
      },
      dependencia: {
        created: '🏛️',
        updated: '📝',
        completed: '🏛️',
        approved: '🏛️',
        rejected: '🏛️',
        deleted: '🗑️',
      },
    }
    return icons[type][action] || '📄'
  }

  const getActivityColor = (action: ActivityItem['action']) => {
    const colors = {
      created: 'text-blue-600 bg-blue-50',
      updated: 'text-yellow-600 bg-yellow-50',
      completed: 'text-green-600 bg-green-50',
      approved: 'text-green-600 bg-green-50',
      rejected: 'text-red-600 bg-red-50',
      deleted: 'text-gray-600 bg-gray-50',
    }
    return colors[action] || 'text-gray-600 bg-gray-50'
  }

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true
    return activity.type === filter
  })

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Hace un momento'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`
  }

  if (loading && activities.length === 0) {
    return (
      <Card className={clsx('p-6', className)}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Cargando actividad reciente...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={clsx('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Últimas actividades del sistema</p>
        </div>

        <div className="flex items-center space-x-2">
          {loading && <Spinner size="sm" />}
          <Button variant="ghost" size="sm" onClick={fetchActivities} disabled={loading}>
            🔄
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'tramite', 'opa', 'faq', 'user'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(filterType)}
            >
              {filterType === 'all'
                ? 'Todos'
                : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchActivities} className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay actividad reciente</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  getActivityColor(activity.action)
                )}
              >
                <span className="text-sm">{getActivityIcon(activity.type, activity.action)}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  por {activity.user.name} ({activity.user.role})
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredActivities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Button variant="ghost" size="sm">
            Ver toda la actividad
          </Button>
        </div>
      )}
    </Card>
  )
}

export default ActivityFeed
