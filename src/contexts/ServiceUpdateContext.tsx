'use client'

/**
 * ServiceUpdateContext
 * 
 * Global context for managing real-time service status updates across components.
 * When a service is toggled, all components that display service data will be notified
 * and can refresh their data accordingly.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ServiceUpdate {
  serviceId: string
  newStatus: boolean
  timestamp: number
  serviceType: 'tramite' | 'opa' | 'servicio'
}

interface ServiceUpdateContextType {
  // Subscribe to service updates
  subscribeToUpdates: (callback: (update: ServiceUpdate) => void) => () => void
  
  // Notify all subscribers of a service update
  notifyServiceUpdate: (serviceId: string, newStatus: boolean, serviceType: 'tramite' | 'opa' | 'servicio') => void
  
  // Get the latest update for a specific service
  getLatestUpdate: (serviceId: string) => ServiceUpdate | null
  
  // Clear all updates (useful for cleanup)
  clearUpdates: () => void
}

const ServiceUpdateContext = createContext<ServiceUpdateContextType | null>(null)

interface ServiceUpdateProviderProps {
  children: ReactNode
}

export const ServiceUpdateProvider: React.FC<ServiceUpdateProviderProps> = ({ children }) => {
  const [subscribers, setSubscribers] = useState<Set<(update: ServiceUpdate) => void>>(new Set())
  const [updates, setUpdates] = useState<Map<string, ServiceUpdate>>(new Map())

  const subscribeToUpdates = useCallback((callback: (update: ServiceUpdate) => void) => {
    setSubscribers(prev => new Set(prev).add(callback))
    
    // Return unsubscribe function
    return () => {
      setSubscribers(prev => {
        const newSet = new Set(prev)
        newSet.delete(callback)
        return newSet
      })
    }
  }, [])

  const notifyServiceUpdate = useCallback((
    serviceId: string, 
    newStatus: boolean, 
    serviceType: 'tramite' | 'opa' | 'servicio'
  ) => {
    const update: ServiceUpdate = {
      serviceId,
      newStatus,
      timestamp: Date.now(),
      serviceType
    }

    // Store the update
    setUpdates(prev => new Map(prev).set(serviceId, update))

    // Notify all subscribers
    subscribers.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error('Error in service update subscriber:', error)
      }
    })

    console.log(`🔄 Service update broadcasted: ${serviceId} -> ${newStatus ? 'active' : 'inactive'}`)
  }, [subscribers])

  const getLatestUpdate = useCallback((serviceId: string): ServiceUpdate | null => {
    return updates.get(serviceId) || null
  }, [updates])

  const clearUpdates = useCallback(() => {
    setUpdates(new Map())
  }, [])

  const contextValue: ServiceUpdateContextType = {
    subscribeToUpdates,
    notifyServiceUpdate,
    getLatestUpdate,
    clearUpdates
  }

  return (
    <ServiceUpdateContext.Provider value={contextValue}>
      {children}
    </ServiceUpdateContext.Provider>
  )
}

export const useServiceUpdates = (): ServiceUpdateContextType => {
  const context = useContext(ServiceUpdateContext)
  if (!context) {
    throw new Error('useServiceUpdates must be used within a ServiceUpdateProvider')
  }
  return context
}

export default ServiceUpdateContext
