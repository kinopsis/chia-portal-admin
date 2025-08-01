import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '@/components/organisms'
import type { Column } from '@/components/organisms/DataTable/DataTable'

interface TestData {
  id: string
  codigo: string
  nombre: string
  tipo: string
  estado: string
  descripcion: string
}

const testData: TestData[] = [
  {
    id: '1',
    codigo: 'TR001',
    nombre: 'Certificado de Residencia',
    tipo: 'gratuito',
    estado: 'activo',
    descripcion: 'Certificado que acredita la residencia del ciudadano',
  },
  {
    id: '2',
    codigo: 'TR002',
    nombre: 'Licencia de Construcción',
    tipo: 'pago',
    estado: 'activo',
    descripcion: 'Permiso para realizar construcciones',
  },
  {
    id: '3',
    codigo: 'OP001',
    nombre: 'Proceso de Contratación',
    tipo: 'proceso',
    estado: 'borrador',
    descripcion: 'Proceso administrativo de contratación pública',
  },
  {
    id: '4',
    codigo: 'TR003',
    nombre: 'Certificado de Estratificación',
    tipo: 'gratuito',
    estado: 'inactivo',
    descripcion: 'Certificado del estrato socioeconómico',
  },
]

const testColumns: Column<TestData>[] = [
  {
    key: 'codigo',
    title: 'Código',
    sortable: true,
    searchable: true,
  },
  {
    key: 'nombre',
    title: 'Nombre',
    sortable: true,
    searchable: true,
  },
  {
    key: 'tipo',
    title: 'Tipo',
    sortable: true,
    searchable: true,
  },
  {
    key: 'estado',
    title: 'Estado',
    sortable: true,
    searchable: true,
  },
  {
    key: 'descripcion',
    title: 'Descripción',
    sortable: false,
    searchable: false, // This column should not be searchable
  },
]

describe('DataTable Search Functionality', () => {
  const user = userEvent.setup()

  it('renders search input when searchable=true', () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
      />
    )

    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('does not render search input when searchable=false', () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={false}
      />
    )

    expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument()
  })

  it('filters data based on search input in searchable columns', async () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
      />
    )

    // Initially all rows should be visible
    expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
    expect(screen.getByText('Licencia de Construcción')).toBeInTheDocument()
    expect(screen.getByText('Proceso de Contratación')).toBeInTheDocument()
    expect(screen.getByText('Certificado de Estratificación')).toBeInTheDocument()

    // Search for "certificado"
    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'certificado')

    await waitFor(() => {
      // Should show only rows with "certificado" in searchable columns
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
      expect(screen.getByText('Certificado de Estratificación')).toBeInTheDocument()
      expect(screen.queryByText('Licencia de Construcción')).not.toBeInTheDocument()
      expect(screen.queryByText('Proceso de Contratación')).not.toBeInTheDocument()
    })
  })

  it('searches by codigo field', async () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'TR001')

    await waitFor(() => {
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
      expect(screen.queryByText('Licencia de Construcción')).not.toBeInTheDocument()
      expect(screen.queryByText('Proceso de Contratación')).not.toBeInTheDocument()
      expect(screen.queryByText('Certificado de Estratificación')).not.toBeInTheDocument()
    })
  })

  it('searches by tipo field', async () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'gratuito')

    await waitFor(() => {
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
      expect(screen.getByText('Certificado de Estratificación')).toBeInTheDocument()
      expect(screen.queryByText('Licencia de Construcción')).not.toBeInTheDocument()
      expect(screen.queryByText('Proceso de Contratación')).not.toBeInTheDocument()
    })
  })

  it('searches by estado field', async () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'borrador')

    await waitFor(() => {
      expect(screen.getByText('Proceso de Contratación')).toBeInTheDocument()
      expect(screen.queryByText('Certificado de Residencia')).not.toBeInTheDocument()
      expect(screen.queryByText('Licencia de Construcción')).not.toBeInTheDocument()
      expect(screen.queryByText('Certificado de Estratificación')).not.toBeInTheDocument()
    })
  })

  it('does not search in non-searchable columns', async () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    // Search for text that only exists in the descripcion field (which is not searchable)
    await user.type(searchInput, 'acredita')

    await waitFor(() => {
      // Should show no results since descripcion is not searchable
      expect(screen.queryByText('Certificado de Residencia')).not.toBeInTheDocument()
      expect(screen.queryByText('Licencia de Construcción')).not.toBeInTheDocument()
      expect(screen.queryByText('Proceso de Contratación')).not.toBeInTheDocument()
      expect(screen.queryByText('Certificado de Estratificación')).not.toBeInTheDocument()
    })
  })

  it('clears search results when input is cleared', async () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    
    // Search for something
    await user.type(searchInput, 'certificado')
    
    await waitFor(() => {
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
      expect(screen.queryByText('Licencia de Construcción')).not.toBeInTheDocument()
    })

    // Clear the search
    await user.clear(searchInput)

    await waitFor(() => {
      // All rows should be visible again
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
      expect(screen.getByText('Licencia de Construcción')).toBeInTheDocument()
      expect(screen.getByText('Proceso de Contratación')).toBeInTheDocument()
      expect(screen.getByText('Certificado de Estratificación')).toBeInTheDocument()
    })
  })

  it('search is case insensitive', async () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'CERTIFICADO')

    await waitFor(() => {
      expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
      expect(screen.getByText('Certificado de Estratificación')).toBeInTheDocument()
      expect(screen.queryByText('Licencia de Construcción')).not.toBeInTheDocument()
    })
  })

  it('shows empty state when no results match search', async () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
        emptyText="No se encontraron resultados"
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'xyz123')

    await waitFor(() => {
      expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument()
      expect(screen.queryByText('Certificado de Residencia')).not.toBeInTheDocument()
    })
  })

  it('uses custom search placeholder', () => {
    render(
      <DataTable
        data={testData}
        columns={testColumns}
        searchable={true}
        searchPlaceholder="Buscar trámites..."
      />
    )

    expect(screen.getByPlaceholderText('Buscar trámites...')).toBeInTheDocument()
  })
})
