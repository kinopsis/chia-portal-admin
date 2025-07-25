// Unified Search Service for Global Portal Search
// Combines Trámites, OPAs, and FAQs into single search interface

import { tramitesClientService } from './tramites'
import { opasClientService } from './opas'
import { faqsClientService } from './faqs'
import type { Tramite, OPA, FAQ } from '@/types'

// Unified search result interface
export interface UnifiedSearchResult {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  tipo: 'tramite' | 'opa' | 'faq'
  dependencia: string
  subdependencia?: string
  categoria?: string // For FAQs
  costo?: number
  tiempo_estimado?: string
  estado: 'activo' | 'inactivo'
  tags: string[]
  vistas?: number // For FAQs
  created_at: string
  // Original data for detailed view
  originalData: Tramite | OPA | FAQ
}

// Search filters for unified search
export interface UnifiedSearchFilters {
  query?: string
  tipo?: 'tramite' | 'opa' | 'faq' | ''
  dependencia?: string
  subdependenciaId?: string  // NEW: Filter by subdependencia ID (for uniqueness)
  tipoPago?: 'gratuito' | 'con_pago' | ''  // NEW: Filter by payment type (replaces estado)
  page?: number
  limit?: number
}

// Paginated response for unified search
export interface UnifiedSearchResponse {
  data: UnifiedSearchResult[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}

export class UnifiedSearchService {
  /**
   * Perform unified search across Trámites, OPAs, and FAQs
   */
  async search(filters: UnifiedSearchFilters = {}): Promise<UnifiedSearchResponse> {
    try {
      // Check if we're in a build environment and return mock data
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        return {
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          }
        }
      }

      const {
        query = '',
        tipo = '',
        dependencia = '',
        subdependenciaId = '',  // NEW: Extract subdependencia ID filter
        tipoPago = '',          // NEW: Extract payment type filter
        page = 1,
        limit = 10
      } = filters

      // Prepare search filters for each service
      const searchFilters = {
        query,
        page: 1, // Get all results first, then paginate unified results
        limit: 1000 // Large limit to get comprehensive results
      }

      // Execute parallel searches based on tipo filter
      const searchPromises: Promise<any>[] = []

      if (!tipo || tipo === 'tramite') {
        searchPromises.push(
          tramitesClientService.getAll(searchFilters).catch(error => {
            console.error('Error searching tramites:', error)
            return { data: [], pagination: { total: 0 } }
          })
        )
      } else {
        searchPromises.push(Promise.resolve({ data: [], pagination: { total: 0 } }))
      }

      if (!tipo || tipo === 'opa') {
        searchPromises.push(
          opasClientService.getAll(searchFilters).catch(error => {
            console.error('Error searching OPAs:', error)
            return { data: [], pagination: { total: 0 } }
          })
        )
      } else {
        searchPromises.push(Promise.resolve({ data: [], pagination: { total: 0 } }))
      }

      if (!tipo || tipo === 'faq') {
        searchPromises.push(
          faqsClientService.getAll(searchFilters).catch(error => {
            console.error('Error searching FAQs:', error)
            return { data: [], pagination: { total: 0 } }
          })
        )
      } else {
        searchPromises.push(Promise.resolve({ data: [], pagination: { total: 0 } }))
      }

      // Wait for all searches to complete
      const [tramitesResult, opasResult, faqsResult] = await Promise.all(searchPromises)

      // Normalize and combine results
      const unifiedResults: UnifiedSearchResult[] = []

