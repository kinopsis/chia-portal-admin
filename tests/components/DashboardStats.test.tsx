import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import DashboardStats from '@/components/organisms/DashboardStats'
import { useSystemMetrics } from '@/hooks'
import { useAuth } from '@/hooks'

// Mock the hooks
jest.mock('@/hooks', () => ({
  useSystemMetrics: jest.fn(),
  useAuth: jest.fn(),
}))

const mockUseSystemMetrics = useSystemMetrics as jest.MockedFunction<typeof useSystemMetrics>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const mockMetrics = {
  users: {
    total: 1234,
    active: 1100,
    newThisMonth: 45,
    byRole: {
      ciudadano: 1000,
      funcionario: 200,
      admin: 34,
    },
  },
  tramites: {
    total: 567,
    pending: 23,
    completed: 544,
    thisMonth: 89,
  },
  opas: {
    total: 234,
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
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: mockUserProfile,
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
    })

    mockUseSystemMetrics.mockReturnValue({
      metrics: mockMetrics,
      loading: false,
      error: null,
      refreshMetrics: jest.fn(),
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
      expect(screen.getByText('1,234')).toBeInTheDocument() // Total users
      expect(screen.getByText('567')).toBeInTheDocument() // Total tramites
      expect(screen.getByText('234')).toBeInTheDocument() // Total opas
      expect(screen.getByText('156')).toBeInTheDocument() // Total faqs
    })
  })

  it('shows loading state correctly', () => {
    mockUseSystemMetrics.mockReturnValue({
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
    mockUseSystemMetrics.mockReturnValue({
      metrics: null,
      loading: false,
      error: 'Error loading metrics',
      refreshMetrics: jest.fn(),
      applyFilters: jest.fn(),
      filters: {},
    })

    render(<DashboardStats />)

    expect(screen.getByText('Error al cargar métricas')).toBeInTheDocument()
    expect(screen.getByText('Error loading metrics')).toBeInTheDocument()
  })

  it('calls refresh metrics when refresh button is clicked', async () => {
    const mockRefreshMetrics = jest.fn()
    mockUseSystemMetrics.mockReturnValue({
      metrics: mockMetrics,
      loading: false,
      error: null,
      refreshMetrics: mockRefreshMetrics,
      applyFilters: jest.fn(),
      filters: {},
    })

    render(<DashboardStats />)

    const refreshButton = screen.getByText('🔄 Actualizar')
    fireEvent.click(refreshButton)

    expect(mockRefreshMetrics).toHaveBeenCalledTimes(1)
  })

  it('filters stats based on user role', async () => {
    // Test with funcionario role
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: { ...mockUserProfile, rol: 'funcionario' },
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
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
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: { ...mockUserProfile, rol: 'funcionario' },
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
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
    const mockRefreshMetrics = jest.fn()
    mockUseSystemMetrics.mockReturnValue({
      metrics: mockMetrics,
      loading: false,
      error: null,
      refreshMetrics: mockRefreshMetrics,
      applyFilters: jest.fn(),
      filters: {},
    })

    render(<DashboardStats autoRefresh={true} refreshInterval={1000} />)

    // The useSystemMetrics hook should be called with autoRefresh parameters
    expect(mockUseSystemMetrics).toHaveBeenCalledWith(true, 1000)
  })

  it('disables auto-refresh when specified', () => {
    render(<DashboardStats autoRefresh={false} />)

    expect(mockUseSystemMetrics).toHaveBeenCalledWith(false, 30000)
  })

  it('shows last updated timestamp', async () => {
    render(<DashboardStats />)

    await waitFor(() => {
      expect(screen.getByText(/Última actualización:/)).toBeInTheDocument()
    })
  })
})
