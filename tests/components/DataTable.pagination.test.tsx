import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import DataTable from '@/components/organisms/DataTable'
import type { Column } from '@/components/organisms/DataTable'

interface TestData {
  id: number
  name: string
  age: number
  status: 'active' | 'inactive'
}

// Generate test data
const generateTestData = (count: number): TestData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 50),
    status: i % 2 === 0 ? 'active' : 'inactive',
  }))
}

const columns: Column<TestData>[] = [
  { key: 'id', title: 'ID', sortable: true },
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true },
  { key: 'status', title: 'Status', sortable: true },
]

describe('DataTable Pagination Integration', () => {
  it('renders paginated data correctly', () => {
    const data = generateTestData(25)
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 25,
      onChange: jest.fn(),
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} />)

    // Should show first 10 records
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('User 10')).toBeInTheDocument()
    expect(screen.queryByText('User 11')).not.toBeInTheDocument()

    // Should show pagination controls
    expect(screen.getByText(/Mostrando 1-10 de 25 registros/)).toBeInTheDocument()
  })

  it('changes page and displays correct data', async () => {
    const data = generateTestData(25)
    const onChange = jest.fn()
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 25,
      onChange,
    }

    const { rerender } = render(
      <DataTable data={data} columns={columns} pagination={pagination} />
    )

    // Click page 2
    fireEvent.click(screen.getByText('2'))
    expect(onChange).toHaveBeenCalledWith(2, 10)

    // Simulate page change
    rerender(
      <DataTable 
        data={data} 
        columns={columns} 
        pagination={{ ...pagination, current: 2 }} 
      />
    )

    // Should show records 11-20
    expect(screen.getByText('User 11')).toBeInTheDocument()
    expect(screen.getByText('User 20')).toBeInTheDocument()
    expect(screen.queryByText('User 10')).not.toBeInTheDocument()
    expect(screen.queryByText('User 21')).not.toBeInTheDocument()
  })

  it('maintains sorting across page changes', () => {
    const data = generateTestData(25)
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 25,
      onChange: jest.fn(),
    }

    render(
      <DataTable 
        data={data} 
        columns={columns} 
        pagination={pagination}
        sortable={true}
      />
    )

    // Sort by name (should be alphabetical)
    fireEvent.click(screen.getByText('Name'))

    // First page should show sorted data
    const rows = screen.getAllByRole('row')
    // Skip header row, check first data row
    expect(rows[1]).toHaveTextContent('User 1')
  })

  it('handles page size changes correctly', () => {
    const data = generateTestData(50)
    const onChange = jest.fn()
    const onShowSizeChange = jest.fn()
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 50,
      showSizeChanger: true,
      onChange,
      onShowSizeChange,
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} />)

    // Change page size
    const select = screen.getByLabelText('Registros por página')
    fireEvent.change(select, { target: { value: '25' } })

    expect(onShowSizeChange).toHaveBeenCalledWith(1, 25)
    expect(onChange).toHaveBeenCalledWith(1, 25)
  })

  it('shows pagination at different positions', () => {
    const data = generateTestData(25)
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 25,
      position: 'both' as const,
      onChange: jest.fn(),
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} />)

    // Should have pagination both at top and bottom
    const paginationElements = screen.getAllByText(/Mostrando 1-10 de 25 registros/)
    expect(paginationElements).toHaveLength(2)
  })

  it('hides pagination on single page when hideOnSinglePage is true', () => {
    const data = generateTestData(5)
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 5,
      hideOnSinglePage: true,
      onChange: jest.fn(),
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} />)

    // Should not show pagination controls
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Página siguiente')).not.toBeInTheDocument()
  })

  it('disables pagination during loading', () => {
    const data = generateTestData(25)
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 25,
      onChange: jest.fn(),
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} loading={true} />)

    // Pagination buttons should be disabled
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled()
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
  })

  it('handles quick jump functionality', () => {
    const data = generateTestData(100)
    const onChange = jest.fn()
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 100,
      showQuickJumper: true,
      onChange,
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} />)

    const input = screen.getByLabelText('Ir a página')
    const button = screen.getByText('Ir')

    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.click(button)

    expect(onChange).toHaveBeenCalledWith(5, 10)
  })

  it('preserves selection state across pages when possible', () => {
    const data = generateTestData(25)
    const onSelectionChange = jest.fn()
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 25,
      onChange: jest.fn(),
    }

    render(
      <DataTable 
        data={data} 
        columns={columns} 
        pagination={pagination}
        selectable={true}
        selectedRowKeys={[1, 2, 15]} // Some on current page, some on other pages
        onSelectionChange={onSelectionChange}
      />
    )

    // Should show checkboxes for items on current page as selected
    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is "select all", then individual row checkboxes
    expect(checkboxes[1]).toBeChecked() // ID 1
    expect(checkboxes[2]).toBeChecked() // ID 2
    expect(checkboxes[3]).not.toBeChecked() // ID 3
  })

  it('calculates correct total pages', () => {
    const data = generateTestData(23) // Not evenly divisible
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 23,
      onChange: jest.fn(),
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} />)

    // Should show page 3 as last page (23 records / 10 per page = 3 pages)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.queryByText('4')).not.toBeInTheDocument()
  })

  it('handles empty data with pagination', () => {
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 0,
      onChange: jest.fn(),
    }

    render(<DataTable data={[]} columns={columns} pagination={pagination} />)

    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument()
    expect(screen.getByText(/Mostrando 0-0 de 0 registros/)).toBeInTheDocument()
  })

  it('works without pagination (shows all data)', () => {
    const data = generateTestData(25)

    render(<DataTable data={data} columns={columns} />)

    // Should show all records
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('User 25')).toBeInTheDocument()

    // Should not show pagination controls
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument()
  })

  it('supports simple pagination mode', () => {
    const data = generateTestData(25)
    const pagination = {
      current: 2,
      pageSize: 10,
      total: 25,
      simple: true,
      onChange: jest.fn(),
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} />)

    expect(screen.getByText('← Anterior')).toBeInTheDocument()
    expect(screen.getByText('Siguiente →')).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('handles keyboard navigation in pagination', () => {
    const data = generateTestData(25)
    const onChange = jest.fn()
    const pagination = {
      current: 1,
      pageSize: 10,
      total: 25,
      onChange,
    }

    render(<DataTable data={data} columns={columns} pagination={pagination} />)

    const nextButton = screen.getByLabelText('Página siguiente')
    fireEvent.keyDown(nextButton, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(2, 10)
  })
})
