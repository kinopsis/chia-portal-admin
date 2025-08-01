// UX-004: Test for interactive filter chips
// This test verifies that the chip-based filters work correctly with multi-selection

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterChips, FilterOption } from '@/components/molecules/FilterChips/FilterChips'

// Mock options for testing
const mockOptions: FilterOption[] = [
  { value: 'option1', label: 'Option 1', count: 10 },
  { value: 'option2', label: 'Option 2', count: 5 },
  { value: 'option3', label: 'Option 3', count: 15 },
  { value: 'option4', label: 'Option 4', count: 0, disabled: true },
  { value: 'option5', label: 'Option 5', count: 8 }
]

describe('UX-004: Filter Chips Tests', () => {
  const defaultProps = {
    label: 'Test Filter',
    options: mockOptions,
    selectedValues: [],
    onChange: jest.fn(),
    'data-testid': 'test-filter'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('should render filter label correctly', () => {
      render(<FilterChips {...defaultProps} />)
      
      expect(screen.getByText('Test Filter')).toBeInTheDocument()
    })

    test('should render trigger button with placeholder', () => {
      render(<FilterChips {...defaultProps} placeholder="Select options..." />)
      
      const trigger = screen.getByTestId('filter-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Select options...')
    })

    test('should show loading state', () => {
      render(<FilterChips {...defaultProps} loading={true} />)
      
      const trigger = screen.getByTestId('filter-trigger')
      expect(trigger).toHaveTextContent('Cargando...')
      expect(trigger).toBeDisabled()
    })

    test('should show disabled state', () => {
      render(<FilterChips {...defaultProps} disabled={true} />)
      
      const trigger = screen.getByTestId('filter-trigger')
      expect(trigger).toBeDisabled()
    })
  })

  describe('Dropdown Functionality', () => {
    test('should open dropdown when clicking trigger', async () => {
      const user = userEvent.setup()
      render(<FilterChips {...defaultProps} />)
      
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      // Check if options are visible
      expect(screen.getByTestId('option-option1')).toBeInTheDocument()
      expect(screen.getByTestId('option-option2')).toBeInTheDocument()
    })

    test('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <FilterChips {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      )
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      expect(screen.getByTestId('option-option1')).toBeInTheDocument()
      
      // Click outside
      const outside = screen.getByTestId('outside')
      await user.click(outside)
      
      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByTestId('option-option1')).not.toBeInTheDocument()
      })
    })

    test('should show search input for large option lists', async () => {
      const user = userEvent.setup()
      const manyOptions = Array.from({ length: 10 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
        count: i
      }))
      
      render(<FilterChips {...defaultProps} options={manyOptions} />)
      
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })
  })

  describe('Multi-Selection', () => {
    test('should select multiple options', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(<FilterChips {...defaultProps} onChange={onChange} allowMultiple={true} />)
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      // Select first option
      const option1 = screen.getByTestId('option-option1')
      await user.click(option1)
      expect(onChange).toHaveBeenCalledWith(['option1'])
      
      // Select second option
      const option2 = screen.getByTestId('option-option2')
      await user.click(option2)
      expect(onChange).toHaveBeenCalledWith(['option2'])
    })

    test('should deselect option when clicking selected option', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1']} 
          onChange={onChange} 
          allowMultiple={true} 
        />
      )
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      // Click selected option to deselect
      const option1 = screen.getByTestId('option-option1')
      await user.click(option1)
      expect(onChange).toHaveBeenCalledWith([])
    })

    test('should show selected chips', () => {
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1', 'option2']} 
        />
      )
      
      expect(screen.getByTestId('selected-chip-option1')).toBeInTheDocument()
      expect(screen.getByTestId('selected-chip-option2')).toBeInTheDocument()
    })

    test('should remove chip when clicking X button', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1', 'option2']} 
          onChange={onChange}
        />
      )
      
      const chip = screen.getByTestId('selected-chip-option1')
      const removeButton = chip.querySelector('button')
      
      if (removeButton) {
        await user.click(removeButton)
        expect(onChange).toHaveBeenCalledWith(['option2'])
      }
    })
  })

  describe('Single Selection Mode', () => {
    test('should only allow single selection when allowMultiple is false', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(
        <FilterChips 
          {...defaultProps} 
          onChange={onChange} 
          allowMultiple={false} 
        />
      )
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      // Select option
      const option1 = screen.getByTestId('option-option1')
      await user.click(option1)
      
      expect(onChange).toHaveBeenCalledWith(['option1'])
      
      // Dropdown should close after selection
      await waitFor(() => {
        expect(screen.queryByTestId('option-option1')).not.toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    test('should filter options based on search query', async () => {
      const user = userEvent.setup()
      const manyOptions = Array.from({ length: 10 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
        count: i
      }))
      
      render(<FilterChips {...defaultProps} options={manyOptions} />)
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      // Search for "Option 1"
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, '1')
      
      // Should show only Option 1
      expect(screen.getByTestId('option-option1')).toBeInTheDocument()
      expect(screen.queryByTestId('option-option2')).not.toBeInTheDocument()
    })

    test('should show no results message when search yields no matches', async () => {
      const user = userEvent.setup()
      // Use more than 5 options to trigger search input
      const manyOptions = Array.from({ length: 10 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
        count: i
      }))

      render(<FilterChips {...defaultProps} options={manyOptions} />)

      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)

      // Search for non-existent option
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'nonexistent')

      expect(screen.getByText('No se encontraron opciones')).toBeInTheDocument()
    })
  })

  describe('Clear All Functionality', () => {
    test('should show clear all button when selections exist', () => {
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1', 'option2']} 
        />
      )
      
      expect(screen.getByTestId('clear-all-button')).toBeInTheDocument()
    })

    test('should clear all selections when clicking clear all', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1', 'option2']} 
          onChange={onChange}
        />
      )
      
      const clearButton = screen.getByTestId('clear-all-button')
      await user.click(clearButton)
      
      expect(onChange).toHaveBeenCalledWith([])
    })

    test('should show footer clear button in dropdown', async () => {
      const user = userEvent.setup()
      
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1']} 
          allowMultiple={true}
        />
      )
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      expect(screen.getByTestId('footer-clear-button')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(<FilterChips {...defaultProps} />)
      
      const trigger = screen.getByTestId('filter-trigger')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    })

    test('should update aria-expanded when dropdown opens', async () => {
      const user = userEvent.setup()
      render(<FilterChips {...defaultProps} />)
      
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('should have proper labels for remove buttons', () => {
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1']} 
        />
      )
      
      const chip = screen.getByTestId('selected-chip-option1')
      const removeButton = chip.querySelector('button')
      
      expect(removeButton).toHaveAttribute('aria-label', 'Remover Option 1')
    })
  })

  describe('Count Display', () => {
    test('should show option counts when showCount is true', async () => {
      const user = userEvent.setup()
      render(<FilterChips {...defaultProps} showCount={true} />)
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      expect(screen.getByText('(10)')).toBeInTheDocument() // Option 1 count
      expect(screen.getByText('(5)')).toBeInTheDocument()  // Option 2 count
    })

    test('should show selection count in label', () => {
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1', 'option2']} 
          showCount={true}
        />
      )
      
      expect(screen.getByText('(2 seleccionados)')).toBeInTheDocument()
    })
  })

  describe('Disabled Options', () => {
    test('should disable options marked as disabled', async () => {
      const user = userEvent.setup()
      render(<FilterChips {...defaultProps} />)
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      const disabledOption = screen.getByTestId('option-option4')
      expect(disabledOption).toBeDisabled()
    })

    test('should not select disabled options', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(<FilterChips {...defaultProps} onChange={onChange} />)
      
      // Open dropdown
      const trigger = screen.getByTestId('filter-trigger')
      await user.click(trigger)
      
      // Try to click disabled option
      const disabledOption = screen.getByTestId('option-option4')
      await user.click(disabledOption)
      
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Max Visible Chips', () => {
    test('should limit visible chips based on maxVisible prop', () => {
      render(
        <FilterChips 
          {...defaultProps} 
          selectedValues={['option1', 'option2', 'option3', 'option5']} 
          maxVisible={2}
        />
      )
      
      // Should show first 2 chips
      expect(screen.getByTestId('selected-chip-option1')).toBeInTheDocument()
      expect(screen.getByTestId('selected-chip-option2')).toBeInTheDocument()
      
      // Should show "+2 más" indicator
      expect(screen.getByText('+2 más')).toBeInTheDocument()
    })
  })
})
