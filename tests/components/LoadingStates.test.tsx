import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import { Skeleton, LoadingOverlay, EmptyState, ErrorBoundary } from '@/components/atoms'
import { TableSkeleton } from '@/components/molecules'

describe('Skeleton', () => {
  it('renders basic skeleton', () => {
    render(<Skeleton />)
    
    const skeleton = screen.getByRole('status')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('aria-label', 'Cargando contenido')
  })

  it('renders multiple lines', () => {
    render(<Skeleton lines={3} />)
    
    const skeletons = screen.getAllByRole('status')
    expect(skeletons).toHaveLength(3)
  })

  it('applies custom width and height', () => {
    render(<Skeleton width="200px" height="50px" />)
    
    const skeleton = screen.getByRole('status')
    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' })
  })

  it('applies different variants', () => {
    const { rerender } = render(<Skeleton variant="circular" />)
    expect(screen.getByRole('status')).toHaveClass('rounded-full')

    rerender(<Skeleton variant="rectangular" />)
    expect(screen.getByRole('status')).toHaveClass('h-12')
  })
})

describe('LoadingOverlay', () => {
  it('renders children when not visible', () => {
    render(
      <LoadingOverlay isVisible={false}>
        <div>Test content</div>
      </LoadingOverlay>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows overlay when visible', () => {
    render(
      <LoadingOverlay isVisible={true} message="Loading test...">
        <div>Test content</div>
      </LoadingOverlay>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading test...')).toBeInTheDocument()
  })

  it('shows progress bar when enabled', () => {
    render(
      <LoadingOverlay 
        isVisible={true} 
        showProgress={true} 
        progress={50}
      >
        <div>Test content</div>
      </LoadingOverlay>
    )
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('applies different sizes', () => {
    const { rerender } = render(
      <LoadingOverlay isVisible={true} size="sm">
        <div>Test content</div>
      </LoadingOverlay>
    )
    
    expect(screen.getByText('Cargando...')).toHaveClass('text-sm')

    rerender(
      <LoadingOverlay isVisible={true} size="lg">
        <div>Test content</div>
      </LoadingOverlay>
    )
    
    expect(screen.getByText('Cargando...')).toHaveClass('text-lg')
  })
})

describe('EmptyState', () => {
  it('renders basic empty state', () => {
    render(<EmptyState title="No data" />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <EmptyState 
        title="No data" 
        description="There are no items to display"
      />
    )
    
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('There are no items to display')).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>
    render(<EmptyState title="No data" icon={customIcon} />)
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders with action buttons', () => {
    const onAction = jest.fn()
    const onSecondaryAction = jest.fn()

    render(
      <EmptyState 
        title="No data"
        action={{
          label: 'Add Item',
          onClick: onAction,
        }}
        secondaryAction={{
          label: 'Refresh',
          onClick: onSecondaryAction,
        }}
      />
    )
    
    const addButton = screen.getByText('Add Item')
    const refreshButton = screen.getByText('Refresh')
    
    expect(addButton).toBeInTheDocument()
    expect(refreshButton).toBeInTheDocument()

    fireEvent.click(addButton)
    expect(onAction).toHaveBeenCalled()

    fireEvent.click(refreshButton)
    expect(onSecondaryAction).toHaveBeenCalled()
  })

  it('applies different sizes', () => {
    const { rerender } = render(<EmptyState title="No data" size="sm" />)
    expect(screen.getByText('No data')).toHaveClass('text-lg')

    rerender(<EmptyState title="No data" size="lg" />)
    expect(screen.getByText('No data')).toHaveClass('text-2xl')
  })
})

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error')
    }
    return <div>No error</div>
  }

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
    expect(screen.getByText('Recargar página')).toBeInTheDocument()
  })

  it('shows error details when enabled', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Ver detalles del error')).toBeInTheDocument()
  })

  it('calls onError callback', () => {
    const onError = jest.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalled()
  })

  it('renders custom fallback', () => {
    const fallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('retries on retry button click', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Reintentar'))
    
    // After retry, component should reset
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})

describe('TableSkeleton', () => {
  it('renders table skeleton with default props', () => {
    render(<TableSkeleton />)
    
    // Should render table structure
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders correct number of rows and columns', () => {
    render(<TableSkeleton rows={3} columns={4} />)
    
    const table = screen.getByRole('table')
    const rows = table.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(3)
    
    const headerCells = table.querySelectorAll('thead th')
    expect(headerCells).toHaveLength(4)
  })

  it('shows filters when enabled', () => {
    render(<TableSkeleton showFilters={true} />)
    
    // Should render filter section
    const filterSection = document.querySelector('.border-b')
    expect(filterSection).toBeInTheDocument()
  })

  it('shows pagination when enabled', () => {
    render(<TableSkeleton showPagination={true} />)
    
    // Should render pagination section
    const paginationSection = document.querySelector('.border-t')
    expect(paginationSection).toBeInTheDocument()
  })

  it('hides header when disabled', () => {
    render(<TableSkeleton showHeader={false} />)
    
    const table = screen.getByRole('table')
    const header = table.querySelector('thead')
    expect(header).not.toBeInTheDocument()
  })

  it('applies different sizes', () => {
    const { rerender } = render(<TableSkeleton size="small" />)
    
    let cells = document.querySelectorAll('td')
    expect(cells[0]).toHaveClass('px-2', 'py-1')

    rerender(<TableSkeleton size="large" />)
    
    cells = document.querySelectorAll('td')
    expect(cells[0]).toHaveClass('px-6', 'py-4')
  })
})
