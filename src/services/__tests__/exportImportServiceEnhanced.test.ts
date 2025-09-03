/**
 * Enhanced ExportImportService Tests
 * Tests for dependency and subdependency name export
 */

import { ExportImportService } from '../exportImportService'
import type { ServiceEnhanced } from '@/types'

describe('ExportImportService - Enhanced', () => {
  let exportImportService: ExportImportService

  beforeEach(() => {
    exportImportService = new ExportImportService()
  })

  describe('exportServicesToCSV', () => {
    it('should export services with dependency and subdependency names', () => {
      const services: ServiceEnhanced[] = [
        {
          id: '1',
          codigo: 'TRAM-001',
          nombre: 'Trámite de prueba',
          descripcion: 'Descripción de prueba',
          tipo: 'tramite',
          categoria: 'atencion_ciudadana',
          dependencia_id: 'dep1',
          dependencia: 'Alcaldía',
          subdependencia_id: 'sub1',
          subdependencia: 'Departamento de Atención al Ciudadano',
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
      expect(csv).toContain('dependencia_id,dependencia_nombre,subdependencia_id,subdependencia_nombre')
      expect(csv).toContain('dep1,Alcaldía,sub1,Departamento de Atención al Ciudadano')
    })
  })

  describe('parseCSVToServices', () => {
    it('should parse CSV with dependency and subdependency names', () => {
      const csvContent = `id,codigo,nombre,tipo_servicio,dependencia_id,dependencia_nombre,subdependencia_id,subdependencia_nombre,requiere_pago,activo,created_at,updated_at
1,TRAM-001,Trámite de prueba,tramite,dep1,Alcaldía,sub1,Departamento de Atención al Ciudadano,true,true,2023-01-01T00:00:00Z,2023-01-01T00:00:00Z`

      const services = exportImportService.parseCSVToServices(csvContent)
      expect(services).toHaveLength(1)
      expect(services[0].dependencia).toBe('Alcaldía')
      expect(services[0].subdependencia).toBe('Departamento de Atención al Ciudadano')
    })
  })

  describe('exportServicesToJSON', () => {
    it('should export services with dependency and subdependency names in JSON', () => {
      const services: ServiceEnhanced[] = [
        {
          id: '1',
          codigo: 'TRAM-001',
          nombre: 'Trámite de prueba',
          tipo: 'tramite',
          dependencia_id: 'dep1',
          dependencia: 'Alcaldía',
          subdependencia_id: 'sub1',
          subdependencia: 'Departamento de Atención al Ciudadano',
          tiene_pago: true,
          activo: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          originalData: {} as any
        }
      ]

      const json = exportImportService.exportServicesToJSON(services)
      const parsed = JSON.parse(json)
      
      expect(parsed).toHaveLength(1)
      expect(parsed[0]).toHaveProperty('dependencia_nombre', 'Alcaldía')
      expect(parsed[0]).toHaveProperty('subdependencia_nombre', 'Departamento de Atención al Ciudadano')
    })
  })

  describe('parseJSONToServices', () => {
    it('should parse JSON with dependency and subdependency names', () => {
      const jsonData = [{
        id: '1',
        codigo: 'TRAM-001',
        nombre: 'Trámite de prueba',
        tipo_servicio: 'tramite',
        dependencia_id: 'dep1',
        dependencia_nombre: 'Alcaldía',
        subdependencia_id: 'sub1',
        subdependencia_nombre: 'Departamento de Atención al Ciudadano',
        requiere_pago: true,
        activo: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }]

      const services = exportImportService.parseJSONToServices(JSON.stringify(jsonData))
      expect(services).toHaveLength(1)
      expect(services[0].dependencia).toBe('Alcaldía')
      expect(services[0].subdependencia).toBe('Departamento de Atención al Ciudadano')
    })
  })
})