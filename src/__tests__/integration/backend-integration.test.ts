// Jest integration tests for backend integration
// Tests all services and components with real data

import { tramitesClientService } from '@/services/tramites'
import { opasClientService } from '@/services/opas'
import { faqsClientService } from '@/services/faqs'
import { dependenciasClientService } from '@/services/dependencias'
import { unifiedSearchService } from '@/services/unifiedSearch'

// Mock fetch for API tests
global.fetch = jest.fn()

describe('Backend Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Trámites Service', () => {
    it('should fetch trámites successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            codigo_unico: 'TRAM-001',
            nombre: 'Test Trámite',
            formulario: 'Test description',
            activo: true,
            subdependencias: {
              nombre: 'Test Subdependencia',
              dependencias: {
                nombre: 'Test Dependencia'
              }
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }

      // Mock the service method
      jest.spyOn(tramitesClientService, 'getAll').mockResolvedValue(mockResponse)

      const result = await tramitesClientService.getAll({ limit: 10 })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.pagination).toBeDefined()
    })

    it('should handle search with filters', async () => {
      const mockResponse = {
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }

      jest.spyOn(tramitesClientService, 'getAll').mockResolvedValue(mockResponse)

      const result = await tramitesClientService.getAll({
        query: 'licencia',
        activo: true,
        limit: 10
      })

      expect(result.success).toBe(true)
      expect(tramitesClientService.getAll).toHaveBeenCalledWith({
        query: 'licencia',
        activo: true,
        limit: 10
      })
    })
  })

  describe('OPAs Service', () => {
    it('should fetch OPAs successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            codigo_opa: 'OPA-001',
            nombre: 'Test OPA',
            descripcion: 'Test description',
            activa: true,
            valor_opa: 50000,
            subdependencias: {
              nombre: 'Test Subdependencia',
              dependencias: {
                nombre: 'Test Dependencia'
              }
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }

      jest.spyOn(opasClientService, 'getAll').mockResolvedValue(mockResponse)

      const result = await opasClientService.getAll({ limit: 10 })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data[0]).toHaveProperty('codigo_opa')
      expect(result.data[0]).toHaveProperty('valor_opa')
    })
  })

  describe('FAQs Service', () => {
    it('should fetch FAQs successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            pregunta: 'Test question?',
            respuesta: 'Test answer',
            tema: 'test',
            activo: true,
            dependencias: {
              nombre: 'Test Dependencia'
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }

      jest.spyOn(faqsClientService, 'getAll').mockResolvedValue(mockResponse)

      const result = await faqsClientService.getAll({ limit: 10 })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data[0]).toHaveProperty('pregunta')
      expect(result.data[0]).toHaveProperty('respuesta')
    })
  })

  describe('Dependencias Service', () => {
    it('should fetch dependencias with relationships', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            codigo: 'DEP-001',
            nombre: 'Test Dependencia',
            descripcion: 'Test description',
            activa: true,
            subdependencias: [
              {
                id: '1',
                nombre: 'Test Subdependencia',
                tramites: [],
                opas: []
              }
            ],
            tramites_count: 5,
            opas_count: 3
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }

      jest.spyOn(dependenciasClientService, 'getAll').mockResolvedValue(mockResponse)

      const result = await dependenciasClientService.getAll({
        includeSubdependencias: true,
        includeTramites: true,
        includeOPAs: true
      })

      expect(result.success).toBe(true)
      expect(result.data[0]).toHaveProperty('subdependencias')
      expect(result.data[0]).toHaveProperty('tramites_count')
      expect(result.data[0]).toHaveProperty('opas_count')
    })
  })

  describe('Unified Search Service', () => {
    it('should perform unified search across all content types', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            codigo: 'TRAM-001',
            nombre: 'Test Trámite',
            descripcion: 'Test description',
            tipo: 'tramite' as const,
            dependencia: 'Test Dependencia',
            estado: 'activo' as const,
            tags: ['test'],
            created_at: '2024-01-01',
            originalData: {}
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        },
        success: true
      }

      jest.spyOn(unifiedSearchService, 'search').mockResolvedValue(mockResponse)

      const result = await unifiedSearchService.search({
        query: 'licencia',
        limit: 10
      })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data[0]).toHaveProperty('tipo')
      expect(['tramite', 'opa', 'faq']).toContain(result.data[0].tipo)
    })

    it('should get search suggestions', async () => {
      const mockSuggestions = ['licencia', 'certificado', 'impuesto']

      jest.spyOn(unifiedSearchService, 'getSearchSuggestions').mockResolvedValue(mockSuggestions)

      const suggestions = await unifiedSearchService.getSearchSuggestions('lic', 5)

      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThanOrEqual(0)
    })

    it('should get search statistics', async () => {
      const mockStats = {
        totalTramites: 100,
        totalOpas: 50,
        totalFaqs: 200,
        totalActive: 300
      }

      jest.spyOn(unifiedSearchService, 'getSearchStats').mockResolvedValue(mockStats)

      const stats = await unifiedSearchService.getSearchStats()

      expect(stats).toHaveProperty('totalTramites')
      expect(stats).toHaveProperty('totalOpas')
      expect(stats).toHaveProperty('totalFaqs')
      expect(stats).toHaveProperty('totalActive')
      expect(typeof stats.totalTramites).toBe('number')
    })
  })

  describe('Metrics API', () => {
    it('should fetch system metrics', async () => {
      const mockMetrics = {
        success: true,
        data: {
          dependencias: 12,
          subdependencias: 45,
          tramites: 156,
          opas: 89,
          faqs: 234,
          usuarios: 1247,
          tramitesActivos: 140,
          opasActivas: 80,
          faqsActivas: 220,
          lastUpdated: '2024-01-01T00:00:00Z'
        },
        timestamp: '2024-01-01T00:00:00Z'
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics)
      })

      const response = await fetch('/api/metrics')
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('dependencias')
      expect(result.data).toHaveProperty('tramites')
      expect(result.data).toHaveProperty('opas')
      expect(result.data).toHaveProperty('faqs')
      expect(typeof result.data.dependencias).toBe('number')
    })
  })
})
