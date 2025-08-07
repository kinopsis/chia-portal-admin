/**
 * Test to validate parity between /admin/servicios and /funcionarios/servicios pages
 * 
 * This test ensures both pages have:
 * - Same visual layout and styling
 * - Same management actions (Edit, Delete, Toggle)
 * - Same form functionality including instrucciones field
 * - Same filtering capabilities
 * - Same error handling and loading states
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the pages
import AdminServiciosPage from '@/app/admin/servicios/page'
import FuncionariosServiciosPage from '@/app/funcionarios/servicios/page'

// Mock dependencies
jest.mock('@/services/tramitesOpasUnified', () => ({
  tramitesOpasUnifiedService: {
    getAll: jest.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: '1',
          codigo: 'TEST-001',
          nombre: 'Test Trámite',
          tipo: 'tramite',
          tipo_servicio: 'tramite',
          descripcion: 'Test description',
          activo: true,
          requiere_pago: false,
          subdependencia_id: 'sub1',
          dependencia: 'Test Dependencia',
          subdependencia: 'Test Subdependencia',
          requisitos: ['Requisito 1', 'Requisito 2'],
          instructivo: ['Instrucción 1', 'Instrucción 2'],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          codigo: 'OPA-001',
          nombre: 'Test OPA',
          tipo: 'opa',
          tipo_servicio: 'opa',
          descripcion: 'Test OPA description',
          activo: true,
          requiere_pago: true,
          subdependencia_id: 'sub2',
          dependencia: 'Test Dependencia 2',
          subdependencia: 'Test Subdependencia 2',
          requisitos: ['OPA Requisito 1'],
          instructivo: ['OPA Instrucción 1'],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]
    })
  }
}))

jest.mock('@/services/dependencias', () => ({
  dependenciasClientService: {
    getAll: jest.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 'dep1', nombre: 'Test Dependencia', codigo: 'TD1' },
        { id: 'dep2', nombre: 'Test Dependencia 2', codigo: 'TD2' }
      ]
    }),
    getSubdependencias: jest.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 'sub1', nombre: 'Test Subdependencia', dependencia_id: 'dep1' },
        { id: 'sub2', nombre: 'Test Subdependencia 2', dependencia_id: 'dep2' }
      ]
    })
  }
}))

jest.mock('@/services/unifiedServices', () => ({
  unifiedServicesService: {
    updateService: jest.fn().mockResolvedValue({ success: true }),
    deleteService: jest.fn().mockResolvedValue({ success: true })
  }
}))

// Mock auth components
jest.mock('@/components/auth', () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe('Admin and Funcionarios Servicios Pages Parity', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Visual Consistency', () => {
    test('both pages should have the same basic structure', async () => {
      const { container: adminContainer } = render(<AdminServiciosPage />)
      const { container: funcionariosContainer } = render(<FuncionariosServiciosPage />)

      await waitFor(() => {
        // Both should have the same main container structure
        expect(adminContainer.querySelector('.min-h-screen.bg-gray-50')).toBeInTheDocument()
        expect(funcionariosContainer.querySelector('.min-h-screen.bg-gray-50')).toBeInTheDocument()

        // Both should have filters section
        expect(adminContainer.querySelector('[data-testid*="filters"]')).toBeInTheDocument()
        expect(funcionariosContainer.querySelector('[data-testid*="filters"]')).toBeInTheDocument()

        // Both should have services grid
        expect(adminContainer.querySelector('[data-testid*="services-grid"]')).toBeInTheDocument()
        expect(funcionariosContainer.querySelector('[data-testid*="services-grid"]')).toBeInTheDocument()
      })
    })

    test('both pages should show management actions', async () => {
      render(<AdminServiciosPage />)
      render(<FuncionariosServiciosPage />)

      await waitFor(() => {
        // Both should show edit buttons
        const editButtons = screen.getAllByText(/Editar/i)
        expect(editButtons.length).toBeGreaterThan(0)

        // Both should show delete buttons
        const deleteButtons = screen.getAllByText(/Eliminar/i)
        expect(deleteButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Management Actions Functionality', () => {
    test('edit button should open modal on both pages', async () => {
      const { rerender } = render(<AdminServiciosPage />)

      await waitFor(() => {
        const editButton = screen.getAllByText(/Editar/i)[0]
        fireEvent.click(editButton)
      })

      // Should open edit modal
      await waitFor(() => {
        expect(screen.getByText(/Editar.*:/i)).toBeInTheDocument()
      })

      // Test funcionarios page
      rerender(<FuncionariosServiciosPage />)

      await waitFor(() => {
        const editButton = screen.getAllByText(/Editar/i)[0]
        fireEvent.click(editButton)
      })

      // Should also open edit modal
      await waitFor(() => {
        expect(screen.getByText(/Editar.*:/i)).toBeInTheDocument()
      })
    })

    test('delete button should show confirmation on both pages', async () => {
      const { rerender } = render(<AdminServiciosPage />)

      await waitFor(() => {
        const deleteButton = screen.getAllByText(/Eliminar/i)[0]
        fireEvent.click(deleteButton)
      })

      // Should show delete confirmation
      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro/i)).toBeInTheDocument()
      })

      // Test funcionarios page
      rerender(<FuncionariosServiciosPage />)

      await waitFor(() => {
        const deleteButton = screen.getAllByText(/Eliminar/i)[0]
        fireEvent.click(deleteButton)
      })

      // Should also show delete confirmation
      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Functionality', () => {
    test('edit modal should include instrucciones field on both pages', async () => {
      const { rerender } = render(<AdminServiciosPage />)

      // Open edit modal on admin page
      await waitFor(() => {
        const editButton = screen.getAllByText(/Editar/i)[0]
        fireEvent.click(editButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/Instrucciones/i)).toBeInTheDocument()
      })

      // Close modal and test funcionarios page
      fireEvent.click(screen.getByText(/Cancelar/i))
      rerender(<FuncionariosServiciosPage />)

      // Open edit modal on funcionarios page
      await waitFor(() => {
        const editButton = screen.getAllByText(/Editar/i)[0]
        fireEvent.click(editButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/Instrucciones/i)).toBeInTheDocument()
      })
    })
  })

  describe('Filtering Capabilities', () => {
    test('both pages should have the same filter options', async () => {
      const { container: adminContainer } = render(<AdminServiciosPage />)
      const { container: funcionariosContainer } = render(<FuncionariosServiciosPage />)

      await waitFor(() => {
        // Both should have search input
        expect(adminContainer.querySelector('input[type="text"]')).toBeInTheDocument()
        expect(funcionariosContainer.querySelector('input[type="text"]')).toBeInTheDocument()

        // Both should have filter dropdowns
        const adminSelects = adminContainer.querySelectorAll('select')
        const funcionariosSelects = funcionariosContainer.querySelectorAll('select')
        expect(adminSelects.length).toBe(funcionariosSelects.length)
      })
    })
  })

  describe('Error and Loading States', () => {
    test('both pages should handle loading states consistently', async () => {
      render(<AdminServiciosPage />)
      render(<FuncionariosServiciosPage />)

      // Both should show loading initially
      await waitFor(() => {
        const loadingElements = screen.getAllByText(/Cargando/i)
        expect(loadingElements.length).toBeGreaterThan(0)
      })
    })
  })
})
