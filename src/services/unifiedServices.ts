/**
 * Unified Services Management Service
 * Handles both Trámites and OPAs with a single interface using the unified servicios table
 * 
 * Features:
 * - Unified data structure from servicios table
 * - Type-safe operations
 * - Bulk actions support
 * - Advanced filtering
 * - Real-time metrics
 */

import { supabase } from '@/lib/supabase'
import { normalizeSpanishText } from '@/lib/utils'
import { dependenciasClientService } from './dependencias'
import { subdependenciasClientService } from './subdependencias'
import type { Dependencia, Subdependencia } from '@/types'

// Unified service item interface (from servicios table)
export interface UnifiedServiceItem {
  // Common fields
  id: string
  codigo: string
  codigo_original?: string
  nombre: string
  descripcion?: string
  tipo_servicio: 'tramite' | 'opa' | 'servicio'
  categoria: string
  
  // Relations
  dependencia_id: string
  subdependencia_id: string
  dependencia: {
    id: string
    nombre: string
  }
  subdependencia: {
    id: string
    nombre: string
  }
  
  // Characteristics
  requiere_pago: boolean
  tiempo_respuesta?: string
  activo: boolean
  requisitos?: string[]
  instrucciones?: string[]

  // Government portal URLs
  url_suit?: string
  url_gov?: string
  visualizacion_suit?: boolean
  visualizacion_gov?: boolean
  
  // Metadata
  created_at: string
  updated_at: string
}

