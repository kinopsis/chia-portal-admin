import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { DepartmentShowcase } from '@/components/organisms/DepartmentShowcase'
import type { DepartmentShowcaseProps, DepartmentData } from '@/components/organisms/DepartmentShowcase'

// Mock Next.js Link and router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props} onClick={() => mockPush(href)}>
        {children}
      </a>
    )
  }
})

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    theme: 'light',
  }),
}))

describe('DepartmentShowcase Component', () => {
  const mockDepartments: DepartmentData[] = [
    {
      id: 'planning',
      name: 'Planning',
      icon: '🏛️',
      subdependencies: 3,
      tramites: 15,
      href: '/departments/planning',
      color: 'blue',
      description: 'Urban planning and territorial development',
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: '💼',
      subdependencies: 4,
      tramites: 23,
      href: '/departments/finance',
      color: 'green',
      description: 'Financial management and municipal taxation',
    },
    {
      id: 'health',
      name: 'Health',
      icon: '🏥',
      subdependencies: 2,
      tramites: 8,
      href: '/departments/health',
      color: 'red',
      description: 'Public health services and welfare',
    },
    {
      id: 'environment',
      name: 'Environment',
      icon: '🌱',
      subdependencies: 2,
      tramites: 12,
      href: '/departments/environment',
      color: 'green',
      description: 'Environmental protection and sustainability',
    },
  ]

  const defaultProps: DepartmentShowcaseProps = {
    title: 'Department Quick Access',
    subtitle: 'Find services organized by municipal department',
    departments: mockDepartments,
    variant: 'cards',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with all required props', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Department Quick Access')
      expect(screen.getByText('Find services organized by municipal department')).toBeInTheDocument()
      
      expect(screen.getByText('Planning')).toBeInTheDocument()
      expect(screen.getByText('Finance')).toBeInTheDocument()
      expect(screen.getByText('Health')).toBeInTheDocument()
      expect(screen.getByText('Environment')).toBeInTheDocument()
      
      expect(screen.getByText('🏛️')).toBeInTheDocument()
      expect(screen.getByText('💼')).toBeInTheDocument()
      expect(screen.getByText('🏥')).toBeInTheDocument()
      expect(screen.getByText('🌱')).toBeInTheDocument()
    })

    it('renders with default props', () => {
      render(<DepartmentShowcase />)
      
      expect(screen.getByText('Acceso rápido por dependencia')).toBeInTheDocument()
      expect(screen.getByText('Encuentra los trámites organizados por dependencia municipal')).toBeInTheDocument()
      
      // Should render default departments
      expect(screen.getByText('Planeación')).toBeInTheDocument()
      expect(screen.getByText('Hacienda')).toBeInTheDocument()
      expect(screen.getByText('Salud')).toBeInTheDocument()
      expect(screen.getByText('Ambiente')).toBeInTheDocument()
    })

    it('displays department statistics correctly', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      // Check subdependencies count
      expect(screen.getByText('3')).toBeInTheDocument() // Planning subdependencies
      expect(screen.getByText('4')).toBeInTheDocument() // Finance subdependencies
      
      // Check tramites count
      expect(screen.getByText('15')).toBeInTheDocument() // Planning tramites
      expect(screen.getByText('23')).toBeInTheDocument() // Finance tramites
      expect(screen.getByText('8')).toBeInTheDocument()  // Health tramites
      expect(screen.getByText('12')).toBeInTheDocument() // Environment tramites
    })

    it('displays department descriptions', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      expect(screen.getByText('Urban planning and territorial development')).toBeInTheDocument()
      expect(screen.getByText('Financial management and municipal taxation')).toBeInTheDocument()
      expect(screen.getByText('Public health services and welfare')).toBeInTheDocument()
      expect(screen.getByText('Environmental protection and sustainability')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders cards variant correctly', () => {
      render(<DepartmentShowcase {...defaultProps} variant="cards" />)
      
      const departments = screen.getAllByRole('link')
      expect(departments).toHaveLength(4)
      
      departments.forEach(dept => {
        expect(dept.querySelector('.department-card')).toBeInTheDocument()
      })
    })

    it('renders minimal variant correctly', () => {
      render(<DepartmentShowcase {...defaultProps} variant="minimal" />)
      
      const container = screen.getByRole('region', { name: /departments/i })
      expect(container).toHaveClass('variant-minimal')
      
      // Should show tramites count only in minimal variant
      expect(screen.getByText('15 trámites')).toBeInTheDocument()
    })

    it('renders compact variant correctly', () => {
      render(<DepartmentShowcase {...defaultProps} variant="compact" />)
      
      const container = screen.getByRole('region', { name: /departments/i })
      expect(container).toHaveClass('variant-compact')
      
      // Should show both subdep and tramites in compact format
      expect(screen.getByText('3 subdep. • 15 trámites')).toBeInTheDocument()
    })
  })

  describe('Color Schemes', () => {
    it('applies correct color classes', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      const planningDept = screen.getByText('Planning').closest('a')
      expect(planningDept).toHaveClass('department-blue')
      
      const financeDept = screen.getByText('Finance').closest('a')
      expect(financeDept).toHaveClass('department-green')
      
      const healthDept = screen.getByText('Health').closest('a')
      expect(healthDept).toHaveClass('department-red')
    })

    it('handles all color variants', () => {
      const colorVariants: DepartmentData[] = [
        { ...mockDepartments[0], color: 'blue' },
        { ...mockDepartments[1], color: 'green' },
        { ...mockDepartments[2], color: 'yellow' },
        { ...mockDepartments[3], color: 'purple' },
      ]
      
      render(<DepartmentShowcase {...defaultProps} departments={colorVariants} />)
      
      const departments = screen.getAllByRole('link')
      expect(departments[0]).toHaveClass('department-blue')
      expect(departments[1]).toHaveClass('department-green')
      expect(departments[2]).toHaveClass('department-yellow')
      expect(departments[3]).toHaveClass('department-purple')
    })
  })

  describe('Interactions', () => {
    it('handles department clicks correctly', async () => {
      const user = userEvent.setup()
      render(<DepartmentShowcase {...defaultProps} />)
      
      const planningLink = screen.getByText('Planning').closest('a')
      await user.click(planningLink!)
      
      expect(mockPush).toHaveBeenCalledWith('/departments/planning')
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<DepartmentShowcase {...defaultProps} />)
      
      // Tab to first department
      await user.tab()
      const firstDept = screen.getByText('Planning').closest('a')
      expect(firstDept).toHaveFocus()
      
      // Enter should navigate
      await user.keyboard('{Enter}')
      expect(mockPush).toHaveBeenCalledWith('/departments/planning')
    })

    it('calls custom click handler when provided', async () => {
      const mockOnClick = jest.fn()
      const user = userEvent.setup()
      
      render(<DepartmentShowcase {...defaultProps} onDepartmentClick={mockOnClick} />)
      
      const planningLink = screen.getByText('Planning').closest('a')
      await user.click(planningLink!)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockDepartments[0])
    })

    it('handles explore button clicks', async () => {
      const user = userEvent.setup()
      render(<DepartmentShowcase {...defaultProps} variant="cards" />)
      
      const exploreButton = screen.getAllByText('Explorar →')[0]
      await user.click(exploreButton)
      
      expect(mockPush).toHaveBeenCalledWith('/departments/planning')
    })
  })

  describe('Loading States', () => {
    it('shows loading skeleton when loading', () => {
      render(<DepartmentShowcase {...defaultProps} loading={true} />)
      
      expect(screen.getByTestId('department-showcase-skeleton')).toBeInTheDocument()
      expect(screen.queryByText('Planning')).not.toBeInTheDocument()
    })

    it('shows content when not loading', () => {
      render(<DepartmentShowcase {...defaultProps} loading={false} />)
      
      expect(screen.queryByTestId('department-showcase-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('Planning')).toBeInTheDocument()
    })

    it('shows correct number of skeleton items', () => {
      render(<DepartmentShowcase {...defaultProps} loading={true} />)
      
      const skeletonItems = screen.getAllByTestId('department-card-skeleton')
      expect(skeletonItems).toHaveLength(4)
    })
  })

  describe('Error States', () => {
    it('shows error message when error occurs', () => {
      const errorMessage = 'Failed to load departments'
      render(<DepartmentShowcase {...defaultProps} error={errorMessage} />)
      
      expect(screen.getByText('Error al cargar dependencias')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })

    it('does not show content when error occurs', () => {
      render(<DepartmentShowcase {...defaultProps} error="Some error" />)
      
      expect(screen.queryByText('Planning')).not.toBeInTheDocument()
      expect(screen.getByText('Error al cargar dependencias')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('applies responsive grid classes', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      const container = screen.getByRole('region', { name: /departments/i })
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
    })

    it('handles mobile viewport correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<DepartmentShowcase {...defaultProps} />)
      
      const section = screen.getByRole('region', { name: /departments/i })
      expect(section).toHaveClass('py-16')
    })

    it('applies responsive typography', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveClass('text-3xl', 'sm:text-4xl', 'lg:text-5xl')
      
      const subtitle = screen.getByText('Find services organized by municipal department')
      expect(subtitle).toHaveClass('text-lg', 'sm:text-xl')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveAttribute('id', 'departments-title')
      
      const section = screen.getByRole('region', { name: /departments/i })
      expect(section).toHaveAttribute('aria-labelledby', 'departments-title')
    })

    it('has proper link accessibility', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
        expect(link).toBeVisible()
      })
    })

    it('provides accessible icon content', () => {
      render(<DepartmentShowcase {...defaultProps} />)
      
      const icons = screen.getAllByRole('img', { hidden: true })
      expect(icons).toHaveLength(4)
      
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<DepartmentShowcase {...defaultProps} />)
      
      // Tab through departments
      await user.tab()
      const firstDept = screen.getByText('Planning').closest('a')
      expect(firstDept).toHaveFocus()
      
      await user.tab()
      const secondDept = screen.getByText('Finance').closest('a')
      expect(secondDept).toHaveFocus()
    })
  })

  describe('Content Handling', () => {
    it('handles React node icons', () => {
      const reactNodeDepartments = mockDepartments.map(dept => ({
        ...dept,
        icon: <span data-testid="custom-icon">Custom Icon</span>,
      }))
      
      render(<DepartmentShowcase {...defaultProps} departments={reactNodeDepartments} />)
      
      const customIcons = screen.getAllByTestId('custom-icon')
      expect(customIcons).toHaveLength(4)
    })

    it('handles long department names', () => {
      const longNameDepartments = mockDepartments.map(dept => ({
        ...dept,
        name: 'Very Long Department Name That Should Wrap Properly',
      }))
      
      render(<DepartmentShowcase {...defaultProps} departments={longNameDepartments} />)
      
      expect(screen.getByText('Very Long Department Name That Should Wrap Properly')).toBeInTheDocument()
    })

    it('handles missing optional properties', () => {
      const minimalDepartments = mockDepartments.map(dept => ({
        id: dept.id,
        name: dept.name,
        icon: dept.icon,
        subdependencies: dept.subdependencies,
        tramites: dept.tramites,
        href: dept.href,
        // Missing color and description
      })) as DepartmentData[]
      
      render(<DepartmentShowcase {...defaultProps} departments={minimalDepartments} />)
      
      expect(screen.getByText('Planning')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders efficiently with many departments', () => {
      const manyDepartments = Array.from({ length: 20 }, (_, i) => ({
        id: `dept-${i}`,
        name: `Department ${i}`,
        icon: '🏢',
        subdependencies: i + 1,
        tramites: (i + 1) * 5,
        href: `/departments/dept-${i}`,
        color: 'blue' as const,
      }))
      
      const startTime = performance.now()
      render(<DepartmentShowcase {...defaultProps} departments={manyDepartments} />)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should render in less than 100ms
    })
  })

  describe('Dark Mode Support', () => {
    it('applies dark mode classes', () => {
      // Mock dark theme
      jest.mocked(require('@/contexts/ThemeContext').useTheme).mockReturnValue({
        isDark: true,
        theme: 'dark',
      })

      render(<DepartmentShowcase {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveClass('dark:text-gray-100')
      
      const subtitle = screen.getByText('Find services organized by municipal department')
      expect(subtitle).toHaveClass('dark:text-gray-300')
    })
  })
})
