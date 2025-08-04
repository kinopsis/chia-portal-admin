/**
 * ToggleSwitch Component Tests
 * 
 * Tests for the ToggleSwitch component including:
 * - Basic functionality
 * - Loading states
 * - Confirmation dialogs
 * - Accessibility
 * - Keyboard navigation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleSwitch } from './ToggleSwitch'

describe('ToggleSwitch', () => {
  const defaultProps = {
    checked: false,
    onChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('renders correctly', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeInTheDocument()
      expect(toggle).toHaveAttribute('aria-checked', 'false')
    })

    it('shows checked state correctly', () => {
      render(<ToggleSwitch {...defaultProps} checked={true} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('calls onChange when clicked', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(<ToggleSwitch {...defaultProps} onChange={onChange} />)
      
      const toggle = screen.getByRole('switch')
      await user.click(toggle)
      
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('displays label when provided', () => {
      render(<ToggleSwitch {...defaultProps} label="Test Label" />)
      
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('displays helper text when provided', () => {
      render(<ToggleSwitch {...defaultProps} helperText="Helper text" />)
      
      expect(screen.getByText('Helper text')).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('shows loading state', () => {
      render(<ToggleSwitch {...defaultProps} loading={true} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeDisabled()
      
      // Check for loading spinner
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('shows disabled state', () => {
      render(<ToggleSwitch {...defaultProps} disabled={true} />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeDisabled()
    })

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(<ToggleSwitch {...defaultProps} onChange={onChange} disabled={true} />)
      
      const toggle = screen.getByRole('switch')
      await user.click(toggle)
      
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not call onChange when loading', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(<ToggleSwitch {...defaultProps} onChange={onChange} loading={true} />)
      
      const toggle = screen.getByRole('switch')
      await user.click(toggle)
      
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Confirmation Dialog', () => {
    it('shows confirmation dialog when required', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(
        <ToggleSwitch 
          {...defaultProps} 
          onChange={onChange} 
          confirmationRequired={true}
          confirmationMessage="Are you sure?"
        />
      )
      
      const toggle = screen.getByRole('switch')
      await user.click(toggle)
      
      // Should show confirmation dialog
      expect(screen.getByText('Confirmar cambio')).toBeInTheDocument()
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
      
      // Should not call onChange yet
      expect(onChange).not.toHaveBeenCalled()
    })

    it('calls onChange when confirmation is accepted', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(
        <ToggleSwitch 
          {...defaultProps} 
          onChange={onChange} 
          confirmationRequired={true}
        />
      )
      
      const toggle = screen.getByRole('switch')
      await user.click(toggle)
      
      // Click confirm button
      const confirmButton = screen.getByText('Activar')
      await user.click(confirmButton)
      
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('does not call onChange when confirmation is cancelled', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(
        <ToggleSwitch 
          {...defaultProps} 
          onChange={onChange} 
          confirmationRequired={true}
        />
      )
      
      const toggle = screen.getByRole('switch')
      await user.click(toggle)
      
      // Click cancel button
      const cancelButton = screen.getByText('Cancelar')
      await user.click(cancelButton)
      
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('responds to Enter key', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(<ToggleSwitch {...defaultProps} onChange={onChange} />)
      
      const toggle = screen.getByRole('switch')
      toggle.focus()
      await user.keyboard('{Enter}')
      
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('responds to Space key', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(<ToggleSwitch {...defaultProps} onChange={onChange} />)
      
      const toggle = screen.getByRole('switch')
      toggle.focus()
      await user.keyboard(' ')
      
      expect(onChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ToggleSwitch {...defaultProps} label="Test Switch" />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')
      expect(toggle).toHaveAttribute('aria-label')
    })

    it('is focusable', () => {
      render(<ToggleSwitch {...defaultProps} />)
      
      const toggle = screen.getByRole('switch')
      toggle.focus()
      expect(toggle).toHaveFocus()
    })
  })

  describe('Sizes and Variants', () => {
    it('applies size classes correctly', () => {
      const { rerender } = render(<ToggleSwitch {...defaultProps} size="sm" />)
      let toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('h-5', 'w-9')
      
      rerender(<ToggleSwitch {...defaultProps} size="lg" />)
      toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('h-7', 'w-14')
    })

    it('applies variant classes correctly', () => {
      render(<ToggleSwitch {...defaultProps} checked={true} variant="success" />)
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveClass('bg-green-500')
    })
  })
})
