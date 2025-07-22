// Service for managing Subdependencias

import { supabase } from '@/lib/supabase/client'
import type { Subdependencia, SearchFilters, PaginatedResponse } from '@/types'

// Server-side service functions
export class SubdependenciasServerService {
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
export class SubdependenciasClientService {
  async getAll(
    filters?: SearchFilters & { page?: number; limit?: number; dependencia_id?: string }
  ) {
    let query = supabase
      .from('subdependencias')
      .select(
        `
        *,
        dependencias (
          id,
          nombre
        )
      `,
        { count: 'exact' }
      )
      .order('nombre', { ascending: true })

    // Apply filters
    if (filters?.query) {
      query = query.or(`nombre.ilike.%${filters.query}%,descripcion.ilike.%${filters.query}%`)
    }

    if (filters?.dependencia_id) {
      query = query.eq('dependencia_id', filters.dependencia_id)
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
      throw new Error(`Error fetching subdependencias: ${error.message}`)
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
    } as PaginatedResponse<Subdependencia>
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('subdependencias')
      .select(
        `
        *,
        dependencias (
          id,
          nombre
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching subdependencia: ${error.message}`)
    }

    return data as Subdependencia
  }

  async getActive() {
    const { data, error } = await supabase
      .from('subdependencias')
      .select(
        `
        *,
        dependencias (
          id,
          nombre
        )
      `
      )
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`Error fetching active subdependencias: ${error.message}`)
    }

    return data as Subdependencia[]
  }

  async getByDependencia(dependenciaId: string) {
    const { data, error } = await supabase
      .from('subdependencias')
      .select('*')
      .eq('dependencia_id', dependenciaId)
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`Error fetching subdependencias by dependencia: ${error.message}`)
    }

    return data as Subdependencia[]
  }

  async create(subdependenciaData: Omit<Subdependencia, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('subdependencias')
      .insert([subdependenciaData])
      .select(
        `
        *,
        dependencias (
          id,
          nombre
        )
      `
      )
      .single()

    if (error) {
      throw new Error(`Error creating subdependencia: ${error.message}`)
    }

    return data as Subdependencia
  }

  async update(
    id: string,
    updates: Partial<Omit<Subdependencia, 'id' | 'created_at' | 'updated_at'>>
  ) {
    const { data, error } = await supabase
      .from('subdependencias')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        dependencias (
          id,
          nombre
        )
      `
      )
      .single()

    if (error) {
      throw new Error(`Error updating subdependencia: ${error.message}`)
    }

    return data as Subdependencia
  }

  async delete(id: string) {
    const { error } = await supabase.from('subdependencias').delete().eq('id', id)

    if (error) {
      throw new Error(`Error deleting subdependencia: ${error.message}`)
    }

    return { success: true }
  }

  async search(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('subdependencias')
      .select(
        `
        *,
        dependencias (
          id,
          nombre
        )
      `
      )
      .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .eq('activo', true)
      .limit(limit)

    if (error) {
      throw new Error(`Error searching subdependencias: ${error.message}`)
    }

    return data as Subdependencia[]
  }
}

// Export service instances
export const subdependenciasServerService = new SubdependenciasServerService()
export const subdependenciasClientService = new SubdependenciasClientService()
