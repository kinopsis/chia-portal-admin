/**
 * UnifiedServicesService Unit Tests
 * 
 * Comprehensive tests for the UnifiedServicesService class including:
 * - CRUD operations (create, read, update, delete)
 * - Toggle active/inactive functionality
 * - Data transformation functions
 * - Error handling scenarios
 * - Search and filtering
 * - Metrics calculation
 */

import { UnifiedServicesService, type UnifiedServiceItem, type CreateServiceData, type UpdateServiceData } from '../unifiedServices'
import { supabase } from '@/lib/supabase'

// Mock Supabase with proper chaining
const createMockQuery = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn()
})

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => createMockQuery())
  }
}))

// Mock dependencies services
jest.mock('../dependencias', () => ({
  dependenciasClientService: {
    getAll: jest.fn().mockResolvedValue({
      data: [
        { id: 'dep-1', nombre: 'Secretaría de Gobierno', codigo: '080' },
        { id: 'dep-2', nombre: 'Secretaría de Planeación', codigo: '081' }
      ]
    })
  }
}))

jest.mock('../subdependencias', () => ({
  subdependenciasClientService: {
    getAll: jest.fn().mockResolvedValue({
      data: [
        { id: 'subdep-1', nombre: 'Dirección de Atención al Ciudadano', codigo: '001', dependencia_id: 'dep-1' },
        { id: 'subdep-2', nombre: 'Dirección de Licencias', codigo: '002', dependencia_id: 'dep-2' }
      ]
    })
  }
}))

