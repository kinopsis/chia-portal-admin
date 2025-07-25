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

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  department: string
  active: boolean
  score: number
  createdAt: string
  lastLogin: string
}

const generateUsers = (count: number): User[] => {
  const roles: User['role'][] = ['admin', 'user', 'moderator']
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
  
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    email: `user${index + 1}@company.com`,
    role: roles[index % roles.length],
    department: departments[index % departments.length],
    active: index % 3 !== 0, // 2/3 active
    score: Math.floor(Math.random() * 100) + 1,
    createdAt: new Date(2024, 0, (index % 365) + 1).toISOString(),
    lastLogin: new Date(2024, 5, (index % 30) + 1).toISOString(),
  }))
}

const userColumns: Column<User>[] = [
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
      { label: 'Finance', value: 'Finance' },
    ],
  },
  {
    key: 'active',
    title: 'Status',
    sortable: true,
    filterable: true,
    filterType: 'boolean',
    render: (value: boolean) => (
      <span className={value ? 'text-green-600' : 'text-red-600'}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
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
    key: 'createdAt',
    title: 'Created',
    sortable: true,
    filterable: true,
    dataType: 'date',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
]

describe('DataTable End-to-End Workflows', () => {
  const user = userEvent.setup()
  let testUsers: User[]
  let mockRowActions: RowAction<User>[]
  let mockBulkActions: BulkAction<User>[]

  beforeEach(() => {
    jest.clearAllMocks()
    testUsers = generateUsers(100)
    
    mockRowActions = [
      {
        key: 'view',
        label: 'View Profile',
        icon: '👁️',
        onClick: jest.fn(),
      },
      {
        key: 'edit',
        label: 'Edit User',
        icon: '✏️',
        onClick: jest.fn(),
      },
      {
        key: 'toggle-status',
        label: 'Toggle Status',
        icon: '🔄',
        onClick: jest.fn(),
      },
      {
        key: 'delete',
        label: 'Delete User',
        icon: '🗑️',
        variant: 'danger',
        onClick: jest.fn(),
        confirmMessage: 'Are you sure you want to delete this user?',
      },
    ]

    mockBulkActions = [
      {
        key: 'activate',
        label: 'Activate Users',
        icon: '✅',
        onClick: jest.fn(),
        minSelection: 1,
      },
      {
        key: 'deactivate',
        label: 'Deactivate Users',
        icon: '❌',
        onClick: jest.fn(),
        minSelection: 1,
      },
      {
        key: 'export',
        label: 'Export to CSV',
        icon: '📥',
        onClick: jest.fn(),
        minSelection: 1,
      },
      {
        key: 'delete-bulk',
        label: 'Delete Users',
        icon: '🗑️',
        variant: 'danger',
        onClick: jest.fn(),
        confirmMessage: 'Are you sure you want to delete the selected users?',
        minSelection: 1,
        maxSelection: 10,
      },
    ]
  })

  describe('Complete User Management Workflow', () => {
    it('performs a complete user management session', async () => {
      const onSelectionChange = jest.fn()

      render(
        <DataTable
          data={testUsers}
          columns={userColumns}
          selectable={true}
          onSelectionChange={onSelectionChange}
          rowActions={mockRowActions}
          bulkActions={mockBulkActions}
          showSearchAndFilters={true}
          searchPlaceholder="Buscar..."
          showAdvancedFilters={true}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: true,
          }}
        />
      )

      // 1. Search for specific users
      const searchInput = screen.getByPlaceholderText('Buscar...')
      await user.type(searchInput, 'User 1')
      
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument()
        expect(screen.getByText('User 10')).toBeInTheDocument()
      })

      // 2. Clear search and apply department filter
      await user.clear(searchInput)
      
      const departmentFilter = screen.getByLabelText('Department')
      await user.selectOptions(departmentFilter, 'Engineering')
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeGreaterThan(1)
      })

      // 3. Sort by score (descending)
      const scoreHeader = screen.getByText('Score')
      await user.click(scoreHeader) // First click: ascending
      await user.click(scoreHeader) // Second click: descending
      
      // 4. Select multiple users for bulk operations
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // First user
      await user.click(checkboxes[2]) // Second user
      await user.click(checkboxes[3]) // Third user
      
      expect(onSelectionChange).toHaveBeenCalled()

      // 5. Execute bulk activation
      const activateButton = screen.getByText('Activate Users')
      await user.click(activateButton)
      
      expect(mockBulkActions[0].onClick).toHaveBeenCalled()

      // 6. Navigate to next page
      const nextButton = screen.getByLabelText('Página siguiente')
      await user.click(nextButton)
      
      // 7. Perform individual user action
      const editButtons = screen.getAllByLabelText('Edit User')
      await user.click(editButtons[0])
      
      expect(mockRowActions[1].onClick).toHaveBeenCalled()

      // 8. Test destructive action with confirmation
      const deleteButtons = screen.getAllByLabelText('Delete User')
      await user.click(deleteButtons[0])
      
      // Should show confirmation
      expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
      
      const confirmButton = screen.getByText('Confirmar')
      await user.click(confirmButton)
      
      expect(mockRowActions[3].onClick).toHaveBeenCalled()
    })
  })

  describe('Advanced Filtering Workflow', () => {
    it('creates and applies complex filter combinations', async () => {
      render(
        <DataTable
          data={testUsers}
          columns={userColumns}
          showSearchAndFilters={true}
          showAdvancedFilters={true}
        />
      )

      // Open advanced filters
      const advancedButton = screen.getByText('Filtros Avanzados')
      await user.click(advancedButton)
      
      // Add first filter: Role = Admin
      const addFilterButton = screen.getByText('Agregar Filtro')
      await user.click(addFilterButton)
      
      const firstFieldSelect = screen.getAllByDisplayValue('Seleccionar campo')[0]
      await user.selectOptions(firstFieldSelect, 'role')
      
      const firstOperatorSelect = screen.getAllByDisplayValue('Seleccionar operador')[0]
      await user.selectOptions(firstOperatorSelect, 'equals')
      
      const firstValueSelect = screen.getAllByDisplayValue('Seleccionar valor')[0]
      await user.selectOptions(firstValueSelect, 'admin')
      
      // Add second filter: Score > 80
      await user.click(addFilterButton)
      
      const secondFieldSelect = screen.getAllByDisplayValue('Seleccionar campo')[1]
      await user.selectOptions(secondFieldSelect, 'score')
      
      const secondOperatorSelect = screen.getAllByDisplayValue('Seleccionar operador')[1]
      await user.selectOptions(secondOperatorSelect, 'greater_than')
      
      const secondValueInput = screen.getAllByPlaceholderText('Ingrese valor')[1]
      await user.type(secondValueInput, '80')
      
      // Apply filters
      const applyButton = screen.getByText('Aplicar Filtros')
      await user.click(applyButton)
      
      // Should show filtered results
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeGreaterThan(1)
      })
      
      // Clear filters
      const clearButton = screen.getByText('Limpiar Filtros')
      await user.click(clearButton)
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeGreaterThan(10) // Should show more rows
      })
    })
  })

  describe('Data Export Workflow', () => {
    it('selects and exports user data', async () => {
      const onSelectionChange = jest.fn()

      render(
        <DataTable
          data={testUsers.slice(0, 20)}
          columns={userColumns}
          selectable={true}
          onSelectionChange={onSelectionChange}
          bulkActions={mockBulkActions}
          pagination={{ pageSize: 10 }}
        />
      )

      // Select all users on current page
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await user.click(selectAllCheckbox)
      
      // Verify all page items are selected
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.slice(1).forEach(checkbox => {
        expect(checkbox).toBeChecked()
      })

      // Export selected users
      const exportButton = screen.getByText('Export to CSV')
      await user.click(exportButton)
      
      expect(mockBulkActions[2].onClick).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Array)
      )

      // Navigate to next page and select more users
      const nextButton = screen.getByLabelText('Página siguiente')
      await user.click(nextButton)
      
      // Select additional users
      const newCheckboxes = screen.getAllByRole('checkbox')
      await user.click(newCheckboxes[1])
      await user.click(newCheckboxes[2])
      
      // Export again with combined selection
      const exportButton2 = screen.getByText('Export to CSV')
      await user.click(exportButton2)
      
      expect(mockBulkActions[2].onClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Recovery Workflow', () => {
    it('handles and recovers from errors gracefully', async () => {
      // Start with error state
      const { rerender } = render(
        <DataTable
          data={testUsers}
          columns={userColumns}
          error="Failed to load user data"
          onRetry={jest.fn()}
        />
      )

      // Should show error message
      expect(screen.getByText('Failed to load user data')).toBeInTheDocument()
      
      const retryButton = screen.getByText('Reintentar')
      expect(retryButton).toBeInTheDocument()

      // Simulate successful retry
      rerender(
        <DataTable
          data={testUsers}
          columns={userColumns}
          loading={true}
          loadingMessage="Retrying..."
        />
      )

      // Should show loading state
      expect(screen.getByText('Retrying...')).toBeInTheDocument()

      // Simulate successful data load
      rerender(
        <DataTable
          data={testUsers}
          columns={userColumns}
          pagination={{ pageSize: 10 }}
        />
      )

      // Should show data
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(11) // 10 data + 1 header
    })
  })

  describe('Performance Under Load Workflow', () => {
    it('maintains responsiveness with rapid user interactions', async () => {
      render(
        <DataTable
          data={testUsers}
          columns={userColumns}
          selectable={true}
          showSearchAndFilters={true}
          searchPlaceholder="Buscar..."
          pagination={{ pageSize: 20 }}
        />
      )

      const searchInput = screen.getByPlaceholderText('Buscar...')
      
      // Rapid search operations
      const searchTerms = ['User', 'Admin', 'Engineering', 'Active', '']
      
      for (const term of searchTerms) {
        await user.clear(searchInput)
        if (term) {
          await user.type(searchInput, term)
        }
        
        // Small delay to allow debouncing
        await waitFor(() => {
          expect(searchInput).toHaveValue(term)
        }, { timeout: 1000 })
      }

      // Rapid sorting operations
      const nameHeader = screen.getByText('Name')
      const emailHeader = screen.getByText('Email')
      const scoreHeader = screen.getByText('Score')
      
      await user.click(nameHeader)
      await user.click(emailHeader)
      await user.click(scoreHeader)
      await user.click(nameHeader)

      // Rapid selection operations
      const checkboxes = screen.getAllByRole('checkbox')
      for (let i = 1; i < Math.min(6, checkboxes.length); i++) {
        await user.click(checkboxes[i])
      }

      // Should maintain functionality
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })
  })

  describe('Accessibility Workflow', () => {
    it('supports complete keyboard-only navigation', async () => {
      render(
        <DataTable
          data={testUsers.slice(0, 10)}
          columns={userColumns}
          selectable={true}
          searchable={true}
          pagination={{ pageSize: 5 }}
        />
      )

      // Navigate to search
      await user.tab()
      expect(screen.getByPlaceholderText('Buscar...')).toHaveFocus()

      // Search via keyboard
      await user.keyboard('User 1')
      
      // Navigate to table
      await user.tab() // Name header
      expect(screen.getByText('Name')).toHaveFocus()

      // Sort via keyboard
      await user.keyboard('{Enter}')
      
      // Navigate to first data row checkbox
      await user.tab() // Email header
      await user.tab() // Role header
      await user.tab() // Department header
      await user.tab() // Status header
      await user.tab() // Score header
      await user.tab() // Created header
      await user.tab() // First row checkbox
      
      const firstCheckbox = screen.getAllByRole('checkbox')[1]
      expect(firstCheckbox).toHaveFocus()

      // Select via keyboard
      await user.keyboard(' ')
      expect(firstCheckbox).toBeChecked()

      // Navigate to pagination
      // This would continue through all interactive elements
    })
  })
})
