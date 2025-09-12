/**
 * ExportImportService Tests
 */

import { ExportImportService } from '../exportImportService'
import type { ServiceEnhanced } from '@/types'

describe('ExportImportService', () => {
  let exportImportService: ExportImportService

  beforeEach(() => {
    exportImportService = new ExportImportService()
  })

  describe('exportServicesToCSV', () => {
    it('should export services to CSV format', () => {
      const services: ServiceEnhanced[] = [
        {
          id: '1',
          codigo: 'TRAM-001',
          nombre: 'Trámite de prueba',
          descripcion: 'Descripción de prueba',
          tipo: 'tramite',
          categoria: 'atencion_ciudadana',
          dependencia_id: 'dep1',
          subdependencia_id: 'sub1',
          tiene_pago: true,
          tiempo_respuesta: '5 días',
          activo: true,
          requisitos: ['Requisito 1', 'Requisito 2'],
          instrucciones: ['Paso 1', 'Paso 2'],
          url_suit: 'https://suit.example.com',
          url_gov: 'https://gov.example.com',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          originalData: {} as any
        }
      ]

      const csv = exportImportService.exportServicesToCSV(services)
      expect(csv).toContain('id,codigo,nombre,descripcion,tipo_servicio')
      expect(csv).toContain('1,TRAM-001,Trámite de prueba,Descripción de prueba,tramite')
    })

    it('should handle empty services array', () => {
      const csv = exportImportService.exportServicesToCSV([])
      expect(csv).toBe('')
    })
  })

  describe('exportServicesToJSON', () => {
    it('should export services to JSON format', () => {
      const services: ServiceEnhanced[] = [
        {
          id: '1',
          codigo: 'TRAM-001',
          nombre: 'Trámite de prueba',
          tipo: 'tramite',
          dependencia_id: 'dep1',
          subdependencia_id: 'sub1',
          tiene_pago: true,
          activo: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          originalData: {} as any
        }
      ]

      const json = exportImportService.exportServicesToJSON(services)
      expect(json).toContain('TRAM-001')
      expect(json).toContain('tramite')
    })
  })

  describe('parseCSVToServices', () => {
    it('should parse CSV to services', () => {
      const csvContent = `id,codigo,nombre,tipo_servicio,dependencia_id,subdependencia_id,requiere_pago,activo,created_at,updated_at
1,TRAM-001,Trámite de prueba,tramite,dep1,sub1,true,true,2023-01-01T00:00:00Z,2023-01-01T00:00:00Z`

      const services = exportImportService.parseCSVToServices(csvContent)
      expect(services).toHaveLength(1)
      expect(services[0].id).toBe('1')
      expect(services[0].codigo).toBe('TRAM-001')
      expect(services[0].nombre).toBe('Trámite de prueba')
      expect(services[0].tipo).toBe('tramite')
    })

    it('should handle empty CSV', () => {
      const services = exportImportService.parseCSVToServices('')
      expect(services).toHaveLength(0)
    })
  })

  describe('parseJSONToServices', () => {
    it('should parse JSON to services', () => {
      const jsonContent = JSON.stringify([
        {
          id: '1',
          codigo: 'TRAM-001',
          nombre: 'Trámite de prueba',
          tipo: 'tramite',
          dependencia_id: 'dep1',
          subdependencia_id: 'sub1',
          tiene_pago: true,
          activo: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ])

      const services = exportImportService.parseJSONToServices(jsonContent)
      expect(services).toHaveLength(1)
      expect(services[0].id).toBe('1')
      expect(services[0].codigo).toBe('TRAM-001')
    })

    it('should handle invalid JSON', () => {
      const services = exportImportService.parseJSONToServices('invalid json')
      expect(services).toHaveLength(0)
    })
  })

  describe('validateServiceData', () => {
    it('should validate valid service data', () => {
      const service: ServiceEnhanced = {
        id: '1',
        codigo: 'TRAM-001',
        nombre: 'Trámite de prueba',
        tipo: 'tramite',
        dependencia_id: 'dep1',
        subdependencia_id: 'sub1',
        tiene_pago: true,
        activo: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        originalData: {} as any
      }

      const validation = exportImportService.validateServiceData(service)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should detect invalid service data', () => {
      const service: ServiceEnhanced = {
        id: '1',
        codigo: '',
        nombre: '',
        tipo: 'tramite' as any,
        dependencia_id: '',
        subdependencia_id: '',
        tiene_pago: true,
        activo: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        originalData: {} as any
      }

      const validation = exportImportService.validateServiceData(service)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(4)
    })
  })
})