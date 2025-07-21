// Service for managing Temas (FAQ Topics)
// Since we don't have a separate temas table, we'll manage temas as a virtual layer
// using the existing tema string field in the faqs table

import { supabase } from '@/lib/supabase/client'
import type { Tema, SearchFilters, PaginatedResponse } from '@/types'

// Virtual Tema management - extracts unique temas from FAQs
export class TemasClientService {
  
  // Get all unique temas for a specific subdependencia
  async getBySubdependencia(subdependenciaId: string): Promise<Tema[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select(`
        tema,
        subdependencia_id,
        subdependencias (
          id,
          nombre,
          codigo,
          dependencia_id,
          dependencias (
            id,
            nombre,
            codigo
          )
        )
      `)
      .eq('subdependencia_id', subdependenciaId)
      .eq('activo', true)
      .not('tema', 'is', null)
      .not('tema', 'eq', '')

    if (error) {
      throw new Error(`Error fetching temas: ${error.message}`)
    }

    // Group by tema and create virtual Tema objects
    const temasMap = new Map<string, any>()
    
    data?.forEach(faq => {
      if (faq.tema && !temasMap.has(faq.tema)) {
        temasMap.set(faq.tema, {
          id: `tema-${subdependenciaId}-${faq.tema.toLowerCase().replace(/\s+/g, '-')}`,
          nombre: faq.tema,
          descripcion: `Tema: ${faq.tema}`,
          subdependencia_id: subdependenciaId,
          orden: 0,
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subdependencias: faq.subdependencias,
          faqs_count: 0
        })
      }
    })

    // Count FAQs for each tema
    for (const [temaName, tema] of temasMap) {
      const { count } = await supabase
        .from('faqs')
        .select('*', { count: 'exact', head: true })
        .eq('subdependencia_id', subdependenciaId)
        .eq('tema', temaName)
        .eq('activo', true)
      
      tema.faqs_count = count || 0
    }

    return Array.from(temasMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  // Get all temas across all subdependencias
  async getAll(filters?: SearchFilters): Promise<Tema[]> {
    let query = supabase
      .from('faqs')
      .select(`
        tema,
        subdependencia_id,
        subdependencias (
          id,
          nombre,
          codigo,
          dependencia_id,
          dependencias (
            id,
            nombre,
            codigo
          )
        )
      `)
      .eq('activo', true)
      .not('tema', 'is', null)
      .not('tema', 'eq', '')

    if (filters?.query) {
      query = query.ilike('tema', `%${filters.query}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error fetching all temas: ${error.message}`)
    }

    // Group by subdependencia and tema
    const temasMap = new Map<string, any>()
    
    data?.forEach(faq => {
      if (faq.tema) {
        const key = `${faq.subdependencia_id}-${faq.tema}`
        if (!temasMap.has(key)) {
          temasMap.set(key, {
            id: `tema-${faq.subdependencia_id}-${faq.tema.toLowerCase().replace(/\s+/g, '-')}`,
            nombre: faq.tema,
            descripcion: `Tema: ${faq.tema}`,
            subdependencia_id: faq.subdependencia_id,
            orden: 0,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            subdependencias: faq.subdependencias,
            faqs_count: 0
          })
        }
      }
    })

    // Count FAQs for each tema
    for (const [key, tema] of temasMap) {
      const [subdependenciaId, temaName] = key.split('-', 2)
      const { count } = await supabase
        .from('faqs')
        .select('*', { count: 'exact', head: true })
        .eq('subdependencia_id', subdependenciaId)
        .eq('tema', temaName)
        .eq('activo', true)
      
      tema.faqs_count = count || 0
    }

    return Array.from(temasMap.values()).sort((a, b) => 
      a.subdependencias?.nombre.localeCompare(b.subdependencias?.nombre) || 
      a.nombre.localeCompare(b.nombre)
    )
  }

  // Create a new tema (by creating a FAQ with that tema)
  async create(temaData: { nombre: string; descripcion?: string; subdependencia_id: string }): Promise<Tema> {
    // Since we can't create temas directly, we'll create a placeholder FAQ
    // This is a workaround until we have a proper temas table
    const placeholderFAQ = {
      pregunta: `Tema: ${temaData.nombre}`,
      respuesta: temaData.descripcion || `Preguntas relacionadas con ${temaData.nombre}`,
      tema: temaData.nombre,
      subdependencia_id: temaData.subdependencia_id,
      dependencia_id: '', // Will be filled by trigger or application logic
      activo: false, // Mark as inactive since it's just a placeholder
    }

    const { data, error } = await supabase
      .from('faqs')
      .insert([placeholderFAQ])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating tema: ${error.message}`)
    }

    // Return virtual tema object
    return {
      id: `tema-${temaData.subdependencia_id}-${temaData.nombre.toLowerCase().replace(/\s+/g, '-')}`,
      nombre: temaData.nombre,
      descripcion: temaData.descripcion,
      subdependencia_id: temaData.subdependencia_id,
      orden: 0,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      faqs_count: 0
    }
  }

  // Update tema (updates all FAQs with that tema name)
  async update(temaId: string, temaData: Partial<Tema>): Promise<Tema> {
    // Extract subdependencia_id and tema name from virtual ID
    const parts = temaId.split('-')
    if (parts.length < 3) {
      throw new Error('Invalid tema ID format')
    }
    
    const subdependenciaId = parts[1]
    const oldTemaName = parts.slice(2).join('-').replace(/-/g, ' ')

    if (temaData.nombre && temaData.nombre !== oldTemaName) {
      // Update all FAQs with the old tema name to use the new name
      const { error } = await supabase
        .from('faqs')
        .update({ tema: temaData.nombre })
        .eq('subdependencia_id', subdependenciaId)
        .eq('tema', oldTemaName)

      if (error) {
        throw new Error(`Error updating tema: ${error.message}`)
      }
    }

    // Return updated virtual tema object
    return {
      id: `tema-${subdependenciaId}-${(temaData.nombre || oldTemaName).toLowerCase().replace(/\s+/g, '-')}`,
      nombre: temaData.nombre || oldTemaName,
      descripcion: temaData.descripcion,
      subdependencia_id: subdependenciaId,
      orden: temaData.orden || 0,
      activo: temaData.activo !== undefined ? temaData.activo : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      faqs_count: 0
    }
  }

  // Delete tema (sets all FAQs with that tema to null)
  async delete(temaId: string): Promise<void> {
    // Extract subdependencia_id and tema name from virtual ID
    const parts = temaId.split('-')
    if (parts.length < 3) {
      throw new Error('Invalid tema ID format')
    }
    
    const subdependenciaId = parts[1]
    const temaName = parts.slice(2).join('-').replace(/-/g, ' ')

    // Set tema to null for all FAQs with this tema
    const { error } = await supabase
      .from('faqs')
      .update({ tema: null })
      .eq('subdependencia_id', subdependenciaId)
      .eq('tema', temaName)

    if (error) {
      throw new Error(`Error deleting tema: ${error.message}`)
    }
  }

  // Get unique tema names for a subdependencia (for dropdowns)
  async getTemasForSubdependencia(subdependenciaId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('tema')
      .eq('subdependencia_id', subdependenciaId)
      .eq('activo', true)
      .not('tema', 'is', null)
      .not('tema', 'eq', '')

    if (error) {
      throw new Error(`Error fetching tema names: ${error.message}`)
    }

    // Get unique tema names
    const uniqueTemas = [...new Set(data?.map(faq => faq.tema).filter(Boolean))]
    return uniqueTemas.sort()
  }
}

// Create singleton instance
export const temasClientService = new TemasClientService()
