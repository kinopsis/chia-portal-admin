import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import SearchAndFilters from '@/components/molecules/SearchAndFilters'
import type { FilterConfig, FilterPreset } from '@/components/molecules/SearchAndFilters'

const mockFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { label: 'Activo', value: 'active' },
      { label: 'Inactivo', value: 'inactive' },
    ],
  },
  {
    key: 'name',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Buscar por nombre...',
  },
  {
    key: 'age',
    label: 'Edad',
    type: 'number',
    min: 0,
    max: 100,
  },
  {
    key: 'birthDate',
    label: 'Fecha de Nacimiento',
    type: 'date',
  },
  {
    key: 'dateRange',
    label: 'Rango de Fechas',
    type: 'dateRange',
  },
  {
    key: 'isActive',
    label: 'Activo',
    type: 'boolean',
  },
]

const mockPresets: FilterPreset[] = [
  {
    id: 'active-users',
    name: 'Usuarios Activos',
    filters: { status: 'active' },
    isDefault: true,
  },
  {
    id: 'recent',
    name: 'Recientes',
    filters: { dateRange: { start: '2024-01-01', end: '2024-12-31' } },
  },
]

describe('SearchAndFilters', () => {
  const defaultProps = {
    onSearchChange: jest.fn(),
    onFiltersChange: jest.fn(),
    onPresetSelect: jest.fn(),
    onPresetSave: jest.fn(),
    onClearAll: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input when showSearch is true', () => {
    render(<SearchAndFilters {...defaultProps} showSearch={true} />)
    
    expect(screen.getByLabelText('Buscar en la tabla')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('does not render search input when showSearch is false', () => {
    render(<SearchAndFilters {...defaultProps} showSearch={false} />)
    
    expect(screen.queryByLabelText('Buscar en la tabla')).not.toBeInTheDocument()
  })

  it('debounces search input changes', async () => {
    const onSearchChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        onSearchChange={onSearchChange}
        debounceMs={100}
      />
    )

    const searchInput = screen.getByLabelText('Buscar en la tabla')
    
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    // Should not call immediately
    expect(onSearchChange).not.toHaveBeenCalled()
    
    // Should call after debounce delay
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('test')
    }, { timeout: 200 })
  })

  it('renders filter inputs based on configuration', () => {
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
      />
    )

    expect(screen.getByLabelText('Filtrar por Estado')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por Edad')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por Fecha de Nacimiento')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por Activo')).toBeInTheDocument()
  })

  it('handles text filter changes', () => {
    const onFiltersChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />
    )

    const nameInput = screen.getByLabelText('Filtrar por Nombre')
    fireEvent.change(nameInput, { target: { value: 'John' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ name: 'John' })
  })

  it('handles select filter changes', () => {
    const onFiltersChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />
    )

    const statusSelect = screen.getByLabelText('Filtrar por Estado')
    fireEvent.change(statusSelect, { target: { value: 'active' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'active' })
  })

  it('handles number filter changes', () => {
    const onFiltersChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />
    )

    const ageInput = screen.getByLabelText('Filtrar por Edad')
    fireEvent.change(ageInput, { target: { value: '25' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ age: 25 })
  })

  it('handles date filter changes', () => {
    const onFiltersChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />
    )

    const dateInput = screen.getByLabelText('Filtrar por Fecha de Nacimiento')
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ birthDate: '2024-01-15' })
  })

  it('handles date range filter changes', () => {
    const onFiltersChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />
    )

    const startDateInput = screen.getByLabelText('Rango de Fechas - Fecha inicio')
    const endDateInput = screen.getByLabelText('Rango de Fechas - Fecha fin')

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })
    expect(onFiltersChange).toHaveBeenCalledWith({ 
      dateRange: { start: '2024-01-01', end: '' }
    })

    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } })
    expect(onFiltersChange).toHaveBeenCalledWith({ 
      dateRange: { start: '2024-01-01', end: '2024-12-31' }
    })
  })

  it('handles boolean filter changes', () => {
    const onFiltersChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
        onFiltersChange={onFiltersChange}
      />
    )

    const booleanSelect = screen.getByLabelText('Filtrar por Activo')
    fireEvent.change(booleanSelect, { target: { value: 'true' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ isActive: true })
  })

  it('renders filter presets', () => {
    render(
      <SearchAndFilters 
        {...defaultProps} 
        presets={mockPresets}
      />
    )

    expect(screen.getByText('Usuarios Activos')).toBeInTheDocument()
    expect(screen.getByText('Recientes')).toBeInTheDocument()
  })

  it('handles preset selection', () => {
    const onPresetSelect = jest.fn()
    const onFiltersChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        presets={mockPresets}
        onPresetSelect={onPresetSelect}
        onFiltersChange={onFiltersChange}
      />
    )

    fireEvent.click(screen.getByText('Usuarios Activos'))

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'active' })
    expect(onPresetSelect).toHaveBeenCalledWith(mockPresets[0])
  })

  it('shows clear all button when filters are active', () => {
    render(
      <SearchAndFilters 
        {...defaultProps} 
        searchValue="test"
        filterValues={{ status: 'active' }}
        showClearAll={true}
      />
    )

    expect(screen.getByText('Limpiar Todo')).toBeInTheDocument()
  })

  it('handles clear all action', () => {
    const onSearchChange = jest.fn()
    const onFiltersChange = jest.fn()
    const onClearAll = jest.fn()

    render(
      <SearchAndFilters 
        {...defaultProps} 
        searchValue="test"
        filterValues={{ status: 'active' }}
        onSearchChange={onSearchChange}
        onFiltersChange={onFiltersChange}
        onClearAll={onClearAll}
      />
    )

    fireEvent.click(screen.getByText('Limpiar Todo'))

    expect(onSearchChange).toHaveBeenCalledWith('')
    expect(onFiltersChange).toHaveBeenCalledWith({})
    expect(onClearAll).toHaveBeenCalled()
  })

  it('shows active filter count', () => {
    render(
      <SearchAndFilters 
        {...defaultProps} 
        searchValue="test"
        filterValues={{ status: 'active', name: 'John' }}
        showFilterCount={true}
      />
    )

    expect(screen.getByText('3 activos')).toBeInTheDocument()
  })

  it('supports collapsible mode', () => {
    render(
      <SearchAndFilters 
        {...defaultProps} 
        collapsible={true}
        defaultCollapsed={true}
        filterValues={{ status: 'active' }}
      />
    )

    // Should show collapsed state
    expect(screen.getByText('Filtros')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // Filter count badge

    // Should not show filter inputs
    expect(screen.queryByLabelText('Buscar en la tabla')).not.toBeInTheDocument()
  })

  it('handles save preset functionality', async () => {
    const onPresetSave = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filterValues={{ status: 'active' }}
        onPresetSave={onPresetSave}
      />
    )

    // Click save filter button
    fireEvent.click(screen.getByText('Guardar Filtro'))

    // Enter preset name
    const nameInput = screen.getByPlaceholderText('Nombre del filtro')
    fireEvent.change(nameInput, { target: { value: 'Mi Filtro' } })

    // Save preset
    fireEvent.click(screen.getByText('Guardar'))

    expect(onPresetSave).toHaveBeenCalledWith('Mi Filtro', { status: 'active' })
  })

  it('disables inputs when loading', () => {
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
        loading={true}
      />
    )

    expect(screen.getByLabelText('Buscar en la tabla')).toBeDisabled()
    expect(screen.getByLabelText('Filtrar por Estado')).toBeDisabled()
    expect(screen.getByLabelText('Filtrar por Nombre')).toBeDisabled()
  })

  it('removes filter when value is cleared', () => {
    const onFiltersChange = jest.fn()
    render(
      <SearchAndFilters 
        {...defaultProps} 
        filters={mockFilters}
        filterValues={{ name: 'John' }}
        onFiltersChange={onFiltersChange}
      />
    )

    const nameInput = screen.getByLabelText('Filtrar por Nombre')
    fireEvent.change(nameInput, { target: { value: '' } })

    expect(onFiltersChange).toHaveBeenCalledWith({})
  })

  it('supports keyboard navigation for save preset', () => {
    const onPresetSave = jest.fn()
    render(
      <SearchAndFilters
        {...defaultProps}
        filterValues={{ status: 'active' }}
        onPresetSave={onPresetSave}
      />
    )

    // Click save filter button
    fireEvent.click(screen.getByText('Guardar Filtro'))

    // Enter preset name and press Enter
    const nameInput = screen.getByPlaceholderText('Nombre del filtro')
    fireEvent.change(nameInput, { target: { value: 'Mi Filtro' } })
    fireEvent.keyDown(nameInput, { key: 'Enter' })

    expect(onPresetSave).toHaveBeenCalledWith('Mi Filtro', { status: 'active' })
  })
})
