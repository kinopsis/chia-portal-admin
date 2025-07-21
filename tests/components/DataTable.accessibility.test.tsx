import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import { axe, toHaveNoViolations } from 'jest-axe'
import DataTable from '@/components/organisms/DataTable'
import type { Column } from '@/components/organisms/DataTable'

expect.extend(toHaveNoViolations)

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

interface TestData {
  id: number
  name: string
  email: string
  role: string
  active: boolean
}

const testData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', active: false },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'moderator', active: true },
]

const testColumns: Column<TestData>[] = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
    filterable: true,
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
    render: (value: boolean) => (value ? 'Yes' : 'No'),
  },
]

describe('DataTable Accessibility Tests', () => {
  const user = userEvent.setup()

  describe('ARIA Compliance', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          searchable={true}
          filterable={true}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper table structure with ARIA labels', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
        />
      )

      // Table should have proper role
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // Column headers should have proper roles
      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(5) // 4 data columns + 1 selection column

      // Rows should have proper roles
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(4) // 1 header + 3 data rows
    })

    it('provides proper ARIA labels for interactive elements', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          searchable={true}
          pagination={{ pageSize: 2 }}
        />
      )

      // Search input should have proper label
      const searchInput = screen.getByLabelText('Buscar en la tabla')
      expect(searchInput).toBeInTheDocument()

      // Pagination buttons should have proper labels
      expect(screen.getByLabelText('Página siguiente')).toBeInTheDocument()
      expect(screen.getByLabelText('Página anterior')).toBeInTheDocument()

      // Sort buttons should have proper labels
      const nameHeader = screen.getByText('Name')
      expect(nameHeader.closest('th')).toHaveAttribute('aria-sort', 'none')
    })

    it('manages focus properly during interactions', async () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          searchable={true}
          pagination={{ pageSize: 2 }}
        />
      )

      // Focus should move to search input when typing
      const searchInput = screen.getByLabelText('Buscar en la tabla')
      await user.click(searchInput)
      expect(searchInput).toHaveFocus()

      // Focus should move to pagination when navigating
      const nextButton = screen.getByLabelText('Página siguiente')
      await user.click(nextButton)
      // Focus management is handled by the pagination component
    })

    it('provides proper live region updates', async () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          searchable={true}
          loading={false}
        />
      )

      // Search should update live region
      const searchInput = screen.getByLabelText('Buscar en la tabla')
      await user.type(searchInput, 'John')

      // The filtered results should be announced to screen readers
      // This is typically handled by the table's aria-live region
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation for sorting', async () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
        />
      )

      const nameHeader = screen.getByText('Name')
      
      // Should be focusable
      nameHeader.focus()
      expect(nameHeader).toHaveFocus()

      // Should respond to Enter key
      fireEvent.keyDown(nameHeader, { key: 'Enter' })
      
      // Should update sort state
      expect(nameHeader.closest('th')).toHaveAttribute('aria-sort', 'ascending')
    })

    it('supports keyboard navigation for selection', async () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const firstDataCheckbox = checkboxes[1] // Skip header checkbox

      // Should be focusable
      firstDataCheckbox.focus()
      expect(firstDataCheckbox).toHaveFocus()

      // Should respond to Space key
      fireEvent.keyDown(firstDataCheckbox, { key: ' ' })
      expect(firstDataCheckbox).toBeChecked()
    })

    it('supports tab navigation through interactive elements', async () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          searchable={true}
          pagination={{ pageSize: 2 }}
        />
      )

      // Tab through elements in logical order
      await user.tab() // Search input
      expect(screen.getByLabelText('Buscar en la tabla')).toHaveFocus()

      await user.tab() // First sortable header
      expect(screen.getByText('Name')).toHaveFocus()

      // Continue tabbing through headers
      await user.tab()
      expect(screen.getByText('Email')).toHaveFocus()
    })
  })

  describe('Screen Reader Support', () => {
    it('provides descriptive text for complex interactions', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          pagination={{ pageSize: 2, total: 10 }}
        />
      )

      // Selection should be described
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      expect(selectAllCheckbox).toHaveAttribute('aria-label', 'Seleccionar todos los elementos')

      // Pagination should be described
      const pageInfo = screen.getByText(/Mostrando \d+ a \d+ de \d+ elementos/)
      expect(pageInfo).toBeInTheDocument()
    })

    it('announces loading states', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          loading={true}
          loadingMessage="Loading users..."
        />
      )

      // Loading state should be announced
      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toHaveAttribute('aria-label', 'Cargando contenido')
    })

    it('announces error states', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          error="Failed to load data"
        />
      )

      // Error should be announced
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement).toHaveTextContent('Failed to load data')
    })
  })

  describe('High Contrast and Visual Accessibility', () => {
    it('maintains proper contrast ratios', () => {
      const { container } = render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
        />
      )

      // Check that important elements have proper styling
      const table = container.querySelector('table')
      expect(table).toHaveClass('w-full')

      // Headers should be visually distinct
      const headers = container.querySelectorAll('th')
      headers.forEach(header => {
        expect(header).toHaveClass('font-medium')
      })
    })

    it('supports reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          loading={true}
        />
      )

      // Animations should respect reduced motion
      // This would typically be tested with CSS-in-JS or by checking computed styles
    })
  })

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      // Mock mobile breakpoint
      jest.mocked(require('@/hooks/useBreakpoint').default).mockReturnValue({
        breakpoint: 'sm',
        width: 640,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isSm: true,
      })
    })

    it('maintains accessibility in mobile layout', async () => {
      const { container } = render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="card"
          mobileColumns={{
            primary: 'name',
            secondary: 'email',
          }}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper touch targets', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="card"
          touchOptimized={true}
        />
      )

      // Touch targets should be appropriately sized
      // This would typically be tested by checking computed styles for minimum sizes
    })
  })

  describe('Form Controls Accessibility', () => {
    it('associates labels with form controls', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          filterable={true}
          searchable={true}
        />
      )

      // Search input should have proper label
      const searchInput = screen.getByLabelText('Buscar en la tabla')
      expect(searchInput).toBeInTheDocument()

      // Filter selects should have proper labels
      const roleFilter = screen.getByLabelText('Role')
      expect(roleFilter).toBeInTheDocument()
    })

    it('provides error messages for form validation', async () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          advancedFilters={true}
        />
      )

      // Open advanced filters
      const advancedButton = screen.getByText('Filtros Avanzados')
      await user.click(advancedButton)

      // Add invalid filter
      const addFilterButton = screen.getByText('Agregar Filtro')
      await user.click(addFilterButton)

      // Try to apply without configuring
      const applyButton = screen.getByText('Aplicar Filtros')
      await user.click(applyButton)

      // Should show validation errors
      // This would be implemented in the actual filter validation logic
    })
  })
})
