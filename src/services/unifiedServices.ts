/**
 * Unified Services Management Service
 * Handles both Trámites and OPAs with a single interface
 * 
 * Features:
 * - Unified data structure
 * - Type-safe operations
 * - Bulk actions support
 * - Advanced filtering
 * - Real-time metrics
 */

import { tramitesClientService } from './tramites'
import { opasClientService } from './opas'
import { dependenciasClientService } from './dependencias'
import { subdependenciasClientService } from './subdependencias'
import type { Tramite, OPA, Dependencia, Subdependencia, SearchFilters } from '@/types'

// Unified service item interface
export interface UnifiedServiceItem {
  // Common fields
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  tipo: 'tramite' | 'opa'
  
  // Relations
  dependencia: {
    id: string
    nombre: string
  }
  subdependencia: {
    id: string
    nombre: string
  }
  
  // Characteristics
  tiene_pago: boolean
  tiempo_respuesta?: string
  activo: boolean
  requisitos?: string[]
  
  // Government portal URLs
  visualizacion_suit?: string
  visualizacion_gov?: string
  
  // Metadata
  created_at: string
  updated_at: string
  
  // Type-specific data
  tramiteData?: Partial<Tramite>
  opaData?: Partial<OPA>
}

// Unified search filters
export interface UnifiedSearchFilters extends SearchFilters {
  serviceType?: 'tramite' | 'opa' | 'both'
  tipoPago?: 'gratuito' | 'con_pago' | 'both'
  dateRange?: {
    start: string
    end: string
  }
  page?: number
  limit?: number
}

// Unified metrics interface
export interface UnifiedMetrics {
  tramites: {
    total: number
    activos: number
    inactivos: number
    conPago: number
    gratuitos: number
  }
  opas: {
    total: number
    activos: number
    inactivos: number
    conPago: number
    gratuitos: number
  }
  combined: {
    total: number
    activos: number
    inactivos: number
    conPago: number
    gratuitos: number
  }
  dependencias: number
  subdependencias: number
}

// Unified response interface
export interface UnifiedServicesResponse {
  data: UnifiedServiceItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  metrics: UnifiedMetrics
  success: boolean
}

// Create/Update data interfaces
export interface CreateServiceData {
  tipo: 'tramite' | 'opa'
  codigo: string
  nombre: string
  descripcion?: string
  formulario?: string
  tiempo_respuesta?: string
  tiene_pago: boolean
  subdependencia_id: string
  activo: boolean
  requisitos?: string[]
  visualizacion_suit?: string
  visualizacion_gov?: string
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string
}

export class UnifiedServicesService {
  private dependenciasCache: Dependencia[] = []
  private subdependenciasCache: Subdependencia[] = []

  /**
   * Initialize service with cached dependencies
   */
  async initialize() {
    try {
      const [depResponse, subResponse] = await Promise.all([
        dependenciasClientService.getAll(),
        subdependenciasClientService.getAll({ limit: 1000 }) // Load all subdependencias
      ])
      
      this.dependenciasCache = depResponse.data
      this.subdependenciasCache = subResponse.data
    } catch (error) {
      console.error('Error initializing unified services:', error)
    }
  }

