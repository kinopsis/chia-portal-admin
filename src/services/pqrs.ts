// Service for managing PQRS (Peticiones, Quejas, Reclamos y Sugerencias)
// Handles citizen requests and complaints system

import { supabase } from '@/lib/supabase/client'

export interface PQRS {
  id: string
  tipo: 'peticion' | 'queja' | 'reclamo' | 'sugerencia'
  nombre: string
  email: string
  telefono?: string
  dependencia_id: string
  asunto: string
  descripcion: string
  estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado'
  numero_radicado: string
  respuesta?: string
  fecha_respuesta?: string
  created_at: string
  updated_at: string
  // Relations
  dependencias?: {
    id: string
    codigo: string
    nombre: string
  }
}

export interface CreatePQRSData {
  tipo: 'peticion' | 'queja' | 'reclamo' | 'sugerencia'
  nombre: string
  email: string
  telefono?: string
  dependencia_id: string
  asunto: string
  descripcion: string
}

export interface PQRSFilters {
  query?: string
  tipo?: string
  estado?: string
  dependencia_id?: string
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  limit?: number
}

export interface PaginatedPQRSResponse {
  data: PQRS[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}

export class PQRSClientService {
  /**
   * Create a new PQRS
   */
  async create(pqrsData: CreatePQRSData): Promise<PQRS> {
    try {
      // Generate unique radicado number
      const timestamp = Date.now()
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const numero_radicado = `PQRS-${timestamp}-${randomSuffix}`

      const newPQRS = {
        ...pqrsData,
        numero_radicado,
        estado: 'pendiente' as const
      }

      const { data, error } = await supabase
        .from('pqrs')
        .insert(newPQRS)
        .select(`
          *,
          dependencias (
            id,
            codigo,
            nombre
          )
        `)
        .single()

      if (error) {
        throw new Error(`Error creating PQRS: ${error.message}`)
      }

      return data as PQRS
    } catch (error) {
      console.error('Error in PQRS creation:', error)
      throw error
    }
  }

  /**
   * Get PQRS by radicado number
   */
  async getByRadicado(numeroRadicado: string): Promise<PQRS | null> {
    try {
      const { data, error } = await supabase
        .from('pqrs')
        .select(`
          *,
          dependencias (
            id,
            codigo,
            nombre
          )
        `)
        .eq('numero_radicado', numeroRadicado)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw new Error(`Error fetching PQRS: ${error.message}`)
      }

      return data as PQRS
    } catch (error) {
      console.error('Error fetching PQRS by radicado:', error)
      throw error
    }
  }

  /**
   * Search PQRS with filters
   */
  async search(filters: PQRSFilters = {}): Promise<PaginatedPQRSResponse> {
    try {
      const {
        query = '',
        tipo = '',
        estado = '',
        dependencia_id = '',
        fecha_desde = '',
        fecha_hasta = '',
        page = 1,
        limit = 10
      } = filters

      let queryBuilder = supabase
        .from('pqrs')
        .select(`
          *,
          dependencias (
            id,
            codigo,
            nombre
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply text search
      if (query) {
        queryBuilder = queryBuilder.or(
          `numero_radicado.ilike.%${query}%,asunto.ilike.%${query}%,descripcion.ilike.%${query}%,nombre.ilike.%${query}%`
        )
      }

      // Apply filters
      if (tipo) {
        queryBuilder = queryBuilder.eq('tipo', tipo)
      }

      if (estado) {
        queryBuilder = queryBuilder.eq('estado', estado)
      }

      if (dependencia_id) {
        queryBuilder = queryBuilder.eq('dependencia_id', dependencia_id)
      }

      if (fecha_desde) {
        queryBuilder = queryBuilder.gte('created_at', fecha_desde)
      }

      if (fecha_hasta) {
        queryBuilder = queryBuilder.lte('created_at', fecha_hasta)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      queryBuilder = queryBuilder.range(from, to)

      const { data, error, count } = await queryBuilder

      if (error) {
        throw new Error(`Error searching PQRS: ${error.message}`)
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        },
        success: true
      }
    } catch (error) {
      console.error('Error searching PQRS:', error)
      throw error
    }
  }

  /**
   * Get all PQRS with pagination
   */
  async getAll(filters: PQRSFilters = {}): Promise<PaginatedPQRSResponse> {
    return this.search(filters)
  }

  /**
   * Get PQRS by ID
   */
  async getById(id: string): Promise<PQRS> {
    try {
      const { data, error } = await supabase
        .from('pqrs')
        .select(`
          *,
          dependencias (
            id,
            codigo,
            nombre
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(`Error fetching PQRS: ${error.message}`)
      }

      return data as PQRS
    } catch (error) {
      console.error('Error fetching PQRS by ID:', error)
      throw error
    }
  }

  /**
   * Update PQRS status (admin only)
   */
  async updateStatus(
    id: string, 
    estado: PQRS['estado'], 
    respuesta?: string
  ): Promise<PQRS> {
    try {
      const updateData: any = {
        estado,
        updated_at: new Date().toISOString()
      }

      if (respuesta) {
        updateData.respuesta = respuesta
        updateData.fecha_respuesta = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('pqrs')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          dependencias (
            id,
            codigo,
            nombre
          )
        `)
        .single()

      if (error) {
        throw new Error(`Error updating PQRS: ${error.message}`)
      }

      return data as PQRS
    } catch (error) {
      console.error('Error updating PQRS status:', error)
      throw error
    }
  }

  /**
   * Get PQRS statistics
   */
  async getStats(): Promise<{
    total: number
    byTipo: Record<string, number>
    byEstado: Record<string, number>
    thisMonth: number
  }> {
    try {
      const { data, error } = await supabase
        .from('pqrs')
        .select('tipo, estado, created_at')

      if (error) {
        throw new Error(`Error fetching PQRS stats: ${error.message}`)
      }

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const stats = {
        total: data.length,
        byTipo: {} as Record<string, number>,
        byEstado: {} as Record<string, number>,
        thisMonth: 0
      }

      data.forEach(pqrs => {
        // Count by tipo
        stats.byTipo[pqrs.tipo] = (stats.byTipo[pqrs.tipo] || 0) + 1
        
        // Count by estado
        stats.byEstado[pqrs.estado] = (stats.byEstado[pqrs.estado] || 0) + 1
        
        // Count this month
        if (new Date(pqrs.created_at) >= thisMonth) {
          stats.thisMonth++
        }
      })

      return stats
    } catch (error) {
      console.error('Error fetching PQRS stats:', error)
      throw error
    }
  }
}

// Export service instance
export const pqrsClientService = new PQRSClientService()
export default pqrsClientService
