// Service for managing FAQs

import { supabase } from '@/lib/supabase/client'
import type { FAQ, SearchFilters, PaginatedResponse, FAQHierarchy } from '@/types'

// Server-side service functions
export class FAQsServerService {
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
export class FAQsClientService {
  async getAll(filters?: SearchFilters & { page?: number; limit?: number }) {
    let query = supabase
      .from('faqs')
      .select(
        `
        *,
        dependencias (
          id,
          codigo,
          nombre
        ),
        subdependencias (
          id,
          codigo,
          nombre,
          dependencia_id
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.query) {
      query = query.or(`pregunta.ilike.%${filters.query}%,respuesta.ilike.%${filters.query}%`)
    }

    if (filters?.dependencia_id) {
      query = query.eq('dependencia_id', filters.dependencia_id)
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
      throw new Error(`Error fetching FAQs: ${error.message}`)
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
    } as PaginatedResponse<FAQ>
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('faqs')
      .select(
        `
        *,
        dependencias (
          id,
          codigo,
          nombre
        ),
        subdependencias (
          id,
          codigo,
          nombre,
          dependencia_id
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching FAQ: ${error.message}`)
    }

    return data as FAQ
  }

  async create(faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('faqs').insert(faq).select().single()

    if (error) {
      throw new Error(`Error creating FAQ: ${error.message}`)
    }

    return data as FAQ
  }

  async update(id: string, updates: Partial<Omit<FAQ, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('faqs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating FAQ: ${error.message}`)
    }

    return data as FAQ
  }

  async delete(id: string) {
    const { error } = await supabase.from('faqs').delete().eq('id', id)

    if (error) {
      throw new Error(`Error deleting FAQ: ${error.message}`)
    }

    return { success: true }
  }

  async search(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('faqs')
      .select(
        `
        *,
        dependencias (
          nombre
        )
      `
      )
      .or(`pregunta.ilike.%${query}%,respuesta.ilike.%${query}%`)
      .eq('activa', true)
      .limit(limit)

    if (error) {
      throw new Error(`Error searching FAQs: ${error.message}`)
    }

    return data as FAQ[]
  }

  async getAllTags() {
    const { data, error } = await supabase
      .from('faqs')
      .select('tags')
      .eq('activa', true)
      .not('tags', 'is', null)

    if (error) {
      throw new Error(`Error fetching FAQ tags: ${error.message}`)
    }

    // Flatten and deduplicate tags
    const allTags = data?.flatMap((faq) => faq.tags || []) || []
    const uniqueTags = [...new Set(allTags)]

    return uniqueTags.sort()
  }

  // Get FAQs organized in hierarchical structure
  async getHierarchical(): Promise<FAQHierarchy[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select(
        `
        *,
        dependencias (
          id,
          codigo,
          nombre
        ),
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
      .eq('activo', true)
      .order('dependencias(nombre)')
      .order('subdependencias(nombre)')
      .order('tema')
      .order('pregunta')

    if (error) {
      throw new Error(`Error fetching hierarchical FAQs: ${error.message}`)
    }

    // Group FAQs by dependencia -> subdependencia -> tema
    const hierarchyMap = new Map<string, any>()

    data?.forEach((faq) => {
      const dependencia = faq.subdependencias?.dependencias
      const subdependencia = faq.subdependencias

      if (!dependencia || !subdependencia) return

      const depKey = dependencia.id

      // Initialize dependencia
      if (!hierarchyMap.has(depKey)) {
        hierarchyMap.set(depKey, {
          dependencia: {
            id: dependencia.id,
            nombre: dependencia.nombre,
            codigo: dependencia.codigo,
          },
          subdependencias: new Map(),
        })
      }

      const depData = hierarchyMap.get(depKey)

      // Initialize subdependencia
      if (!depData.subdependencias.has(subdependencia.id)) {
        depData.subdependencias.set(subdependencia.id, {
          id: subdependencia.id,
          nombre: subdependencia.nombre,
          codigo: subdependencia.codigo,
          temas: new Map(),
        })
      }

      const subData = depData.subdependencias.get(subdependencia.id)

      // Initialize tema
      const temaName = faq.tema || 'Sin categoría'
      if (!subData.temas.has(temaName)) {
        subData.temas.set(temaName, {
          id: `tema-${subdependencia.id}-${temaName.toLowerCase().replace(/\s+/g, '-')}`,
          nombre: temaName,
          descripcion: `Preguntas sobre ${temaName}`,
          faqs: [],
        })
      }

      // Add FAQ to tema
      subData.temas.get(temaName).faqs.push(faq)
    })

    // Convert Maps to Arrays
    const result: FAQHierarchy[] = []
    for (const [, depData] of hierarchyMap) {
      const subdependencias = []
      for (const [, subData] of depData.subdependencias) {
        const temas = []
        for (const [, temaData] of subData.temas) {
          temas.push(temaData)
        }
        subdependencias.push({
          ...subData,
          temas: temas.sort((a, b) => a.nombre.localeCompare(b.nombre)),
        })
      }
      result.push({
        dependencia: depData.dependencia,
        subdependencias: subdependencias.sort((a, b) => a.nombre.localeCompare(b.nombre)),
      })
    }

    return result.sort((a, b) => a.dependencia.nombre.localeCompare(b.dependencia.nombre))
  }

  // Get FAQs by tema
  async getByTema(subdependenciaId: string, tema: string): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select(
        `
        *,
        dependencias (
          id,
          codigo,
          nombre
        ),
        subdependencias (
          id,
          codigo,
          nombre,
          dependencia_id
        )
      `
      )
      .eq('subdependencia_id', subdependenciaId)
      .eq('tema', tema)
      .eq('activo', true)
      .order('orden')
      .order('pregunta')

    if (error) {
      throw new Error(`Error fetching FAQs by tema: ${error.message}`)
    }

    return data as FAQ[]
  }
}

// Export service instances
export const faqsServerService = new FAQsServerService()
export const faqsClientService = new FAQsClientService()