  /**
   * Get all services with unified interface
   */
  async getAll(filters: UnifiedSearchFilters = {}): Promise<UnifiedServicesResponse> {
    try {
      const {
        serviceType = 'both',
        query = '',
        dependencia_id = '',
        subdependencia_id = '',
        tipoPago = 'both',
        activo,
        page = 1,
        limit = 20
      } = filters

      // Prepare search filters for individual services
      const searchFilters: SearchFilters = {
        query,
        dependencia_id: dependencia_id || undefined,
        subdependencia_id: subdependencia_id || undefined,
        activo
      }

      // Fetch data based on service type
      const promises: Promise<any>[] = []

      if (serviceType === 'both' || serviceType === 'tramite') {
        promises.push(
          tramitesClientService.getAll(searchFilters).catch(error => {
            console.error('Error fetching tramites:', error)
            return { data: [], pagination: { total: 0 } }
          })
        )
      } else {
        promises.push(Promise.resolve({ data: [], pagination: { total: 0 } }))
      }

      if (serviceType === 'both' || serviceType === 'opa') {
        promises.push(
          opasClientService.getAll(searchFilters).catch(error => {
            console.error('Error fetching opas:', error)
            return { data: [], pagination: { total: 0 } }
          })
        )
      } else {
        promises.push(Promise.resolve({ data: [], pagination: { total: 0 } }))
      }

      const [tramitesResponse, opasResponse] = await Promise.all(promises)

      // Transform data to unified format
      const unifiedData: UnifiedServiceItem[] = []

      // Process Trámites
      if (tramitesResponse.data) {
        tramitesResponse.data.forEach((tramite: Tramite) => {
          const subdep = tramite.subdependencias
          const dep = subdep?.dependencias

          // Apply payment filter
          if (tipoPago !== 'both') {
            const hasPayment = tramite.tiene_pago
            if ((tipoPago === 'con_pago' && !hasPayment) || 
                (tipoPago === 'gratuito' && hasPayment)) {
              return
            }
          }

          unifiedData.push({
            id: tramite.id,
            codigo: tramite.codigo_unico,
            nombre: tramite.nombre,
            descripcion: tramite.formulario,
            tipo: 'tramite',
            dependencia: {
              id: dep?.id || '',
              nombre: dep?.nombre || 'Sin dependencia'
            },
            subdependencia: {
              id: subdep?.id || '',
              nombre: subdep?.nombre || 'Sin subdependencia'
            },
            tiene_pago: tramite.tiene_pago,
            tiempo_respuesta: tramite.tiempo_respuesta,
            activo: tramite.activo,
            requisitos: tramite.requisitos,
            visualizacion_suit: tramite.visualizacion_suit,
            visualizacion_gov: tramite.visualizacion_gov,
            created_at: tramite.created_at,
            updated_at: tramite.updated_at,
            tramiteData: tramite
          })
        })
      }

      // Process OPAs
      if (opasResponse.data) {
        opasResponse.data.forEach((opa: OPA) => {
          const subdep = opa.subdependencias
          const dep = subdep?.dependencias

          // Apply payment filter
          if (tipoPago !== 'both') {
            const hasPayment = opa.tiene_pago
            if ((tipoPago === 'con_pago' && !hasPayment) || 
                (tipoPago === 'gratuito' && hasPayment)) {
              return
            }
          }

          unifiedData.push({
            id: opa.id,
            codigo: opa.codigo_opa,
            nombre: opa.nombre,
            descripcion: opa.descripcion,
            tipo: 'opa',
            dependencia: {
              id: dep?.id || '',
              nombre: dep?.nombre || 'Sin dependencia'
            },
            subdependencia: {
              id: subdep?.id || '',
              nombre: subdep?.nombre || 'Sin subdependencia'
            },
            tiene_pago: opa.tiene_pago,
            tiempo_respuesta: opa.tiempo_respuesta,
            activo: opa.activo,
            requisitos: opa.requisitos,
            visualizacion_suit: opa.visualizacion_suit,
            visualizacion_gov: opa.visualizacion_gov,
            created_at: opa.created_at,
            updated_at: opa.updated_at,
            opaData: opa
          })
        })
      }

      // Sort by name
      unifiedData.sort((a, b) => a.nombre.localeCompare(b.nombre))

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedData = unifiedData.slice(startIndex, endIndex)

      // Calculate metrics
      const metrics = await this.calculateMetrics()

      return {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: unifiedData.length,
          totalPages: Math.ceil(unifiedData.length / limit)
        },
        metrics,
        success: true
      }
    } catch (error) {
      console.error('Error in getAll:', error)
      throw new Error(`Error fetching unified services: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get service by ID and type
   */
  async getById(id: string, type: 'tramite' | 'opa'): Promise<UnifiedServiceItem> {
    try {
      if (type === 'tramite') {
        const tramite = await tramitesClientService.getById(id)
        return this.transformTramiteToUnified(tramite)
      } else {
        const opa = await opasClientService.getById(id)
        return this.transformOpaToUnified(opa)
      }
    } catch (error) {
      throw new Error(`Error fetching service: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a new service item
   */
  async create(data: CreateServiceData): Promise<UnifiedServiceItem> {
    try {
      if (data.tipo === 'tramite') {
        const tramiteData = {
          codigo_unico: data.codigo,
          nombre: data.nombre,
          formulario: data.descripcion,
          tiempo_respuesta: data.tiempo_respuesta,
          tiene_pago: data.tiene_pago,
          subdependencia_id: data.subdependencia_id,
          activo: data.activo,
          requisitos: data.requisitos,
          visualizacion_suit: data.visualizacion_suit,
          visualizacion_gov: data.visualizacion_gov
        }
        const tramite = await tramitesClientService.create(tramiteData as any)
        return this.transformTramiteToUnified(tramite)
      } else {
        const opaData = {
          codigo_opa: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion,
          formulario: data.formulario,
          tiempo_respuesta: data.tiempo_respuesta,
          tiene_pago: data.tiene_pago,
          subdependencia_id: data.subdependencia_id,
          activo: data.activo,
          requisitos: data.requisitos,
          visualizacion_suit: data.visualizacion_suit,
          visualizacion_gov: data.visualizacion_gov
        }
        const opa = await opasClientService.create(opaData as any)
        return this.transformOpaToUnified(opa)
      }
    } catch (error) {
      throw new Error(`Error creating service: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update a service item
   */
  async update(data: UpdateServiceData): Promise<UnifiedServiceItem> {
    try {
      const { id, tipo, ...updateData } = data

      if (tipo === 'tramite') {
        const tramiteData = {
          codigo_unico: updateData.codigo,
          nombre: updateData.nombre,
          formulario: updateData.descripcion,
          tiempo_respuesta: updateData.tiempo_respuesta,
          tiene_pago: updateData.tiene_pago,
          subdependencia_id: updateData.subdependencia_id,
          activo: updateData.activo,
          requisitos: updateData.requisitos,
          visualizacion_suit: updateData.visualizacion_suit,
          visualizacion_gov: updateData.visualizacion_gov
        }
        const tramite = await tramitesClientService.update(id, tramiteData as any)
        return this.transformTramiteToUnified(tramite)
      } else {
        const opaData = {
          codigo_opa: updateData.codigo,
          nombre: updateData.nombre,
          descripcion: updateData.descripcion,
          formulario: updateData.formulario,
          tiempo_respuesta: updateData.tiempo_respuesta,
          tiene_pago: updateData.tiene_pago,
          subdependencia_id: updateData.subdependencia_id,
          activo: updateData.activo,
          requisitos: updateData.requisitos,
          visualizacion_suit: updateData.visualizacion_suit,
          visualizacion_gov: updateData.visualizacion_gov
        }
        const opa = await opasClientService.update(id, opaData as any)
        return this.transformOpaToUnified(opa)
      }
    } catch (error) {
      throw new Error(`Error updating service: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a service item
   */
  async delete(id: string, type: 'tramite' | 'opa'): Promise<void> {
    try {
      if (type === 'tramite') {
        await tramitesClientService.delete(id)
      } else {
        await opasClientService.delete(id)
      }
    } catch (error) {
      throw new Error(`Error deleting service: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Calculate real-time metrics
   */
  async calculateMetrics(): Promise<UnifiedMetrics> {
    try {
      const [tramitesResponse, opasResponse] = await Promise.all([
        tramitesClientService.getAll({ limit: 1000 }),
        opasClientService.getAll({ limit: 1000 })
      ])

      const tramites = tramitesResponse.data || []
      const opas = opasResponse.data || []

      const tramitesMetrics = {
        total: tramites.length,
        activos: tramites.filter(t => t.activo).length,
        inactivos: tramites.filter(t => !t.activo).length,
        conPago: tramites.filter(t => t.tiene_pago).length,
        gratuitos: tramites.filter(t => !t.tiene_pago).length
      }

      const opasMetrics = {
        total: opas.length,
        activos: opas.filter(o => o.activo).length,
        inactivos: opas.filter(o => !o.activo).length,
        conPago: opas.filter(o => o.tiene_pago).length,
        gratuitos: opas.filter(o => !o.tiene_pago).length
      }

      return {
        tramites: tramitesMetrics,
        opas: opasMetrics,
        combined: {
          total: tramitesMetrics.total + opasMetrics.total,
          activos: tramitesMetrics.activos + opasMetrics.activos,
          inactivos: tramitesMetrics.inactivos + opasMetrics.inactivos,
          conPago: tramitesMetrics.conPago + opasMetrics.conPago,
          gratuitos: tramitesMetrics.gratuitos + opasMetrics.gratuitos
        },
        dependencias: this.dependenciasCache.length,
        subdependencias: this.subdependenciasCache.length
      }
    } catch (error) {
      console.error('Error calculating metrics:', error)
      // Return empty metrics on error
      return {
        tramites: { total: 0, activos: 0, inactivos: 0, conPago: 0, gratuitos: 0 },
        opas: { total: 0, activos: 0, inactivos: 0, conPago: 0, gratuitos: 0 },
        combined: { total: 0, activos: 0, inactivos: 0, conPago: 0, gratuitos: 0 },
        dependencias: 0,
        subdependencias: 0
      }
    }
  }

  /**
   * Transform Tramite to UnifiedServiceItem
   */
  private transformTramiteToUnified(tramite: Tramite): UnifiedServiceItem {
    const subdep = tramite.subdependencias
    const dep = subdep?.dependencias

    return {
      id: tramite.id,
      codigo: tramite.codigo_unico,
      nombre: tramite.nombre,
      descripcion: tramite.formulario,
      tipo: 'tramite',
      dependencia: {
        id: dep?.id || '',
        nombre: dep?.nombre || 'Sin dependencia'
      },
      subdependencia: {
        id: subdep?.id || '',
        nombre: subdep?.nombre || 'Sin subdependencia'
      },
      tiene_pago: tramite.tiene_pago,
      tiempo_respuesta: tramite.tiempo_respuesta,
      activo: tramite.activo,
      requisitos: tramite.requisitos,
      visualizacion_suit: tramite.visualizacion_suit,
      visualizacion_gov: tramite.visualizacion_gov,
      created_at: tramite.created_at,
      updated_at: tramite.updated_at,
      tramiteData: tramite
    }
  }

  /**
   * Transform OPA to UnifiedServiceItem
   */
  private transformOpaToUnified(opa: OPA): UnifiedServiceItem {
    const subdep = opa.subdependencias
    const dep = subdep?.dependencias

    return {
      id: opa.id,
      codigo: opa.codigo_opa,
      nombre: opa.nombre,
      descripcion: opa.descripcion,
      tipo: 'opa',
      dependencia: {
        id: dep?.id || '',
        nombre: dep?.nombre || 'Sin dependencia'
      },
      subdependencia: {
        id: subdep?.id || '',
        nombre: subdep?.nombre || 'Sin subdependencia'
      },
      tiene_pago: opa.tiene_pago,
      tiempo_respuesta: opa.tiempo_respuesta,
      activo: opa.activo,
      requisitos: opa.requisitos,
      visualizacion_suit: opa.visualizacion_suit,
      visualizacion_gov: opa.visualizacion_gov,
      created_at: opa.created_at,
      updated_at: opa.updated_at,
      opaData: opa
    }
  }
}

// Export singleton instance
export const unifiedServicesService = new UnifiedServicesService()
