// Service for managing Dependencias

import { supabase } from '@/lib/supabase/client'
import type { Dependencia, SearchFilters, PaginatedResponse } from '@/types'

// Utility function for retrying failed requests
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        break
      }

      // Log retry attempt
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message)

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))

      // Exponential backoff
      delay *= 2
    }
  }

  throw lastError!
}

// Client-side service functions
export class DependenciasClientService {
  async getAll(filters?: SearchFilters & {
    page?: number;
    limit?: number;
    includeSubdependencias?: boolean;
    includeTramites?: boolean;
    includeOPAs?: boolean;
  }) {
    return withRetry(async () => {
    // Build select query with relations
    let selectQuery = `
      *,
      subdependencias:subdependencias!dependencia_id(
        *,
        tramites:tramites!subdependencia_id(*),
        opas:opas!subdependencia_id(*)
      )
    `

    let query = supabase
      .from('dependencias')
      .select(selectQuery, { count: 'exact' })
      .order('codigo', { ascending: true })

    // Apply filters
    if (filters?.query) {
      query = query.or(`nombre.ilike.%${filters.query}%,descripcion.ilike.%${filters.query}%`)
    }

    // Apply activo filter if specified
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo)
    }

    // Apply pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 50 // Increase default limit for dependencias
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error in dependencias service:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Error fetching dependencias: ${error.message}`)
    }

    if (!data) {
      console.warn('No data returned from dependencias query')
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        success: true,
      } as PaginatedResponse<Dependencia>
    }

    // Process the data to calculate counts and ensure proper structure
    const processedData = data?.map(dep => {
      const subdependencias = dep.subdependencias || []

      // Calculate counts
      let tramites_count = 0
      let opas_count = 0

      subdependencias.forEach(subdep => {
        tramites_count += (subdep.tramites?.length || 0)
        opas_count += (subdep.opas?.length || 0)

        // Add counts to subdependencia
        subdep.tramites_count = subdep.tramites?.length || 0
        subdep.opas_count = subdep.opas?.length || 0
      })

      return {
        ...dep,
        subdependencias,
        subdependencias_count: subdependencias.length,
        tramites_count,
        opas_count
      }
    }) || []

    return {
      data: processedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      success: true,
    } as PaginatedResponse<Dependencia>
    }) // Close withRetry wrapper
  }

  async getById(id: string) {
    return withRetry(async () => {
      const { data, error } = await supabase.from('dependencias').select('*').eq('id', id).single()

      if (error) {
        console.error('Supabase error in getById:', error)
        throw new Error(`Error fetching dependencia: ${error.message}`)
      }

      return data as Dependencia
    })
  }

  async getActive() {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('dependencias')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true })

      if (error) {
        console.error('Supabase error in getActive:', error)
        throw new Error(`Error fetching active dependencias: ${error.message}`)
      }

      return data as Dependencia[]
    })
  }

  async create(dependencia: Omit<Dependencia, 'id' | 'created_at' | 'updated_at'>) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('dependencias')
        .insert(dependencia)
        .select()
        .single()

      if (error) {
        console.error('Supabase error in create:', error)
        throw new Error(`Error creating dependencia: ${error.message}`)
      }

      return data as Dependencia
    })
  }

  async update(
    id: string,
    updates: Partial<Omit<Dependencia, 'id' | 'created_at' | 'updated_at'>>
  ) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('dependencias')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error in update:', error)
        throw new Error(`Error updating dependencia: ${error.message}`)
      }

      return data as Dependencia
    })
  }

  async delete(id: string) {
    return withRetry(async () => {
      const { error } = await supabase.from('dependencias').delete().eq('id', id)

      if (error) {
        console.error('Supabase error in delete:', error)
        throw new Error(`Error deleting dependencia: ${error.message}`)
      }

      return { success: true }
    })
  }
}

// Export service instance
export const dependenciasClientService = new DependenciasClientService()
