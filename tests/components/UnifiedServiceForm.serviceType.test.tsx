/**
 * @file UnifiedServiceForm Service Type Initialization Tests
 * @description Tests for the critical OPA service type initialization bug fix
 * 
 * This test suite validates the fix for Issue #1: OPA Service Type Field Locked During Editing
 * where OPA editing showed "Trámite" instead of "OPA" in the dropdown.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { UnifiedServiceForm } from '@/components/organisms/UnifiedServiceForm/UnifiedServiceForm'
import { UnifiedServiceItem } from '@/types/services'

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', role: 'admin' }
  })
}))

jest.mock('@/hooks/useDependencias', () => ({
  useDependencias: () => ({
    dependencias: [],
    loading: false,
    error: null
  })
}))

jest.mock('@/hooks/useSubdependencias', () => ({
  useSubdependencias: () => ({
    subdependencias: [],
    loading: false,
    error: null
  })
}))

// Mock OPA data from database (simulating "Historia laboral" OPA)
const mockOPAData: UnifiedServiceItem = {
  id: 'opa-historia-laboral',
  codigo: 'O-020-021-017',
  nombre: 'Historia laboral',
  descripcion: 'Servicio de atención al ciudadano para historia laboral.',
  tipo_servicio: 'opa',
  categoria: 'atencion_ciudadana',
  dependencia_id: 'dep-secretaria-general',
  subdependencia_id: 'subdep-funcion-publica',
  requiere_pago: false,
  tiempo_respuesta: '30 minutos',
  activo: true,
  requisitos: ['Documento de identidad'],
  instrucciones: ['Dirigirse a la oficina de atención'],
  url_suit: '',
  url_gov: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// Mock Trámite data for comparison
const mockTramiteData: UnifiedServiceItem = {
  ...mockOPAData,
  id: 'tramite-test',
  codigo: 'T-001-001-001',
  nombre: 'Test Trámite',
  tipo_servicio: 'tramite'
}

describe('UnifiedServiceForm - Service Type Initialization Fix', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CRITICAL BUG FIX: OPA Service Type Initialization', () => {
    it('should initialize service type as "opa" when editing OPA service', async () => {
      render(
        <UnifiedServiceForm
          mode="edit"
          initialData={mockOPAData}
          serviceType="opa"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        // The service type dropdown should show "OPA" option selected
        const serviceTypeSelect = screen.getByDisplayValue('OPA (Otros Procedimientos Administrativos)')
        expect(serviceTypeSelect).toBeInTheDocument()
      })
    })

    it('should initialize service type as "opa" when initialData.tipo_servicio is "opa"', async () => {
      render(
        <UnifiedServiceForm
          mode="edit"
          initialData={mockOPAData}
          // No explicit serviceType prop - should derive from initialData
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        // Should resolve to "opa" based on initialData.tipo_servicio
        const serviceTypeSelect = screen.getByDisplayValue('OPA (Otros Procedimientos Administrativos)')
        expect(serviceTypeSelect).toBeInTheDocument()
      })
    })

    it('should NOT show "Trámite" when editing OPA service (regression test)', async () => {
      render(
        <UnifiedServiceForm
          mode="edit"
          initialData={mockOPAData}
          serviceType="opa"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        // Should NOT show "Trámite" as selected value
        expect(screen.queryByDisplayValue('Trámite')).not.toBeInTheDocument()
        
        // Should show "OPA" as selected value
        const serviceTypeSelect = screen.getByDisplayValue('OPA (Otros Procedimientos Administrativos)')
        expect(serviceTypeSelect).toBeInTheDocument()
      })
    })
  })

  describe('Service Type Initialization Logic', () => {
    it('should prioritize explicit serviceType prop over initialData', async () => {
      // Edge case: initialData says "tramite" but serviceType prop says "opa"
      const conflictData = { ...mockOPAData, tipo_servicio: 'tramite' as const }
      
      render(
        <UnifiedServiceForm
          mode="edit"
          initialData={conflictData}
          serviceType="opa" // Explicit prop should win
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        const serviceTypeSelect = screen.getByDisplayValue('OPA (Otros Procedimientos Administrativos)')
        expect(serviceTypeSelect).toBeInTheDocument()
      })
    })

    it('should handle legacy "servicio" type by mapping to "tramite"', async () => {
      const legacyData = { ...mockOPAData, tipo_servicio: 'servicio' as any }
      
      render(
        <UnifiedServiceForm
          mode="edit"
          initialData={legacyData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        const serviceTypeSelect = screen.getByDisplayValue('Trámite')
        expect(serviceTypeSelect).toBeInTheDocument()
      })
    })

    it('should default to "tramite" when no data is provided', async () => {
      render(
        <UnifiedServiceForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        const serviceTypeSelect = screen.getByDisplayValue('Trámite')
        expect(serviceTypeSelect).toBeInTheDocument()
      })
    })
  })

  describe('Form Field Pre-population (Issue #2)', () => {
    it('should pre-populate form fields correctly for OPA editing', async () => {
      render(
        <UnifiedServiceForm
          mode="edit"
          initialData={mockOPAData}
          serviceType="opa"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        // Check all form fields are pre-populated
        expect(screen.getByDisplayValue('Historia laboral')).toBeInTheDocument()
        expect(screen.getByDisplayValue('O-020-021-017')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Servicio de atención al ciudadano para historia laboral.')).toBeInTheDocument()
        expect(screen.getByDisplayValue('30 minutos')).toBeInTheDocument()
      })
    })
  })

  describe('Service Type Options Validation', () => {
    it('should provide correct service type options', async () => {
      render(
        <UnifiedServiceForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        // Check that both options are available
        expect(screen.getByText('Trámite')).toBeInTheDocument()
        expect(screen.getByText('OPA (Otros Procedimientos Administrativos)')).toBeInTheDocument()
      })
    })
  })

  describe('Comparison: Trámite vs OPA Editing', () => {
    it('should correctly initialize Trámite service type', async () => {
      render(
        <UnifiedServiceForm
          mode="edit"
          initialData={mockTramiteData}
          serviceType="tramite"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        const serviceTypeSelect = screen.getByDisplayValue('Trámite')
        expect(serviceTypeSelect).toBeInTheDocument()
      })
    })

    it('should handle both OPA and Trámite editing consistently', async () => {
      const { rerender } = render(
        <UnifiedServiceForm
          mode="edit"
          initialData={mockOPAData}
          serviceType="opa"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        expect(screen.getByDisplayValue('OPA (Otros Procedimientos Administrativos)')).toBeInTheDocument()
      })

      // Re-render with Trámite data
      rerender(
        <UnifiedServiceForm
          mode="edit"
          initialData={mockTramiteData}
          serviceType="tramite"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await waitFor(() => {
        expect(screen.getByDisplayValue('Trámite')).toBeInTheDocument()
      })
    })
  })
})
