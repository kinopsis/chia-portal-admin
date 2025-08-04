/**
 * Unified Services State Management Hook
 * Manages data, filters, and UI state for the unified services interface
 * 
 * Features:
 * - Unified data fetching
 * - Advanced filtering
 * - Real-time metrics
 * - UI state management
 * - Bulk actions support
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { unifiedServicesService } from '@/services/unifiedServices'
import { dependenciasClientService } from '@/services/dependencias'
import { subdependenciasClientService } from '@/services/subdependencias'
import { useServiceUpdates } from '@/contexts/ServiceUpdateContext'
import type { 
  UnifiedServiceItem, 
  UnifiedSearchFilters, 
  UnifiedMetrics,
  CreateServiceData,
  UpdateServiceData
} from '@/services/unifiedServices'
import type { Dependencia, Subdependencia } from '@/types'

// Hook configuration interface
export interface UnifiedServicesConfig {
  defaultServiceType?: 'tramite' | 'opa' | 'both'
  defaultViewMode?: 'table' | 'cards'
  defaultFilters?: Partial<UnifiedSearchFilters>
  autoRefresh?: boolean
  refreshInterval?: number
  enableMetrics?: boolean
  pageSize?: number
}

// Hook return interface
export interface UseUnifiedServicesReturn {
  // Data state
  data: UnifiedServiceItem[]
  loading: boolean
  error: string | null
  metrics: UnifiedMetrics | null
  
  // Pagination
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  
  // Filters and search
  filters: UnifiedSearchFilters
  setFilters: (filters: Partial<UnifiedSearchFilters>) => void
  clearFilters: () => void
  
  // Dependencies data
  dependencias: Dependencia[]
  subdependencias: Subdependencia[]
  filteredSubdependencias: Subdependencia[]
  
  // UI state
  viewMode: 'table' | 'cards'
  setViewMode: (mode: 'table' | 'cards') => void
  selectedItems: UnifiedServiceItem[]
  setSelectedItems: (items: UnifiedServiceItem[]) => void
  
  // Actions
  refresh: () => Promise<void>
  createItem: (data: CreateServiceData) => Promise<void>
  updateItem: (data: UpdateServiceData) => Promise<void>
  deleteItem: (id: string, type: 'tramite' | 'opa') => Promise<void>
  bulkAction: (action: string, items: UnifiedServiceItem[]) => Promise<void>
  
  // Pagination actions
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  
  // Utility functions
  getItemById: (id: string) => UnifiedServiceItem | undefined
  isItemSelected: (item: UnifiedServiceItem) => boolean
  toggleItemSelection: (item: UnifiedServiceItem) => void
  selectAll: () => void
  clearSelection: () => void
}

export function useUnifiedServices(config: UnifiedServicesConfig = {}): UseUnifiedServicesReturn {
  const {
    defaultServiceType = 'both',
    defaultViewMode = 'table',
    defaultFilters = {},
    autoRefresh = false,
    refreshInterval = 30000,
    enableMetrics = true,
    pageSize = 20
  } = config

  // Service updates context
  const { subscribeToUpdates } = useServiceUpdates()

  // Data state
  const [data, setData] = useState<UnifiedServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<UnifiedMetrics | null>(null)

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0
  })

  // Filter state - Start with no default filters applied
  const [filters, setFiltersState] = useState<UnifiedSearchFilters>({
    serviceType: 'both', // Always start with both types to show all services
    query: '',
    dependencia_id: '',
    subdependencia_id: '',
    tipoPago: 'both',
    activo: undefined,
    page: 1,
    limit: pageSize,
    ...defaultFilters
  })

  // Dependencies state
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [subdependencias, setSubdependencias] = useState<Subdependencia[]>([])

  // UI state
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(defaultViewMode)
  const [selectedItems, setSelectedItems] = useState<UnifiedServiceItem[]>([])

  // Filtered subdependencias based on selected dependencia
  const filteredSubdependencias = useMemo(() => {
    if (!filters.dependencia_id) return subdependencias
    return subdependencias.filter(sub => sub.dependencia_id === filters.dependencia_id)
  }, [subdependencias, filters.dependencia_id])

  // Initialize service and load dependencies
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize unified service
        await unifiedServicesService.initialize()
        
        // Load dependencies
        const [depResponse, subResponse] = await Promise.all([
          dependenciasClientService.getAll(),
          subdependenciasClientService.getAll({ limit: 1000 }) // Load all subdependencias
        ])
        


        setDependencias(depResponse.data)
        setSubdependencias(subResponse.data)
      } catch (err) {
        console.error('Error initializing unified services:', err)
        setError('Error initializing services')
      }
    }

    initialize()
  }, [])

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await unifiedServicesService.getAll(filters)



      setData(response.data)
      setPagination(response.pagination)
      
      if (enableMetrics) {
        setMetrics(response.metrics)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching data'
      setError(errorMessage)
      console.error('Error fetching unified services:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, enableMetrics])

  // Fetch data when filters change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Subscribe to service updates for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((update) => {
      console.log('🔄 Received service update:', update)

      // Update the local data state immediately
      setData(prevData =>
        prevData.map(item =>
          item.id === update.serviceId
            ? { ...item, activo: update.newStatus }
            : item
        )
      )

      // Refresh metrics to reflect the change
      if (enableMetrics) {
        fetchData() // This will refresh both data and metrics
      }
    })

    return unsubscribe
  }, [subscribeToUpdates, enableMetrics, fetchData])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData])

  // Filter management functions
  const setFilters = useCallback((newFilters: Partial<UnifiedSearchFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to first page when filters change
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({
      serviceType: defaultServiceType,
      query: '',
      dependencia_id: '',
      subdependencia_id: '',
      tipoPago: 'both',
      activo: undefined,
      page: 1,
      limit: pageSize
    })
  }, [defaultServiceType, pageSize])

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // CRUD operations
  const createItem = useCallback(async (data: CreateServiceData) => {
    try {
      setLoading(true)
      setError(null)

      await unifiedServicesService.create(data)
      await refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [refresh])

  const updateItem = useCallback(async (data: UpdateServiceData) => {
    try {
      setLoading(true)
      setError(null)

      await unifiedServicesService.update(data)
      await refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [refresh])

  const deleteItem = useCallback(async (id: string, type?: 'tramite' | 'opa') => {
    try {
      setLoading(true)
      setError(null)

      await unifiedServicesService.delete(id, type)
      await refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [refresh])

  const bulkAction = useCallback(async (action: string, items: UnifiedServiceItem[]) => {
    try {
      setLoading(true)
      // TODO: Implement bulk actions
      console.log('Bulk action:', action, items)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error performing bulk action')
      throw err
    } finally {
      setLoading(false)
    }
  }, [refresh])

  // Pagination functions
  const goToPage = useCallback((page: number) => {
    setFilters({ page })
  }, [setFilters])

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      goToPage(pagination.page + 1)
    }
  }, [pagination.page, pagination.totalPages, goToPage])

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1)
    }
  }, [pagination.page, goToPage])

  // Selection utility functions
  const getItemById = useCallback((id: string) => {
    return data.find(item => item.id === id)
  }, [data])

  const isItemSelected = useCallback((item: UnifiedServiceItem) => {
    return selectedItems.some(selected => selected.id === item.id)
  }, [selectedItems])

  const toggleItemSelection = useCallback((item: UnifiedServiceItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id)
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id)
      } else {
        return [...prev, item]
      }
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedItems([...data])
  }, [data])

  const clearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  return {
    // Data state
    data,
    loading,
    error,
    metrics,
    
    // Pagination
    pagination,
    
    // Filters and search
    filters,
    setFilters,
    clearFilters,
    
    // Dependencies data
    dependencias,
    subdependencias,
    filteredSubdependencias,
    
    // UI state
    viewMode,
    setViewMode,
    selectedItems,
    setSelectedItems,
    
    // Actions
    refresh,
    createItem,
    updateItem,
    deleteItem,
    bulkAction,
    
    // Pagination actions
    goToPage,
    nextPage,
    prevPage,
    
    // Utility functions
    getItemById,
    isItemSelected,
    toggleItemSelection,
    selectAll,
    clearSelection
  }
}
