'use client'

/**
 * usePublicServiceUpdates Hook
 * 
 * Hook for public pages (like /tramites) to listen for service status updates
 * and automatically refresh their data when services are deactivated in the admin panel.
 */

import { useEffect, useCallback } from 'react'
import { useServiceUpdates } from '@/contexts/ServiceUpdateContext'

interface UsePublicServiceUpdatesOptions {
  /** Callback when a service is updated */
  onServiceUpdate?: (serviceId: string, newStatus: boolean, serviceType: string) => void
  
  /** Callback to refresh data */
  onRefreshNeeded?: () => void
  
  /** Only listen for specific service types */
  serviceTypes?: ('tramite' | 'opa' | 'servicio')[]
  
  /** Debounce refresh calls (ms) */
  refreshDebounce?: number
}

export function usePublicServiceUpdates(options: UsePublicServiceUpdatesOptions = {}) {
  const {
    onServiceUpdate,
    onRefreshNeeded,
    serviceTypes,
    refreshDebounce = 1000
  } = options

  const { subscribeToUpdates } = useServiceUpdates()

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    if (!onRefreshNeeded) return

    const timeoutId = setTimeout(() => {
      onRefreshNeeded()
    }, refreshDebounce)

    return () => clearTimeout(timeoutId)
  }, [onRefreshNeeded, refreshDebounce])

  useEffect(() => {
    const unsubscribe = subscribeToUpdates((update) => {
      // Filter by service types if specified
      if (serviceTypes && !serviceTypes.includes(update.serviceType)) {
        return
      }

      console.log('🌐 Public page received service update:', update)

      // Call the service update callback
      onServiceUpdate?.(update.serviceId, update.newStatus, update.serviceType)

      // If a service was deactivated, refresh the public data
      if (!update.newStatus) {
        console.log('🔄 Service deactivated, refreshing public data...')
        debouncedRefresh()
      }
    })

    return unsubscribe
  }, [subscribeToUpdates, onServiceUpdate, serviceTypes, debouncedRefresh])
}

export default usePublicServiceUpdates
