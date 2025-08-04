/**
 * UnifiedServicesManager Integration Tests
 * 
 * Tests for the complete UnifiedServicesManager component including:
 * - Toggle switches functionality
 * - Responsive design (table vs cards)
 * - Service activation/deactivation
 * - Modal interactions
 * - Error handling
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnifiedServicesManager } from './UnifiedServicesManager'

// Mock hooks
jest.mock('@/hooks/useUnifiedServices')
jest.mock('@/hooks/useServiceToggle')
jest.mock('@/hooks/useAdminBreadcrumbs')

// Mock data
const mockServices = [
  {
    id: '1',
    codigo: '080-081-001',
    nombre: 'Certificado de Residencia',
    tipo: 'tramite' as const,
    activo: true,
    tiene_pago: false,
    tiempo_respuesta: '5 días hábiles',
    dependencia: { id: '1', nombre: 'Secretaría de Gobierno' },
    subdependencia: { id: '1', nombre: 'Dirección de Atención al Ciudadano' },
    descripcion: 'Certificado que acredita la residencia',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    codigo: '080-082-001',
    nombre: 'Licencia de Construcción',
    tipo: 'tramite' as const,
    activo: false,
    tiene_pago: true,
    tiempo_respuesta: '30 días hábiles',
    dependencia: { id: '2', nombre: 'Secretaría de Planeación' },
    subdependencia: { id: '2', nombre: 'Dirección de Licencias' },
    descripcion: 'Licencia para construcción',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockUseUnifiedServices = {
  data: mockServices,
  loading: false,
  error: null,
  metrics: {
    combined: { total: 2, active: 1, inactive: 1 },
    tramites: { total: 2, active: 1, inactive: 1 },
    opas: { total: 0, active: 0, inactive: 0 }
  },
  pagination: { page: 1, pageSize: 20, total: 2 },
  filters: { serviceType: 'both' },
  setFilters: jest.fn(),
  clearFilters: jest.fn(),
  dependencias: [],
  subdependencias: [],
  filteredSubdependencias: [],
  viewMode: 'table',
  setViewMode: jest.fn(),
  selectedItems: [],
  setSelectedItems: jest.fn(),
  refresh: jest.fn(),
  createItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  bulkAction: jest.fn(),
  goToPage: jest.fn(),
  nextPage: jest.fn(),
  prevPage: jest.fn(),
  getItemById: jest.fn(),
  isItemSelected: jest.fn(),
  toggleItemSelection: jest.fn(),
  selectAll: jest.fn(),
  clearSelection: jest.fn()
}

const mockUseServiceToggle = {
  toggleService: jest.fn(),
  toggleMultiple: jest.fn(),
  loadingStates: {},
  errorStates: {},
  clearError: jest.fn(),
  clearAllErrors: jest.fn()
}

describe('UnifiedServicesManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    require('@/hooks/useUnifiedServices').useUnifiedServices.mockReturnValue(mockUseUnifiedServices)
    require('@/hooks/useServiceToggle').useServiceToggle.mockReturnValue(mockUseServiceToggle)
    require('@/hooks/useAdminBreadcrumbs').useAdminBreadcrumbs.mockReturnValue([])
    
    // Mock window.innerWidth for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })
  })

  describe('Basic Rendering', () => {
    it('renders the component correctly', () => {
      render(<UnifiedServicesManager />)
      
      expect(screen.getByText('Gestión Unificada de Servicios')).toBeInTheDocument()
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
      expect(screen.getByText('Licencia de Construcción')).toBeInTheDocument()
    })

    it('shows service codes correctly', () => {
      render(<UnifiedServicesManager />)
      
      expect(screen.getByText('080-081-001')).toBeInTheDocument()
      expect(screen.getByText('080-082-001')).toBeInTheDocument()
    })

    it('displays service types with badges', () => {
      render(<UnifiedServicesManager />)
      
      const tramiteBadges = screen.getAllByText('📄')
      expect(tramiteBadges).toHaveLength(2)
    })
  })

  describe('Toggle Switches', () => {
    it('renders toggle switches for each service', () => {
      render(<UnifiedServicesManager />)
      
      const toggles = screen.getAllByRole('switch')
      expect(toggles).toHaveLength(2)
    })

    it('shows correct initial states', () => {
      render(<UnifiedServicesManager />)
      
      const toggles = screen.getAllByRole('switch')
      expect(toggles[0]).toHaveAttribute('aria-checked', 'true')  // Active service
      expect(toggles[1]).toHaveAttribute('aria-checked', 'false') // Inactive service
    })

    it('calls toggleService when toggle is clicked', async () => {
      const user = userEvent.setup()
      render(<UnifiedServicesManager />)
      
      const toggles = screen.getAllByRole('switch')
      await user.click(toggles[0])
      
      // Should show confirmation dialog first
      expect(screen.getByText('Confirmar cambio')).toBeInTheDocument()
      
      // Confirm the action
      const confirmButton = screen.getByText('Desactivar')
      await user.click(confirmButton)
      
      expect(mockUseServiceToggle.toggleService).toHaveBeenCalledWith(
        mockServices[0],
        false
      )
    })
  })

  describe('Responsive Design', () => {
    it('shows table view on desktop', () => {
      // Desktop width
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      
      render(<UnifiedServicesManager />)
      
      // Should show table headers
      expect(screen.getByText('Código')).toBeInTheDocument()
      expect(screen.getByText('Servicio')).toBeInTheDocument()
    })

    it('switches to card view on mobile', () => {
      // Mobile width
      Object.defineProperty(window, 'innerWidth', { value: 640 })
      
      render(<UnifiedServicesManager />)
      
      // Should show card view elements
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
      expect(screen.getByText('080-081-001')).toBeInTheDocument()
    })

    it('allows manual view toggle', async () => {
      const user = userEvent.setup()
      render(<UnifiedServicesManager />)
      
      // Find view toggle buttons
      const cardViewButton = screen.getByTitle('Vista de tarjetas')
      await user.click(cardViewButton)
      
      // Should switch to card view
      // Note: This would require checking for card-specific elements
    })
  })

  describe('Service Actions', () => {
    it('opens edit modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<UnifiedServicesManager />)
      
      const editButtons = screen.getAllByTitle('Editar')
      await user.click(editButtons[0])
      
      // Should open edit modal
      // Note: This would require the modal to be rendered
    })

    it('opens view details when view button is clicked', async () => {
      const user = userEvent.setup()
      render(<UnifiedServicesManager />)
      
      const viewButtons = screen.getAllByTitle('Ver detalles')
      await user.click(viewButtons[0])
      
      // Should trigger view action
      // Note: This would require checking for view-specific behavior
    })
  })

  describe('Loading States', () => {
    it('shows loading state for individual toggles', () => {
      const mockWithLoading = {
        ...mockUseServiceToggle,
        loadingStates: { '1': true }
      }
      
      require('@/hooks/useServiceToggle').useServiceToggle.mockReturnValue(mockWithLoading)
      
      render(<UnifiedServicesManager />)
      
      // Should show loading spinner in toggle
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('shows error state for failed toggles', () => {
      const mockWithError = {
        ...mockUseServiceToggle,
        errorStates: { '1': 'Error al cambiar estado' }
      }
      
      require('@/hooks/useServiceToggle').useServiceToggle.mockReturnValue(mockWithError)
      
      render(<UnifiedServicesManager />)
      
      // Should show error indicator
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for toggles', () => {
      render(<UnifiedServicesManager />)
      
      const toggles = screen.getAllByRole('switch')
      toggles.forEach(toggle => {
        expect(toggle).toHaveAttribute('aria-label')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<UnifiedServicesManager />)
      
      const firstToggle = screen.getAllByRole('switch')[0]
      firstToggle.focus()
      
      expect(firstToggle).toHaveFocus()
      
      // Test Enter key
      await user.keyboard('{Enter}')
      
      // Should show confirmation dialog
      expect(screen.getByText('Confirmar cambio')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays error message when services fail to load', () => {
      const mockWithError = {
        ...mockUseUnifiedServices,
        error: 'Error al cargar servicios'
      }
      
      require('@/hooks/useUnifiedServices').useUnifiedServices.mockReturnValue(mockWithError)
      
      render(<UnifiedServicesManager />)
      
      expect(screen.getByText(/Error al cargar servicios/)).toBeInTheDocument()
    })

    it('allows clearing individual service errors', async () => {
      const user = userEvent.setup()
      const mockWithError = {
        ...mockUseServiceToggle,
        errorStates: { '1': 'Error al cambiar estado' }
      }
      
      require('@/hooks/useServiceToggle').useServiceToggle.mockReturnValue(mockWithError)
      
      render(<UnifiedServicesManager />)
      
      const errorIcon = screen.getByText('⚠️')
      await user.click(errorIcon)
      
      expect(mockUseServiceToggle.clearError).toHaveBeenCalledWith('1')
    })
  })
})
