import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import DataTable from '@/components/organisms/DataTable'
import type { Column, RowAction, BulkAction } from '@/components/organisms/DataTable'

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

interface TestUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  active: boolean
  score: number
  createdAt: string
  department: string
}

const generateTestData = (count: number): TestUser[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: ['admin', 'user', 'moderator'][index % 3] as TestUser['role'],
    active: index % 2 === 0,
    score: Math.floor(Math.random() * 100),
    createdAt: new Date(2024, 0, index + 1).toISOString(),
    department: ['Engineering', 'Marketing', 'Sales', 'HR'][index % 4],
  }))
}

const testColumns: Column<TestUser>[] = [
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
    ],
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
    key: 'score',
    title: 'Score',
    sortable: true,
    filterable: true,
    filterType: 'range',
    dataType: 'number',
  },
  {
    key: 'department',
    title: 'Department',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Sales', value: 'Sales' },
      { label: 'HR', value: 'HR' },
    ],
  },
]

const testRowActions: RowAction<TestUser>[] = [
  {
    key: 'view',
    label: 'View',
    icon: '👁️',
    onClick: jest.fn(),
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: '✏️',
    onClick: jest.fn(),
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: '🗑️',
    variant: 'danger',
    onClick: jest.fn(),
    confirmMessage: 'Are you sure you want to delete this user?',
  },
]

const testBulkActions: BulkAction<TestUser>[] = [
  {
    key: 'activate',
    label: 'Activate Selected',
    icon: '✅',
    onClick: jest.fn(),
    minSelection: 1,
  },
  {
    key: 'delete-bulk',
    label: 'Delete Selected',
    icon: '🗑️',
    variant: 'danger',
    onClick: jest.fn(),
    confirmMessage: 'Are you sure you want to delete the selected users?',
    minSelection: 1,
  },
]

