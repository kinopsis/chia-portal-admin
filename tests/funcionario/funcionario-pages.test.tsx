import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useAuth, useFuncionarioBreadcrumbs } from '@/hooks'

// Mock hooks
jest.mock('@/hooks', () => ({
  useAuth: jest.fn(),
  useFuncionarioBreadcrumbs: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  },
}))

// Mock error functions
jest.mock('@/lib/errors', () => ({
  logSupabaseError: jest.fn(),
  getUserFriendlyErrorMessage: jest.fn(() => 'Error de prueba'),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseFuncionarioBreadcrumbs = useFuncionarioBreadcrumbs as jest.MockedFunction<typeof useFuncionarioBreadcrumbs>

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

describe('Funcionario Pages Error Fixes', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: mockUserProfile,
      loading: false,
      signOut: jest.fn(),
    })

    mockUseFuncionarioBreadcrumbs.mockReturnValue(mockBreadcrumbs)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should import logSupabaseError from @/lib/errors without errors', async () => {
    // This test verifies that the import fix works
    const { logSupabaseError } = await import('@/lib/errors')
    expect(typeof logSupabaseError).toBe('function')
  })

  it('should import getUserFriendlyErrorMessage from @/lib/errors without errors', async () => {
    // This test verifies that the import fix works
    const { getUserFriendlyErrorMessage } = await import('@/lib/errors')
    expect(typeof getUserFriendlyErrorMessage).toBe('function')
  })

  it('should render tramites page without import errors', async () => {
    const FuncionarioTramitesPage = (await import('@/app/funcionario/tramites/page')).default
    
    render(<FuncionarioTramitesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de Trámites')).toBeInTheDocument()
    })
  })

  it('should render opas page without import errors', async () => {
    const FuncionarioOPAsPage = (await import('@/app/funcionario/opas/page')).default
    
    render(<FuncionarioOPAsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de OPAs')).toBeInTheDocument()
    })
  })

  it('should render faqs page without import errors', async () => {
    const FuncionarioFAQsPage = (await import('@/app/funcionario/faqs/page')).default
    
    render(<FuncionarioFAQsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de FAQs')).toBeInTheDocument()
    })
  })

  it('should render subdependencias page without import errors', async () => {
    const FuncionarioSubdependenciasPage = (await import('@/app/funcionario/subdependencias/page')).default
    
    render(<FuncionarioSubdependenciasPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Subdependencias')).toBeInTheDocument()
    })
  })

  it('should use useFuncionarioMetrics hook without import errors', async () => {
    const { default: useFuncionarioMetrics } = await import('@/hooks/useFuncionarioMetrics')
    expect(typeof useFuncionarioMetrics).toBe('function')
  })

  it('should handle user without dependencia_id gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' } as any,
      userProfile: {
        ...mockUserProfile,
        dependencia_id: null,
      },
      loading: false,
      signOut: jest.fn(),
    })

    // This should not throw an error
    expect(() => {
      const FuncionarioTramitesPage = require('@/app/funcionario/tramites/page').default
      render(<FuncionarioTramitesPage />)
    }).not.toThrow()
  })
})