// Mock Spanish text normalization
jest.mock('@/lib/utils', () => ({
  normalizeSpanishText: jest.fn((text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
}))

describe('UnifiedServicesService', () => {
  let service: UnifiedServicesService
  let mockSupabaseFrom: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    service = new UnifiedServicesService()
    mockSupabaseFrom = supabase.from as jest.Mock

    // Reset the mock to return a fresh query object for each test
    mockSupabaseFrom.mockImplementation(() => createMockQuery())
  })

  describe('Initialization', () => {
    it('should initialize with cached dependencies', async () => {
      await service.initialize()
      
      // Verify that dependencies were loaded
      expect(require('../dependencias').dependenciasClientService.getAll).toHaveBeenCalled()
      expect(require('../subdependencias').subdependenciasClientService.getAll).toHaveBeenCalledWith({ limit: 1000 })
    })

    it('should handle initialization errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      require('../dependencias').dependenciasClientService.getAll.mockRejectedValue(new Error('Network error'))
      
      await service.initialize()
      
      expect(consoleSpy).toHaveBeenCalledWith('Error initializing unified services:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('getAll - Read Operations', () => {
    const mockServiceData = [
      {
        id: 'service-1',
        codigo: '080-001-001',
        nombre: 'Certificado de Residencia',
        descripcion: 'Certificado oficial de residencia',
        tipo_servicio: 'tramite',
        categoria: 'atencion_ciudadana',
        dependencia_id: 'dep-1',
        subdependencia_id: 'subdep-1',
        requiere_pago: false,
        tiempo_respuesta: '5 días hábiles',
        activo: true,
        requisitos: ['Cédula de ciudadanía', 'Recibo de servicios'],
        url_suit: 'https://suit.gov.co/tramite/001',
        url_gov: 'https://gov.co/tramites/001',
        visualizacion_suit: true,
        visualizacion_gov: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        dependencia: { id: 'dep-1', nombre: 'Secretaría de Gobierno' },
        subdependencia: { id: 'subdep-1', nombre: 'Dirección de Atención al Ciudadano' }
      }
    ]

    beforeEach(() => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue(Promise.resolve({
          data: mockServiceData,
          error: null,
          count: 1
        }))
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)
    })

    it('should fetch all services with default filters', async () => {
      const result = await service.getAll()
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({
        id: 'service-1',
        codigo: '080-001-001',
        nombre: 'Certificado de Residencia',
        tipo_servicio: 'tramite',
        activo: true
      })
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      })
    })

    it('should apply search filters correctly', async () => {
      await service.getAll({ query: 'certificado', serviceType: 'tramite' })
      
      const mockQuery = mockSupabaseFrom.mock.results[0].value
      expect(mockQuery.or).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('tipo_servicio', 'tramite')
    })

    it('should handle pagination correctly', async () => {
      await service.getAll({ page: 2, limit: 10 })
      
      const mockQuery = mockSupabaseFrom.mock.results[0].value
      expect(mockQuery.range).toHaveBeenCalledWith(10, 19) // (page-1)*limit, (page-1)*limit + limit - 1
    })

    it('should handle database errors', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue(Promise.resolve({
          data: null,
          error: { message: 'Database connection failed' },
          count: 0
        }))
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)

      await expect(service.getAll()).rejects.toThrow('Error fetching services: Database connection failed')
    })
  })

  describe('toggleActive - Toggle Operations', () => {
    const mockService = {
      id: 'service-1',
      nombre: 'Test Service',
      tipo_servicio: 'tramite',
      activo: true,
      dependencia: { id: 'dep-1', nombre: 'Test Dep' },
      subdependencia: { id: 'subdep-1', nombre: 'Test Subdep' }
    }

    it('should toggle service status successfully', async () => {
      // Mock service existence check
      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockService,
          error: null
        })
      }

      // Mock update operation
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockService, activo: false },
          error: null
        })
      }

      mockSupabaseFrom
        .mockReturnValueOnce(mockCheckQuery)
        .mockReturnValueOnce(mockUpdateQuery)

      const result = await service.toggleActive('service-1', false)
      
      expect(result.id).toBe('service-1')
      expect(result.activo).toBe(false)
      expect(mockUpdateQuery.update).toHaveBeenCalledWith({
        activo: false,
        updated_at: expect.any(String)
      })
    })

    it('should handle service not found error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' }
        })
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)

      await expect(service.toggleActive('nonexistent-id', false))
        .rejects.toThrow('Service with ID nonexistent-id not found')
    })

    it('should handle database update errors', async () => {
      // Mock successful existence check
      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockService,
          error: null
        })
      }

      // Mock failed update
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' }
        })
      }

      mockSupabaseFrom
        .mockReturnValueOnce(mockCheckQuery)
        .mockReturnValueOnce(mockUpdateQuery)

      await expect(service.toggleActive('service-1', false))
        .rejects.toThrow('Error toggling service status: Update failed')
    })
  })

  describe('create - Create Operations', () => {
    const mockCreateData: CreateServiceData = {
      nombre: 'New Service',
      descripcion: 'Test service description',
      tipo: 'tramite',
      subdependencia_id: 'subdep-1',
      activo: true,
      requisitos: ['Test requirement'],
      instrucciones: ['Test instruction']
    }

    it('should create a new service successfully', async () => {
      // Mock subdependencia lookup
      const mockSubdepQuery = createMockQuery()
      mockSubdepQuery.single.mockResolvedValue({
        data: {
          dependencia_id: 'dep-1',
          codigo: '001',
          dependencias: { codigo: '080' }
        },
        error: null
      })

      // Mock existing services count for code generation
      const mockCountQuery = createMockQuery()
      mockCountQuery.then.mockResolvedValue({
        data: [],
        error: null
      })

      // Mock code uniqueness check
      const mockCodeCheckQuery = createMockQuery()
      mockCodeCheckQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // No rows returned
      })

      // Mock insert operation
      const mockInsertQuery = createMockQuery()
      mockInsertQuery.single.mockResolvedValue({
        data: {
          id: 'new-service-id',
          codigo: '080-001-001',
          ...mockCreateData,
          tipo_servicio: 'tramite',
          dependencia: { id: 'dep-1', nombre: 'Test Dep' },
          subdependencia: { id: 'subdep-1', nombre: 'Test Subdep' }
        },
        error: null
      })

      mockSupabaseFrom
        .mockReturnValueOnce(mockSubdepQuery)
        .mockReturnValueOnce(mockCountQuery)
        .mockReturnValueOnce(mockCodeCheckQuery)
        .mockReturnValueOnce(mockInsertQuery)

      const result = await service.create(mockCreateData)

      expect(result.id).toBe('new-service-id')
      expect(result.nombre).toBe('New Service')
      expect(result.tipo_servicio).toBe('tramite')
      expect(mockInsertQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
        nombre: 'New Service',
        tipo_servicio: 'tramite',
        dependencia_id: 'dep-1',
        subdependencia_id: 'subdep-1'
      }))
    })

    it('should handle subdependencia not found error', async () => {
      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      })
      mockSupabaseFrom.mockReturnValue(mockQuery)

      await expect(service.create(mockCreateData))
        .rejects.toThrow('Subdependencia not found')
    })

    it('should generate automatic service code when not provided', async () => {
      const dataWithoutCode = { ...mockCreateData }
      delete dataWithoutCode.codigo

      // Mock subdependencia lookup with codigo data
      const mockSubdepQuery = createMockQuery()
      mockSubdepQuery.single.mockResolvedValue({
        data: {
          dependencia_id: 'dep-1',
          codigo: '001',
          dependencias: { codigo: '080' }
        },
        error: null
      })

      // Mock existing services for code generation
      const mockCountQuery = createMockQuery()
      mockCountQuery.then.mockResolvedValue({
        data: [{ codigo: '080-001-001' }],
        error: null
      })

      // Mock code uniqueness check
      const mockCodeCheckQuery = createMockQuery()
      mockCodeCheckQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })

      // Mock successful insert
      const mockInsertQuery = createMockQuery()
      mockInsertQuery.single.mockResolvedValue({
        data: {
          id: 'new-service-id',
          codigo: '080-001-002', // Next consecutive number
          ...dataWithoutCode,
          tipo_servicio: 'tramite'
        },
        error: null
      })

      mockSupabaseFrom
        .mockReturnValueOnce(mockSubdepQuery)
        .mockReturnValueOnce(mockCountQuery)
        .mockReturnValueOnce(mockCodeCheckQuery)
        .mockReturnValueOnce(mockInsertQuery)

      const result = await service.create(dataWithoutCode)

      expect(result.codigo).toBe('080-001-002')
      expect(mockInsertQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
        codigo: expect.stringMatching(/^\d{3}-\d{3}-\d{3}$/)
      }))
    })
  })

  describe('update - Update Operations', () => {
    const mockUpdateData: UpdateServiceData = {
      id: 'service-1',
      nombre: 'Updated Service Name',
      descripcion: 'Updated description',
      tiene_pago: true,
      instrucciones: ['Updated instruction']
    }

    it('should update service successfully', async () => {
      // Mock service existence check
      const mockCheckQuery = createMockQuery()
      mockCheckQuery.single.mockResolvedValue({
        data: { id: 'service-1', nombre: 'Original Name', tipo_servicio: 'tramite' },
        error: null
      })

      // Mock update operation
      const mockUpdateQuery = createMockQuery()
      mockUpdateQuery.single.mockResolvedValue({
        data: {
          id: 'service-1',
          nombre: 'Updated Service Name',
          descripcion: 'Updated description',
          requiere_pago: true,
          instrucciones: ['Updated instruction'],
          dependencia: { id: 'dep-1', nombre: 'Test Dep' },
          subdependencia: { id: 'subdep-1', nombre: 'Test Subdep' }
        },
        error: null
      })

      mockSupabaseFrom
        .mockReturnValueOnce(mockCheckQuery)
        .mockReturnValueOnce(mockUpdateQuery)

      const result = await service.update(mockUpdateData)

      expect(result.id).toBe('service-1')
      expect(result.nombre).toBe('Updated Service Name')
      expect(result.requiere_pago).toBe(true)
      expect(mockUpdateQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        nombre: 'Updated Service Name',
        descripcion: 'Updated description',
        requiere_pago: true, // Should be mapped from tiene_pago
        instrucciones: ['Updated instruction'],
        updated_at: expect.any(String)
      }))
    })

    it('should handle service not found during update', async () => {
      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      })
      mockSupabaseFrom.mockReturnValue(mockQuery)

      await expect(service.update(mockUpdateData))
        .rejects.toThrow('Service with ID service-1 not found')
    })

    it('should require ID for update operation', async () => {
      const invalidData = { nombre: 'Test' } as UpdateServiceData

      await expect(service.update(invalidData))
        .rejects.toThrow('Service ID is required for update operation')
    })

    it('should map field names correctly for database compatibility', async () => {
      const dataWithFormFields: UpdateServiceData = {
        id: 'service-1',
        tipo: 'opa',
        tiene_pago: false
      }

      // Mock successful existence check
      const mockCheckQuery = createMockQuery()
      mockCheckQuery.single.mockResolvedValue({
        data: { id: 'service-1', nombre: 'Test', tipo_servicio: 'tramite' },
        error: null
      })

      // Mock successful update
      const mockUpdateQuery = createMockQuery()
      mockUpdateQuery.single.mockResolvedValue({
        data: { id: 'service-1', tipo_servicio: 'opa', requiere_pago: false },
        error: null
      })

      mockSupabaseFrom
        .mockReturnValueOnce(mockCheckQuery)
        .mockReturnValueOnce(mockUpdateQuery)

      await service.update(dataWithFormFields)

      expect(mockUpdateQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        tipo_servicio: 'opa', // Should be mapped from tipo
        requiere_pago: false, // Should be mapped from tiene_pago
        updated_at: expect.any(String)
      }))
      expect(mockUpdateQuery.update).not.toHaveBeenCalledWith(expect.objectContaining({
        tipo: expect.anything(),
        tiene_pago: expect.anything()
      }))
    })
  })

  describe('delete - Delete Operations', () => {
    it('should delete service successfully', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)

      await service.delete('service-1')

      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'service-1')
    })

    it('should handle delete errors', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' }
        })
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)

      await expect(service.delete('service-1'))
        .rejects.toThrow('Error deleting service: Delete failed')
    })

    it('should accept optional type parameter for backward compatibility', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)

      await service.delete('service-1', 'tramite')

      // Should still only use ID for deletion
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'service-1')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockRejectedValue(new Error('Network timeout'))
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)

      await expect(service.getAll()).rejects.toThrow('Network timeout')
    })

    it('should handle malformed data gracefully', async () => {
      const malformedData = {
        id: 'service-1',
        codigo: null,
        nombre: '',
        dependencia: null,
        subdependencia: null,
        requisitos: 'not-an-array'
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [malformedData],
          error: null,
          count: 1
        })
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)

      const result = await service.getAll()

      expect(result.data[0]).toMatchObject({
        id: 'service-1',
        codigo: null,
        nombre: '',
        dependencia: { nombre: 'Sin dependencia' },
        subdependencia: { nombre: 'Sin subdependencia' },
        requisitos: [] // Should be normalized to empty array
      })
    })

    it('should handle empty results correctly', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      }
      mockSupabaseFrom.mockReturnValue(mockQuery)

      const result = await service.getAll()

      expect(result.data).toEqual([])
      expect(result.pagination.total).toBe(0)
      expect(result.success).toBe(true)
    })
  })
})
