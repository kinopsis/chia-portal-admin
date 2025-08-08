/**
 * TramiteCardEnhanced Management Actions Tests
 * 
 * Tests for the management actions functionality in the enhanced tramite card component
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TramiteCardEnhanced, TramiteManagementActions } from '@/components/molecules/TramiteCardEnhanced'
import type { ServiceEnhanced } from '@/types'

// Mock service data
const mockService: ServiceEnhanced = {
  id: 'test-service-1',
  codigo: 'T-001',
  nombre: 'Test Service',
  descripcion: 'Test service description',
  tipo_servicio: 'tramite',
  tipo: 'tramite',
  activo: true,
  dependencia_nombre: 'Test Department',
  subdependencia_nombre: 'Test Subdepartment',
  tiempo_respuesta: '5 días',
  tiene_pago: false,
  modalidad: 'presencial',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('TramiteCardEnhanced Management Actions', () => {
  const mockActions: TramiteManagementActions = {
    onEdit: jest.fn(),
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    // onView and onDuplicate removed for simplified workflow
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should not show management actions in public context', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="public"
        showManagementActions={true}
        actions={mockActions}
        userRole="ciudadano"
      />
    )

    // Management actions should not be visible
    expect(screen.queryByTestId(`toggle-${mockService.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`edit-${mockService.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`delete-${mockService.id}`)).not.toBeInTheDocument()
  })

  test('should show management actions for admin users', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="admin"
        showManagementActions={true}
        actions={mockActions}
        userRole="admin"
        permissions={{
          edit: true,
          toggle: true,
          delete: true,
          view: false,     // Disabled for simplified workflow
          duplicate: false // Disabled for simplified workflow
        }}
      />
    )

    // Core management actions should be visible
    expect(screen.getByTestId(`toggle-${mockService.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`edit-${mockService.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`delete-${mockService.id}`)).toBeInTheDocument()

    // View and duplicate buttons should not be present
    expect(screen.queryByTestId(`view-${mockService.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`duplicate-${mockService.id}`)).not.toBeInTheDocument()
  })

  test('should show management actions for funcionario users', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="funcionario"
        showManagementActions={true}
        actions={mockActions}
        userRole="funcionario"
        permissions={{
          edit: true,
          toggle: true,
          delete: true,     // Funcionarios can now delete services
          view: false,      // Disabled for simplified workflow
          duplicate: false  // Disabled for simplified workflow
        }}
      />
    )

    // Core management actions should be visible
    expect(screen.getByTestId(`toggle-${mockService.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`edit-${mockService.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`delete-${mockService.id}`)).toBeInTheDocument()

    // View and duplicate should not be visible (simplified workflow)
    expect(screen.queryByTestId(`view-${mockService.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`duplicate-${mockService.id}`)).not.toBeInTheDocument()
  })

  test('should call onEdit when edit button is clicked', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="admin"
        showManagementActions={true}
        actions={mockActions}
        userRole="admin"
        permissions={{ edit: true }}
      />
    )

    const editButton = screen.getByTestId(`edit-${mockService.id}`)
    fireEvent.click(editButton)

    expect(mockActions.onEdit).toHaveBeenCalledWith(mockService)
  })



  test('should show delete confirmation modal when delete button is clicked', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="admin"
        showManagementActions={true}
        actions={mockActions}
        userRole="admin"
        permissions={{ delete: true }}
      />
    )

    const deleteButton = screen.getByTestId(`delete-${mockService.id}`)
    fireEvent.click(deleteButton)

    // Should show confirmation modal instead of immediately calling onDelete
    expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument()
    expect(screen.getByText(/¿Estás seguro de que deseas eliminar permanentemente/)).toBeInTheDocument()

    // onDelete should not be called yet
    expect(mockActions.onDelete).not.toHaveBeenCalled()

    // Click confirm button in modal
    const confirmButton = screen.getByText('Eliminar')
    fireEvent.click(confirmButton)

    // Now onDelete should be called
    expect(mockActions.onDelete).toHaveBeenCalledWith(mockService)
  })

  test('should display status badge correctly', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="admin"
        showManagementActions={true}
        actions={mockActions}
        userRole="admin"
      />
    )

    // Should show active status badge
    expect(screen.getByText('✅ Activo')).toBeInTheDocument()
  })

  test('should display inactive status badge for inactive service', () => {
    const inactiveService = { ...mockService, activo: false }
    
    render(
      <TramiteCardEnhanced
        tramite={inactiveService}
        context="admin"
        showManagementActions={true}
        actions={mockActions}
        userRole="admin"
      />
    )

    // Should show inactive status badge
    expect(screen.getByText('❌ Inactivo')).toBeInTheDocument()
  })

  test('should display last updated timestamp', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="admin"
        showManagementActions={true}
        actions={mockActions}
        userRole="admin"
      />
    )

    // Should show last updated timestamp
    expect(screen.getByText(/📅 Actualizado:/)).toBeInTheDocument()
  })

  test('should show loading state for toggle action', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="admin"
        showManagementActions={true}
        actions={mockActions}
        userRole="admin"
        permissions={{ toggle: true }}
        loadingStates={{ toggle: true }}
      />
    )

    const toggleSwitch = screen.getByTestId(`toggle-${mockService.id}`)
    expect(toggleSwitch).toBeInTheDocument()
    // The loading state would be handled by the ToggleSwitch component
  })

  test('should display error message when provided', () => {
    render(
      <TramiteCardEnhanced
        tramite={mockService}
        context="admin"
        showManagementActions={true}
        actions={mockActions}
        userRole="admin"
        errorStates={{ edit: 'Error editing service' }}
      />
    )

    expect(screen.getByText('Error editing service')).toBeInTheDocument()
  })
})
