import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import { MobileDataTable, SwipeActions } from '@/components/molecules'
import useBreakpoint from '@/hooks/useBreakpoint'

// Mock the useBreakpoint hook
jest.mock('@/hooks/useBreakpoint')
const mockUseBreakpoint = useBreakpoint as jest.MockedFunction<typeof useBreakpoint>

const mockData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    active: true,
    image: 'https://example.com/avatar1.jpg',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    active: false,
    image: 'https://example.com/avatar2.jpg',
  },
]

const mockColumns = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'Email' },
  { key: 'role', title: 'Role' },
  { key: 'active', title: 'Active', dataType: 'boolean' as const },
]

const mockRowActions = [
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
    variant: 'danger' as const,
    onClick: jest.fn(),
  },
]

describe('MobileDataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders card layout correctly', () => {
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        layout="card"
        primaryField="name"
        secondaryField="email"
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders list layout correctly', () => {
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        layout="list"
        primaryField="name"
        secondaryField="email"
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders compact layout correctly', () => {
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        layout="compact"
        primaryField="name"
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('handles row selection', () => {
    const onSelectionChange = jest.fn()
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        selectable={true}
        selectedRowKeys={[]}
        onSelectionChange={onSelectionChange}
        layout="card"
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(onSelectionChange).toHaveBeenCalledWith([1], [mockData[0]])
  })

  it('expands and collapses row details', () => {
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        layout="card"
        primaryField="name"
        secondaryField="email"
      />
    )

    // Find expand button
    const expandButtons = screen.getAllByLabelText('Expandir detalles')
    fireEvent.click(expandButtons[0])

    // Should show additional details
    expect(screen.getByText('Role:')).toBeInTheDocument()
    expect(screen.getByText('Active:')).toBeInTheDocument()

    // Click to collapse
    const collapseButton = screen.getByLabelText('Colapsar detalles')
    fireEvent.click(collapseButton)

    // Details should be hidden
    expect(screen.queryByText('Role:')).not.toBeInTheDocument()
  })

  it('renders row actions', () => {
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        rowActions={mockRowActions}
        layout="card"
      />
    )

    const actionButtons = screen.getAllByLabelText('Abrir menú de acciones')
    expect(actionButtons).toHaveLength(2)
  })

  it('handles row click events', () => {
    const onRowClick = jest.fn()
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        onRowClick={onRowClick}
        layout="card"
      />
    )

    const firstCard = screen.getByText('John Doe').closest('.cursor-pointer')
    fireEvent.click(firstCard!)

    expect(onRowClick).toHaveBeenCalledWith(mockData[0], 0)
  })

  it('shows images when enabled', () => {
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        showImages={true}
        layout="card"
      />
    )

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', 'https://example.com/avatar1.jpg')
  })

  it('renders empty state when no data', () => {
    render(
      <MobileDataTable
        data={[]}
        columns={mockColumns}
        layout="card"
      />
    )

    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument()
  })

  it('formats different data types correctly', () => {
    const dataWithTypes = [
      {
        id: 1,
        name: 'Test User',
        active: true,
        date: '2024-01-15',
        score: null,
      },
    ]

    const columnsWithTypes = [
      { key: 'name', title: 'Name' },
      { key: 'active', title: 'Active', dataType: 'boolean' as const },
      { key: 'date', title: 'Date', dataType: 'date' as const },
      { key: 'score', title: 'Score' },
    ]

    render(
      <MobileDataTable
        data={dataWithTypes}
        columns={columnsWithTypes}
        layout="card"
        primaryField="name"
      />
    )

    // Expand to see details
    const expandButton = screen.getByLabelText('Expandir detalles')
    fireEvent.click(expandButton)

    expect(screen.getByText('✓')).toBeInTheDocument() // Boolean true
    expect(screen.getByText('-')).toBeInTheDocument() // Null value
  })
})

describe('SwipeActions', () => {
  const mockLeftActions = [
    {
      key: 'archive',
      label: 'Archive',
      icon: '📁',
      color: 'blue' as const,
      onClick: jest.fn(),
    },
  ]

  const mockRightActions = [
    {
      key: 'delete',
      label: 'Delete',
      icon: '🗑️',
      color: 'red' as const,
      onClick: jest.fn(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children normally', () => {
    render(
      <SwipeActions>
        <div>Test Content</div>
      </SwipeActions>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders left and right actions', () => {
    render(
      <SwipeActions leftActions={mockLeftActions} rightActions={mockRightActions}>
        <div>Test Content</div>
      </SwipeActions>
    )

    expect(screen.getByText('Archive')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('handles touch swipe gestures', () => {
    render(
      <SwipeActions rightActions={mockRightActions} threshold={50}>
        <div>Test Content</div>
      </SwipeActions>
    )

    const container = screen.getByText('Test Content').parentElement!

    // Simulate swipe left (to reveal right actions)
    fireEvent.touchStart(container, {
      touches: [{ clientX: 100 }],
    })

    fireEvent.touchMove(container, {
      touches: [{ clientX: 40 }], // Moved 60px left
    })

    fireEvent.touchEnd(container)

    expect(mockRightActions[0].onClick).toHaveBeenCalled()
  })

  it('handles mouse swipe gestures', () => {
    render(
      <SwipeActions leftActions={mockLeftActions} threshold={50}>
        <div>Test Content</div>
      </SwipeActions>
    )

    const container = screen.getByText('Test Content').parentElement!

    // Simulate mouse swipe right (to reveal left actions)
    fireEvent.mouseDown(container, { clientX: 100 })

    // Mock mouse move event
    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 160 })
    act(() => {
      document.dispatchEvent(mouseMoveEvent)
    })

    const mouseUpEvent = new MouseEvent('mouseup')
    act(() => {
      document.dispatchEvent(mouseUpEvent)
    })

    expect(mockLeftActions[0].onClick).toHaveBeenCalled()
  })

  it('does not trigger action if threshold not met', () => {
    render(
      <SwipeActions rightActions={mockRightActions} threshold={100}>
        <div>Test Content</div>
      </SwipeActions>
    )

    const container = screen.getByText('Test Content').parentElement!

    fireEvent.touchStart(container, {
      touches: [{ clientX: 100 }],
    })

    fireEvent.touchMove(container, {
      touches: [{ clientX: 70 }], // Only moved 30px, below threshold
    })

    fireEvent.touchEnd(container)

    expect(mockRightActions[0].onClick).not.toHaveBeenCalled()
  })

  it('respects disabled prop', () => {
    render(
      <SwipeActions rightActions={mockRightActions} disabled={true}>
        <div>Test Content</div>
      </SwipeActions>
    )

    const container = screen.getByText('Test Content').parentElement!

    fireEvent.touchStart(container, {
      touches: [{ clientX: 100 }],
    })

    fireEvent.touchMove(container, {
      touches: [{ clientX: 40 }],
    })

    fireEvent.touchEnd(container)

    expect(mockRightActions[0].onClick).not.toHaveBeenCalled()
  })

  it('shows swipe hint overlay during swipe', () => {
    render(
      <SwipeActions rightActions={mockRightActions}>
        <div>Test Content</div>
      </SwipeActions>
    )

    const container = screen.getByText('Test Content').parentElement!

    fireEvent.touchStart(container, {
      touches: [{ clientX: 100 }],
    })

    fireEvent.touchMove(container, {
      touches: [{ clientX: 70 }], // Move 30px to show hint
    })

    expect(screen.getByText('Delete →')).toBeInTheDocument()
  })
})
