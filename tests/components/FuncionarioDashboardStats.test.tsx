import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FuncionarioDashboardStats } from '@/components/organisms'
import { useFuncionarioMetrics, useAuth } from '@/hooks'

// Mock hooks
jest.mock('@/hooks', () => ({
  useFuncionarioMetrics: jest.fn(),
  useAuth: jest.fn(),
}))

const mockUseFuncionarioMetrics = useFuncionarioMetrics as jest.MockedFunction<typeof useFuncionarioMetrics>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const mockMetrics = {
  tramites: {
    total: 25,
    active: 20,
    pending: 5,
    thisMonth: 3,
  },
  opas: {
    total: 15,
    active: 12,
    pending: 3,
    thisMonth: 2,
  },
  faqs: {
    total: 30,
    published: 28,
    thisMonth: 5,
  },
  subdependencias: {
    total: 8,
    active: 7,
  },
  activity: {
    totalActions: 70,
    todayActions: 5,
    weekActions: 25,
  },
}

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

describe('FuncionarioDashboardStats', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: mockUserProfile,
      loading: false,
      signOut: jest.fn(),
    })

    mockUseFuncionarioMetrics.mockReturnValue({
      metrics: mockMetrics,
      loading: false,
      error: null,
      refreshMetrics: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders metrics correctly', () => {
    render(<FuncionarioDashboardStats />)

    expect(screen.getByText('Métricas de Secretaría de Gobierno')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument() // Trámites total
    expect(screen.getByText('20 activos')).toBeInTheDocument() // Trámites activos
    expect(screen.getByText('15')).toBeInTheDocument() // OPAs total
    expect(screen.getByText('12 aprobadas')).toBeInTheDocument() // OPAs aprobadas
    expect(screen.getByText('30')).toBeInTheDocument() // FAQs total
    expect(screen.getByText('28 publicadas')).toBeInTheDocument() // FAQs publicadas
  })

  it('shows loading state', () => {
    mockUseFuncionarioMetrics.mockReturnValue({
      metrics: null,
      loading: true,
      error: null,
      refreshMetrics: jest.fn(),
    })

    render(<FuncionarioDashboardStats />)

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(screen.getAllByRole('generic')).toHaveLength(5) // 5 skeleton cards
  })

  it('shows error state', () => {
    const mockRefresh = jest.fn()
    mockUseFuncionarioMetrics.mockReturnValue({
      metrics: null,
      loading: false,
      error: 'Error de conexión',
      refreshMetrics: mockRefresh,
    })

    render(<FuncionarioDashboardStats />)

    expect(screen.getByText('Error al cargar métricas')).toBeInTheDocument()
    expect(screen.getByText('Error de conexión')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('calls refresh when refresh button is clicked', async () => {
    const mockRefresh = jest.fn()
    mockUseFuncionarioMetrics.mockReturnValue({
      metrics: mockMetrics,
      loading: false,
      error: null,
      refreshMetrics: mockRefresh,
    })

    const user = userEvent.setup()
    render(<FuncionarioDashboardStats />)

    const refreshButton = screen.getByText('Actualizar')
    await user.click(refreshButton)

    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('displays correct trend information', () => {
    render(<FuncionarioDashboardStats />)

    expect(screen.getByText('3')).toBeInTheDocument() // Trámites este mes
    expect(screen.getByText('este mes')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // OPAs este mes
    expect(screen.getByText('5')).toBeInTheDocument() // FAQs este mes
  })

  it('calculates activity percentage correctly', () => {
    render(<FuncionarioDashboardStats />)

    // Activity today: 5, Activity week: 25
    // Percentage: (5/25) * 100 = 20%
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('del total semanal')).toBeInTheDocument()
  })

  it('handles missing dependencia name gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: {
        ...mockUserProfile,
        dependencia: undefined,
      },
      loading: false,
      signOut: jest.fn(),
    })

    render(<FuncionarioDashboardStats />)

    expect(screen.getByText('Métricas de Mi Dependencia')).toBeInTheDocument()
  })

  it('disables refresh button when loading', () => {
    mockUseFuncionarioMetrics.mockReturnValue({
      metrics: mockMetrics,
      loading: true,
      error: null,
      refreshMetrics: jest.fn(),
    })

    render(<FuncionarioDashboardStats />)

    const refreshButton = screen.getByText('Cargando...')
    expect(refreshButton).toBeDisabled()
  })

  it('shows correct subtitle', () => {
    render(<FuncionarioDashboardStats />)

    expect(screen.getByText('Resumen de actividad y contenido gestionado')).toBeInTheDocument()
  })
})
