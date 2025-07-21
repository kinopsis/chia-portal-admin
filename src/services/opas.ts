// Service for managing OPAs (Órdenes de Pago y Autorización)

import { supabase } from '@/lib/supabase/client'
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
  async getAll(filters?: SearchFilters & { page?: number; limit?: number }) {
    let query = supabase
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
      `,
        { count: 'exact' }
      )
      .order('nombre', { ascending: true })

    // Apply filters
    if (filters?.query) {
      query = query.or(`nombre.ilike.%${filters.query}%,codigo_opa.ilike.%${filters.query}%`)
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
      throw new Error(`Error fetching OPAs: ${error.message}`)
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
      .eq('activa', true)
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
        subdependencias (
          nombre,
          dependencias (
            nombre
          )
        )
      `
      )
      .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .eq('activa', true)
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
