import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { MetricsGrid } from '@/components/organisms/MetricsGrid'
import type { MetricData } from '@/components/organisms/MetricsGrid'

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    theme: 'light',
  }),
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('MetricsGrid Component', () => {
  const mockMetrics: MetricData[] = [
    {
      id: 'users',
      title: 'Users',
      value: 1250,
      subtitle: 'active',
      description: 'Total active users',
      icon: '👥',
      color: 'primary',
      href: '/users',
    },
    {
      id: 'services',
      title: 'Services',
      value: 45,
      subtitle: 'available',
      description: 'Available services',
      icon: '🔧',
      color: 'secondary',
      trend: {
        value: 12,
        isPositive: true,
        label: 'increase',
        period: 'this month',
      },
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: 98500,
      subtitle: 'total',
      description: 'Total revenue',
      icon: '💰',
      color: 'success',
      trend: {
        value: 5,
        isPositive: false,
        label: 'decrease',
        period: 'this week',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock requestAnimationFrame for animations
    global.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(cb, 16)
      return 1
    })
    global.cancelAnimationFrame = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders metrics correctly', () => {
      render(<MetricsGrid metrics={mockMetrics} />)
      
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
      
      expect(screen.getByText('👥')).toBeInTheDocument()
      expect(screen.getByText('🔧')).toBeInTheDocument()
      expect(screen.getByText('💰')).toBeInTheDocument()
    })

    it('renders with different layouts', () => {
      const { rerender } = render(
        <MetricsGrid metrics={mockMetrics} layout="auto" />
      )
      
      let container = screen.getByRole('region', { name: /metrics/i })
      expect(container).toHaveClass('metrics-grid-auto')

      rerender(<MetricsGrid metrics={mockMetrics} layout="fixed" columns={3} />)
      container = screen.getByRole('region', { name: /metrics/i })
      expect(container).toHaveClass('metrics-grid-fixed')

      rerender(<MetricsGrid metrics={mockMetrics} layout="responsive" />)
      container = screen.getByRole('region', { name: /metrics/i })
      expect(container).toHaveClass('metrics-grid-responsive')
    })

    it('renders with different sizes', () => {
      const { rerender } = render(
        <MetricsGrid metrics={mockMetrics} size="sm" />
      )
      
      let cards = screen.getAllByRole('article')
      expect(cards[0]).toHaveClass('metric-card-sm')

      rerender(<MetricsGrid metrics={mockMetrics} size="md" />)
      cards = screen.getAllByRole('article')
      expect(cards[0]).toHaveClass('metric-card-md')

      rerender(<MetricsGrid metrics={mockMetrics} size="lg" />)
      cards = screen.getAllByRole('article')
      expect(cards[0]).toHaveClass('metric-card-lg')
    })
  })

  describe('Animated Counters', () => {
    it('animates counter values when enabled', async () => {
      render(<MetricsGrid metrics={mockMetrics} animated={true} animationDuration={100} />)
      
      // Initially should show 0 or lower value
      const userMetric = screen.getByText('Users').closest('[role="article"]')
      expect(userMetric).toBeInTheDocument()
      
      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument()
      }, { timeout: 200 })
    })

    it('shows final values immediately when animation disabled', () => {
      render(<MetricsGrid metrics={mockMetrics} animated={false} />)
      
      expect(screen.getByText('1,250')).toBeInTheDocument()
      expect(screen.getByText('45')).toBeInTheDocument()
      expect(screen.getByText('98,500')).toBeInTheDocument()
    })

    it('respects animation duration', async () => {
      const shortDuration = 50
      render(
        <MetricsGrid 
          metrics={mockMetrics} 
          animated={true} 
          animationDuration={shortDuration} 
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument()
      }, { timeout: shortDuration + 50 })
    })
  })

  describe('Loading States', () => {
    it('shows loading skeleton when loading', () => {
      render(<MetricsGrid metrics={[]} loading={true} />)
      
      expect(screen.getByTestId('metrics-grid-skeleton')).toBeInTheDocument()
      expect(screen.queryByText('Users')).not.toBeInTheDocument()
    })

    it('shows content when not loading', () => {
      render(<MetricsGrid metrics={mockMetrics} loading={false} />)
      
      expect(screen.queryByTestId('metrics-grid-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('shows correct number of skeleton items', () => {
      render(<MetricsGrid metrics={[]} loading={true} columns={5} />)
      
      const skeletonItems = screen.getAllByTestId('metric-card-skeleton')
      expect(skeletonItems).toHaveLength(5)
    })
  })

  describe('Error States', () => {
    it('shows error message when error occurs', () => {
      const errorMessage = 'Failed to load metrics'
      render(<MetricsGrid metrics={[]} error={errorMessage} />)
      
      expect(screen.getByText('Error al cargar métricas')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })

    it('does not show content when error occurs', () => {
      render(<MetricsGrid metrics={mockMetrics} error="Some error" />)
      
      expect(screen.queryByText('Users')).not.toBeInTheDocument()
      expect(screen.getByText('Error al cargar métricas')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no metrics provided', () => {
      render(<MetricsGrid metrics={[]} />)
      
      expect(screen.getByText('No hay métricas disponibles')).toBeInTheDocument()
      expect(screen.getByText('📊')).toBeInTheDocument()
    })

    it('shows empty state message', () => {
      render(<MetricsGrid metrics={[]} />)
      
      expect(screen.getByText('Las métricas se mostrarán aquí cuando estén disponibles.')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('handles metric click events', async () => {
      const mockOnClick = jest.fn()
      const user = userEvent.setup()
      
      render(<MetricsGrid metrics={mockMetrics} onMetricClick={mockOnClick} />)
      
      const userMetric = screen.getByText('Users').closest('[role="article"]')
      await user.click(userMetric!)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockMetrics[0])
    })

    it('navigates to href when no click handler provided', async () => {
      const user = userEvent.setup()
      
      render(<MetricsGrid metrics={mockMetrics} />)
      
      const userMetric = screen.getByText('Users').closest('[role="article"]')
      await user.click(userMetric!)
      
      expect(mockPush).toHaveBeenCalledWith('/users')
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<MetricsGrid metrics={mockMetrics} />)
      
      const userMetric = screen.getByText('Users').closest('[role="article"]')
      userMetric?.focus()
      
      await user.keyboard('{Enter}')
      expect(mockPush).toHaveBeenCalledWith('/users')
    })
  })

  describe('Trend Indicators', () => {
    it('displays positive trends correctly', () => {
      render(<MetricsGrid metrics={mockMetrics} />)
      
      const servicesCard = screen.getByText('Services').closest('[role="article"]')
      expect(servicesCard).toHaveTextContent('12')
      expect(servicesCard).toHaveTextContent('increase')
      expect(servicesCard).toHaveTextContent('this month')
    })

    it('displays negative trends correctly', () => {
      render(<MetricsGrid metrics={mockMetrics} />)
      
      const revenueCard = screen.getByText('Revenue').closest('[role="article"]')
      expect(revenueCard).toHaveTextContent('5')
      expect(revenueCard).toHaveTextContent('decrease')
      expect(revenueCard).toHaveTextContent('this week')
    })

    it('applies correct trend styling', () => {
      render(<MetricsGrid metrics={mockMetrics} />)
      
      const positiveIndicator = screen.getByText('increase')
      expect(positiveIndicator).toHaveClass('trend-positive')
      
      const negativeIndicator = screen.getByText('decrease')
      expect(negativeIndicator).toHaveClass('trend-negative')
    })
  })

  describe('Responsive Behavior', () => {
    it('applies responsive grid classes', () => {
      render(<MetricsGrid metrics={mockMetrics} layout="responsive" />)
      
      const container = screen.getByRole('region', { name: /metrics/i })
      expect(container).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-5')
    })

    it('handles mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<MetricsGrid metrics={mockMetrics} />)
      
      const container = screen.getByRole('region', { name: /metrics/i })
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<MetricsGrid metrics={mockMetrics} />)
      
      const container = screen.getByRole('region', { name: /metrics/i })
      expect(container).toHaveAttribute('aria-label')
      
      const metrics = screen.getAllByRole('article')
      metrics.forEach(metric => {
        expect(metric).toHaveAttribute('aria-labelledby')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<MetricsGrid metrics={mockMetrics} />)
      
      // Tab through metrics
      await user.tab()
      const firstMetric = screen.getByText('Users').closest('[role="article"]')
      expect(firstMetric).toHaveFocus()
      
      await user.tab()
      const secondMetric = screen.getByText('Services').closest('[role="article"]')
      expect(secondMetric).toHaveFocus()
    })

    it('provides screen reader friendly content', () => {
      render(<MetricsGrid metrics={mockMetrics} />)
      
      // Check for screen reader text
      expect(screen.getByText('1,250 active users')).toBeInTheDocument()
      expect(screen.getByText('45 available services')).toBeInTheDocument()
    })
  })

  describe('Color Schemes', () => {
    it('applies correct color classes', () => {
      render(<MetricsGrid metrics={mockMetrics} />)
      
      const userMetric = screen.getByText('Users').closest('[role="article"]')
      expect(userMetric).toHaveClass('metric-card-primary')
      
      const servicesMetric = screen.getByText('Services').closest('[role="article"]')
      expect(servicesMetric).toHaveClass('metric-card-secondary')
      
      const revenueMetric = screen.getByText('Revenue').closest('[role="article"]')
      expect(revenueMetric).toHaveClass('metric-card-success')
    })
  })

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeMetrics = Array.from({ length: 100 }, (_, i) => ({
        id: `metric-${i}`,
        title: `Metric ${i}`,
        value: i * 100,
        icon: '📊',
        color: 'primary' as const,
      }))
      
      const startTime = performance.now()
      render(<MetricsGrid metrics={largeMetrics} />)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should render in less than 100ms
    })

    it('cleans up animation frames on unmount', () => {
      const { unmount } = render(
        <MetricsGrid metrics={mockMetrics} animated={true} />
      )
      
      unmount()
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled()
    })
  })
})
