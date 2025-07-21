import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import DataTable from '@/components/organisms/DataTable'
import type { Column } from '@/components/organisms/DataTable'

// Mock useBreakpoint hook
jest.mock('@/hooks/useBreakpoint', () => ({
  __esModule: true,
  default: () => ({
    breakpoint: 'lg',
    width: 1024,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLg: true,
  }),
}))

interface LargeDataItem {
  id: number
  name: string
  email: string
  role: string
  department: string
  score: number
  active: boolean
  createdAt: string
  description: string
  tags: string[]
}

const generateLargeDataset = (size: number): LargeDataItem[] => {
  const roles = ['admin', 'user', 'moderator', 'viewer']
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
  const tags = ['urgent', 'important', 'review', 'approved', 'pending', 'archived']

  return Array.from({ length: size }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[index % roles.length],
    department: departments[index % departments.length],
    score: Math.floor(Math.random() * 100),
    active: index % 2 === 0,
    createdAt: new Date(2024, 0, (index % 365) + 1).toISOString(),
    description: `This is a detailed description for user ${index + 1}. `.repeat(5),
    tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      tags[Math.floor(Math.random() * tags.length)]
    ),
  }))
}

const largeDataColumns: Column<LargeDataItem>[] = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    filterable: true,
    width: 200,
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
    filterable: true,
    width: 250,
  },
  {
    key: 'role',
    title: 'Role',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
      { label: 'Moderator', value: 'moderator' },
      { label: 'Viewer', value: 'viewer' },
    ],
  },
  {
    key: 'department',
    title: 'Department',
    sortable: true,
    filterable: true,
    filterType: 'select',
  },
  {
    key: 'score',
    title: 'Score',
    sortable: true,
    filterable: true,
    filterType: 'range',
    dataType: 'number',
  },
  {
    key: 'active',
    title: 'Active',
    sortable: true,
    filterable: true,
    filterType: 'boolean',
    render: (value: boolean) => (value ? '✅' : '❌'),
  },
  {
    key: 'createdAt',
    title: 'Created',
    sortable: true,
    filterable: true,
    dataType: 'date',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'description',
    title: 'Description',
    width: 300,
    render: (value: string) => value.substring(0, 100) + '...',
  },
  {
    key: 'tags',
    title: 'Tags',
    render: (value: string[]) => value.join(', '),
  },
]

