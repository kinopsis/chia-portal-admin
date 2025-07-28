import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import DashboardStats from '@/components/organisms/DashboardStats'

// Mock the hooks
const mockRefreshMetrics = jest.fn()

// Mock Supabase client to prevent real database calls
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}))

// Mock the hooks module completely
jest.mock('@/hooks/useSystemMetrics', () => ({
  useSystemMetrics: jest.fn(),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

// Import the mocked hooks
import { useSystemMetrics } from '@/hooks/useSystemMetrics'
import { useAuth } from '@/hooks/useAuth'

const mockedUseSystemMetrics = useSystemMetrics as jest.MockedFunction<typeof useSystemMetrics>
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const mockMetrics = {
  users: {
    total: 1234,
    active: 1100,
    newThisMonth: 45,
    byRole: {
      ciudadano: 1000,
      funcionario: 200,
      ad    },
  },
  tramites: {
    total: 567,
    active: 544, // Changed from 'completed' to 'active' to match component
    pending: 23,
    completed: 544,
    thisMonth: 89,
  },
  opas: {
    total: 234,
    active: 222, // Changed from 'approved' to 'active' to match component
    pending: 12,
    approved: 222,
    thisMonth: 34,
  },
  faqs: {
    total: 156,
    published: 145,
    thisMonth: 12,
  },
  dependencias: {
    total: 45,
    active: 43,
  },
  activity: {
    totalActions: 801,
    todayActions: 23,
    weekActions: 156,
  },
}

const mockUserProfile = {
  id: '1',
  nombre: 'Test',
  apellido: 'User',
  email: 'test@test.com',
  rol: 'admin' as const,
  activo: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('DashboardStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRefreshMetrics.mockClear()

    mockedUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: mockUserProfile,
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
      hasRole: jest.fn(),
      isAdmin: true,
      isFuncionario: false,
      isCiudadano: false,
      session: null,
    })

    mockedUseSystemMetrics.mockReturnValue({
      metrics: mockMetrics,
      loading: false,
      error: null,
      refreshMetrics: mockRefreshMetrics,
      applyFilters: jest.fn(),
      filters: {},
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard stats correctly', async () => {
    render(<DashboardStats />)

    await waitFor(() => {
      expect(screen.getByText('Métricas del Sistema')).toBeInTheDocument()
      expect(screen.getByText('Resumen de actividad y estadísticas')).toBeInTheDocument()
      // Check for the formatted numbers from mock data
      expect(screen.getByText('1,234')).toBeInTheDocument() // Filtered users (sum of all roles)
      expect(screen.getByText('567')).toBeInTheDocument() // Total tramites
      expect(screen.getByText('234')).toBeInTheDocument() // Total opas
      expect(screen.getByText('156')).toBeInTheDocument() // Total faqs
    })
  })

  it('shows loading state correctly', () => {
    mockedUseSystemMetrics.mockReturnValue({
      metrics: null,
      loading: true,
      error: null,
      refreshMetrics: jest.fn(),
      applyFilters: jest.fn(),
      filters: {},
    })

    render(<DashboardStats />)

    expect(screen.getByText('Cargando métricas del sistema...')).toBeInTheDocument()
  })

  it('shows error state correctly', () => {
    mockedUseSystemMetrics.mockReturnValue({
      metrics: null,
      loading: false,
      error: 'Error loading metrics',
      refreshMetrics: mockRefreshMetrics,
      applyFilters: jest.fn(),
      filters: {},
    })

    render(<DashboardStats />)

    expect(screen.getByText('Error al cargar métricas')).toBeInTheDocument()
    expect(screen.getByText('Error loading metrics')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('calls refresh metrics when refresh button is clicked', async () => {
    render(<DashboardStats />)

    const refreshButton = screen.getByText('Actualizar')
    fireEvent.click(refreshButton)

    expect(mockRefreshMetrics).toHaveBeenCalledTimes(1)
  })

  it('filters stats based on user role', async () => {
    // Test with funcionario role
    mockedUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: { ...mockUserProfile, rol: 'funcionario' },
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
      hasRole: jest.fn(),
      isAdmin: false,
      isFuncionario: true,
      isCiudadano: false,
      session: null,
    })

    render(<DashboardStats />)

    await waitFor(() => {
      // Should not show admin-only stats like dependencias
      expect(screen.queryByText('Dependencias')).not.toBeInTheDocument()
      expect(screen.queryByText('Actividad Hoy')).not.toBeInTheDocument()
    })
  })

  it('shows role filter for admin users', async () => {
    render(<DashboardStats showRoleFilter={true} />)

    await waitFor(() => {
      expect(screen.getByText('Filtrar por roles:')).toBeInTheDocument()
      expect(screen.getByText('Todos')).toBeInTheDocument()
      expect(screen.getByText('Ciudadanos')).toBeInTheDocument()
      expect(screen.getByText('Funcionarios')).toBeInTheDocument()
      expect(screen.getByText('Administradores')).toBeInTheDocument()
    })
  })

  it('hides role filter for non-admin users', async () => {
    mockedUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: { ...mockUserProfile, rol: 'funcionario' },
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
      hasRole: jest.fn(),
      isAdmin: false,
      isFuncionario: true,
      isCiudadano: false,
      session: null,
    })

    render(<DashboardStats showRoleFilter={true} />)

    await waitFor(() => {
      expect(screen.queryByText('Filtrar por roles:')).not.toBeInTheDocument()
    })
  })

  it('displays correct trend indicators', async () => {
    render(<DashboardStats />)

    await waitFor(() => {
      // Should show trend indicators with arrows
      const trendElements = screen.getAllByText(/↗|↘/)
      expect(trendElements.length).toBeGreaterThan(0)
    })
  })

  it('handles auto-refresh correctly', () => {
    render(<DashboardStats autoRefresh={true} refreshInterval={1000} />)

    // Verify the component renders with auto-refresh enabled
    expect(screen.getByText(/Se actualiza cada 1s/)).toBeInTheDocument()
  })

  it('disables auto-refresh when specified', () => {
    render(<DashboardStats autoRefresh={false} />)

    // Verify the component renders without auto-refresh text
    expect(screen.queryByText(/Se actualiza cada/)).not.toBeInTheDocument()
  })

  it('shows last updated timestamp', async () => {
    render(<DashboardStats />)

    await waitFor(() => {
      expect(screen.getByText(/Última actualización:/)).toBeInTheDocument()
    })
  })
})
