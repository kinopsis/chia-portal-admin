import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import AdvancedFilterBuilder, { applyAdvancedFilters } from '@/components/molecules/AdvancedFilterBuilder'
import type { AdvancedFilterConfig, FilterGroup, FilterCondition } from '@/components/molecules/AdvancedFilterBuilder'

const mockFields: AdvancedFilterConfig[] = [
  {
    field: 'name',
    label: 'Nombre',
    dataType: 'string',
  },
  {
    field: 'age',
    label: 'Edad',
    dataType: 'number',
  },
  {
    field: 'birthDate',
    label: 'Fecha de Nacimiento',
    dataType: 'date',
  },
  {
    field: 'isActive',
    label: 'Activo',
    dataType: 'boolean',
  },
  {
    field: 'status',
    label: 'Estado',
    dataType: 'string',
    options: [
      { label: 'Activo', value: 'active' },
      { label: 'Inactivo', value: 'inactive' },
    ],
  },
]

const mockTestData = [
  { id: 1, name: 'Juan Pérez', age: 30, birthDate: '1994-01-15', isActive: true, status: 'active' },
  { id: 2, name: 'María García', age: 25, birthDate: '1999-05-20', isActive: false, status: 'inactive' },
  { id: 3, name: 'Carlos López', age: 35, birthDate: '1989-03-10', isActive: true, status: 'active' },
  { id: 4, name: 'Ana Martínez', age: 28, birthDate: '1996-08-05', isActive: true, status: 'active' },
]

describe('AdvancedFilterBuilder', () => {
  const defaultProps = {
    fields: mockFields,
    onChange: jest.fn(),
    onValidate: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the filter builder interface', () => {
    render(<AdvancedFilterBuilder {...defaultProps} />)
    
    expect(screen.getByText('Constructor de Filtros Avanzados')).toBeInTheDocument()
    expect(screen.getByText('+ Condición')).toBeInTheDocument()
    expect(screen.getByText('+ Grupo')).toBeInTheDocument()
  })

  it('adds a new condition when clicking + Condición', () => {
    const onChange = jest.fn()
    render(<AdvancedFilterBuilder {...defaultProps} onChange={onChange} />)

    fireEvent.click(screen.getByText('+ Condición'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            operator: 'equals',
            value: '',
            dataType: 'string',
          })
        ])
      })
    )
  })

  it('adds a new group when clicking + Grupo', () => {
    const onChange = jest.fn()
    render(<AdvancedFilterBuilder {...defaultProps} onChange={onChange} />)

    fireEvent.click(screen.getByText('+ Grupo'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            operator: 'AND',
            conditions: [],
            groups: [],
          })
        ])
      })
    )
  })

  it('renders existing filter group correctly', () => {
    const existingGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'contains',
          value: 'Juan',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    render(<AdvancedFilterBuilder {...defaultProps} filterGroup={existingGroup} />)

    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('contains')).toBeInTheDocument()
  })

  it('updates condition field when changed', () => {
    const onChange = jest.fn()
    const existingGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'equals',
          value: '',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    render(<AdvancedFilterBuilder {...defaultProps} filterGroup={existingGroup} onChange={onChange} />)

    const fieldSelect = screen.getByDisplayValue('Nombre')
    fireEvent.change(fieldSelect, { target: { value: 'age' } })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: expect.arrayContaining([
          expect.objectContaining({
            field: 'age',
            dataType: 'number',
            operator: 'equals',
            value: '',
          })
        ])
      })
    )
  })

  it('updates condition operator when changed', () => {
    const onChange = jest.fn()
    const existingGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'equals',
          value: '',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    render(<AdvancedFilterBuilder {...defaultProps} filterGroup={existingGroup} onChange={onChange} />)

    const operatorSelect = screen.getByDisplayValue('Igual a')
    fireEvent.change(operatorSelect, { target: { value: 'contains' } })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: expect.arrayContaining([
          expect.objectContaining({
            operator: 'contains',
            value: '',
          })
        ])
      })
    )
  })

  it('updates condition value when changed', () => {
    const onChange = jest.fn()
    const existingGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'contains',
          value: '',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    render(<AdvancedFilterBuilder {...defaultProps} filterGroup={existingGroup} onChange={onChange} />)

    const valueInput = screen.getByPlaceholderText('Valor...')
    fireEvent.change(valueInput, { target: { value: 'Juan' } })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: expect.arrayContaining([
          expect.objectContaining({
            value: 'Juan',
          })
        ])
      })
    )
  })

  it('removes condition when clicking remove button', () => {
    const onChange = jest.fn()
    const existingGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'equals',
          value: 'Juan',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    render(<AdvancedFilterBuilder {...defaultProps} filterGroup={existingGroup} onChange={onChange} />)

    const removeButton = screen.getByLabelText('Eliminar condición')
    fireEvent.click(removeButton)

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: [],
      })
    )
  })

  it('handles between operator with two values', () => {
    const onChange = jest.fn()
    const existingGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'age',
          operator: 'between',
          value: ['', ''],
          dataType: 'number',
        }
      ],
      groups: [],
    }

    render(<AdvancedFilterBuilder {...defaultProps} filterGroup={existingGroup} onChange={onChange} />)

    const startInput = screen.getByPlaceholderText('Valor inicial')
    const endInput = screen.getByPlaceholderText('Valor final')

    fireEvent.change(startInput, { target: { value: '20' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: expect.arrayContaining([
          expect.objectContaining({
            value: ['20', ''],
          })
        ])
      })
    )

    fireEvent.change(endInput, { target: { value: '30' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: expect.arrayContaining([
          expect.objectContaining({
            value: ['20', '30'],
          })
        ])
      })
    )
  })

  it('handles boolean field correctly', () => {
    const onChange = jest.fn()
    const existingGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'isActive',
          operator: 'equals',
          value: '',
          dataType: 'boolean',
        }
      ],
      groups: [],
    }

    render(<AdvancedFilterBuilder {...defaultProps} filterGroup={existingGroup} onChange={onChange} />)

    const booleanSelect = screen.getByDisplayValue('Seleccionar...')
    fireEvent.change(booleanSelect, { target: { value: 'true' } })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: expect.arrayContaining([
          expect.objectContaining({
            value: true,
          })
        ])
      })
    )
  })

  it('calls validation function when validate button is clicked', () => {
    const onValidate = jest.fn().mockReturnValue(['Error de prueba'])
    render(<AdvancedFilterBuilder {...defaultProps} onValidate={onValidate} />)

    fireEvent.click(screen.getByText('Validar'))

    expect(onValidate).toHaveBeenCalled()
    expect(screen.getByText('Error de prueba')).toBeInTheDocument()
  })

  it('disables inputs when disabled prop is true', () => {
    const existingGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'equals',
          value: 'Juan',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    render(<AdvancedFilterBuilder {...defaultProps} filterGroup={existingGroup} disabled={true} />)

    expect(screen.getByDisplayValue('Nombre')).toBeDisabled()
    expect(screen.getByDisplayValue('Igual a')).toBeDisabled()
    expect(screen.getByDisplayValue('Juan')).toBeDisabled()
  })
})

