'use client'

/**
 * useServiceToggle Hook
 * 
 * Custom hook for managing service activation/deactivation with:
 * - Optimistic updates for immediate UI feedback
 * - Error handling and rollback
 * - Loading states
 * - Toast notifications
 * - Batch operations support
 */

import { useState, useCallback } from 'react'
import { unifiedServicesService, type UnifiedServiceItem } from '@/services/unifiedServices'
import { useServiceUpdates } from '@/contexts/ServiceUpdateContext'

export interface UseServiceToggleOptions {
  /** Callback when toggle succeeds */
  onSuccess?: (item: UnifiedServiceItem, newState: boolean) => void
  /** Callback when toggle fails */
  onError?: (error: Error, item: UnifiedServiceItem) => void
  /** Show toast notifications */
  showToast?: boolean
}

export interface UseServiceToggleReturn {
  /** Toggle a single service */
  toggleService: (item: UnifiedServiceItem, newState?: boolean) => Promise<boolean>
  /** Toggle multiple services */
  toggleMultiple: (items: UnifiedServiceItem[], newState: boolean) => Promise<boolean>
  /** Loading states by service ID */
  loadingStates: Record<string, boolean>
  /** Error states by service ID */
  errorStates: Record<string, string | null>
  /** Clear error for a specific service */
  clearError: (serviceId: string) => void
  /** Clear all errors */
  clearAllErrors: () => void
}

export function useServiceToggle(options: UseServiceToggleOptions = {}): UseServiceToggleReturn {
  const { onSuccess, onError, showToast = true } = options
  const { notifyServiceUpdate } = useServiceUpdates()

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [errorStates, setErrorStates] = useState<Record<string, string | null>>({})

  const setLoading = useCallback((serviceId: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [serviceId]: loading
    }))
  }, [])

  const setError = useCallback((serviceId: string, error: string | null) => {
    setErrorStates(prev => ({
      ...prev,
      [serviceId]: error
    }))
  }, [])

  const clearError = useCallback((serviceId: string) => {
    setError(serviceId, null)
  }, [setError])

  const clearAllErrors = useCallback(() => {
    setErrorStates({})
  }, [])

  const showSuccessToast = useCallback((item: UnifiedServiceItem, newState: boolean) => {
    if (!showToast) return
    
    // TODO: Implement toast notification system
    console.log(`✅ ${item.nombre} ${newState ? 'activado' : 'desactivado'} correctamente`)
  }, [showToast])

  const showErrorToast = useCallback((error: Error, item: UnifiedServiceItem) => {
    if (!showToast) return
    
    // TODO: Implement toast notification system
    console.error(`❌ Error al cambiar estado de ${item.nombre}: ${error.message}`)
  }, [showToast])

  const updateServiceInDatabase = useCallback(async (
    item: UnifiedServiceItem,
    newState: boolean
  ): Promise<UnifiedServiceItem> => {
    // Use the unified service to toggle status
    return await unifiedServicesService.toggleActive(item.id, newState)
  }, [])

  const toggleService = useCallback(async (
    item: UnifiedServiceItem,
    newState?: boolean
  ): Promise<boolean> => {
    const targetState = newState !== undefined ? newState : !item.activo
    const serviceId = item.id

    // Clear any previous errors
    clearError(serviceId)
    
    // Set loading state
    setLoading(serviceId, true)

    try {
      // Optimistic update - update UI immediately
      const originalState = item.activo
      item.activo = targetState

      // Update database and get updated item
      const updatedItem = await updateServiceInDatabase(item, targetState)

      // Update the item with the latest data from database
      Object.assign(item, updatedItem)

      // Success callback
      onSuccess?.(item, targetState)
      showSuccessToast(item, targetState)

      // Notify global context about the update
      notifyServiceUpdate(item.id, targetState, item.tipo_servicio)

      return true

    } catch (error) {
      // Rollback optimistic update
      item.activo = !targetState

      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(serviceId, errorMessage)

      const errorObj = error instanceof Error ? error : new Error(errorMessage)
      onError?.(errorObj, item)
      showErrorToast(errorObj, item)

      return false

    } finally {
      // Clear loading state
      setLoading(serviceId, false)
    }
  }, [updateServiceInDatabase, onSuccess, onError, showSuccessToast, showErrorToast, setLoading, clearError, setError])

  const toggleMultiple = useCallback(async (
    items: UnifiedServiceItem[],
    newState: boolean
  ): Promise<boolean> => {
    if (items.length === 0) return true

    // Set loading for all items
    items.forEach(item => setLoading(item.id, true))

    try {
      // Group by type for batch operations
      const tramites = items.filter(item => item.tipo === 'tramite')
      const opas = items.filter(item => item.tipo === 'opa')

      const promises: Promise<void>[] = []

      // Batch update tramites
      if (tramites.length > 0) {
        const tramiteIds = tramites.map(item => item.id)
        promises.push(
          supabase
            .from('tramites')
            .update({ 
              activo: newState,
              updated_at: new Date().toISOString()
            })
            .in('id', tramiteIds)
            .then(({ error }) => {
              if (error) throw new Error(`Error updating tramites: ${error.message}`)
            })
        )
      }

      // Batch update opas
      if (opas.length > 0) {
        const opaIds = opas.map(item => item.id)
        promises.push(
          supabase
            .from('opas')
            .update({ 
              activo: newState,
              updated_at: new Date().toISOString()
            })
            .in('id', opaIds)
            .then(({ error }) => {
              if (error) throw new Error(`Error updating opas: ${error.message}`)
            })
        )
      }

      // Wait for all updates
      await Promise.all(promises)

      // Optimistic update for all items
      items.forEach(item => {
        item.activo = newState
        onSuccess?.(item, newState)
      })

      // Show success toast
      if (showToast) {
        console.log(`✅ ${items.length} servicios ${newState ? 'activados' : 'desactivados'} correctamente`)
      }

      return true

    } catch (error) {
      // Handle batch error
      const errorMessage = error instanceof Error ? error.message : 'Error en operación masiva'
      
      items.forEach(item => {
        setError(item.id, errorMessage)
        const errorObj = error instanceof Error ? error : new Error(errorMessage)
        onError?.(errorObj, item)
      })

      if (showToast) {
        console.error(`❌ Error en operación masiva: ${errorMessage}`)
      }

      return false

    } finally {
      // Clear loading for all items
      items.forEach(item => setLoading(item.id, false))
    }
  }, [updateServiceInDatabase, onSuccess, onError, showToast, setLoading, setError])

  return {
    toggleService,
    toggleMultiple,
    loadingStates,
    errorStates,
    clearError,
    clearAllErrors
  }
}
