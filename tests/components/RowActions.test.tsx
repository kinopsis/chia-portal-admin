import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import RowActions from '@/components/molecules/RowActions'
import type { RowAction } from '@/components/molecules/RowActions'

const mockRecord = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  active: true,
}

const mockActions: RowAction[] = [
  {
    key: 'view',
    label: 'View',
    icon: '👁️',
    onClick: jest.fn(),
    tooltip: 'View details',
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: '✏️',
    onClick: jest.fn(),
    shortcut: 'e',
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: '🗑️',
    variant: 'danger',
    onClick: jest.fn(),
    confirmMessage: 'Are you sure you want to delete this item?',
  },
  {
    key: 'toggle',
    label: (record) => record.active ? 'Deactivate' : 'Activate',
    icon: (record) => record.active ? '🔴' : '🟢',
    onClick: jest.fn(),
    tooltip: (record) => record.active ? 'Deactivate item' : 'Activate item',
  },
  {
    key: 'hidden',
    label: 'Hidden Action',
    onClick: jest.fn(),
    hidden: true,
  },
  {
    key: 'disabled',
    label: 'Disabled Action',
    onClick: jest.fn(),
    disabled: true,
  },
]

describe('RowActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders visible actions as buttons', () => {
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="buttons"
      />
    )

    expect(screen.getByLabelText('View')).toBeInTheDocument()
    expect(screen.getByLabelText('Edit')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete')).toBeInTheDocument()
    expect(screen.queryByLabelText('Hidden Action')).not.toBeInTheDocument()
  })

  it('calls action onClick when button is clicked', () => {
    const viewAction = mockActions[0]
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="buttons"
      />
    )

    fireEvent.click(screen.getByLabelText('View'))
    expect(viewAction.onClick).toHaveBeenCalledWith(mockRecord, 0)
  })

  it('shows confirmation dialog for actions with confirmMessage', () => {
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="buttons"
      />
    )

    fireEvent.click(screen.getByLabelText('Delete'))
    
    expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
  })

  it('executes action after confirmation', async () => {
    const deleteAction = mockActions[2]
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="buttons"
      />
    )

    fireEvent.click(screen.getByLabelText('Delete'))
    fireEvent.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(deleteAction.onClick).toHaveBeenCalledWith(mockRecord, 0)
    })
  })

  it('cancels action when confirmation is cancelled', () => {
    const deleteAction = mockActions[2]
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="buttons"
      />
    )

    fireEvent.click(screen.getByLabelText('Delete'))
    fireEvent.click(screen.getByText('Cancelar'))

    expect(deleteAction.onClick).not.toHaveBeenCalled()
    expect(screen.queryByText('Confirmar acción')).not.toBeInTheDocument()
  })

  it('disables buttons when action is disabled', () => {
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="buttons"
      />
    )

    const disabledButton = screen.getByLabelText('Disabled Action')
    expect(disabledButton).toBeDisabled()
  })

  it('renders as dropdown when variant is dropdown', () => {
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="dropdown"
        maxVisibleActions={2}
      />
    )

    // Should show first 2 actions as buttons
    expect(screen.getByLabelText('View')).toBeInTheDocument()
    expect(screen.getByLabelText('Edit')).toBeInTheDocument()
    
    // Should show dropdown button for additional actions
    expect(screen.getByLabelText('Más acciones')).toBeInTheDocument()
  })

  it('opens dropdown menu when dropdown button is clicked', () => {
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="dropdown"
        maxVisibleActions={1}
      />
    )

    fireEvent.click(screen.getByLabelText('Más acciones'))
    
    // Should show dropdown menu with additional actions
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('renders as menu when variant is menu', () => {
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="menu"
      />
    )

    expect(screen.getByLabelText('Abrir menú de acciones')).toBeInTheDocument()
  })

  it('opens menu when menu button is clicked', () => {
    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions}
        variant="menu"
      />
    )

    fireEvent.click(screen.getByLabelText('Abrir menú de acciones'))
    
    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('handles conditional disabled function', () => {
    const conditionalActions: RowAction[] = [
      {
        key: 'conditional',
        label: 'Conditional Action',
        onClick: jest.fn(),
        disabled: (record) => record.active === false,
      },
    ]

    const { rerender } = render(
      <RowActions
        record={{ ...mockRecord, active: true }}
        index={0}
        actions={conditionalActions}
        variant="buttons"
      />
    )

    expect(screen.getByLabelText('Conditional Action')).not.toBeDisabled()

    rerender(
      <RowActions
        record={{ ...mockRecord, active: false }}
        index={0}
        actions={conditionalActions}
        variant="buttons"
      />
    )

    expect(screen.getByLabelText('Conditional Action')).toBeDisabled()
  })

  it('handles conditional hidden function', () => {
    const conditionalActions: RowAction[] = [
      {
        key: 'conditional',
        label: 'Conditional Action',
        onClick: jest.fn(),
        hidden: (record) => record.active === false,
      },
    ]

    const { rerender } = render(
      <RowActions
        record={{ ...mockRecord, active: true }}
        index={0}
        actions={conditionalActions}
        variant="buttons"
      />
    )

    expect(screen.getByLabelText('Conditional Action')).toBeInTheDocument()

    rerender(
      <RowActions
        record={{ ...mockRecord, active: false }}
        index={0}
        actions={conditionalActions}
        variant="buttons"
      />
    )

    expect(screen.queryByLabelText('Conditional Action')).not.toBeInTheDocument()
  })

  it('shows loading state for actions', () => {
    const loadingActions: RowAction[] = [
      {
        key: 'loading',
        label: 'Loading Action',
        onClick: jest.fn(),
        loading: true,
      },
    ]

    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={loadingActions}
        variant="buttons"
      />
    )

    expect(screen.getByText('⟳')).toBeInTheDocument()
  })

  it('calls action callbacks', async () => {
    const onActionStart = jest.fn()
    const onActionComplete = jest.fn()
    const onActionError = jest.fn()

    const asyncAction: RowAction = {
      key: 'async',
      label: 'Async Action',
      onClick: jest.fn().mockResolvedValue('success'),
    }

    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={[asyncAction]}
        variant="buttons"
        onActionStart={onActionStart}
        onActionComplete={onActionComplete}
        onActionError={onActionError}
      />
    )

    fireEvent.click(screen.getByLabelText('Async Action'))

    await waitFor(() => {
      expect(onActionStart).toHaveBeenCalledWith(asyncAction, mockRecord)
      expect(onActionComplete).toHaveBeenCalledWith(asyncAction, mockRecord, 'success')
    })
  })

  it('handles action errors', async () => {
    const onActionError = jest.fn()
    const error = new Error('Action failed')

    const failingAction: RowAction = {
      key: 'failing',
      label: 'Failing Action',
      onClick: jest.fn().mockRejectedValue(error),
    }

    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={[failingAction]}
        variant="buttons"
        onActionError={onActionError}
      />
    )

    fireEvent.click(screen.getByLabelText('Failing Action'))

    await waitFor(() => {
      expect(onActionError).toHaveBeenCalledWith(failingAction, mockRecord, error)
    })
  })

  it('applies correct size classes', () => {
    const { rerender } = render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions.slice(0, 1)}
        variant="buttons"
        size="sm"
      />
    )

    let button = screen.getByLabelText('View')
    expect(button).toHaveClass('px-3', 'py-1.5')

    rerender(
      <RowActions
        record={mockRecord}
        index={0}
        actions={mockActions.slice(0, 1)}
        variant="buttons"
        size="lg"
      />
    )

    button = screen.getByLabelText('View')
    expect(button).toHaveClass('px-6', 'py-3')
  })

  it('handles function-based tooltips correctly', () => {
    const toggleAction = mockActions.find(action => action.key === 'toggle')

    render(
      <RowActions
        record={mockRecord}
        index={0}
        actions={[toggleAction!]}
        variant="buttons"
      />
    )

    // For active record, should show "Deactivate item" tooltip
    const button = screen.getByLabelText('Deactivate')
    expect(button).toHaveAttribute('title', 'Deactivate item')
  })

  it('handles function-based tooltips for inactive record', () => {
    const inactiveRecord = { ...mockRecord, active: false }
    const toggleAction = mockActions.find(action => action.key === 'toggle')

    render(
      <RowActions
        record={inactiveRecord}
        index={0}
        actions={[toggleAction!]}
        variant="buttons"
      />
    )

    // For inactive record, should show "Activate item" tooltip
    const button = screen.getByLabelText('Activate')
    expect(button).toHaveAttribute('title', 'Activate item')
  })
})
