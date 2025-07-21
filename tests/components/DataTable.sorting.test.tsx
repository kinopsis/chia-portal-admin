import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import DataTable from '@/components/organisms/DataTable'
import type { Column, SortConfig } from '@/components/organisms/DataTable'

interface TestData {
  id: number
  name: string
  age: number
  date: string
  status: 'active' | 'inactive'
}

const mockData: TestData[] = [
  { id: 1, name: 'Alice Johnson', age: 30, date: '2024-01-15', status: 'active' },
  { id: 2, name: 'Bob Smith', age: 25, date: '2024-01-10', status: 'inactive' },
  { id: 3, name: 'Charlie Brown', age: 35, date: '2024-01-20', status: 'active' },
  { id: 4, name: 'Diana Prince', age: 28, date: '2024-01-05', status: 'active' },
]

const columns: Column<TestData>[] = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    key: 'age',
    title: 'Age',
    sortable: true,
  },
  {
    key: 'date',
    title: 'Date',
    sortable: true,
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
  },
]

describe('DataTable Sorting', () => {
  it('renders sortable column headers with sort icons', () => {
    render(<DataTable data={mockData} columns={columns} />)

    columns.forEach(column => {
      const header = screen.getByText(column.title)
      expect(header).toBeInTheDocument()
      
      // Check for sort icons (▲ and ▼)
      const headerCell = header.closest('th')
      expect(headerCell).toHaveTextContent('▲')
      expect(headerCell).toHaveTextContent('▼')
    })
  })

  it('sorts data by single column on click', async () => {
    render(<DataTable data={mockData} columns={columns} />)

    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // Skip header row, check data rows
      expect(rows[1]).toHaveTextContent('Alice Johnson')
      expect(rows[2]).toHaveTextContent('Bob Smith')
      expect(rows[3]).toHaveTextContent('Charlie Brown')
      expect(rows[4]).toHaveTextContent('Diana Prince')
    })
  })

  it('reverses sort direction on second click', async () => {
    render(<DataTable data={mockData} columns={columns} />)

    const nameHeader = screen.getByText('Name')
    
    // First click - ascending
    fireEvent.click(nameHeader)
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Alice Johnson')
    })

    // Second click - descending
    fireEvent.click(nameHeader)
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Diana Prince')
    })
  })

  it('supports multi-column sorting with Shift+click', async () => {
    const onSort = jest.fn()
    render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        multiSort={true}
        onSort={onSort}
      />
    )

    const nameHeader = screen.getByText('Name')
    const ageHeader = screen.getByText('Age')

    // First sort by name
    fireEvent.click(nameHeader)
    expect(onSort).toHaveBeenCalledWith([
      { key: 'name', direction: 'asc', priority: 0 }
    ])

    // Then sort by age with Shift+click
    fireEvent.click(ageHeader, { shiftKey: true })
    expect(onSort).toHaveBeenCalledWith([
      { key: 'name', direction: 'asc', priority: 0 },
      { key: 'age', direction: 'asc', priority: 1 }
    ])
  })

  it('shows priority numbers for multi-column sorting', () => {
    const sortConfig: SortConfig<TestData>[] = [
      { key: 'name', direction: 'asc', priority: 0 },
      { key: 'age', direction: 'desc', priority: 1 },
    ]

    render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        multiSort={true}
        sortConfig={sortConfig}
      />
    )

    // Check for priority indicators
    expect(screen.getByText('1')).toBeInTheDocument() // First priority
    expect(screen.getByText('2')).toBeInTheDocument() // Second priority
  })

  it('uses custom sorter functions when provided', async () => {
    const customColumns: Column<TestData>[] = [
      {
        key: 'name',
        title: 'Name',
        sortable: true,
        sorter: (a, b) => {
          // Custom sort: by last name
          const lastNameA = a.name.split(' ')[1]
          const lastNameB = b.name.split(' ')[1]
          return lastNameA.localeCompare(lastNameB)
        },
      },
    ]

    render(<DataTable data={mockData} columns={customColumns} />)

    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // Should be sorted by last name: Brown, Johnson, Prince, Smith
      expect(rows[1]).toHaveTextContent('Charlie Brown')
      expect(rows[2]).toHaveTextContent('Alice Johnson')
      expect(rows[3]).toHaveTextContent('Diana Prince')
      expect(rows[4]).toHaveTextContent('Bob Smith')
    })
  })

  it('supports keyboard navigation for sorting', () => {
    const onSort = jest.fn()
    render(<DataTable data={mockData} columns={columns} onSort={onSort} />)

    const nameHeader = screen.getByText('Name')
    const headerCell = nameHeader.closest('th')

    // Should be focusable
    expect(headerCell).toHaveAttribute('tabIndex', '0')
    expect(headerCell).toHaveAttribute('role', 'button')

    // Test Enter key
    fireEvent.keyDown(headerCell!, { key: 'Enter' })
    expect(onSort).toHaveBeenCalled()

    // Test Space key
    fireEvent.keyDown(headerCell!, { key: ' ' })
    expect(onSort).toHaveBeenCalled()
  })

  it('has proper ARIA labels for accessibility', () => {
    render(<DataTable data={mockData} columns={columns} multiSort={true} />)

    const nameHeader = screen.getByText('Name')
    const headerCell = nameHeader.closest('th')

    expect(headerCell).toHaveAttribute('aria-label')
    expect(headerCell?.getAttribute('aria-label')).toContain('Ordenar por Name')
    expect(headerCell?.getAttribute('aria-label')).toContain('Mantén Shift para ordenamiento múltiple')
  })

  it('handles controlled sorting', () => {
    const sortConfig: SortConfig<TestData>[] = [
      { key: 'age', direction: 'desc', priority: 0 }
    ]

    const { rerender } = render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        sortConfig={sortConfig}
      />
    )

    // Should show data sorted by age descending
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Charlie Brown') // age 35

    // Update sort config
    const newSortConfig: SortConfig<TestData>[] = [
      { key: 'name', direction: 'asc', priority: 0 }
    ]

    rerender(
      <DataTable 
        data={mockData} 
        columns={columns} 
        sortConfig={newSortConfig}
      />
    )

    // Should now show data sorted by name ascending
    const updatedRows = screen.getAllByRole('row')
    expect(updatedRows[1]).toHaveTextContent('Alice Johnson')
  })

  it('removes sort when cycling through directions in multi-sort', () => {
    const onSort = jest.fn()
    const initialSort: SortConfig<TestData>[] = [
      { key: 'name', direction: 'asc', priority: 0 }
    ]

    render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        multiSort={true}
        sortConfig={initialSort}
        onSort={onSort}
      />
    )

    const nameHeader = screen.getByText('Name')

    // Click with Shift to change direction
    fireEvent.click(nameHeader, { shiftKey: true })
    expect(onSort).toHaveBeenCalledWith([
      { key: 'name', direction: 'desc', priority: 0 }
    ])

    // Click again with Shift to remove sort
    fireEvent.click(nameHeader, { shiftKey: true })
    expect(onSort).toHaveBeenCalledWith([])
  })

  it('handles empty data gracefully', () => {
    render(<DataTable data={[]} columns={columns} />)

    // Should still render headers with sort functionality
    columns.forEach(column => {
      const header = screen.getByText(column.title)
      expect(header).toBeInTheDocument()
    })

    // Should show empty state
    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument()
  })

  it('disables sorting when sortable is false', () => {
    const nonSortableColumns: Column<TestData>[] = [
      {
        key: 'name',
        title: 'Name',
        sortable: false,
      },
    ]

    render(<DataTable data={mockData} columns={nonSortableColumns} />)

    const nameHeader = screen.getByText('Name')
    const headerCell = nameHeader.closest('th')

    // Should not be clickable
    expect(headerCell).not.toHaveAttribute('role', 'button')
    expect(headerCell).not.toHaveAttribute('tabIndex')
    
    // Should not have sort icons
    expect(headerCell).not.toHaveTextContent('▲')
    expect(headerCell).not.toHaveTextContent('▼')
  })
})
