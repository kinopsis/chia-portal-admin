import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import BulkActions from '@/components/molecules/BulkActions'
import type { BulkAction } from '@/components/molecules/BulkActions'

const mockRecords = [
  { id: 1, name: 'John Doe', active: true },
  { id: 2, name: 'Jane Smith', active: false },
  { id: 3, name: 'Bob Johnson', active: true },
]

const mockSelectedKeys = [1, 2]
const mockSelectedRecords = mockRecords.filter(record => mockSelectedKeys.includes(record.id))

const mockActions: BulkAction[] = [
  {
    key: 'activate',
    label: 'Activate Selected',
    icon: '🔓',
    variant: 'primary',
    onClick: jest.fn(),
    minSelection: 1,
  },
  {
    key: 'delete',
    label: 'Delete Selected',
    icon: '🗑️',
    variant: 'danger',
    onClick: jest.fn(),
    confirmMessage: 'Are you sure you want to delete the selected items?',
    minSelection: 1,
    maxSelection: 5,
  },
  {
    key: 'export',
    label: 'Export Selected',
    icon: '📥',
    onClick: jest.fn(),
    minSelection: 1,
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

describe('BulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when no items are selected', () => {
    const { container } = render(
      <BulkActions
        selectedRecords={[]}
        selectedKeys={[]}
        actions={mockActions}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when no actions are visible', () => {
    const hiddenActions: BulkAction[] = [
      {
        key: 'hidden',
        label: 'Hidden Action',
        onClick: jest.fn(),
        hidden: true,
      },
    ]

    const { container } = render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={hiddenActions}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('displays selected count correctly', () => {
    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={mockActions}
      />
    )

    expect(screen.getByText('2 elementos seleccionados')).toBeInTheDocument()
  })

  it('displays singular form for single selection', () => {
    render(
      <BulkActions
        selectedRecords={[mockSelectedRecords[0]]}
        selectedKeys={[1]}
        actions={mockActions}
      />
    )

    expect(screen.getByText('1 elemento seleccionado')).toBeInTheDocument()
  })

  it('renders visible action buttons', () => {
    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={mockActions}
        variant="bar"
      />
    )

    expect(screen.getByText('Activate Selected')).toBeInTheDocument()
    expect(screen.getByText('Delete Selected')).toBeInTheDocument()
    expect(screen.getByText('Export Selected')).toBeInTheDocument()
    expect(screen.queryByText('Hidden Action')).not.toBeInTheDocument()
  })

  it('calls action onClick when button is clicked', () => {
    const activateAction = mockActions[0]
    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={mockActions}
      />
    )

    fireEvent.click(screen.getByText('Activate Selected'))
    expect(activateAction.onClick).toHaveBeenCalledWith(mockSelectedRecords, mockSelectedKeys)
  })

  it('shows confirmation dialog for actions with confirmMessage', () => {
    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={mockActions}
      />
    )

    fireEvent.click(screen.getByText('Delete Selected'))
    
    expect(screen.getByText('Confirmar acción masiva')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete the selected items?')).toBeInTheDocument()
    expect(screen.getByText('Esta acción afectará a 2 elementos.')).toBeInTheDocument()
  })

  it('executes action after confirmation', async () => {
    const deleteAction = mockActions[1]
    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={mockActions}
      />
    )

    fireEvent.click(screen.getByText('Delete Selected'))
    fireEvent.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(deleteAction.onClick).toHaveBeenCalledWith(mockSelectedRecords, mockSelectedKeys)
    })
  })

  it('cancels action when confirmation is cancelled', () => {
    const deleteAction = mockActions[1]
    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={mockActions}
      />
    )

    fireEvent.click(screen.getByText('Delete Selected'))
    fireEvent.click(screen.getByText('Cancelar'))

    expect(deleteAction.onClick).not.toHaveBeenCalled()
    expect(screen.queryByText('Confirmar acción masiva')).not.toBeInTheDocument()
  })

  it('disables buttons when action is disabled', () => {
    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={mockActions}
      />
    )

    const disabledButton = screen.getByText('Disabled Action')
    expect(disabledButton).toBeDisabled()
  })

  it('respects minSelection requirement', () => {
    const minSelectionAction: BulkAction = {
      key: 'min-selection',
      label: 'Min Selection Action',
      onClick: jest.fn(),
      minSelection: 3,
    }

    const { container } = render(
      <BulkActions
        selectedRecords={mockSelectedRecords} // Only 2 selected
        selectedKeys={mockSelectedKeys}
        actions={[minSelectionAction]}
      />
    )

    // Should not render because minSelection is not met
    expect(container.firstChild).toBeNull()
  })

  it('respects maxSelection requirement', () => {
    const maxSelectionAction: BulkAction = {
      key: 'max-selection',
      label: 'Max Selection Action',
      onClick: jest.fn(),
      maxSelection: 1,
    }

    const { container } = render(
      <BulkActions
        selectedRecords={mockSelectedRecords} // 2 selected, but max is 1
        selectedKeys={mockSelectedKeys}
        actions={[maxSelectionAction]}
      />
    )

    // Should not render because maxSelection is exceeded
    expect(container.firstChild).toBeNull()
  })

  it('handles conditional disabled function', () => {
    const conditionalAction: BulkAction = {
      key: 'conditional',
      label: 'Conditional Action',
      onClick: jest.fn(),
      disabled: (selectedRecords) => selectedRecords.every(record => record.active),
    }

    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={[conditionalAction]}
      />
    )

    // Should be enabled because not all selected records are active
    expect(screen.getByText('Conditional Action')).not.toBeDisabled()
  })

  it('handles conditional hidden function', () => {
    const conditionalAction: BulkAction = {
      key: 'conditional',
      label: 'Conditional Action',
      onClick: jest.fn(),
      hidden: (selectedRecords) => selectedRecords.length < 2,
    }

    const { rerender, container } = render(
      <BulkActions
        selectedRecords={[mockSelectedRecords[0]]} // Only 1 selected
        selectedKeys={[1]}
        actions={[conditionalAction]}
      />
    )

    // Should be hidden because only 1 record selected
    expect(container.firstChild).toBeNull()

    rerender(
      <BulkActions
        selectedRecords={mockSelectedRecords} // 2 selected
        selectedKeys={mockSelectedKeys}
        actions={[conditionalAction]}
      />
    )

    // Should be visible now
    expect(screen.getByText('Conditional Action')).toBeInTheDocument()
  })

  it('shows loading state for actions', () => {
    const loadingAction: BulkAction = {
      key: 'loading',
      label: 'Loading Action',
      onClick: jest.fn(),
      loading: true,
    }

    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={[loadingAction]}
      />
    )

    expect(screen.getByText('⟳')).toBeInTheDocument()
  })

  it('calls onClearSelection when clear button is clicked', () => {
    const onClearSelection = jest.fn()

    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={mockActions}
        onClearSelection={onClearSelection}
      />
    )

    fireEvent.click(screen.getByText('Limpiar selección'))
    expect(onClearSelection).toHaveBeenCalled()
  })

  it('calls action callbacks', async () => {
    const onActionStart = jest.fn()
    const onActionComplete = jest.fn()
    const onActionError = jest.fn()

    const asyncAction: BulkAction = {
      key: 'async',
      label: 'Async Action',
      onClick: jest.fn().mockResolvedValue('success'),
    }

    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={[asyncAction]}
        onActionStart={onActionStart}
        onActionComplete={onActionComplete}
        onActionError={onActionError}
      />
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Async Action'))
    })

    await waitFor(() => {
      expect(onActionStart).toHaveBeenCalledWith(asyncAction, mockSelectedRecords)
      expect(onActionComplete).toHaveBeenCalledWith(asyncAction, mockSelectedRecords, 'success')
    })
  })

  it('handles action errors', async () => {
    const onActionError = jest.fn()
    const error = new Error('Action failed')

    const failingAction: BulkAction = {
      key: 'failing',
      label: 'Failing Action',
      onClick: jest.fn().mockRejectedValue(error),
    }

    render(
      <BulkActions
        selectedRecords={mockSelectedRecords}
        selectedKeys={mockSelectedKeys}
        actions={[failingAction]}
        onActionError={onActionError}
      />
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Failing Action'))
    })

    await waitFor(() => {
      expect(onActionError).toHaveBeenCalledWith(failingAction, mockSelectedRecords, error)
    })
  })
})