describe('DataTable Integration Tests', () => {
  const user = userEvent.setup()
  let testData: TestUser[]

  beforeEach(() => {
    jest.clearAllMocks()
    testData = generateTestData(50)
  })

  describe('Complete Feature Integration', () => {
    it('integrates search, filter, sort, and pagination together', async () => {
      const onSelectionChange = jest.fn()
      
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          onSelectionChange={onSelectionChange}
          rowActions={testRowActions}
          bulkActions={testBulkActions}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          searchable={true}
          filterable={true}
          advancedFilters={true}
        />
      )

      // 1. Search for specific users
      const searchInput = screen.getByPlaceholderText('Buscar...')
      await user.type(searchInput, 'User 1')
      
      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument()
        expect(screen.getByText('User 10')).toBeInTheDocument()
        expect(screen.queryByText('User 2')).not.toBeInTheDocument()
      })

      // 2. Clear search and apply role filter
      await user.clear(searchInput)
      
      const roleFilter = screen.getByLabelText('Role')
      await user.selectOptions(roleFilter, 'admin')
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        // Should only show admin users (header + admin rows)
        expect(rows.length).toBeGreaterThan(1)
      })

      // 3. Sort by name
      const nameHeader = screen.getByText('Name')
      await user.click(nameHeader)
      
      await waitFor(() => {
        const firstRow = screen.getAllByRole('row')[1] // Skip header
        expect(within(firstRow).getByText(/User \d+/)).toBeInTheDocument()
      })

      // 4. Select multiple rows
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // First data row
      await user.click(checkboxes[2]) // Second data row
      
      expect(onSelectionChange).toHaveBeenCalled()
      
      // 5. Execute bulk action
      const bulkActionButton = screen.getByText('Activate Selected')
      await user.click(bulkActionButton)
      
      expect(testBulkActions[0].onClick).toHaveBeenCalled()
    })

    it('maintains state consistency across all operations', async () => {
      const onSelectionChange = jest.fn()
      
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          onSelectionChange={onSelectionChange}
          pagination={{ pageSize: 5 }}
          defaultSort={{ key: 'name', direction: 'asc' }}
        />
      )

      // Select items on first page
      const firstPageCheckboxes = screen.getAllByRole('checkbox')
      await user.click(firstPageCheckboxes[1])
      await user.click(firstPageCheckboxes[2])
      
      // Navigate to second page
      const nextButton = screen.getByLabelText('Página siguiente')
      await user.click(nextButton)
      
      // Selection should be maintained
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.arrayContaining([1, 2]),
        expect.any(Array)
      )
      
      // Navigate back to first page
      const prevButton = screen.getByLabelText('Página anterior')
      await user.click(prevButton)
      
      // Selected items should still be checked
      const updatedCheckboxes = screen.getAllByRole('checkbox')
      expect(updatedCheckboxes[1]).toBeChecked()
      expect(updatedCheckboxes[2]).toBeChecked()
    })
  })

  describe('Row Actions Integration', () => {
    it('executes row actions with proper context', async () => {
      render(
        <DataTable
          data={testData.slice(0, 5)}
          columns={testColumns}
          rowActions={testRowActions}
        />
      )

      // Click edit action on first row
      const editButtons = screen.getAllByLabelText('Edit')
      await user.click(editButtons[0])
      
      expect(testRowActions[1].onClick).toHaveBeenCalledWith(
        testData[0],
        0
      )
    })

    it('shows confirmation dialog for destructive actions', async () => {
      render(
        <DataTable
          data={testData.slice(0, 5)}
          columns={testColumns}
          rowActions={testRowActions}
        />
      )

      // Click delete action
      const deleteButtons = screen.getAllByLabelText('Delete')
      await user.click(deleteButtons[0])
      
      // Should show confirmation dialog
      expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete this user?')).toBeInTheDocument()
      
      // Confirm deletion
      const confirmButton = screen.getByText('Confirmar')
      await user.click(confirmButton)
      
      expect(testRowActions[2].onClick).toHaveBeenCalledWith(
        testData[0],
        0
      )
    })
  })

  describe('Bulk Actions Integration', () => {
    it('executes bulk actions with selected items', async () => {
      const onSelectionChange = jest.fn()
      
      render(
        <DataTable
          data={testData.slice(0, 10)}
          columns={testColumns}
          selectable={true}
          onSelectionChange={onSelectionChange}
          bulkActions={testBulkActions}
        />
      )

      // Select multiple items
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])
      await user.click(checkboxes[2])
      await user.click(checkboxes[3])
      
      // Execute bulk action
      const activateButton = screen.getByText('Activate Selected')
      await user.click(activateButton)
      
      expect(testBulkActions[0].onClick).toHaveBeenCalledWith(
        expect.arrayContaining([testData[0], testData[1], testData[2]]),
        expect.arrayContaining([1, 2, 3])
      )
    })

    it('shows bulk action confirmation for destructive operations', async () => {
      const onSelectionChange = jest.fn()
      
      render(
        <DataTable
          data={testData.slice(0, 10)}
          columns={testColumns}
          selectable={true}
          onSelectionChange={onSelectionChange}
          bulkActions={testBulkActions}
        />
      )

      // Select items
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])
      await user.click(checkboxes[2])
      
      // Click bulk delete
      const deleteButton = screen.getByText('Delete Selected')
      await user.click(deleteButton)
      
      // Should show confirmation
      expect(screen.getByText('Confirmar acción masiva')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete the selected users?')).toBeInTheDocument()
      expect(screen.getByText('Esta acción afectará a 2 elementos.')).toBeInTheDocument()
    })
  })

  describe('Advanced Filtering Integration', () => {
    it('applies complex filter combinations', async () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          advancedFilters={true}
          filterable={true}
        />
      )

      // Open advanced filters
      const advancedButton = screen.getByText('Filtros Avanzados')
      await user.click(advancedButton)
      
      // Add role filter
      const addFilterButton = screen.getByText('Agregar Filtro')
      await user.click(addFilterButton)
      
      // Configure filter
      const fieldSelect = screen.getByDisplayValue('Seleccionar campo')
      await user.selectOptions(fieldSelect, 'role')
      
      const operatorSelect = screen.getByDisplayValue('Seleccionar operador')
      await user.selectOptions(operatorSelect, 'equals')
      
      const valueSelect = screen.getByDisplayValue('Seleccionar valor')
      await user.selectOptions(valueSelect, 'admin')
      
      // Apply filters
      const applyButton = screen.getByText('Aplicar Filtros')
      await user.click(applyButton)
      
      // Should show only admin users
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeGreaterThan(1) // Header + filtered rows
      })
    })
  })

  describe('Error Handling', () => {
    it('handles empty data gracefully', () => {
      render(
        <DataTable
          data={[]}
          columns={testColumns}
          emptyState={{
            title: 'No users found',
            description: 'Try adjusting your search criteria',
          }}
        />
      )

      expect(screen.getByText('No users found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument()
    })

    it('handles loading states properly', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          loading={true}
          loadingType="skeleton"
        />
      )

      // Should show skeleton loading
      expect(screen.getAllByRole('status')).toHaveLength(5) // Default skeleton rows
    })

    it('handles error states with retry functionality', async () => {
      const onRetry = jest.fn()
      
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          error="Failed to load data"
          onRetry={onRetry}
        />
      )

      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      
      const retryButton = screen.getByText('Reintentar')
      await user.click(retryButton)
      
      expect(onRetry).toHaveBeenCalled()
    })
  })
})
