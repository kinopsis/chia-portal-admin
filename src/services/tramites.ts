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
