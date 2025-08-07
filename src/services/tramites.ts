// Service for managing Tramites

import { supabase } from '@/lib/supabase/client'
import { normalizeSpanishText } from '@/lib/utils'
import type { Tramite, SearchFilters, PaginatedResponse } from '@/types'
import { getTramitesSelectQuery } from './databaseHelper'

// Server-side service functions
export class TramitesServerService {
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
export class TramitesClientService {
  async getAll(filters?: SearchFilters & { page?: number; limit?: number; modalidad?: string; categoria?: string }) {
    let query = supabase
      .from('tramites')
      .select(
        `
        *,
        requisitos,
        instructivo,
        modalidad,
        categoria,
        observaciones,
        visualizacion_suit,
        visualizacion_gov,
        subdependencias (
          id,
          nombre,
          dependencias (
            id,
            nombre
          )
        )
      `,
        { count: 'exact' }
      )
      .order('nombre', { ascending: true })

    // Apply filters
    // UX-001: Enhanced search with accent normalization
    if (filters?.query) {
      // Use both database search (for performance) and client-side normalization (for accuracy)
      const normalizedQuery = normalizeSpanishText(filters.query)

      // Create broader database search using prefixes to catch accent variations
      // For words longer than 4 characters, use a prefix approach to cast a wider net
      const searchTerms = filters.query.split(' ').map(term => {
        if (term.length > 4) {
          return term.substring(0, Math.max(4, Math.floor(term.length * 0.7)))
        }
        return term
      })

      const prefixQueries = searchTerms.map(term =>
        `nombre.ilike.%${term}%,formulario.ilike.%${term}%`
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
        console.log('Processing dependencia_id filter:', dependenciaId, typeof dependenciaId)

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
            console.log(`Found ${subdeps.length} subdependencias, filtering tramites`)
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

    // NEW FILTERS: Add filtering by new fields
    if (filters?.modalidad) {
      query = query.eq('modalidad', filters.modalidad)
    }

    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria)
    }

    // Apply pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching tramites: ${error.message}`)
    }

    let filteredData = data || []

    // UX-001: Apply client-side accent-insensitive filtering for comprehensive search
    const clientSearchQuery = (query as any)._clientSearchQuery
    const originalQuery = (query as any)._originalQuery

    if ((clientSearchQuery || originalQuery) && filteredData.length > 0) {
      filteredData = filteredData.filter((tramite: Tramite) => {
        const normalizedNombre = normalizeSpanishText(tramite.nombre || '')
        const normalizedFormulario = normalizeSpanishText(tramite.formulario || '')
        const normalizedOriginalQuery = normalizeSpanishText(originalQuery || '')

        // Check if any of the search terms match
        return normalizedNombre.includes(clientSearchQuery || '') ||
               normalizedFormulario.includes(clientSearchQuery || '') ||
               normalizedNombre.includes(normalizedOriginalQuery) ||
               normalizedFormulario.includes(normalizedOriginalQuery) ||
               (tramite.nombre || '').toLowerCase().includes((originalQuery || '').toLowerCase()) ||
               (tramite.formulario || '').toLowerCase().includes((originalQuery || '').toLowerCase())
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
    } as PaginatedResponse<Tramite>
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tramites')
      .select(
        `
        *,
        instructivo,
        modalidad,
        categoria,
        observaciones,
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
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching tramite: ${error.message}`)
    }

    return data as Tramite
  }

  async getActive() {
    const { data, error } = await supabase
      .from('tramites')
      .select(
        `
        *,
        instructivo,
        modalidad,
        categoria,
        observaciones,
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
      throw new Error(`Error fetching active tramites: ${error.message}`)
    }

    return data as Tramite[]
  }

  async search(query: string, limit = 10) {
    // Apply accent normalization for comprehensive search
    const normalizedQuery = normalizeSpanishText(query)

    // Create broader database search using prefixes to catch accent variations
    const searchTerms = query.split(' ').map(term => {
      if (term.length > 4) {
        return term.substring(0, Math.max(4, Math.floor(term.length * 0.7)))
      }
      return term
    })

    const prefixQueries = searchTerms.map(term =>
      `nombre.ilike.%${term}%,formulario.ilike.%${term}%,categoria.ilike.%${term}%,observaciones.ilike.%${term}%`
    ).join(',')

    const { data, error } = await supabase
      .from('tramites')
      .select(
        `
        *,
        instructivo,
        modalidad,
        categoria,
        observaciones,
        subdependencias (
          nombre,
          dependencias (
            nombre
          )
        )
      `
      )
      .or(prefixQueries)
      .eq('activo', true)
      .limit(limit * 3) // Get more results to account for client-side filtering

    if (error) {
      throw new Error(`Error searching tramites: ${error.message}`)
    }

    let filteredData = data || []

    // UX-001: Apply client-side accent-insensitive filtering for comprehensive search
    if (query && filteredData.length > 0) {
      filteredData = filteredData.filter((tramite: Tramite) => {
        const normalizedNombre = normalizeSpanishText(tramite.nombre || '')
        const normalizedFormulario = normalizeSpanishText(tramite.formulario || '')

        return normalizedNombre.includes(normalizedQuery) ||
               normalizedFormulario.includes(normalizedQuery) ||
               (tramite.nombre || '').toLowerCase().includes(query.toLowerCase()) ||
               (tramite.formulario || '').toLowerCase().includes(query.toLowerCase())
      })
    }

    // Limit results after filtering
    return filteredData.slice(0, limit) as Tramite[]
  }

  async create(tramite: Omit<Tramite, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('tramites').insert(tramite).select().single()

    if (error) {
      throw new Error(`Error creating tramite: ${error.message}`)
    }

    return data as Tramite
  }

  async update(id: string, updates: Partial<Omit<Tramite, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('tramites')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating tramite: ${error.message}`)
    }

    return data as Tramite
  }

  async delete(id: string) {
    const { error } = await supabase.from('tramites').delete().eq('id', id)

    if (error) {
      throw new Error(`Error deleting tramite: ${error.message}`)
    }

    return { success: true }
  }
}

// Export service instances
export const tramitesServerService = new TramitesServerService()
export const tramitesClientService = new TramitesClientService()
