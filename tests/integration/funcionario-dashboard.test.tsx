import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import FuncionarioDashboard from '@/app/funcionario/page'
import { useAuth, useFuncionarioBreadcrumbs, useFuncionarioMetrics } from '@/hooks'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock hooks
jest.mock('@/hooks', () => ({
  useAuth: jest.fn(),
  useFuncionarioBreadcrumbs: jest.fn(),
  useFuncionarioMetrics: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseFuncionarioBreadcrumbs = useFuncionarioBreadcrumbs as jest.MockedFunction<typeof useFuncionarioBreadcrumbs>
const mockUseFuncionarioMetrics = useFuncionarioMetrics as jest.MockedFunction<typeof useFuncionarioMetrics>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

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

const mockBreadcrumbs = [
  { label: 'Panel Funcionario', href: '/funcionario' },
  { label: 'Secretaría de Gobierno', href: '/funcionario', current: true },
]

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

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

describe('Funcionario Dashboard Integration', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue(mockRouter as any)
    
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: mockUserProfile,
      loading: false,
      signOut: jest.fn(),
    })

    mockUseFuncionarioBreadcrumbs.mockReturnValue(mockBreadcrumbs)

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

  it('renders dashboard with correct title and dependencia info', async () => {
    render(<FuncionarioDashboard />)

    expect(screen.getByText('Panel de Gestión - Secretaría de Gobierno')).toBeInTheDocument()
    expect(screen.getByText('Gestiona los trámites, OPAs y FAQs de tu dependencia')).toBeInTheDocument()
  })

  it('displays metrics correctly', async () => {
    render(<FuncionarioDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Métricas de Secretaría de Gobierno')).toBeInTheDocument()
    })

    // Check if metrics are displayed
    expect(screen.getByText('25')).toBeInTheDocument() // Trámites total
    expect(screen.getByText('15')).toBeInTheDocument() // OPAs total
    expect(screen.getByText('30')).toBeInTheDocument() // FAQs total
  })

  it('shows quick actions with correct links', () => {
    render(<FuncionarioDashboard />)

    expect(screen.getByText('Nuevo Trámite')).toBeInTheDocument()
    expect(screen.getByText('Nueva OPA')).toBeInTheDocument()
    expect(screen.getByText('Nueva FAQ')).toBeInTheDocument()
    expect(screen.getByText('Ver Subdependencias')).toBeInTheDocument()
  })

  it('displays dependencia information card', () => {
    render(<FuncionarioDashboard />)

    expect(screen.getByText('Mi Dependencia')).toBeInTheDocument()
    expect(screen.getByText('Dependencia Asignada:')).toBeInTheDocument()
    expect(screen.getByText('Secretaría de Gobierno')).toBeInTheDocument()
    expect(screen.getByText('Código:')).toBeInTheDocument()
    expect(screen.getByText('GOB')).toBeInTheDocument()
    expect(screen.getByText('Estado:')).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
  })

  it('shows activity feed section', () => {
    render(<FuncionarioDashboard />)

    expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
    expect(screen.getByText('Últimas acciones en tu dependencia')).toBeInTheDocument()
  })

  it('displays resources section', () => {
    render(<FuncionarioDashboard />)

    expect(screen.getByText('Recursos Útiles')).toBeInTheDocument()
    expect(screen.getByText('📖 Manual del Funcionario')).toBeInTheDocument()
    expect(screen.getByText('📋 Guía de Trámites')).toBeInTheDocument()
    expect(screen.getByText('🔒 Políticas de Seguridad')).toBeInTheDocument()
  })

  it('handles user without dependencia gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: {
        ...mockUserProfile,
        dependencia: undefined,
      },
      loading: false,
      signOut: jest.fn(),
    })

    render(<FuncionarioDashboard />)

    expect(screen.getByText('Panel de Gestión - Funcionario')).toBeInTheDocument()
    expect(screen.getByText('No asignada')).toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('shows inactive dependencia status correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: {
        ...mockUserProfile,
        dependencia: {
          ...mockUserProfile.dependencia!,
          activo: false,
        },
      },
      loading: false,
      signOut: jest.fn(),
    })

    render(<FuncionarioDashboard />)

    expect(screen.getByText('Inactiva')).toBeInTheDocument()
  })

  it('opens resource links in new tab', async () => {
    const user = userEvent.setup()
    
    // Mock window.open
    const mockWindowOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    })

    render(<FuncionarioDashboard />)

    const manualButton = screen.getByText('📖 Manual del Funcionario')
    await user.click(manualButton)

    expect(mockWindowOpen).toHaveBeenCalledWith('/docs/manual-funcionario.pdf', '_blank')
  })

  it('handles loading state', () => {
    mockUseFuncionarioMetrics.mockReturnValue({
      metrics: null,
      loading: true,
      error: null,
      refreshMetrics: jest.fn(),
    })

    render(<FuncionarioDashboard />)

    // Should still render the page structure
    expect(screen.getByText('Panel de Gestión - Secretaría de Gobierno')).toBeInTheDocument()
    expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument()
  })

  it('handles error state', () => {
    mockUseFuncionarioMetrics.mockReturnValue({
      metrics: null,
      loading: false,
      error: 'Error de conexión',
      refreshMetrics: jest.fn(),
    })

    render(<FuncionarioDashboard />)

    // Should still render the page structure
    expect(screen.getByText('Panel de Gestión - Secretaría de Gobierno')).toBeInTheDocument()
    expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument()
  })
})
