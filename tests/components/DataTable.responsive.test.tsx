import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import DataTable from '@/components/organisms/DataTable'
import type { Column } from '@/components/organisms/DataTable'

// Mock useBreakpoint hook
const mockUseBreakpoint = jest.fn()
jest.mock('@/hooks/useBreakpoint', () => ({
  __esModule: true,
  default: mockUseBreakpoint,
}))

interface TestData {
  id: number
  name: string
  email: string
  role: string
  active: boolean
  score: number
  department: string
}

const testData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true, score: 95, department: 'Engineering' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', active: false, score: 87, department: 'Marketing' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'moderator', active: true, score: 92, department: 'Sales' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', active: true, score: 88, department: 'HR' },
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
  },
  {
    key: 'active',
    title: 'Active',
    render: (value: boolean) => (value ? 'Yes' : 'No'),
  },
  {
    key: 'score',
    title: 'Score',
    sortable: true,
  },
  {
    key: 'department',
    title: 'Department',
    sortable: true,
  },
]

describe('DataTable Responsive Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'lg',
        width: 1024,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLg: true,
      })
    })

    it('renders traditional table layout on desktop', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
        />
      )

      // Should render as table
      expect(screen.getByRole('table')).toBeInTheDocument()
      
      // Should show all columns
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
      expect(screen.getByText('Department')).toBeInTheDocument()
    })

    it('maintains full functionality on desktop', async () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          searchable={true}
          pagination={{ pageSize: 2 }}
        />
      )

      // Search should work
      const searchInput = screen.getByPlaceholderText('Buscar...')
      await user.type(searchInput, 'John')
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()

      // Selection should work
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])
      expect(checkboxes[1]).toBeChecked()

      // Pagination should work
      await user.clear(searchInput)
      const nextButton = screen.getByLabelText('Página siguiente')
      await user.click(nextButton)
      
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })
  })

  describe('Tablet Layout', () => {
    beforeEach(() => {
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'md',
        width: 768,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isMd: true,
      })
    })

    it('adapts layout for tablet screens', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileBreakpoint={768}
          mobileLayout="list"
        />
      )

      // Should still render table on tablet by default
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('switches to mobile layout when configured', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileBreakpoint={900} // Higher than tablet width
          mobileLayout="card"
          mobileColumns={{
            primary: 'name',
            secondary: 'email',
          }}
        />
      )

      // Should render mobile layout
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'sm',
        width: 640,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isSm: true,
      })
    })

    it('renders card layout on mobile', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="card"
          mobileColumns={{
            primary: 'name',
            secondary: 'email',
            hidden: ['department', 'score'],
          }}
        />
      )

      // Should not render table
      expect(screen.queryByRole('table')).not.toBeInTheDocument()

      // Should render cards
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()

      // Hidden columns should not be visible initially
      expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
    })

    it('renders list layout on mobile', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="list"
          mobileColumns={{
            primary: 'name',
            secondary: 'role',
          }}
        />
      )

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    it('renders compact layout on mobile', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="compact"
          mobileColumns={{
            primary: 'name',
          }}
        />
      )

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('maintains selection functionality in mobile layout', async () => {
      const onSelectionChange = jest.fn()

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="card"
          selectable={true}
          onSelectionChange={onSelectionChange}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[0]) // First item

      expect(onSelectionChange).toHaveBeenCalledWith([1], [testData[0]])
    })

    it('supports expandable details in card layout', async () => {
      render(
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

      // Find expand button
      const expandButtons = screen.getAllByLabelText('Expandir detalles')
      await user.click(expandButtons[0])

      // Should show additional details
      expect(screen.getByText('Role:')).toBeInTheDocument()
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
  })

  describe('Responsive Breakpoint Changes', () => {
    it('adapts when screen size changes', () => {
      // Start with desktop
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'lg',
        width: 1024,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLg: true,
      })

      const { rerender } = render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileBreakpoint={768}
          mobileLayout="card"
        />
      )

      // Should render table
      expect(screen.getByRole('table')).toBeInTheDocument()

      // Change to mobile
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'sm',
        width: 640,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isSm: true,
      })

      rerender(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileBreakpoint={768}
          mobileLayout="card"
        />
      )

      // Should render mobile layout
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('preserves state across layout changes', () => {
      const onSelectionChange = jest.fn()

      // Start with desktop
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'lg',
        width: 1024,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLg: true,
      })

      const { rerender } = render(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          selectedRowKeys={[1, 2]}
          onSelectionChange={onSelectionChange}
          mobileBreakpoint={768}
          mobileLayout="card"
        />
      )

      // Verify selection in desktop
      const desktopCheckboxes = screen.getAllByRole('checkbox')
      expect(desktopCheckboxes[1]).toBeChecked()
      expect(desktopCheckboxes[2]).toBeChecked()

      // Change to mobile
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'sm',
        width: 640,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isSm: true,
      })

      rerender(
        <DataTable
          data={testData}
          columns={testColumns}
          selectable={true}
          selectedRowKeys={[1, 2]}
          onSelectionChange={onSelectionChange}
          mobileBreakpoint={768}
          mobileLayout="card"
        />
      )

      // Selection should be preserved in mobile
      const mobileCheckboxes = screen.getAllByRole('checkbox')
      expect(mobileCheckboxes[0]).toBeChecked()
      expect(mobileCheckboxes[1]).toBeChecked()
    })
  })

  describe('Touch Optimization', () => {
    beforeEach(() => {
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'sm',
        width: 640,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isSm: true,
      })
    })

    it('optimizes touch targets for mobile', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="card"
          touchOptimized={true}
        />
      )

      // Touch targets should be appropriately sized
      // This would typically be tested by checking computed styles
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeInTheDocument()
    })

    it('supports swipe actions when configured', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="card"
          swipeActions={{
            right: [
              {
                key: 'edit',
                label: 'Edit',
                icon: '✏️',
                color: 'blue',
                onClick: jest.fn(),
              },
            ],
          }}
        />
      )

      // Swipe actions would be tested with touch events
      // This is a placeholder for swipe gesture testing
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  describe('Accessibility in Responsive Layouts', () => {
    it('maintains accessibility in mobile layouts', () => {
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'sm',
        width: 640,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isSm: true,
      })

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="card"
          selectable={true}
        />
      )

      // Should maintain proper ARIA labels
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toHaveAttribute('aria-label')
    })

    it('supports keyboard navigation in mobile layouts', async () => {
      mockUseBreakpoint.mockReturnValue({
        breakpoint: 'sm',
        width: 640,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isSm: true,
      })

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          mobileLayout="card"
          selectable={true}
        />
      )

      // Should support tab navigation
      await user.tab()
      const firstCheckbox = screen.getAllByRole('checkbox')[0]
      expect(firstCheckbox).toHaveFocus()
    })
  })
})
