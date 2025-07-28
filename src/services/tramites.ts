// Service for managing Tramites

import { supabase } from '@/lib/supabase/client'
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
  async getAll(filters?: SearchFilters & { page?: number; limit?: number }) {
    let query = supabase
      .from('tramites')
      .select(
        `
        *,
        requisitos,
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
    if (filters?.query) {
      query = query.or(`nombre.ilike.%${filters.query}%,formulario.ilike.%${filters.query}%`)
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

    return {
      data: data || [],
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
    const { data, error } = await supabase
      .from('tramites')
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
      .or(`nombre.ilike.%${query}%,formulario.ilike.%${query}%`)
      .eq('activo', true)
      .limit(limit)

    if (error) {
      throw new Error(`Error searching tramites: ${error.message}`)
    }

    return data as Tramite[]
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
