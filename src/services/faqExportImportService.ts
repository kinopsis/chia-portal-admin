/**
 * FAQ Export Import Service
 * Handles export and import operations for FAQs
 */

import type { FAQ } from '@/types'
import { downloadFile, parseCSV } from '@/utils/fileUtils'

// Import result interface
export interface ImportResult {
  success: boolean
  message: string
  created: number
  updated: number
  skipped: number
  errors: string[]
}

// Conflict resolution strategies
export type ConflictStrategy = 'update' | 'skip' | 'create'

/**
 * FAQ Export Import Service Class
 */
export class FAQExportImportService {
  /**
   * Export FAQs to CSV format
   */
  exportFAQsToCSV(faqs: FAQ[]): string {
    if (faqs.length === 0) {
      return ''
    }

    // Create header row
    const headers = [
      'id',
      'pregunta',
      'respuesta',
      'dependencia_id',
      'dependencia_nombre',
      'subdependencia_id',
      'subdependencia_nombre',
      'tema',
      'categoria',
      'palabras_clave',
      'orden',
      'activo',
      'created_at',
      'updated_at'
    ]

    // Create data rows
    const rows = faqs.map(faq => [
      faq.id,
      faq.pregunta,
      faq.respuesta,
      faq.dependencia_id,
      faq.dependencias?.nombre || '',
      faq.subdependencia_id,
      faq.subdependencias?.nombre || '',
      faq.tema || '',
      faq.categoria || '',
      faq.palabras_clave ? faq.palabras_clave.join('|') : '',
      (faq.orden || 0).toString(),
      faq.activo.toString(),
      faq.created_at,
      faq.updated_at
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => {
        // Escape commas and quotes in fields
        if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
          return `"${field.replace(/"/g, '""')}"`
        }
        return field
      }).join(','))
    ].join('\n')

    return csvContent
  }

  /**
   * Export FAQs to JSON format
   */
  exportFAQsToJSON(faqs: FAQ[]): string {
    // Create a copy of FAQs with only the fields we want to export
    const exportData = faqs.map(faq => ({
      id: faq.id,
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
      dependencia_id: faq.dependencia_id,
      dependencia_nombre: faq.dependencias?.nombre || '',
      subdependencia_id: faq.subdependencia_id,
      subdependencia_nombre: faq.subdependencias?.nombre || '',
      tema: faq.tema || '',
      categoria: faq.categoria || '',
      palabras_clave: faq.palabras_clave || [],
      orden: faq.orden || 0,
      activo: faq.activo,
      created_at: faq.created_at,
      updated_at: faq.updated_at
    }));
    
    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Parse CSV content to FAQs
   */
  parseCSVToFAQs(csvContent: string): FAQ[] {
    try {
      // Use the existing parseCSV utility function
      const parsedData = parseCSV(csvContent);
      
      // Convert parsed data to FAQ objects
      const faqs: FAQ[] = parsedData.map(row => {
        return {
          id: row.id || '',
          pregunta: row.pregunta || '',
          respuesta: row.respuesta || '',
          dependencia_id: row.dependencia_id || '',
          subdependencia_id: row.subdependencia_id || '',
          tema: row.tema || undefined,
          categoria: row.categoria || undefined,
          palabras_clave: row.palabras_clave ? row.palabras_clave.split('|') : [],
          orden: parseInt(row.orden) || 0,
          activo: row.activo?.toLowerCase() === 'true',
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
          // Create the dependencias and subdependencias objects with the names
          dependencias: row.dependencia_nombre ? {
            id: row.dependencia_id || '',
            nombre: row.dependencia_nombre,
            codigo: ''
          } : undefined,
          subdependencias: row.subdependencia_nombre ? {
            id: row.subdependencia_id || '',
            nombre: row.subdependencia_nombre,
            codigo: '',
            dependencia_id: row.dependencia_id || ''
          } : undefined,
          originalData: {}
        } as FAQ;
      });
      
      return faqs;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return [];
    }
  }

  /**
   * Parse JSON content to FAQs
   */
  parseJSONToFAQs(jsonContent: string): FAQ[] {
    try {
      const parsed = JSON.parse(jsonContent)
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          ...item,
          // Map the exported field names back to the FAQ structure
          dependencias: item.dependencias || { 
            id: item.dependencia_id || '', 
            nombre: item.dependencia_nombre || '', 
            codigo: '' 
          },
          subdependencias: item.subdependencias || { 
            id: item.subdependencia_id || '', 
            nombre: item.subdependencia_nombre || '', 
            codigo: '', 
            dependencia_id: item.dependencia_id || '' 
          },
          originalData: item.originalData || {},
          // Ensure required fields are present
          palabras_clave: item.palabras_clave || [],
          tema: item.tema || undefined,
          categoria: item.categoria || undefined,
          orden: item.orden || 0,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }))
      }
      return []
    } catch (error) {
      console.error('Error parsing JSON:', error)
      return []
    }
  }

  /**
   * Validate FAQ data
   */
  validateFAQData(faq: FAQ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!faq.pregunta || faq.pregunta.trim() === '') {
      errors.push('La pregunta es requerida')
    }

    if (!faq.respuesta || faq.respuesta.trim() === '') {
      errors.push('La respuesta es requerida')
    }

    if (!faq.subdependencia_id) {
      errors.push('La subdependencia es requerida')
    }

    if (!faq.dependencia_id) {
      errors.push('La dependencia es requerida')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const faqExportImportService = new FAQExportImportService()