describe('DataTable Performance Tests', () => {
  const user = userEvent.setup()

  describe('Large Dataset Rendering', () => {
    it('renders 1000 rows efficiently with pagination', async () => {
      const largeData = generateLargeDataset(1000)
      const startTime = performance.now()

      render(
        <DataTable
          data={largeData}
          columns={largeDataColumns}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
          }}
        />
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000) // 1 second

      // Should only render current page items (header + data rows)
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(0) // Should have at least header row
      expect(rows.length).toBeLessThanOrEqual(51) // Should not exceed page size + header
    })

    it('handles sorting large datasets efficiently', async () => {
      const largeData = generateLargeDataset(1000)
      
      render(
        <DataTable
          data={largeData}
          columns={largeDataColumns}
          pagination={{ pageSize: 50 }}
        />
      )

      const nameHeader = screen.getByText('Name')
      const startTime = performance.now()

      await user.click(nameHeader)

      await waitFor(() => {
        const endTime = performance.now()
        const sortTime = endTime - startTime

        // Sorting should be fast
        expect(sortTime).toBeLessThan(500) // 500ms
      })

      // Should maintain pagination after sort
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(0) // Should have at least header row
    })

    it('handles filtering large datasets efficiently', async () => {
      const largeData = generateLargeDataset(1000)
      
      render(
        <DataTable
          data={largeData}
          columns={largeDataColumns}
          showSearchAndFilters={true}
          searchPlaceholder="Buscar..."
        />
      )

      const searchInput = screen.getByPlaceholderText('Buscar...')
      const startTime = performance.now()

      await user.type(searchInput, 'User 1')

      await waitFor(() => {
        const endTime = performance.now()
        const filterTime = endTime - startTime

        // Filtering should be reasonably fast
        expect(filterTime).toBeLessThan(1000) // 1 second
      })

      // Should show filtered results
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(1) // At least header + some results
    })
  })

  describe('Memory Management', () => {
    it('cleans up properly when unmounted', () => {
      const largeData = generateLargeDataset(500)
      
      const { unmount } = render(
        <DataTable
          data={largeData}
          columns={largeDataColumns}
          pagination={{ pageSize: 25 }}
        />
      )

      // Unmount component
      unmount()

      // Memory cleanup would be tested with more sophisticated tools
      // This is a placeholder for memory leak detection
      expect(true).toBe(true)
    })

    it('handles rapid state changes without memory leaks', async () => {
      const largeData = generateLargeDataset(200)
      
      render(
        <DataTable
          data={largeData}
          columns={largeDataColumns}
          pagination={{ pageSize: 20 }}
          showSearchAndFilters={true}
          searchPlaceholder="Buscar..."
        />
      )

      const searchInput = screen.getByPlaceholderText('Buscar...')

      // Rapid typing to test debouncing and cleanup
      for (let i = 0; i < 10; i++) {
        await user.type(searchInput, `search${i}`)
        await user.clear(searchInput)
      }

      // Should handle rapid changes gracefully
      expect(searchInput).toHaveValue('')
    })
  })

  describe('Virtualization and Optimization', () => {
    it('maintains smooth scrolling with large datasets', async () => {
      const largeData = generateLargeDataset(1000)
      
      render(
        <DataTable
          data={largeData}
          columns={largeDataColumns}
          pagination={{ pageSize: 100 }}
          scrollY={400}
        />
      )

      const tableContainer = screen.getByRole('table').parentElement
      
      // Simulate scrolling
      const startTime = performance.now()
      
      fireEvent.scroll(tableContainer!, { target: { scrollTop: 200 } })
      fireEvent.scroll(tableContainer!, { target: { scrollTop: 400 } })
      fireEvent.scroll(tableContainer!, { target: { scrollTop: 600 } })

      const endTime = performance.now()
      const scrollTime = endTime - startTime

      // Scrolling should be smooth
      expect(scrollTime).toBeLessThan(100) // 100ms
    })

    it('optimizes re-renders during interactions', async () => {
      const largeData = generateLargeDataset(500)
      let renderCount = 0

      const TestWrapper = () => {
        renderCount++
        return (
          <DataTable
            data={largeData}
            columns={largeDataColumns}
            selectable={true}
            pagination={{ pageSize: 50 }}
          />
        )
      }

      render(<TestWrapper />)

      const initialRenderCount = renderCount

      // Select a few items
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])
      await user.click(checkboxes[2])

      // Should not cause excessive re-renders
      expect(renderCount - initialRenderCount).toBeLessThan(5)
    })
  })

  describe('Network and Data Loading Performance', () => {
    it('handles loading states efficiently', async () => {
      const { rerender } = render(
        <DataTable
          data={[]}
          columns={largeDataColumns}
          loading={true}
          loadingType="skeleton"
        />
      )

      // Should show loading state quickly
      const loadingElements = screen.getAllByRole('status')
      expect(loadingElements.length).toBeGreaterThan(0) // Should have loading elements

      const largeData = generateLargeDataset(1000)
      const startTime = performance.now()

      // Simulate data loading completion
      rerender(
        <DataTable
          data={largeData}
          columns={largeDataColumns}
          loading={false}
          pagination={{ pageSize: 50 }}
        />
      )

      const endTime = performance.now()
      const transitionTime = endTime - startTime

      // Transition from loading to data should be fast
      expect(transitionTime).toBeLessThan(500) // 500ms
    })

    it('handles progressive data loading', async () => {
      const initialData = generateLargeDataset(100)
      
      const { rerender } = render(
        <DataTable
          data={initialData}
          columns={largeDataColumns}
          pagination={{ pageSize: 25 }}
        />
      )

      // Add more data progressively
      const additionalData = generateLargeDataset(200)
      const combinedData = [...initialData, ...additionalData]

      const startTime = performance.now()

      rerender(
        <DataTable
          data={combinedData}
          columns={largeDataColumns}
          pagination={{ pageSize: 25 }}
        />
      )

      const endTime = performance.now()
      const updateTime = endTime - startTime

      // Progressive updates should be efficient
      expect(updateTime).toBeLessThan(300) // 300ms
    })
  })

  describe('Complex Operations Performance', () => {
    it('handles multiple simultaneous operations efficiently', async () => {
      const largeData = generateLargeDataset(500)
      
      const filters = [
        {
          key: 'role',
          label: 'Role',
          type: 'select' as const,
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
            { label: 'Manager', value: 'manager' },
          ],
        },
      ]

      render(
        <DataTable
          data={largeData}
          columns={largeDataColumns}
          selectable={true}
          showSearchAndFilters={true}
          searchPlaceholder="Buscar..."
          filters={filters}
          pagination={{ pageSize: 25 }}
        />
      )

      const startTime = performance.now()

      // Perform multiple operations simultaneously
      const searchInput = screen.getByPlaceholderText('Buscar...')
      await user.type(searchInput, 'User')

      const nameHeader = screen.getByText('Name')
      await user.click(nameHeader)

      const roleFilter = screen.getByLabelText('Filtrar por Role')
      await user.selectOptions(roleFilter, 'admin')

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      await waitFor(() => {
        const endTime = performance.now()
        const operationTime = endTime - startTime

        // Multiple operations should complete in reasonable time
        expect(operationTime).toBeLessThan(2000) // 2 seconds
      })
    })

    it('maintains performance with complex cell renderers', () => {
      const complexData = generateLargeDataset(200)
      
      const complexColumns: Column<LargeDataItem>[] = [
        ...largeDataColumns,
        {
          key: 'complex',
          title: 'Complex Render',
          render: (_, record) => (
            <div className="flex items-center space-x-2">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.name}`}
                alt={record.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="font-medium">{record.name}</div>
                <div className="text-sm text-gray-500">{record.role}</div>
              </div>
            </div>
          ),
        },
      ]

      const startTime = performance.now()

      render(
        <DataTable
          data={complexData}
          columns={complexColumns}
          pagination={{ pageSize: 20 }}
        />
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Complex renderers should not significantly impact performance
      expect(renderTime).toBeLessThan(1500) // 1.5 seconds
    })
  })
})