// Unified search filters
export interface UnifiedSearchFilters {
  query?: string
  serviceType?: 'tramite' | 'opa' | 'servicio' | 'both'
  dependencia_id?: string
  subdependencia_id?: string
  tipoPago?: 'gratuito' | 'con_pago' | 'both'
  activo?: boolean
  categoria?: string
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
  codigo?: string // Optional, will be auto-generated if not provided
  nombre: string
  descripcion?: string
  tipo: 'tramite' | 'opa' // Match form field name
  tipo_servicio?: 'tramite' | 'opa' | 'servicio' // For backward compatibility
  categoria?: string // Optional, defaults to 'atencion_ciudadana'
  dependencia_id?: string // Will be derived from subdependencia
  subdependencia_id: string
  tiene_pago?: boolean // Match form field name
  requiere_pago?: boolean // For backward compatibility
  tiempo_respuesta?: string
  activo: boolean
  requisitos?: string[]
  instrucciones?: string[] // Add instrucciones field
  formulario?: string // For OPAs
  url_suit?: string
  url_gov?: string
  visualizacion_suit?: string | boolean
  visualizacion_gov?: string | boolean
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
   * Get all services with unified interface from servicios table
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
        categoria,
        page = 1,
        limit = 20
      } = filters

      // Build Supabase query
      let queryBuilder = supabase
        .from('servicios')
        .select(`
          *,
          dependencia:dependencias(id, nombre),
          subdependencia:subdependencias(id, nombre)
        `, { count: 'exact' })

      // Apply filters with enhanced search including accent normalization
      if (query) {
        // Use both database search (for performance) and client-side normalization (for accuracy)
        const normalizedQuery = normalizeSpanishText(query)

        // Create broader database search using prefixes to catch accent variations
        const searchTerms = query.split(' ').map(term => {
          if (term.length > 4) {
            return term.substring(0, Math.max(4, Math.floor(term.length * 0.7)))
          }
          return term
        })

        const prefixQueries = searchTerms.map(term =>
          `nombre.ilike.%${term}%,codigo.ilike.%${term}%,codigo_original.ilike.%${term}%,descripcion.ilike.%${term}%`
        ).join(',')

        queryBuilder = queryBuilder.or(prefixQueries)
      }

      if (serviceType !== 'both') {
        queryBuilder = queryBuilder.eq('tipo_servicio', serviceType)
      }

      if (dependencia_id) {
        queryBuilder = queryBuilder.eq('dependencia_id', dependencia_id)
      }

      if (subdependencia_id) {
        queryBuilder = queryBuilder.eq('subdependencia_id', subdependencia_id)
      }

      if (tipoPago !== 'both') {
        const requiresPago = tipoPago === 'con_pago'
        queryBuilder = queryBuilder.eq('requiere_pago', requiresPago)
      }

      if (activo !== undefined) {
        queryBuilder = queryBuilder.eq('activo', activo)
      }

      if (categoria) {
        queryBuilder = queryBuilder.eq('categoria', categoria)
      }

      // Apply pagination
      const offset = (page - 1) * limit
      queryBuilder = queryBuilder
        .range(offset, offset + limit - 1)
        .order('updated_at', { ascending: false })

      // Execute query
      const { data, error, count } = await queryBuilder

      if (error) {
        throw new Error(`Error fetching services: ${error.message}`)
      }



      // Transform data to UnifiedServiceItem format
      let transformedData: UnifiedServiceItem[] = (data || []).map(item => ({
        id: item.id,
        codigo: item.codigo,
        codigo_original: item.codigo_original,
        nombre: item.nombre,
        descripcion: item.descripcion,
        tipo_servicio: item.tipo_servicio,
        categoria: item.categoria,
        dependencia_id: item.dependencia_id,
        subdependencia_id: item.subdependencia_id,
        dependencia: {
          id: item.dependencia?.id || item.dependencia_id,
          nombre: item.dependencia?.nombre || 'Sin dependencia'
        },
        subdependencia: {
          id: item.subdependencia?.id || item.subdependencia_id,
          nombre: item.subdependencia?.nombre || 'Sin subdependencia'
        },
        requiere_pago: item.requiere_pago,
        tiempo_respuesta: item.tiempo_respuesta,
        activo: item.activo,
        requisitos: Array.isArray(item.requisitos) ? item.requisitos : [],
        instrucciones: Array.isArray(item.instrucciones) ? item.instrucciones : [],
        url_suit: item.url_suit,
        url_gov: item.url_gov,
        visualizacion_suit: item.visualizacion_suit,
        visualizacion_gov: item.visualizacion_gov,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))

      // REMOVED: Client-side filtering is redundant since database query already handles search
      // The database query with ILIKE already provides accent-insensitive search
      // Additional client-side filtering was causing all results to be filtered out



      // Get total count for pagination
      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      // Calculate metrics
      const metrics = await this.calculateMetrics()

      return {
        data: transformedData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages
        },
        metrics,
        success: true
      }
    } catch (error) {
      console.error('Error fetching unified services:', error)
      throw error
    }
  }

  /**
   * Calculate unified metrics from both servicios table and original tables
   */
  private async calculateMetrics(): Promise<UnifiedMetrics> {
    try {
      // Get counts from servicios table
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios')
        .select('tipo_servicio, activo, requiere_pago')

      if (serviciosError) {
        throw new Error(`Error fetching servicios metrics: ${serviciosError.message}`)
      }

      // Also get counts from original tables to ensure accuracy
      const [tramitesResult, opasResult] = await Promise.all([
        supabase.from('tramites').select('activo, tiene_pago', { count: 'exact' }),
        supabase.from('opas').select('activo, tiene_pago', { count: 'exact' })
      ])

      const services = serviciosData || []
      const tramitesData = tramitesResult.data || []
      const opasData = opasResult.data || []

      // Calculate metrics using original tables for accuracy
      const tramitesMetrics = {
        total: tramitesData.length,
        activos: tramitesData.filter(t => t.activo).length,
        inactivos: tramitesData.filter(t => !t.activo).length,
        conPago: tramitesData.filter(t => t.tiene_pago).length,
        gratuitos: tramitesData.filter(t => !t.tiene_pago).length
      }

      const opasMetrics = {
        total: opasData.length,
        activos: opasData.filter(o => o.activo).length,
        inactivos: opasData.filter(o => !o.activo).length,
        conPago: opasData.filter(o => o.tiene_pago).length,
        gratuitos: opasData.filter(o => !o.tiene_pago).length
      }

      // Also calculate from servicios table for comparison
      const serviciosTramites = services.filter(s => s.tipo_servicio === 'tramite')
      const serviciosOpas = services.filter(s => s.tipo_servicio === 'opa')

      const combined = {
        total: tramitesMetrics.total + opasMetrics.total,
        activos: tramitesMetrics.activos + opasMetrics.activos,
        inactivos: tramitesMetrics.inactivos + opasMetrics.inactivos,
        conPago: tramitesMetrics.conPago + opasMetrics.conPago,
        gratuitos: tramitesMetrics.gratuitos + opasMetrics.gratuitos
      }

      // Log discrepancy if servicios table is missing data
      const serviciosTotal = services.length
      const actualTotal = combined.total
      if (serviciosTotal !== actualTotal) {
        console.warn(`Data discrepancy detected: servicios table has ${serviciosTotal} items, but original tables have ${actualTotal} items`)
      }

      return {
        tramites: tramitesMetrics,
        opas: opasMetrics,
        combined,
        dependencias: this.dependenciasCache.length,
        subdependencias: this.subdependenciasCache.length
      }
    } catch (error) {
      console.error('Error calculating metrics:', error)
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
   * Toggle service active status
   */
  async toggleActive(id: string, activo: boolean): Promise<UnifiedServiceItem> {
    try {
      console.log('🔄 Toggling service status:', { id, activo })

      // First, check if the service exists
      const { data: existingService, error: checkError } = await supabase
        .from('servicios')
        .select('id, nombre, tipo_servicio, activo')
        .eq('id', id)
        .single()

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new Error(`Service with ID ${id} not found`)
        }
        throw new Error(`Error checking service existence: ${checkError.message}`)
      }

      console.log('✅ Service exists:', existingService)

      // Perform the toggle operation
      const { data: updatedService, error } = await supabase
        .from('servicios')
        .update({
          activo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          dependencia:dependencias(id, nombre),
          subdependencia:subdependencias(id, nombre)
        `)
        .single()

      if (error) {
        console.error('❌ Database toggle error:', error)
        throw new Error(`Error toggling service status: ${error.message}`)
      }

      if (!updatedService) {
        throw new Error('Toggle operation completed but no data was returned')
      }

      console.log('✅ Service status toggled successfully:', updatedService.id)
      return this.transformServiceItem(updatedService)
    } catch (error) {
      console.error('❌ Error toggling service status:', error)
      throw error
    }
  }

  /**
   * Create a new service
   */
  async create(data: CreateServiceData): Promise<UnifiedServiceItem> {
    try {
      // Normalize field names
      const tipoServicio = data.tipo || data.tipo_servicio || 'tramite'
      const requierePago = data.tiene_pago ?? data.requiere_pago ?? false

      // Get dependencia_id from subdependencia if not provided
      let dependenciaId = data.dependencia_id
      if (!dependenciaId) {
        const { data: subdep, error: subdepError } = await supabase
          .from('subdependencias')
          .select('dependencia_id')
          .eq('id', data.subdependencia_id)
          .single()

        if (subdepError || !subdep) {
          throw new Error('Subdependencia not found')
        }
        dependenciaId = subdep.dependencia_id
      }

      // Generate automatic code if not provided
      let codigo = data.codigo
      if (!codigo || codigo === 'XXX-XXX-XXX' || codigo === '') {
        codigo = await this.generateServiceCode(data.subdependencia_id, tipoServicio as 'tramite' | 'opa')
      }

      // Prepare data for insertion
      const insertData = {
        codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo_servicio: tipoServicio,
        categoria: data.categoria || 'atencion_ciudadana',
        dependencia_id: dependenciaId,
        subdependencia_id: data.subdependencia_id,
        requiere_pago: requierePago,
        tiempo_respuesta: data.tiempo_respuesta,
        activo: data.activo,
        requisitos: data.requisitos || null,
        instrucciones: data.instrucciones || null, // Handle instrucciones field
        url_suit: typeof data.visualizacion_suit === 'string' ? data.visualizacion_suit : data.url_suit,
        url_gov: typeof data.visualizacion_gov === 'string' ? data.visualizacion_gov : data.url_gov,
        visualizacion_suit: typeof data.visualizacion_suit === 'boolean' ? data.visualizacion_suit : false,
        visualizacion_gov: typeof data.visualizacion_gov === 'boolean' ? data.visualizacion_gov : false
      }

      const { data: result, error } = await supabase
        .from('servicios')
        .insert(insertData)
        .select(`
          *,
          dependencia:dependencias(id, nombre),
          subdependencia:subdependencias(id, nombre)
        `)
        .single()

      if (error) {
        throw new Error(`Error creating service: ${error.message}`)
      }

      // Sync with original tables (tramites/opas) for data consistency
      await this.syncToOriginalTables(result)

      return this.transformServiceItem(result)
    } catch (error) {
      console.error('Error in service creation:', error)
      throw error
    }
  }

  /**
   * Update an existing service
   */
  async update(data: UpdateServiceData): Promise<UnifiedServiceItem> {
    try {
      const { id, ...updateData } = data

      // Validate that ID is provided
      if (!id) {
        throw new Error('Service ID is required for update operation')
      }

      console.log('🔧 Updating service with ID:', id)
      console.log('🔧 Update data:', updateData)

      // Log URL field mapping for debugging
      if ('visualizacion_suit' in updateData || 'visualizacion_gov' in updateData) {
        console.log('🔗 URL field mapping detected:', {
          visualizacion_suit: updateData.visualizacion_suit,
          visualizacion_gov: updateData.visualizacion_gov,
          visualizacion_suit_type: typeof updateData.visualizacion_suit,
          visualizacion_gov_type: typeof updateData.visualizacion_gov
        })
      }

      // First, check if the service exists
      const { data: existingService, error: checkError } = await supabase
        .from('servicios')
        .select('id, nombre, tipo_servicio')
        .eq('id', id)
        .single()

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new Error(`Service with ID ${id} not found`)
        }
        throw new Error(`Error checking service existence: ${checkError.message}`)
      }

      console.log('✅ Service exists:', existingService)

      // Normalize field names for database compatibility
      const normalizedData = { ...updateData }

      // Map tiene_pago to requiere_pago for database compatibility
      if ('tiene_pago' in normalizedData) {
        normalizedData.requiere_pago = normalizedData.tiene_pago
        delete normalizedData.tiene_pago
      }

      // Map tipo to tipo_servicio for database compatibility
      if ('tipo' in normalizedData) {
        normalizedData.tipo_servicio = normalizedData.tipo
        delete normalizedData.tipo
      }

      // Fix URL field mapping issue - form sends URL strings with visualization field names
      // Map visualizacion_suit/visualizacion_gov form fields to correct database columns
      if ('visualizacion_suit' in normalizedData) {
        if (typeof normalizedData.visualizacion_suit === 'string') {
          // URL string value goes to url_suit column
          normalizedData.url_suit = normalizedData.visualizacion_suit
          // Set visualization flag based on whether URL is provided
          normalizedData.visualizacion_suit = Boolean(normalizedData.visualizacion_suit)
        }
        // If it's already a boolean, keep it as is for the visualization flag
      }

      if ('visualizacion_gov' in normalizedData) {
        if (typeof normalizedData.visualizacion_gov === 'string') {
          // URL string value goes to url_gov column
          normalizedData.url_gov = normalizedData.visualizacion_gov
          // Set visualization flag based on whether URL is provided
          normalizedData.visualizacion_gov = Boolean(normalizedData.visualizacion_gov)
        }
        // If it's already a boolean, keep it as is for the visualization flag
      }

      // Clean up undefined values to avoid database issues
      const cleanedData = Object.fromEntries(
        Object.entries(normalizedData).filter(([_, value]) => value !== undefined)
      )

      // Prepare data for update
      const updatePayload: any = {
        ...cleanedData,
        requisitos: normalizedData.requisitos || null,
        instrucciones: normalizedData.instrucciones || null,
        updated_at: new Date().toISOString()
      }

      console.log('🔧 Final update payload:', updatePayload)

      // Log URL field mapping results for debugging
      if (updatePayload.url_suit || updatePayload.url_gov || updatePayload.visualizacion_suit !== undefined || updatePayload.visualizacion_gov !== undefined) {
        console.log('🔗 URL mapping results:', {
          url_suit: updatePayload.url_suit,
          url_gov: updatePayload.url_gov,
          visualizacion_suit: updatePayload.visualizacion_suit,
          visualizacion_gov: updatePayload.visualizacion_gov
        })
      }

      // Perform the update
      const { data: result, error } = await supabase
        .from('servicios')
        .update(updatePayload)
        .eq('id', id)
        .select(`
          *,
          dependencia:dependencias(id, nombre),
          subdependencia:subdependencias(id, nombre)
        `)
        .single()

      if (error) {
        console.error('❌ Database update error:', error)

        // Provide specific error message for boolean type mismatch (the original issue)
        if (error.message && error.message.includes('invalid input syntax for type boolean')) {
          console.error('🔗 URL field mapping error detected. This usually means URL strings are being sent to boolean columns.')
          console.error('🔧 Check that visualizacion_suit/visualizacion_gov form fields are properly mapped to url_suit/url_gov database columns.')
          throw new Error(`Database field type mismatch: ${error.message}. This is likely a URL field mapping issue where string values are being sent to boolean columns.`)
        }

        throw new Error(`Error updating service: ${error.message}`)
      }

      if (!result) {
        throw new Error('Update operation completed but no data was returned')
      }

      console.log('✅ Service updated successfully:', result.id)

      // Validate updated service data
      const validation = this.validateServiceData(result)
      if (!validation.isValid) {
        console.warn('⚠️ Service validation warnings:', validation.errors)
      }

      // Sync with original tables (tramites/opas) for data consistency
      await this.syncToOriginalTables(result)

      return this.transformServiceItem(result)
    } catch (error) {
      console.error('❌ Error in service update:', error)
      throw error
    }
  }

  /**
   * Delete a service
   */
  async delete(id: string, type?: 'tramite' | 'opa'): Promise<void> {
    try {
      // Only use ID for deletion since it's unique
      // The type parameter is kept for backward compatibility but not used in the query
      const { error } = await supabase
        .from('servicios')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Error deleting service: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in service deletion:', error)
      throw error
    }
  }

  /**
   * Generate automatic service code
   */
  private async generateServiceCode(subdependenciaId: string, tipoServicio: 'tramite' | 'opa'): Promise<string> {
    try {
      // Get subdependencia and dependencia codes
      const { data: subdep, error: subdepError } = await supabase
        .from('subdependencias')
        .select(`
          codigo,
          dependencias(codigo)
        `)
        .eq('id', subdependenciaId)
        .single()

      if (subdepError || !subdep) {
        throw new Error('Subdependencia not found')
      }

      const depCode = subdep.dependencias?.codigo || '000'
      const subdepCode = subdep.codigo || '000'

      // Get all existing services for this subdependencia to find the highest consecutive number
      const { data: existingServices, error: countError } = await supabase
        .from('servicios')
        .select('codigo')
        .eq('subdependencia_id', subdependenciaId)
        .not('codigo', 'is', null)

      if (countError) {
        throw new Error('Error counting existing services')
      }

      let maxNumber = 0
      const expectedPrefix = `${depCode}-${subdepCode}-`

      // Find the highest consecutive number for codes that match our format
      if (existingServices && existingServices.length > 0) {
        for (const service of existingServices) {
          if (service.codigo && service.codigo.startsWith(expectedPrefix)) {
            const parts = service.codigo.split('-')
            if (parts.length === 3) {
              const number = parseInt(parts[2], 10)
              if (!isNaN(number) && number > maxNumber) {
                maxNumber = number
              }
            }
          }
        }
      }

      // Generate next consecutive number
      const nextNumber = maxNumber + 1
      const consecutiveStr = nextNumber.toString().padStart(3, '0')
      const newCode = `${depCode}-${subdepCode}-${consecutiveStr}`

      // Double-check that this code doesn't already exist
      const { data: existingCode, error: checkError } = await supabase
        .from('servicios')
        .select('id')
        .eq('codigo', newCode)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error('Error checking code uniqueness')
      }

      if (existingCode) {
        // If code exists, use timestamp-based fallback
        const timestamp = Date.now().toString().slice(-6)
        return `${depCode}-${subdepCode}-${timestamp}`
      }

      return newCode
    } catch (error) {
      console.error('Error generating service code:', error)
      // Fallback to timestamp-based code
      const timestamp = Date.now().toString().slice(-6)
      return `GEN-${tipoServicio.toUpperCase()}-${timestamp}`
    }
  }

  /**
   * Transform raw service data to UnifiedServiceItem
   */
  private transformServiceItem(item: any): UnifiedServiceItem {
    return {
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      tipo_servicio: item.tipo_servicio,
      categoria: item.categoria,
      dependencia_id: item.dependencia_id,
      subdependencia_id: item.subdependencia_id,
      dependencia: {
        id: item.dependencia?.id || item.dependencia_id,
        nombre: item.dependencia?.nombre || 'Sin dependencia'
      },
      subdependencia: {
        id: item.subdependencia?.id || item.subdependencia_id,
        nombre: item.subdependencia?.nombre || 'Sin subdependencia'
      },
      requiere_pago: item.requiere_pago,
      tiempo_respuesta: item.tiempo_respuesta,
      activo: item.activo,
      requisitos: Array.isArray(item.requisitos) ? item.requisitos : [],
      instrucciones: Array.isArray(item.instrucciones) ? item.instrucciones : [],
      url_suit: item.url_suit,
      url_gov: item.url_gov,
      visualizacion_suit: item.visualizacion_suit,
      visualizacion_gov: item.visualizacion_gov,
      created_at: item.created_at,
      updated_at: item.updated_at
    }
  }

  /**
   * Validate service data for consistency
   */
  private validateServiceData(service: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!service.nombre || service.nombre.trim() === '') {
      errors.push('Service name is required')
    }

    if (!service.codigo || service.codigo.trim() === '') {
      errors.push('Service code is required')
    }

    if (!service.subdependencia_id) {
      errors.push('Subdependencia ID is required')
    }

    if (!service.dependencia_id) {
      errors.push('Dependencia ID is required')
    }

    if (service.tipo_servicio && !['tramite', 'opa', 'servicio'].includes(service.tipo_servicio)) {
      errors.push('Invalid service type')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Synchronize servicios table data with original tramites/opas tables
   * This ensures data consistency between the unified table and original tables
   */
  private async syncToOriginalTables(service: any): Promise<void> {
    try {
      console.log('🔄 [SYNC] Starting synchronization for service:', {
        id: service.id,
        codigo: service.codigo,
        nombre: service.nombre,
        tipo_servicio: service.tipo_servicio,
        requisitos_count: service.requisitos?.length || 0,
        instrucciones_count: service.instrucciones?.length || 0
      })

      if (service.tipo_servicio === 'tramite') {
        // Find corresponding tramite by codigo
        const { data: tramite, error: findError } = await supabase
          .from('tramites')
          .select('id, codigo_unico')
          .eq('codigo_unico', service.codigo)
          .single()

        if (findError && findError.code !== 'PGRST116') {
          console.error('🚨 [SYNC] Error finding tramite:', findError)
          return
        }

        if (tramite) {
          console.log('📋 [SYNC] Found tramite to update:', tramite.id, tramite.codigo_unico)
          // Update tramite with synchronized data
          const { error: updateError } = await supabase
            .from('tramites')
            .update({
              nombre: service.nombre,
              descripcion: service.descripcion,
              requisitos: service.requisitos || [],
              instructivo: service.instrucciones || [], // Map instrucciones to instructivo
              tiempo_respuesta: service.tiempo_respuesta,
              tiene_pago: service.requiere_pago,
              visualizacion_suit: service.url_suit || '',
              visualizacion_gov: service.url_gov || '',
              activo: service.activo,
              updated_at: new Date().toISOString()
            })
            .eq('id', tramite.id)

          if (updateError) {
            console.error('🚨 [SYNC] Error updating tramite:', updateError)
          } else {
            console.log('✅ [SYNC] Tramite synchronized successfully:', {
              id: tramite.id,
              codigo: service.codigo,
              requisitos_synced: service.requisitos?.length || 0,
              instructivo_synced: service.instrucciones?.length || 0
            })
          }
        }
      } else if (service.tipo_servicio === 'opa') {
        // Find corresponding OPA by codigo
        const { data: opa, error: findError } = await supabase
          .from('opas')
          .select('id, codigo_opa')
          .eq('codigo_opa', service.codigo)
          .single()

        if (findError && findError.code !== 'PGRST116') {
          console.error('🚨 [SYNC] Error finding OPA:', findError)
          return
        }

        if (opa) {
          console.log('⚡ [SYNC] Found OPA to update:', opa.id, opa.codigo_opa)
          // Update OPA with synchronized data
          const { error: updateError } = await supabase
            .from('opas')
            .update({
              nombre: service.nombre,
              descripcion: service.descripcion,
              requisitos: service.requisitos || [],
              instructivo: service.instrucciones || [], // Map instrucciones to instructivo
              tiempo_respuesta: service.tiempo_respuesta,
              tiene_pago: service.requiere_pago,
              visualizacion_suit: service.url_suit || '',
              visualizacion_gov: service.url_gov || '',
              activo: service.activo,
              updated_at: new Date().toISOString()
            })
            .eq('id', opa.id)

          if (updateError) {
            console.error('🚨 [SYNC] Error updating OPA:', updateError)
          } else {
            console.log('✅ [SYNC] OPA synchronized successfully:', {
              id: opa.id,
              codigo: service.codigo,
              requisitos_synced: service.requisitos?.length || 0,
              instructivo_synced: service.instrucciones?.length || 0
            })
          }
        } else {
          console.log('⚠️ [SYNC] No corresponding OPA found for codigo:', service.codigo)
        }
      } else {
        console.log('⚠️ [SYNC] Unknown service type:', service.tipo_servicio)
      }

      console.log('🏁 [SYNC] Synchronization completed for service:', service.id)
    } catch (error) {
      console.error('🚨 [SYNC] Error in syncToOriginalTables:', error)
      // Don't throw error to avoid breaking the main update operation
    }
  }
}

// Export singleton instance
export const unifiedServicesService = new UnifiedServicesService()
