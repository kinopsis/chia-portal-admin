/**
 * Tramites and OPAs Unified Service
 * 
 * Service for handling both Tramites and OPAs from their respective tables
 * and presenting them in a unified ServiceEnhanced format
 */

import { supabase } from '@/lib/supabase/client'
import type { ServiceEnhanced, Tramite, OPA } from '@/types'
import { 
  combineServicesEnhanced, 
  applyServiceFilters,
  transformTramitesToServiceEnhanced,
  transformOPAsToServiceEnhanced
} from '@/utils/serviceTransformers'
import { normalizeSpanishText } from '@/lib/utils'

export interface TramitesOpasFilters {
  query?: string
  tipo?: 'tramite' | 'opa' | ''
  dependencia?: string[]
  subdependencia?: string[]
  tipoPago?: 'true' | 'false' | ''
  activo?: boolean | undefined // Allow undefined to get all services
  limit?: number
  offset?: number
}

export interface TramitesOpasResult {
  data: ServiceEnhanced[]
  total: number
  hasMore: boolean
}

class TramitesOpasUnifiedService {
  /**
   * Get all services (Tramites and OPAs) with optional filters
   */
  async getAllServices(filters: TramitesOpasFilters = {}): Promise<TramitesOpasResult> {
    try {
      const {
        query = '',
        tipo = '',
        dependencia = [],
        subdependencia = [],
        tipoPago = '',
        activo = true, // Default to true, but can be overridden with undefined to get all
        limit = 50,
        offset = 0
      } = filters

      // Build queries for both tramites and opas
      const shouldIncludeTramites = !tipo || tipo === 'tramite'
      const shouldIncludeOPAs = !tipo || tipo === 'opa'

      const promises: Promise<any>[] = []

      // Query tramites if needed
      if (shouldIncludeTramites) {
        let tramitesQuery = supabase
          .from('tramites')
          .select(`
            *,
            subdependencias (
              id,
              nombre,
              dependencias (
                id,
                nombre
              )
            )
          `)

        // Only filter by activo if it's explicitly set (not undefined)
        if (activo !== undefined) {
          tramitesQuery = tramitesQuery.eq('activo', activo)
        }

        promises.push(tramitesQuery)
      } else {
        promises.push(Promise.resolve({ data: [], error: null }))
      }

      // Query OPAs if needed
      if (shouldIncludeOPAs) {
        let opasQuery = supabase
          .from('opas')
          .select(`
            *,
            subdependencias (
              id,
              nombre,
              dependencias (
                id,
                nombre
              )
            )
          `)

        // Only filter by activo if it's explicitly set (not undefined)
        if (activo !== undefined) {
          opasQuery = opasQuery.eq('activo', activo)
        }

        promises.push(opasQuery)
      } else {
        promises.push(Promise.resolve({ data: [], error: null }))
      }

      // Execute queries in parallel
      const [tramitesResult, opasResult] = await Promise.all(promises)

      if (tramitesResult.error) {
        throw tramitesResult.error
      }

      if (opasResult.error) {
        throw opasResult.error
      }

      // Transform to unified format
      const tramites = tramitesResult.data || []
      const opas = opasResult.data || []
      
      let services = combineServicesEnhanced(tramites, opas)

      // Apply filters
      services = applyServiceFilters(services, {
        type: tipo,
        activeOnly: activo,
        paymentType: tipoPago,
        dependencias: dependencia,
        subdependencias: subdependencia
      })

      // Apply search query if provided
      if (query.trim()) {
        services = this.filterServicesByQuery(services, query)
      }

      // Apply pagination
      const total = services.length
      const paginatedServices = services.slice(offset, offset + limit)
      const hasMore = offset + limit < total

      return {
        data: paginatedServices,
        total,
        hasMore
      }

    } catch (error) {
      console.error('Error fetching unified services:', error)
      throw error
    }
  }

  /**
   * Filter services by search query
   */
  private filterServicesByQuery(services: ServiceEnhanced[], query: string): ServiceEnhanced[] {
    const normalizedQuery = normalizeSpanishText(query.toLowerCase())
    
    return services.filter(service => {
      const searchableFields = [
        service.nombre,
        service.codigo,
        service.descripcion || '',
        service.dependencia || '',
        service.subdependencia || '',
        service.formulario || '',
        service.observaciones || '',
        ...(service.requisitos || []),
        ...(service.instructivo || [])
      ]

      return searchableFields.some(field => {
        const normalizedField = normalizeSpanishText(field.toLowerCase())
        return normalizedField.includes(normalizedQuery)
      })
    })
  }

  /**
   * Get services by type only
   */
  async getTramites(filters: Omit<TramitesOpasFilters, 'tipo'> = {}): Promise<TramitesOpasResult> {
    return this.getAllServices({ ...filters, tipo: 'tramite' })
  }

  /**
   * Get OPAs only
   */
  async getOPAs(filters: Omit<TramitesOpasFilters, 'tipo'> = {}): Promise<TramitesOpasResult> {
    return this.getAllServices({ ...filters, tipo: 'opa' })
  }

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<{
    totalTramites: number
    totalOPAs: number
    totalServices: number
    activeTramites: number
    activeOPAs: number
    activeServices: number
  }> {
    try {
      const [tramitesCount, opasCount, activeTramitesCount, activeOPAsCount] = await Promise.all([
        supabase.from('tramites').select('*', { count: 'exact', head: true }),
        supabase.from('opas').select('*', { count: 'exact', head: true }),
        supabase.from('tramites').select('*', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('opas').select('*', { count: 'exact', head: true }).eq('activo', true)
      ])

      const totalTramites = tramitesCount.count || 0
      const totalOPAs = opasCount.count || 0
      const activeTramites = activeTramitesCount.count || 0
      const activeOPAs = activeOPAsCount.count || 0

      return {
        totalTramites,
        totalOPAs,
        totalServices: totalTramites + totalOPAs,
        activeTramites,
        activeOPAs,
        activeServices: activeTramites + activeOPAs
      }
    } catch (error) {
      console.error('Error fetching service stats:', error)
      return {
        totalTramites: 0,
        totalOPAs: 0,
        totalServices: 0,
        activeTramites: 0,
        activeOPAs: 0,
        activeServices: 0
      }
    }
  }
}

// Export singleton instance
export const tramitesOpasUnifiedService = new TramitesOpasUnifiedService()
export default tramitesOpasUnifiedService
