import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import Pagination from '@/components/molecules/Pagination'

describe('Pagination', () => {
  const defaultProps = {
    current: 1,
    pageSize: 10,
    total: 100,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders pagination controls correctly', () => {
    render(<Pagination {...defaultProps} />)

    // Check for navigation buttons
    expect(screen.getByLabelText('Primera página')).toBeInTheDocument()
    expect(screen.getByLabelText('Página anterior')).toBeInTheDocument()
    expect(screen.getByLabelText('Página siguiente')).toBeInTheDocument()
    expect(screen.getByLabelText('Última página')).toBeInTheDocument()

    // Check for page numbers
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()

    // Check for total info
    expect(screen.getByText(/Mostrando 1-10 de 100 registros/)).toBeInTheDocument()
  })

  it('calls onChange when page is clicked', () => {
    const onChange = jest.fn()
    render(<Pagination {...defaultProps} onChange={onChange} />)

    fireEvent.click(screen.getByText('2'))
    expect(onChange).toHaveBeenCalledWith(2, 10)
  })

  it('calls onChange when navigation buttons are clicked', () => {
    const onChange = jest.fn()
    render(<Pagination {...defaultProps} current={5} onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('Página anterior'))
    expect(onChange).toHaveBeenCalledWith(4, 10)

    fireEvent.click(screen.getByLabelText('Página siguiente'))
    expect(onChange).toHaveBeenCalledWith(6, 10)

    fireEvent.click(screen.getByLabelText('Primera página'))
    expect(onChange).toHaveBeenCalledWith(1, 10)

    fireEvent.click(screen.getByLabelText('Última página'))
    expect(onChange).toHaveBeenCalledWith(10, 10)
  })

  it('disables navigation buttons at boundaries', () => {
    const { rerender } = render(<Pagination {...defaultProps} current={1} />)

    // At first page
    expect(screen.getByLabelText('Primera página')).toBeDisabled()
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
    expect(screen.getByLabelText('Página siguiente')).not.toBeDisabled()
    expect(screen.getByLabelText('Última página')).not.toBeDisabled()

    // At last page
    rerender(<Pagination {...defaultProps} current={10} />)
    expect(screen.getByLabelText('Primera página')).not.toBeDisabled()
    expect(screen.getByLabelText('Página anterior')).not.toBeDisabled()
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled()
    expect(screen.getByLabelText('Última página')).toBeDisabled()
  })

  it('shows page size selector when showSizeChanger is true', () => {
    render(<Pagination {...defaultProps} showSizeChanger={true} />)

    expect(screen.getByLabelText('Registros por página')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
  })

  it('calls onShowSizeChange when page size is changed', () => {
    const onShowSizeChange = jest.fn()
    const onChange = jest.fn()
    render(
      <Pagination 
        {...defaultProps} 
        showSizeChanger={true}
        onShowSizeChange={onShowSizeChange}
        onChange={onChange}
      />
    )

    const select = screen.getByLabelText('Registros por página')
    fireEvent.change(select, { target: { value: '25' } })

    expect(onShowSizeChange).toHaveBeenCalledWith(1, 25)
    expect(onChange).toHaveBeenCalledWith(1, 25)
  })

  it('shows quick jumper when showQuickJumper is true', () => {
    render(<Pagination {...defaultProps} showQuickJumper={true} />)

    expect(screen.getByLabelText('Ir a página')).toBeInTheDocument()
    expect(screen.getByText('Ir')).toBeInTheDocument()
  })

  it('handles quick jump functionality', () => {
    const onChange = jest.fn()
    render(<Pagination {...defaultProps} showQuickJumper={true} onChange={onChange} />)

    const input = screen.getByLabelText('Ir a página')
    const button = screen.getByText('Ir')

    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.click(button)

    expect(onChange).toHaveBeenCalledWith(5, 10)
  })

  it('handles quick jump with Enter key', () => {
    const onChange = jest.fn()
    render(<Pagination {...defaultProps} showQuickJumper={true} onChange={onChange} />)

    const input = screen.getByLabelText('Ir a página')
    fireEvent.change(input, { target: { value: '3' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(3, 10)
  })

  it('shows ellipsis for large page counts', () => {
    render(<Pagination {...defaultProps} total={1000} />)

    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('renders simple pagination when simple is true', () => {
    render(<Pagination {...defaultProps} simple={true} />)

    expect(screen.getByText('← Anterior')).toBeInTheDocument()
    expect(screen.getByText('Siguiente →')).toBeInTheDocument()
    expect(screen.getByText('1 / 10')).toBeInTheDocument()
  })

  it('hides pagination when hideOnSinglePage is true and only one page', () => {
    const { container } = render(
      <Pagination {...defaultProps} total={5} hideOnSinglePage={true} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('supports keyboard navigation', () => {
    const onChange = jest.fn()
    render(<Pagination {...defaultProps} onChange={onChange} />)

    const nextButton = screen.getByLabelText('Página siguiente')
    
    fireEvent.keyDown(nextButton, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(2, 10)

    fireEvent.keyDown(nextButton, { key: ' ' })
    expect(onChange).toHaveBeenCalledWith(2, 10)
  })

  it('calculates correct record ranges', () => {
    const { rerender } = render(<Pagination {...defaultProps} current={1} pageSize={10} total={100} />)
    expect(screen.getByText(/Mostrando 1-10 de 100 registros/)).toBeInTheDocument()

    rerender(<Pagination {...defaultProps} current={2} pageSize={10} total={100} />)
    expect(screen.getByText(/Mostrando 11-20 de 100 registros/)).toBeInTheDocument()

    rerender(<Pagination {...defaultProps} current={10} pageSize={10} total={95} />)
    expect(screen.getByText(/Mostrando 91-95 de 95 registros/)).toBeInTheDocument()
  })

  it('handles edge case with zero total', () => {
    render(<Pagination {...defaultProps} total={0} />)
    expect(screen.getByText(/Mostrando 0-0 de 0 registros/)).toBeInTheDocument()
  })

  it('disables all controls when disabled prop is true', () => {
    render(<Pagination {...defaultProps} disabled={true} showSizeChanger={true} showQuickJumper={true} />)

    expect(screen.getByLabelText('Primera página')).toBeDisabled()
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled()
    expect(screen.getByLabelText('Última página')).toBeDisabled()
    expect(screen.getByLabelText('Registros por página')).toBeDisabled()
    expect(screen.getByLabelText('Ir a página')).toBeDisabled()
  })

  it('validates quick jump input range', () => {
    const onChange = jest.fn()
    render(<Pagination {...defaultProps} showQuickJumper={true} onChange={onChange} />)

    const input = screen.getByLabelText('Ir a página')
    const button = screen.getByText('Ir')

    // Test invalid page number (too high)
    fireEvent.change(input, { target: { value: '20' } })
    fireEvent.click(button)
    expect(onChange).not.toHaveBeenCalled()

    // Test invalid page number (too low)
    fireEvent.change(input, { target: { value: '0' } })
    fireEvent.click(button)
    expect(onChange).not.toHaveBeenCalled()

    // Test valid page number
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.click(button)
    expect(onChange).toHaveBeenCalledWith(5, 10)
  })

  it('maintains current page position when page size changes', () => {
    const onChange = jest.fn()
    const onShowSizeChange = jest.fn()
    
    render(
      <Pagination 
        {...defaultProps} 
        current={3}
        pageSize={10}
        total={100}
        showSizeChanger={true}
        onChange={onChange}
        onShowSizeChange={onShowSizeChange}
      />
    )

    const select = screen.getByLabelText('Registros por página')
    fireEvent.change(select, { target: { value: '25' } })

    // Should calculate new page to maintain position (records 21-30 should now be on page 2 with 25 per page)
    expect(onShowSizeChange).toHaveBeenCalledWith(2, 25)
    expect(onChange).toHaveBeenCalledWith(2, 25)
  })
})