describe('applyAdvancedFilters', () => {
  it('filters data with equals operator', () => {
    const filterGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'equals',
          value: 'Juan Pérez',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    const result = applyAdvancedFilters(mockTestData, filterGroup)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Juan Pérez')
  })

  it('filters data with contains operator', () => {
    const filterGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'contains',
          value: 'Juan',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    const result = applyAdvancedFilters(mockTestData, filterGroup)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Juan Pérez')
  })

  it('filters data with greater_than operator', () => {
    const filterGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'age',
          operator: 'greater_than',
          value: 30,
          dataType: 'number',
        }
      ],
      groups: [],
    }

    const result = applyAdvancedFilters(mockTestData, filterGroup)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Carlos López')
  })

  it('filters data with between operator', () => {
    const filterGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'condition1',
          field: 'age',
          operator: 'between',
          value: [25, 30],
          dataType: 'number',
        }
      ],
      groups: [],
    }

    const result = applyAdvancedFilters(mockTestData, filterGroup)
    expect(result).toHaveLength(3) // Juan (30), María (25), Ana (28)
  })

  it('filters data with OR operator', () => {
    const filterGroup: FilterGroup = {
      id: 'root',
      operator: 'OR',
      conditions: [
        {
          id: 'condition1',
          field: 'name',
          operator: 'contains',
          value: 'Juan',
          dataType: 'string',
        },
        {
          id: 'condition2',
          field: 'name',
          operator: 'contains',
          value: 'María',
          dataType: 'string',
        }
      ],
      groups: [],
    }

    const result = applyAdvancedFilters(mockTestData, filterGroup)
    expect(result).toHaveLength(2) // Juan and María
  })

  it('handles nested groups correctly', () => {
    const filterGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [],
      groups: [
        {
          id: 'group1',
          operator: 'OR',
          conditions: [
            {
              id: 'condition1',
              field: 'name',
              operator: 'contains',
              value: 'Juan',
              dataType: 'string',
            },
            {
              id: 'condition2',
              field: 'name',
              operator: 'contains',
              value: 'María',
              dataType: 'string',
            }
          ],
          groups: [],
        }
      ],
    }

    const result = applyAdvancedFilters(mockTestData, filterGroup)
    expect(result).toHaveLength(2) // Juan and María
  })

  it('returns all data when no filters are applied', () => {
    const filterGroup: FilterGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [],
      groups: [],
    }

    const result = applyAdvancedFilters(mockTestData, filterGroup)
    expect(result).toHaveLength(4) // All records
  })
})
