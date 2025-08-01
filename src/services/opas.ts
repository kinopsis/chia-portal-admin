// Service for managing OPAs (Órdenes de Pago y Autorización)

import { supabase } from '@/lib/supabase/client'
import { normalizeSpanishText } from '@/lib/utils'
import type { OPA, SearchFilters, PaginatedResponse } from '@/types'

// Server-side service functions
// Note: Server service temporarily disabled for client-side testing
export class OPAsServerService {
  // Placeholder class for server-side operations
  async getAll() {
    throw new Error('Server service not available in client-side context')
  }
  async getById() {
    throw new Error('Server service not available in client-side context')
  }
  async create() {
    throw new Error('Server service not available in client-side context')
  }
  async update() {
    throw new Error('Server service not available in client-side context')
  }
  async delete() {
    throw new Error('Server service not available in client-side context')
  }
}

// Client-side service functions
export class OPAsClientService {
  async getAll(filters?: SearchFilters & { page?: number; limit?: number; tiene_pago?: boolean }) {
    let query = supabase
      .from('opas')
      .select(
        `
        *,
        requisitos,
        visualizacion_suit,
        visualizacion_gov,
        subdependencias (
          id,
          codigo,
          nombre,
          dependencia_id,
          dependencias (
            id,
            codigo,
            nombre
          )
        )
      `,
        { count: 'exact' }
      )
      .order('nombre', { ascending: true })

    // Enhanced search including new fields
    // UX-001: Enhanced search with accent normalization
    if (filters?.query) {
      // Use both database search (for performance) and client-side normalization (for accuracy)
      const normalizedQuery = normalizeSpanishText(filters.query)

      // Create broader database search using prefixes to catch accent variations
      const searchTerms = filters.query.split(' ').map(term => {
        if (term.length > 4) {
          return term.substring(0, Math.max(4, Math.floor(term.length * 0.7)))
        }
        return term
      })

      const prefixQueries = searchTerms.map(term =>
        `nombre.ilike.%${term}%,descripcion.ilike.%${term}%,codigo_opa.ilike.%${term}%,formulario.ilike.%${term}%`
      ).join(',')

      // Database search - use prefix-based search to catch more potential matches
      query = query.or(prefixQueries)

      // Store original query for client-side filtering
      ;(query as any)._clientSearchQuery = normalizedQuery
      ;(query as any)._originalQuery = filters.query
    }

    if (filters?.dependencia_id) {
      try {
        // Convert to string and validate
        const dependenciaId = String(filters.dependencia_id).trim()
        console.log('Processing dependencia_id filter for OPAs:', dependenciaId, typeof dependenciaId)

        // Skip empty strings
        if (!dependenciaId) {
          console.log('Empty dependencia_id, skipping filter')
        } else if (!dependenciaId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          console.error('Invalid UUID format for dependencia_id:', dependenciaId)
          // Return empty result for invalid UUID
          query = query.eq('id', 'no-match')
        } else {
          console.log('Valid UUID, fetching subdependencias for dependencia:', dependenciaId)
          // First get subdependencias for this dependencia
          const { data: subdeps, error: subdepsError } = await supabase
            .from('subdependencias')
            .select('id')
            .eq('dependencia_id', dependenciaId)

          if (subdepsError) {
            console.error('Error fetching subdependencias:', subdepsError)
            // Return empty result on error
            query = query.eq('id', 'no-match')
          } else if (subdeps && subdeps.length > 0) {
            console.log(`Found ${subdeps.length} subdependencias, filtering OPAs`)
            const subdependenciaIds = subdeps.map(sub => sub.id)
            query = query.in('subdependencia_id', subdependenciaIds)
          } else {
            console.log('No subdependencias found for dependencia, returning empty result')
            // If no subdependencias found, return empty result
            query = query.eq('id', 'no-match')
          }
        }
      } catch (error) {
        console.error('Error processing dependencia_id filter:', error)
        // Return empty result on any error
        query = query.eq('id', 'no-match')
      }
    }

    if (filters?.subdependencia_id) {
      query = query.eq('subdependencia_id', filters.subdependencia_id)
    }

    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo)
    }

    // Add payment filter
    if (filters?.tiene_pago !== undefined) {
      query = query.eq('tiene_pago', filters.tiene_pago)
    }

    // Apply pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching OPAs: ${error.message}`)
    }

    let filteredData = data || []

    // UX-001: Apply client-side accent-insensitive filtering for comprehensive search
    const clientSearchQuery = (query as any)._clientSearchQuery
    const originalQuery = (query as any)._originalQuery

    if ((clientSearchQuery || originalQuery) && filteredData.length > 0) {
      filteredData = filteredData.filter((opa: OPA) => {
        const normalizedNombre = normalizeSpanishText(opa.nombre || '')
        const normalizedDescripcion = normalizeSpanishText(opa.descripcion || '')
        const normalizedFormulario = normalizeSpanishText(opa.formulario || '')
        const normalizedCodigo = normalizeSpanishText(opa.codigo_opa || '')
        const normalizedOriginalQuery = normalizeSpanishText(originalQuery || '')

        // Check if any of the search terms match
        return normalizedNombre.includes(clientSearchQuery || '') ||
               normalizedDescripcion.includes(clientSearchQuery || '') ||
               normalizedFormulario.includes(clientSearchQuery || '') ||
               normalizedCodigo.includes(clientSearchQuery || '') ||
               normalizedNombre.includes(normalizedOriginalQuery) ||
               normalizedDescripcion.includes(normalizedOriginalQuery) ||
               normalizedFormulario.includes(normalizedOriginalQuery) ||
               normalizedCodigo.includes(normalizedOriginalQuery) ||
               (opa.nombre || '').toLowerCase().includes((originalQuery || '').toLowerCase()) ||
               (opa.descripcion || '').toLowerCase().includes((originalQuery || '').toLowerCase()) ||
               (opa.formulario || '').toLowerCase().includes((originalQuery || '').toLowerCase()) ||
               (opa.codigo_opa || '').toLowerCase().includes((originalQuery || '').toLowerCase())
      })
    }

    return {
      data: filteredData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      success: true,
    } as PaginatedResponse<OPA>
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('opas')
      .select(
        `
        *,
        subdependencias (
          id,
          codigo,
          nombre,
          dependencia_id,
          dependencias (
            id,
            codigo,
            nombre
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching OPA: ${error.message}`)
    }

    return data as OPA
  }

  async getActive() {
    const { data, error } = await supabase
      .from('opas')
      .select(
        `
        *,
        subdependencias (
          nombre,
          dependencias (
            nombre
          )
        )
      `
      )
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`Error fetching active OPAs: ${error.message}`)
    }

    return data as OPA[]
  }

  async search(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('opas')
      .select(
        `
        *,
        requisitos,
        visualizacion_suit,
        visualizacion_gov,
        subdependencias (
          nombre,
          dependencias (
            nombre
          )
        )
      `
      )
      .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%,codigo_opa.ilike.%${query}%,formulario.ilike.%${query}%`)
      .eq('activo', true)
      .limit(limit)

    if (error) {
      throw new Error(`Error searching OPAs: ${error.message}`)
    }

    return data as OPA[]
  }

  async create(opa: Omit<OPA, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('opas')
      .insert(opa)
      .select(
        `
        *,
        subdependencias (
          id,
          nombre,
          dependencias (
            id,
            nombre
          )
        )
      `
      )
      .single()

    if (error) {
      throw new Error(`Error creating OPA: ${error.message}`)
    }

    return data as OPA
  }

  async update(id: string, updates: Partial<Omit<OPA, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('opas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(
        `
        *,
        subdependencias (
          id,
          nombre,
          dependencias (
            id,
            nombre
          )
        )
      `
      )
      .single()

    if (error) {
      throw new Error(`Error updating OPA: ${error.message}`)
    }

    return data as OPA
  }

  async delete(id: string) {
    const { error } = await supabase.from('opas').delete().eq('id', id)

    if (error) {
      throw new Error(`Error deleting OPA: ${error.message}`)
    }

    return { success: true }
  }
}

// Export service instances
export const opasServerService = new OPAsServerService()
export const opasClientService = new OPAsClientService()
