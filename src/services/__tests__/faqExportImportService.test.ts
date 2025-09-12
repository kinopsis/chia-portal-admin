/**
 * FAQ ExportImportService Tests
 */

import { FAQExportImportService } from '../faqExportImportService'
import type { FAQ } from '@/types'

describe('FAQExportImportService', () => {
  let faqExportImportService: FAQExportImportService

  beforeEach(() => {
    faqExportImportService = new FAQExportImportService()
  })

  describe('exportFAQsToCSV', () => {
    it('should export FAQs to CSV format', () => {
      const faqs: FAQ[] = [
        {
          id: '1',
          pregunta: '¿Cómo solicito un certificado de residencia?',
          respuesta: 'Para solicitar un certificado de residencia, debe ...',
          dependencia_id: 'dep1',
          subdependencia_id: 'sub1',
          tema: 'Certificados',
          categoria: 'documentos',
          palabras_clave: ['certificado', 'residencia'],
          orden: 1,
          activo: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          dependencias: {
            id: 'dep1',
            nombre: 'Alcaldía',
            codigo: 'ALC'
          },
          subdependencias: {
            id: 'sub1',
            nombre: 'Departamento de Atención al Ciudadano',
            codigo: 'DAC',
            dependencia_id: 'dep1'
          }
        }
      ]

      const csv = faqExportImportService.exportFAQsToCSV(faqs)
      expect(csv).toContain('id,pregunta,respuesta,dependencia_id,dependencia_nombre,subdependencia_id,subdependencia_nombre')
      expect(csv).toContain('¿Cómo solicito un certificado de residencia?')
    })

    it('should handle empty FAQs array', () => {
      const csv = faqExportImportService.exportFAQsToCSV([])
      expect(csv).toBe('')
    })
  })

  describe('exportFAQsToJSON', () => {
    it('should export FAQs to JSON format', () => {
      const faqs: FAQ[] = [
        {
          id: '1',
          pregunta: '¿Cómo solicito un certificado de residencia?',
          respuesta: 'Para solicitar un certificado de residencia, debe ...',
          dependencia_id: 'dep1',
          subdependencia_id: 'sub1',
          tema: 'Certificados',
          categoria: 'documentos',
          orden: 1,
          activo: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          dependencias: {
            id: 'dep1',
            nombre: 'Alcaldía',
            codigo: 'ALC'
          },
          subdependencias: {
            id: 'sub1',
            nombre: 'Departamento de Atención al Ciudadano',
            codigo: 'DAC',
            dependencia_id: 'dep1'
          }
        }
      ]

      const json = faqExportImportService.exportFAQsToJSON(faqs)
      expect(json).toContain('¿Cómo solicito un certificado de residencia?')
      expect(json).toContain('Alcaldía')
    })
  })

  describe('parseCSVToFAQs', () => {
    it('should parse CSV to FAQs', () => {
      const csvContent = `id,pregunta,respuesta,dependencia_id,dependencia_nombre,subdependencia_id,subdependencia_nombre,tema,categoria,palabras_clave,orden,activo,created_at,updated_at
1,"¿Cómo solicito un certificado de residencia?","Para solicitar un certificado de residencia, debe ...",dep1,"Alcaldía",sub1,"Departamento de Atención al Ciudadano",Certificados,documentos,"certificado|residencia",1,true,2023-01-01T00:00:00Z,2023-01-01T00:00:00Z`

      const faqs = faqExportImportService.parseCSVToFAQs(csvContent)
      expect(faqs).toHaveLength(1)
      expect(faqs[0].id).toBe('1')
      expect(faqs[0].pregunta).toBe('¿Cómo solicito un certificado de residencia?')
      expect(faqs[0].dependencias?.nombre).toBe('Alcaldía')
      expect(faqs[0].subdependencias?.nombre).toBe('Departamento de Atención al Ciudadano')
    })

    it('should handle empty CSV', () => {
      const faqs = faqExportImportService.parseCSVToFAQs('')
      expect(faqs).toHaveLength(0)
    })
  })

  describe('parseJSONToFAQs', () => {
    it('should parse JSON to FAQs', () => {
      const jsonContent = JSON.stringify([
        {
          id: '1',
          pregunta: '¿Cómo solicito un certificado de residencia?',
          respuesta: 'Para solicitar un certificado de residencia, debe ...',
          dependencia_id: 'dep1',
          dependencia_nombre: 'Alcaldía',
          subdependencia_id: 'sub1',
          subdependencia_nombre: 'Departamento de Atención al Ciudadano',
          tema: 'Certificados',
          categoria: 'documentos',
          palabras_clave: ['certificado', 'residencia'],
          orden: 1,
          activo: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ])

      const faqs = faqExportImportService.parseJSONToFAQs(jsonContent)
      expect(faqs).toHaveLength(1)
      expect(faqs[0].id).toBe('1')
      expect(faqs[0].pregunta).toBe('¿Cómo solicito un certificado de residencia?')
      expect(faqs[0].dependencias?.nombre).toBe('Alcaldía')
      expect(faqs[0].subdependencias?.nombre).toBe('Departamento de Atención al Ciudadano')
    })

    it('should handle invalid JSON', () => {
      const faqs = faqExportImportService.parseJSONToFAQs('invalid json')
      expect(faqs).toHaveLength(0)
    })
  })

  describe('validateFAQData', () => {
    it('should validate valid FAQ data', () => {
      const faq: FAQ = {
        id: '1',
        pregunta: '¿Cómo solicito un certificado de residencia?',
        respuesta: 'Para solicitar un certificado de residencia, debe ...',
        dependencia_id: 'dep1',
        subdependencia_id: 'sub1',
        tema: 'Certificados',
        categoria: 'documentos',
        orden: 1,
        activo: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        dependencias: {
          id: 'dep1',
          nombre: 'Alcaldía',
          codigo: 'ALC'
        },
        subdependencias: {
          id: 'sub1',
          nombre: 'Departamento de Atención al Ciudadano',
          codigo: 'DAC',
          dependencia_id: 'dep1'
        }
      }

      const validation = faqExportImportService.validateFAQData(faq)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should detect invalid FAQ data', () => {
      const faq: FAQ = {
        id: '1',
        pregunta: '',
        respuesta: '',
        dependencia_id: '',
        subdependencia_id: '',
        tema: 'Certificados',
        categoria: 'documentos',
        orden: 1,
        activo: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        dependencias: {
          id: '',
          nombre: '',
          codigo: ''
        },
        subdependencias: {
          id: '',
          nombre: '',
          codigo: '',
          dependencia_id: ''
        }
      }

      const validation = faqExportImportService.validateFAQData(faq)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(4)
    })
  })
})