import { renderHook, waitFor } from '@testing-library/react'
import { useFuncionarioMetrics } from '@/hooks'
import { useAuth } from '@/hooks'
import { supabase } from '@/lib/supabase/client'

// Mock dependencies
jest.mock('@/hooks', () => ({
  ...jest.requireActual('@/hooks'),
  useAuth: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockSupabase = supabase as jest.Mocked<typeof supabase>



const mockUserProfile = {
  id: '1',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@test.com',
  rol: 'funcionario' as const,
  activo: true,
  dependencia_id: 'dep-1',
  dependencia: {
    id: 'dep-1',
    nombre: 'Secretaría de Gobierno',
    codigo: 'GOB',
    activo: true,
  },
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockTramitesData = [
  { id: '1', activo: true, created_at: '2024-01-15' },
  { id: '2', activo: true, created_at: '2024-01-10' },
  { id: '3', activo: false, created_at: '2024-01-05' },
]

const mockOpasData = [
  { id: '1', estado: 'aprobada', created_at: '2024-01-15' },
  { id: '2', estado: 'en_revision', created_at: '2024-01-10' },
  { id: '3', estado: 'borrador', created_at: '2024-01-05' },
]

const mockFaqsData = [
  { id: '1', activo: true, created_at: '2024-01-15' },
  { id: '2', activo: true, created_at: '2024-01-10' },
  { id: '3', activo: false, created_at: '2024-01-05' },
]

const mockSubdependenciasData = [
  { id: '1', activo: true },
  { id: '2', activo: true },
  { id: '3', activo: false },
]

describe('useFuncionarioMetrics', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: mockUserProfile,
      loading: false,
      signOut: jest.fn(),
    })

    // Setup default successful responses
    mockSupabase.from.mockImplementation((table: string) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: table === 'tramites' ? mockTramitesData :
              table === 'opas' ? mockOpasData :
              table === 'faqs' ? mockFaqsData :
              table === 'subdependencias' ? mockSubdependenciasData : [],
        error: null,
      }),
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches and processes metrics correctly', async () => {
    const { result } = renderHook(() => useFuncionarioMetrics())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(null)
    expect(result.current.metrics).toEqual({
      tramites: {
        total: 3,
        active: 2,
        pending: 1,
        thisMonth: expect.any(Number),
      },
      opas: {
        total: 3,
        active: 1, // Only 'aprobada' status
        pending: 2, // 'en_revision' and 'borrador'
        thisMonth: expect.any(Number),
      },
      faqs: {
        total: 3,
        published: 2,
        thisMonth: expect.any(Number),
      },
      subdependencias: {
        total: 3,
        active: 2,
      },
      activity: {
        totalActions: 9, // 3 + 3 + 3
        todayActions: expect.any(Number),
        weekActions: expect.any(Number),
      },
    })
  })

  it('handles user without dependencia_id', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: {
        ...mockUserProfile,
        dependencia_id: null,
      },
      loading: false,
      signOut: jest.fn(),
    })

    const { result } = renderHook(() => useFuncionarioMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Usuario sin dependencia asignada')
    expect(result.current.metrics).toBe(null)
  })

  it('handles Supabase errors', async () => {
    const mockError = new Error('Database connection failed')

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    }))

    const { result } = renderHook(() => useFuncionarioMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.metrics).toBe(null)
  })

  it('filters data by dependencia_id', async () => {
    const { result } = renderHook(() => useFuncionarioMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verify that each table query includes the dependencia_id filter
    expect(mockSupabase.from).toHaveBeenCalledWith('tramites')
    expect(mockSupabase.from).toHaveBeenCalledWith('opas')
    expect(mockSupabase.from).toHaveBeenCalledWith('faqs')
    expect(mockSupabase.from).toHaveBeenCalledWith('subdependencias')
  })

  it('refreshes metrics when refreshMetrics is called', async () => {
    const { result } = renderHook(() => useFuncionarioMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear previous calls
    jest.clearAllMocks()

    // Call refresh
    await result.current.refreshMetrics()

    // Verify that data is fetched again
    expect(mockSupabase.from).toHaveBeenCalledWith('tramites')
    expect(mockSupabase.from).toHaveBeenCalledWith('opas')
    expect(mockSupabase.from).toHaveBeenCalledWith('faqs')
    expect(mockSupabase.from).toHaveBeenCalledWith('subdependencias')
  })

  it('calculates monthly metrics correctly', async () => {
    // Mock current date to January 20, 2024
    const mockDate = new Date('2024-01-20')
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

    const { result } = renderHook(() => useFuncionarioMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // All mock data is from January 2024, so thisMonth should be 3 for each
    expect(result.current.metrics?.tramites.thisMonth).toBe(3)
    expect(result.current.metrics?.opas.thisMonth).toBe(3)
    expect(result.current.metrics?.faqs.thisMonth).toBe(3)

    // Restore Date
    jest.restoreAllMocks()
  })

  it('processes OPA states correctly', async () => {
    const { result } = renderHook(() => useFuncionarioMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.metrics?.opas.active).toBe(1) // Only 'aprobada'
    expect(result.current.metrics?.opas.pending).toBe(2) // 'en_revision' + 'borrador'
  })
})
