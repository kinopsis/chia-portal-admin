// Service for managing Dependencias

import { supabase } from '@/lib/supabase/client'
import type { Dependencia, SearchFilters, PaginatedResponse } from '@/types'

// Client-side service functions
export class DependenciasClientService {
  async getAll(filters?: SearchFilters & { page?: number; limit?: number }) {
    let query = supabase
      .from('dependencias')
      .select('*', { count: 'exact' })
      .order('nombre', { ascending: true })

    // Apply filters
    if (filters?.query) {
      query = query.or(`nombre.ilike.%${filters.query}%,descripcion.ilike.%${filters.query}%`)
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
      throw new Error(`Error fetching dependencias: ${error.message}`)
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
    } as PaginatedResponse<Dependencia>
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('dependencias')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching dependencia: ${error.message}`)
    }

    return data as Dependencia
  }

  async getActive() {
    const { data, error } = await supabase
      .from('dependencias')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`Error fetching active dependencias: ${error.message}`)
    }

    return data as Dependencia[]
  }

  async create(dependencia: Omit<Dependencia, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('dependencias')
      .insert(dependencia)
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating dependencia: ${error.message}`)
    }

    return data as Dependencia
  }

  async update(id: string, updates: Partial<Omit<Dependencia, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('dependencias')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating dependencia: ${error.message}`)
    }

    return data as Dependencia
  }

  async delete(id: string) {
    const { error } = await supabase
      .from('dependencias')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting dependencia: ${error.message}`)
    }

    return { success: true }
  }
}

// Export service instance
export const dependenciasClientService = new DependenciasClientService()
