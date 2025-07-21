import { renderHook, waitFor, act } from '@testing-library/react'
import { useSystemMetrics } from '@/hooks'
import { supabase } from '@/lib/supabase'

// Create mock query builder
const createMockQueryBuilder = (data: any[] = []) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  then: jest.fn().mockResolvedValue({ data, error: null }),
})

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    userProfile: {
      id: '1',
      nombre: 'Test',
      apellido: 'User',
      email: 'test@test.com',
      rol: 'admin',
      activo: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  }),
}))

const mockUserProfilesData = [
  { rol: 'ciudadano', activo: true, created_at: '2024-01-01' },
  { rol: 'funcionario', activo: true, created_at: '2024-01-15' },
  { rol: 'admin', activo: true, created_at: '2024-01-20' },
  { rol: 'ciudadano', activo: false, created_at: '2024-01-25' },
]

const mockTramitesData = [
  { estado: 'pendiente', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { estado: 'completado', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { estado: 'pendiente', created_at: '2024-01-20', updated_at: '2024-01-20' },
]

const mockOpasData = [
  { estado: 'pendiente', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { estado: 'aprobada', created_at: '2024-01-15', updated_at: '2024-01-15' },
]

const mockFaqsData = [
  { activa: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { activa: false, created_at: '2024-01-15', updated_at: '2024-01-15' },
]

const mockDependenciasData = [
  { activa: true },
  { activa: true },
  { activa: false },
]

describe('useSystemMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mock responses for different tables
    mockSupabase.from.mockImplementation((table: string) => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn(),
      }

      // Configure responses based on table
      switch (table) {
        case 'user_profiles':
          mockQueryBuilder.limit.mockResolvedValue({ data: mockUserProfilesData, error: null })
          mockQueryBuilder.select.mockResolvedValue({ data: mockUserProfilesData, error: null })
          break
        case 'tramites':
          mockQueryBuilder.limit.mockResolvedValue({ data: mockTramitesData, error: null })
          mockQueryBuilder.select.mockResolvedValue({ data: mockTramitesData, error: null })
          break
        case 'opas':
          mockQueryBuilder.limit.mockResolvedValue({ data: mockOpasData, error: null })
          mockQueryBuilder.select.mockResolvedValue({ data: mockOpasData, error: null })
          break
        case 'faqs':
          mockQueryBuilder.limit.mockResolvedValue({ data: mockFaqsData, error: null })
          mockQueryBuilder.select.mockResolvedValue({ data: mockFaqsData, error: null })
          break
        case 'dependencias':
          mockQueryBuilder.select.mockResolvedValue({ data: mockDependenciasData, error: null })
          mockQueryBuilder.limit.mockResolvedValue({ data: mockDependenciasData, error: null })
          break
        default:
          mockQueryBuilder.limit.mockResolvedValue({ data: [], error: null })
          mockQueryBuilder.select.mockResolvedValue({ data: [], error: null })
      }

      return mockQueryBuilder
    })
  })

  it('fetches and processes metrics correctly', async () => {
    const { result } = renderHook(() => useSystemMetrics(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.metrics).toBeDefined()
    expect(result.current.metrics?.users.total).toBe(4)
    expect(result.current.metrics?.users.active).toBe(3)
    expect(result.current.metrics?.users.byRole.ciudadano).toBe(2)
    expect(result.current.metrics?.users.byRole.funcionario).toBe(1)
    expect(result.current.metrics?.users.byRole.admin).toBe(1)

    expect(result.current.metrics?.tramites.total).toBe(3)
    expect(result.current.metrics?.tramites.pending).toBe(2)
    expect(result.current.metrics?.tramites.completed).toBe(1)

    expect(result.current.metrics?.opas.total).toBe(2)
    expect(result.current.metrics?.opas.pending).toBe(1)
    expect(result.current.metrics?.opas.approved).toBe(1)

    expect(result.current.metrics?.faqs.total).toBe(2)
    expect(result.current.metrics?.faqs.published).toBe(1)

    expect(result.current.metrics?.dependencias.total).toBe(3)
    expect(result.current.metrics?.dependencias.active).toBe(2)
  })

  it('handles loading state correctly', () => {
    const { result } = renderHook(() => useSystemMetrics(false))

    expect(result.current.loading).toBe(true)
    expect(result.current.metrics).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('handles errors correctly', async () => {
    const mockError = new Error('Database error')

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: null, error: mockError }),
    }))

    const { result } = renderHook(() => useSystemMetrics(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 3000 })

    expect(result.current.error).toBe('Database error')
    expect(result.current.metrics).toBe(null)
  })

  it('refreshes metrics when refreshMetrics is called', async () => {
    const { result } = renderHook(() => useSystemMetrics(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear previous calls
    jest.clearAllMocks()

    // Re-setup mocks for refresh
    mockSupabase.from.mockImplementation((table: string) => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
      return mockQueryBuilder
    })

    // Call refresh
    await act(async () => {
      await result.current.refreshMetrics()
    })

    // Should have made new API calls
    expect(mockSupabase.from).toHaveBeenCalled()
  })

  it('applies filters correctly', async () => {
    const { result } = renderHook(() => useSystemMetrics(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const filters = {
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      },
      userRole: 'admin',
    }

    await act(async () => {
      result.current.applyFilters(filters)
    })

    expect(result.current.filters).toEqual(filters)
  })

  it('auto-refreshes when enabled', async () => {
    jest.useFakeTimers()

    const { result } = renderHook(() => 
      useSystemMetrics(true, 1000) // 1 second interval
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear initial calls
    jest.clearAllMocks()

    // Fast-forward time
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled()
    })

    jest.useRealTimers()
  })

  it('does not auto-refresh when disabled', async () => {
    jest.useFakeTimers()

    const { result } = renderHook(() => 
      useSystemMetrics(false, 1000)
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear initial calls
    jest.clearAllMocks()

    // Fast-forward time
    jest.advanceTimersByTime(2000)

    // Should not have made additional calls
    expect(mockSupabase.from).not.toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('calculates activity metrics correctly', async () => {
    const { result } = renderHook(() => useSystemMetrics(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.metrics?.activity.totalActions).toBe(5) // 3 tramites + 2 opas
    expect(result.current.metrics?.activity.todayActions).toBeGreaterThanOrEqual(0)
    expect(result.current.metrics?.activity.weekActions).toBeGreaterThanOrEqual(0)
  })

  it('handles empty data correctly', async () => {
    // Mock empty responses
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }))

    const { result } = renderHook(() => useSystemMetrics(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.metrics?.users.total).toBe(0)
    expect(result.current.metrics?.tramites.total).toBe(0)
    expect(result.current.metrics?.opas.total).toBe(0)
    expect(result.current.metrics?.faqs.total).toBe(0)
    expect(result.current.metrics?.dependencias.total).toBe(0)
  })
})