      // Process Trámites
      if (tramitesResult.data) {
        tramitesResult.data.forEach((tramite: Tramite) => {
          const dependenciaNombre = tramite.subdependencias?.dependencias?.nombre || 'Sin dependencia'
          const subdependenciaNombre = tramite.subdependencias?.nombre || ''

          // Apply dependencia filter
          if (dependencia && dependenciaNombre !== dependencia) return

          // Apply subdependencia filter (NEW) - using ID for uniqueness
          if (subdependenciaId && tramite.subdependencia_id !== subdependenciaId) return

          // Apply payment type filter (NEW)
          if (tipoPago) {
            if (tipoPago === 'gratuito' && tramite.tiene_pago !== false) return
            if (tipoPago === 'con_pago' && tramite.tiene_pago !== true) return
          }

          // PHASE 3 COMPLETED: Using real database data
          unifiedResults.push({
            id: tramite.id,
            codigo: tramite.codigo_unico,
            nombre: tramite.nombre,
            descripcion: tramite.formulario || 'Trámite municipal',
            tipo: 'tramite',
            dependencia: dependenciaNombre,
            subdependencia: subdependenciaNombre,
            tiempo_estimado: tramite.tiempo_respuesta,
            estado: tramite.activo ? 'activo' : 'inactivo',
            tags: [
              'tramite',
              tramite.tiene_pago ? 'pago' : 'gratuito',
              subdependenciaNombre.toLowerCase() || ''
            ].filter(Boolean),
            created_at: tramite.created_at,
            originalData: {
              ...tramite,
              // Use real requisitos from database
              requisitos: tramite.requisitos || [],
              // Use real government portal URLs from database
              visualizacion_suit: tramite.visualizacion_suit,
              visualizacion_gov: tramite.visualizacion_gov
            }
          })
        })
      }

      // Process OPAs
      if (opasResult.data) {
        opasResult.data.forEach((opa: OPA) => {
          const dependenciaNombre = opa.subdependencias?.dependencias?.nombre || 'Sin dependencia'
          const subdependenciaNombre = opa.subdependencias?.nombre || ''

          // Apply dependencia filter
          if (dependencia && dependenciaNombre !== dependencia) return

          // Apply subdependencia filter (NEW) - using ID for uniqueness
          if (subdependenciaId && opa.subdependencia_id !== subdependenciaId) return

          // Use actual description if available, otherwise create a meaningful fallback
          const descripcionText = opa.descripcion ||
            `Servicio administrativo para ${opa.nombre.toLowerCase()}. Disponible en ${subdependenciaNombre || dependenciaNombre}.`

          unifiedResults.push({
            id: opa.id,
            codigo: opa.codigo_opa,
            nombre: opa.nombre,
            descripcion: descripcionText,
            tipo: 'opa',
            dependencia: dependenciaNombre,
            subdependencia: subdependenciaNombre,
            estado: opa.activo ? 'activo' : 'inactivo',
            tags: [
              'opa',
              'pago',
              'autorizacion',
              subdependenciaNombre.toLowerCase() || ''
            ].filter(Boolean),
            created_at: opa.created_at,
            originalData: opa
          })
        })
      }

      // Process FAQs
      if (faqsResult.data) {
        faqsResult.data.forEach((faq: FAQ) => {
          const dependenciaNombre = faq.dependencias?.nombre || 'Sin dependencia'
          
          // Apply dependencia filter
          if (dependencia && dependenciaNombre !== dependencia) return

          unifiedResults.push({
            id: faq.id,
            codigo: `FAQ-${faq.id.slice(0, 8)}`,
            nombre: faq.pregunta,
            descripcion: faq.respuesta,
            tipo: 'faq',
            dependencia: dependenciaNombre,
            categoria: faq.tema,
            estado: faq.activo ? 'activo' : 'inactivo',
            tags: [
              'faq',
              'pregunta',
              'ayuda',
              faq.tema?.toLowerCase() || '',
              faq.dependencias?.nombre?.toLowerCase() || ''
            ].filter(Boolean),
            vistas: 0, // TODO: Implement real view tracking
            created_at: faq.created_at,
            originalData: faq
          })
        })
      }

