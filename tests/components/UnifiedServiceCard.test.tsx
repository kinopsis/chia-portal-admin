/**
 * Tests for UnifiedServiceCard component
 * Verifies the unified card design system works correctly for both Trámites and OPAs
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { UnifiedServiceCard, UnifiedServiceCardGrid } from '@/components/molecules/UnifiedServiceCard'
import type { UnifiedServiceData, ManagementActions } from '@/components/molecules/UnifiedServiceCard'

// Mock the text utils
jest.mock('@/utils/textUtils', () => ({
  getServiceDescription: jest.fn((item) => item.descripcion || 'Default description'),
  truncateByChars: jest.fn((text, maxChars) => text.length > maxChars ? text.substring(0, maxChars) + '...' : text),
  isMeaningfulText: jest.fn((text) => text && text.length > 10)
}))

describe('UnifiedServiceCard', () => {
  const mockTramite: UnifiedServiceData = {
    id: 'tramite-1',
    codigo: 'TR-001',
    nombre: 'Certificado de Residencia',
    descripcion: 'Certificado oficial que acredita la residencia del solicitante en el municipio',
    tipo: 'tramite',
    activo: true,
    dependencia: 'Secretaría de Gobierno',
    subdependencia: 'Dirección de Atención al Ciudadano',
    tiempo_estimado: '5 días hábiles',
    vistas: 150,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    originalData: {
      tiene_pago: false,
      requiere_pago: false,
      requisitos: ['Cédula de ciudadanía', 'Recibo de servicios públicos'],
      visualizacion_suit: 'https://suit.gov.co/tramite-1',
      visualizacion_gov: 'https://gov.co/tramite-1'
    }
  }

  const mockOPA: UnifiedServiceData = {
    id: 'opa-1',
    codigo: 'OPA-001',
    nombre: 'Atención al Ciudadano - Secretaría de Medio Ambiente',
    descripcion: 'Servicio de atención personalizada para consultas ambientales',
    tipo: 'opa',
    activo: true,
    dependencia: 'Secretaría de Medio Ambiente',
    tiempo_estimado: '30 minutos',
    vistas: 75,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  }

  const mockActions: ManagementActions = {
    onEdit: jest.fn(),
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn(),
    onDuplicate: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Visual Design Consistency', () => {
    test('should render trámite card with correct visual elements', () => {
      render(
        <UnifiedServiceCard
          service={mockTramite}
          context="public"
          userRole="ciudadano"
        />
      )

      // Check header badges
      expect(screen.getByText('📄 TRÁMITE TR-001')).toBeInTheDocument()
      expect(screen.getByText('🆓 Gratuito')).toBeInTheDocument()

      // Check title
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()

      // Check dependency hierarchy
      expect(screen.getByText('Secretaría de Gobierno')).toBeInTheDocument()
      expect(screen.getByText('Dirección de Atención al Ciudadano')).toBeInTheDocument()

      // Check description section
      expect(screen.getByText('Descripción:')).toBeInTheDocument()

      // Check estimated time
      expect(screen.getByText('Tiempo estimado:')).toBeInTheDocument()
      expect(screen.getByText('5 días hábiles')).toBeInTheDocument()

      // Check views
      expect(screen.getByText('👁️ 150 vistas')).toBeInTheDocument()
    })

    test('should render OPA card with correct visual elements', () => {
      render(
        <UnifiedServiceCard
          service={mockOPA}
          context="public"
          userRole="ciudadano"
        />
      )

      // Check header badge
      expect(screen.getByText('⚡ OPA OPA-001')).toBeInTheDocument()

      // Check title
      expect(screen.getByText('Atención al Ciudadano - Secretaría de Medio Ambiente')).toBeInTheDocument()

      // Check dependency
      expect(screen.getByText('Secretaría de Medio Ambiente')).toBeInTheDocument()

      // Check estimated time
      expect(screen.getByText('30 minutos')).toBeInTheDocument()
    })

    test('should show payment badge correctly for paid trámites', () => {
      const paidTramite = {
        ...mockTramite,
        originalData: {
          ...mockTramite.originalData,
          tiene_pago: true,
          requiere_pago: true
        }
      }

      render(
        <UnifiedServiceCard
          service={paidTramite}
          context="public"
          userRole="ciudadano"
        />
      )

      expect(screen.getByText('💰 Con pago')).toBeInTheDocument()
    })
  })

  describe('Management Actions', () => {
    test('should show management actions for admin users', () => {
      render(
        <UnifiedServiceCard
          service={mockTramite}
          actions={mockActions}
          context="admin"
          userRole="admin"
          permissions={{
            edit: true,
            toggle: true,
            delete: true,
            view: true,
            duplicate: true
          }}
        />
      )

      // Check status badge for admin context
      expect(screen.getByText('✅ Activo')).toBeInTheDocument()

      // Check management buttons
      expect(screen.getByTestId(`view-${mockTramite.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`edit-${mockTramite.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`duplicate-${mockTramite.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`delete-${mockTramite.id}`)).toBeInTheDocument()

      // Check toggle switch
      expect(screen.getByTestId(`toggle-${mockTramite.id}`)).toBeInTheDocument()
    })

    test('should not show management actions for public users', () => {
      render(
        <UnifiedServiceCard
          service={mockTramite}
          actions={mockActions}
          context="public"
          userRole="ciudadano"
        />
      )

      // Should not show status badge
      expect(screen.queryByText('✅ Activo')).not.toBeInTheDocument()

      // Should not show management buttons
      expect(screen.queryByTestId(`view-${mockTramite.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`edit-${mockTramite.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`toggle-${mockTramite.id}`)).not.toBeInTheDocument()
    })

    test('should call action handlers when buttons are clicked', async () => {
      render(
        <UnifiedServiceCard
          service={mockTramite}
          actions={mockActions}
          context="admin"
          userRole="admin"
        />
      )

      // Test edit button
      fireEvent.click(screen.getByTestId(`edit-${mockTramite.id}`))
      expect(mockActions.onEdit).toHaveBeenCalledWith(mockTramite)

      // Test view button
      fireEvent.click(screen.getByTestId(`view-${mockTramite.id}`))
      expect(mockActions.onView).toHaveBeenCalledWith(mockTramite)

      // Test duplicate button
      fireEvent.click(screen.getByTestId(`duplicate-${mockTramite.id}`))
      expect(mockActions.onDuplicate).toHaveBeenCalledWith(mockTramite)

      // Test delete button
      fireEvent.click(screen.getByTestId(`delete-${mockTramite.id}`))
      expect(mockActions.onDelete).toHaveBeenCalledWith(mockTramite)
    })
  })

  describe('Requirements Section', () => {
    test('should show expandable requirements for trámites', () => {
      render(
        <UnifiedServiceCard
          service={mockTramite}
          context="public"
          userRole="ciudadano"
        />
      )

      // Check requirements button
      const requirementsButton = screen.getByText('Requisitos (2)')
      expect(requirementsButton).toBeInTheDocument()

      // Expand requirements
      fireEvent.click(requirementsButton)

      // Check requirements list
      expect(screen.getByText('Cédula de ciudadanía')).toBeInTheDocument()
      expect(screen.getByText('Recibo de servicios públicos')).toBeInTheDocument()

      // Check government links
      expect(screen.getByText('SUIT')).toBeInTheDocument()
      expect(screen.getByText('GOV.CO')).toBeInTheDocument()
    })

    test('should not show requirements section for OPAs', () => {
      render(
        <UnifiedServiceCard
          service={mockOPA}
          context="public"
          userRole="ciudadano"
        />
      )

      expect(screen.queryByText(/Requisitos/)).not.toBeInTheDocument()
    })
  })

  describe('Description Handling', () => {
    test('should show full description when "Ver más" is clicked', () => {
      const longDescription = 'A'.repeat(250) // Long description
      const serviceWithLongDescription = {
        ...mockTramite,
        descripcion: longDescription
      }

      render(
        <UnifiedServiceCard
          service={serviceWithLongDescription}
          context="public"
          userRole="ciudadano"
        />
      )

      // Should show "Ver más" button
      const verMasButton = screen.getByText('Ver más')
      expect(verMasButton).toBeInTheDocument()

      // Click to expand
      fireEvent.click(verMasButton)

      // Should show "Ver menos" button
      expect(screen.getByText('Ver menos')).toBeInTheDocument()
    })
  })

  describe('Loading and Error States', () => {
    test('should show loading states for specific actions', () => {
      render(
        <UnifiedServiceCard
          service={mockTramite}
          actions={mockActions}
          context="admin"
          userRole="admin"
          loadingStates={{
            toggle: true,
            edit: true
          }}
        />
      )

      // Toggle switch should show loading
      const toggleSwitch = screen.getByTestId(`toggle-${mockTramite.id}`)
      expect(toggleSwitch).toHaveAttribute('aria-busy', 'true')

      // Edit button should show loading
      const editButton = screen.getByTestId(`edit-${mockTramite.id}`)
      expect(editButton).toBeDisabled()
    })

    test('should show error messages', () => {
      render(
        <UnifiedServiceCard
          service={mockTramite}
          actions={mockActions}
          context="admin"
          userRole="admin"
          errorStates={{
            toggle: 'Error al cambiar estado',
            edit: 'Error al editar servicio'
          }}
        />
      )

      expect(screen.getByText('Error al cambiar estado')).toBeInTheDocument()
      expect(screen.getByText('Error al editar servicio')).toBeInTheDocument()
    })
  })
})

describe('UnifiedServiceCardGrid', () => {
  const mockServices: UnifiedServiceData[] = [
    {
      id: 'service-1',
      codigo: 'TR-001',
      nombre: 'Service 1',
      descripcion: 'Description 1',
      tipo: 'tramite',
      activo: true,
      dependencia: 'Dep 1'
    },
    {
      id: 'service-2',
      codigo: 'OPA-001',
      nombre: 'Service 2',
      descripcion: 'Description 2',
      tipo: 'opa',
      activo: true,
      dependencia: 'Dep 2'
    }
  ]

  test('should render multiple service cards', () => {
    render(
      <UnifiedServiceCardGrid
        services={mockServices}
        context="public"
        userRole="ciudadano"
      />
    )

    expect(screen.getByText('Service 1')).toBeInTheDocument()
    expect(screen.getByText('Service 2')).toBeInTheDocument()
  })

  test('should show loading skeleton when loading', () => {
    render(
      <UnifiedServiceCardGrid
        services={[]}
        loading={true}
        skeletonCount={3}
        context="public"
        userRole="ciudadano"
      />
    )

    // Should show skeleton cards
    expect(screen.getByTestId('skeleton-card-0')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-card-2')).toBeInTheDocument()
  })

  test('should show empty state when no services', () => {
    render(
      <UnifiedServiceCardGrid
        services={[]}
        context="public"
        userRole="ciudadano"
      />
    )

    expect(screen.getByText('No se encontraron servicios')).toBeInTheDocument()
  })

  test('should show custom empty state', () => {
    const customEmptyState = <div>Custom empty message</div>

    render(
      <UnifiedServiceCardGrid
        services={[]}
        emptyState={customEmptyState}
        context="public"
        userRole="ciudadano"
      />
    )

    expect(screen.getByText('Custom empty message')).toBeInTheDocument()
  })
})