      // Sort by relevance (exact matches first, then partial matches)
      if (query) {
        unifiedResults.sort((a, b) => {
          const aExactMatch = a.nombre.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
          const bExactMatch = b.nombre.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
          
          if (aExactMatch !== bExactMatch) {
            return bExactMatch - aExactMatch
          }
          
          // Secondary sort by creation date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      } else {
        // Default sort by creation date (newest first)
        unifiedResults.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }

      // Apply pagination to unified results
      const total = unifiedResults.length
      const totalPages = Math.ceil(total / limit)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedResults = unifiedResults.slice(startIndex, endIndex)

      return {
        data: paginatedResults,
        pagination: {
          page,
          limit,
          total,
          totalPages
        },
        success: true
      }

    } catch (error) {
      console.error('Error in unified search:', error)
      throw new Error(`Unified search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get quick search suggestions
   */
  async getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
    try {
      if (!query || query.length < 2) return []

      const results = await this.search({ query, limit: 20 })
      
      // Extract unique suggestions from results
      const suggestions = new Set<string>()
      
      results.data.forEach(item => {
        // Add exact name matches
        if (item.nombre.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(item.nombre)
        }
        
        // Add relevant tags
        item.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase()) && tag.length > 2) {
            suggestions.add(tag)
          }
        })
      })

      return Array.from(suggestions).slice(0, limit)
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  /**
   * Perform search across Trámites and OPAs only (excludes FAQs)
   * Used specifically for the /tramites page
   */
  async searchTramitesAndOpas(filters: UnifiedSearchFilters = {}): Promise<UnifiedSearchResponse> {
    try {
      // Check if we're in a build environment and return mock data
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        return {
          data: [],
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 10,
            total: 0,
            totalPages: 0
          },
          success: true
        }
      }

      const { query, tipo, dependencia, subdependenciaId, tipoPago, page = 1, limit = 10 } = filters

      // Prepare search filters for individual services
      const searchFilters = {
        query,
        dependencia,
        page: 1, // Get all results first, then paginate
        limit: 10000 // Large limit to get all results
      }

      // Only search Trámites and OPAs (exclude FAQs)
      const searchPromises: Promise<any>[] = []

      // Search Trámites
      if (!tipo || tipo === 'tramite') {
        searchPromises.push(
          tramitesClientService.getAll(searchFilters).catch(error => {
            console.error('Error searching Trámites:', error)
            return { data: [], pagination: { total: 0 } }
          })
        )
      } else {
        searchPromises.push(Promise.resolve({ data: [], pagination: { total: 0 } }))
      }

      // Search OPAs
      if (!tipo || tipo === 'opa') {
        searchPromises.push(
          opasClientService.getAll(searchFilters).catch(error => {
            console.error('Error searching OPAs:', error)
            return { data: [], pagination: { total: 0 } }
          })
        )
      } else {
        searchPromises.push(Promise.resolve({ data: [], pagination: { total: 0 } }))
      }

      // Wait for searches to complete (only Trámites and OPAs)
      const [tramitesResult, opasResult] = await Promise.all(searchPromises)

      // Normalize and combine results
      const unifiedResults: UnifiedSearchResult[] = []

      // Process Trámites (same logic as original)
      if (tramitesResult.data) {
        tramitesResult.data.forEach((tramite: Tramite) => {
          const dependenciaNombre = tramite.subdependencias?.dependencias?.nombre || 'Sin dependencia'
          const subdependenciaNombre = tramite.subdependencias?.nombre || ''

          // Apply dependencia filter
          if (dependencia && dependenciaNombre !== dependencia) return

          // Apply subdependencia filter (NEW) - using ID for uniqueness
          if (subdependenciaId && tramite.subdependencia_id !== subdependenciaId) return

          // Apply payment type filter (NEW)
          if (tipoPago) {
            if (tipoPago === 'gratuito' && tramite.tiene_pago !== false) return
            if (tipoPago === 'con_pago' && tramite.tiene_pago !== true) return
          }

          unifiedResults.push({
            id: tramite.id,
            codigo: tramite.codigo_unico,
            nombre: tramite.nombre,
            descripcion: tramite.formulario || 'Trámite municipal',
            tipo: 'tramite',
            dependencia: dependenciaNombre,
            subdependencia: subdependenciaNombre,
            tiempo_estimado: tramite.tiempo_respuesta,
            estado: tramite.activo ? 'activo' : 'inactivo',
            tags: [
              'tramite',
              tramite.tiene_pago ? 'pago' : 'gratuito',
              subdependenciaNombre.toLowerCase() || ''
            ].filter(Boolean),
            created_at: tramite.created_at,
            originalData: {
              ...tramite,
              requisitos: tramite.requisitos || [],
              visualizacion_suit: tramite.visualizacion_suit,
              visualizacion_gov: tramite.visualizacion_gov
            }
          })
        })
      }

      // Process OPAs (same logic as original)
      if (opasResult.data) {
        opasResult.data.forEach((opa: OPA) => {
          const dependenciaNombre = opa.subdependencias?.dependencias?.nombre || 'Sin dependencia'
          const subdependenciaNombre = opa.subdependencias?.nombre || ''

          // Apply dependencia filter
          if (dependencia && dependenciaNombre !== dependencia) return

          // Apply subdependencia filter (NEW) - using ID for uniqueness
          if (subdependenciaId && opa.subdependencia_id !== subdependenciaId) return

          const descripcionText = opa.descripcion ||
            `Servicio administrativo para ${opa.nombre.toLowerCase()}. Disponible en ${subdependenciaNombre || dependenciaNombre}.`

          unifiedResults.push({
            id: opa.id,
            codigo: opa.codigo_opa,
            nombre: opa.nombre,
            descripcion: descripcionText,
            tipo: 'opa',
            dependencia: dependenciaNombre,
            subdependencia: subdependenciaNombre,
            estado: opa.activo ? 'activo' : 'inactivo',
            tags: [
              'opa',
              'pago',
              'autorizacion',
              subdependenciaNombre.toLowerCase() || ''
            ].filter(Boolean),
            created_at: opa.created_at,
            originalData: opa
          })
        })
      }

      // Sort by relevance (same logic as original)
      if (query) {
        unifiedResults.sort((a, b) => {
          const queryLower = query.toLowerCase()

          const aExactMatch = a.nombre.toLowerCase().includes(queryLower) ||
                             a.codigo.toLowerCase().includes(queryLower)
          const bExactMatch = b.nombre.toLowerCase().includes(queryLower) ||
                             b.codigo.toLowerCase().includes(queryLower)

          if (aExactMatch && !bExactMatch) return -1
          if (!aExactMatch && bExactMatch) return 1

          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      } else {
        unifiedResults.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedResults = unifiedResults.slice(startIndex, endIndex)

      return {
        data: paginatedResults,
        pagination: {
          page,
          limit,
          total: unifiedResults.length,
          totalPages: Math.ceil(unifiedResults.length / limit)
        },
        success: true
      }

    } catch (error) {
      console.error('Error in unified search (Trámites and OPAs only):', error)
      return {
        data: [],
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: 0,
          totalPages: 0
        },
        success: false
      }
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<{
    totalTramites: number
    totalOpas: number
    totalFaqs: number
    totalActive: number
  }> {
    try {
      const results = await this.search({ limit: 10000 }) // Get all results
      
      const stats = {
        totalTramites: results.data.filter(item => item.tipo === 'tramite').length,
        totalOpas: results.data.filter(item => item.tipo === 'opa').length,
        totalFaqs: results.data.filter(item => item.tipo === 'faq').length,
        totalActive: results.data.filter(item => item.estado === 'activo').length
      }

      return stats
    } catch (error) {
      console.error('Error getting search stats:', error)
      return {
        totalTramites: 0,
        totalOpas: 0,
        totalFaqs: 0,
        totalActive: 0
      }
    }
  }
}

// Export service instance
export const unifiedSearchService = new UnifiedSearchService()
export default unifiedSearchService
