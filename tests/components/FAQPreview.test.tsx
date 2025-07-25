import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { FAQPreview } from '@/components/organisms/FAQPreview'
import type { FAQPreviewProps, FAQItem } from '@/components/organisms/FAQPreview'

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

describe('FAQPreview Component', () => {
  const mockFAQs: FAQItem[] = [
    {
      id: 'residence-certificate',
      question: 'How can I request a residence certificate?',
      answer: 'To request a residence certificate, you need to present your original ID, a utility bill not older than 3 months, and fill out the corresponding form.',
      category: 'certificates',
      isPopular: true,
    },
    {
      id: 'appointment-booking',
      question: 'What documents do I need to book an appointment?',
      answer: 'To book an appointment you need your ID, specify the reason for consultation, and have schedule availability.',
      category: 'appointments',
      isPopular: true,
    },
    {
      id: 'online-payments',
      question: 'How can I make secure online payments?',
      answer: 'Our online payment system uses state-of-the-art encryption. You need the payment reference number, your ID, and a valid payment method.',
      category: 'payments',
      isPopular: true,
    },
    {
      id: 'forms-download',
      question: 'Where can I download official forms?',
      answer: 'All official forms are available in the "Forms and Documents" section of our portal.',
      category: 'forms',
      isPopular: false,
    },
  ]

  const defaultProps: FAQPreviewProps = {
    title: 'Frequently Asked Questions',
    subtitle: 'Find quick answers to common inquiries',
    faqs: mockFAQs,
    maxItems: 4,
    fullFAQLink: '/faqs',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with all required props', () => {
      render(<FAQPreview {...defaultProps} />)
      
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Frequently Asked Questions')
      expect(screen.getByText('Find quick answers to common inquiries')).toBeInTheDocument()
      
      expect(screen.getByText('How can I request a residence certificate?')).toBeInTheDocument()
      expect(screen.getByText('What documents do I need to book an appointment?')).toBeInTheDocument()
      expect(screen.getByText('How can I make secure online payments?')).toBeInTheDocument()
      expect(screen.getByText('Where can I download official forms?')).toBeInTheDocument()
    })

    it('renders with default props', () => {
      render(<FAQPreview />)
      
      expect(screen.getByText('Preguntas frecuentes')).toBeInTheDocument()
      expect(screen.getByText('Encuentra respuestas rápidas a las consultas más comunes')).toBeInTheDocument()
      
      // Should render default FAQs
      expect(screen.getByText('¿Cómo puedo solicitar un certificado de residencia?')).toBeInTheDocument()
    })

    it('limits displayed FAQs based on maxItems', () => {
      render(<FAQPreview {...defaultProps} maxItems={2} />)
      
      expect(screen.getByText('How can I request a residence certificate?')).toBeInTheDocument()
      expect(screen.getByText('What documents do I need to book an appointment?')).toBeInTheDocument()
      expect(screen.queryByText('How can I make secure online payments?')).not.toBeInTheDocument()
      expect(screen.queryByText('Where can I download official forms?')).not.toBeInTheDocument()
    })

    it('renders "View All FAQs" link', () => {
      render(<FAQPreview {...defaultProps} />)
      
      const viewAllLink = screen.getByRole('link', { name: /ver todas las faqs/i })
      expect(viewAllLink).toHaveAttribute('href', '/faqs')
    })
  })

  describe('Accordion Functionality', () => {
    it('opens FAQ on click', async () => {
      const user = userEvent.setup()
      render(<FAQPreview {...defaultProps} />)
      
      const firstQuestion = screen.getByRole('button', { name: /how can i request a residence certificate/i })
      await user.click(firstQuestion)
      
      await waitFor(() => {
        expect(screen.getByText(/to request a residence certificate/i)).toBeVisible()
      })
    })

    it('closes FAQ when clicked again', async () => {
      const user = userEvent.setup()
      render(<FAQPreview {...defaultProps} />)
      
      const firstQuestion = screen.getByRole('button', { name: /how can i request a residence certificate/i })
      
      // Open
      await user.click(firstQuestion)
      await waitFor(() => {
        expect(screen.getByText(/to request a residence certificate/i)).toBeVisible()
      })
      
      // Close
      await user.click(firstQuestion)
      await waitFor(() => {
        expect(screen.getByText(/to request a residence certificate/i)).not.toBeVisible()
      })
    })

    it('allows multiple FAQs to be open simultaneously', async () => {
      const user = userEvent.setup()
      render(<FAQPreview {...defaultProps} />)
      
      const firstQuestion = screen.getByRole('button', { name: /how can i request a residence certificate/i })
      const secondQuestion = screen.getByRole('button', { name: /what documents do i need to book/i })
      
      await user.click(firstQuestion)
      await user.click(secondQuestion)
      
      await waitFor(() => {
        expect(screen.getByText(/to request a residence certificate/i)).toBeVisible()
        expect(screen.getByText(/to book an appointment you need/i)).toBeVisible()
      })
    })

    it('has first FAQ open by default', () => {
      render(<FAQPreview {...defaultProps} />)
      
      // First FAQ should be expanded by default
      const firstButton = screen.getByRole('button', { name: /how can i request a residence certificate/i })
      expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports Enter key to toggle FAQ', async () => {
      const user = userEvent.setup()
      render(<FAQPreview {...defaultProps} />)
      
      const firstQuestion = screen.getByRole('button', { name: /how can i request a residence certificate/i })
      firstQuestion.focus()
      
      await user.keyboard('{Enter}')
      
      // Should toggle the FAQ (close it since it's open by default)
      await waitFor(() => {
        expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('supports Space key to toggle FAQ', async () => {
      const user = userEvent.setup()
      render(<FAQPreview {...defaultProps} />)
      
      const secondQuestion = screen.getByRole('button', { name: /what documents do i need to book/i })
      secondQuestion.focus()
      
      await user.keyboard(' ')
      
      await waitFor(() => {
        expect(secondQuestion).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('supports tab navigation through FAQ buttons', async () => {
      const user = userEvent.setup()
      render(<FAQPreview {...defaultProps} />)
      
      // Tab through FAQ buttons
      await user.tab()
      const firstButton = screen.getByRole('button', { name: /how can i request a residence certificate/i })
      expect(firstButton).toHaveFocus()
      
      await user.tab()
      const secondButton = screen.getByRole('button', { name: /what documents do i need to book/i })
      expect(secondButton).toHaveFocus()
    })
  })

  describe('Loading States', () => {
    it('shows loading skeleton when loading', () => {
      render(<FAQPreview {...defaultProps} loading={true} />)
      
      expect(screen.getByTestId('faq-preview-skeleton')).toBeInTheDocument()
      expect(screen.queryByText('How can I request a residence certificate?')).not.toBeInTheDocument()
    })

    it('shows content when not loading', () => {
      render(<FAQPreview {...defaultProps} loading={false} />)
      
      expect(screen.queryByTestId('faq-preview-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('How can I request a residence certificate?')).toBeInTheDocument()
    })

    it('shows correct number of skeleton items', () => {
      render(<FAQPreview {...defaultProps} loading={true} maxItems={3} />)
      
      const skeletonItems = screen.getAllByTestId('faq-item-skeleton')
      expect(skeletonItems).toHaveLength(3)
    })
  })

  describe('Error States', () => {
    it('shows error message when error occurs', () => {
      const errorMessage = 'Failed to load FAQs'
      render(<FAQPreview {...defaultProps} error={errorMessage} />)
      
      expect(screen.getByText('Error al cargar preguntas frecuentes')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })

    it('does not show content when error occurs', () => {
      render(<FAQPreview {...defaultProps} error="Some error" />)
      
      expect(screen.queryByText('How can I request a residence certificate?')).not.toBeInTheDocument()
      expect(screen.getByText('Error al cargar preguntas frecuentes')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<FAQPreview {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveAttribute('id', 'faq-title')
      
      const section = screen.getByRole('region', { name: /faq/i })
      expect(section).toHaveAttribute('aria-labelledby', 'faq-title')
    })

    it('has proper ARIA attributes for accordion', () => {
      render(<FAQPreview {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button, index) => {
        expect(button).toHaveAttribute('aria-expanded')
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('id')
      })
    })

    it('has proper region roles for answers', () => {
      render(<FAQPreview {...defaultProps} />)
      
      const regions = screen.getAllByRole('region')
      // Should have main section + answer regions
      expect(regions.length).toBeGreaterThan(1)
      
      regions.slice(1).forEach(region => {
        expect(region).toHaveAttribute('aria-labelledby')
      })
    })

    it('supports screen reader navigation', () => {
      render(<FAQPreview {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-expanded')
        const isExpanded = button.getAttribute('aria-expanded') === 'true'
        const controlsId = button.getAttribute('aria-controls')
        
        if (controlsId) {
          const controlledElement = document.getElementById(controlsId)
          expect(controlledElement).toBeInTheDocument()
        }
      })
    })

    it('has proper focus management', async () => {
      const user = userEvent.setup()
      render(<FAQPreview {...defaultProps} />)
      
      const firstButton = screen.getByRole('button', { name: /how can i request a residence certificate/i })
      firstButton.focus()
      
      expect(firstButton).toHaveFocus()
      expect(firstButton).toHaveClass('focus:bg-gray-50')
    })
  })

  describe('Responsive Behavior', () => {
    it('applies responsive typography', () => {
      render(<FAQPreview {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveClass('text-3xl', 'sm:text-4xl', 'lg:text-5xl')
      
      const subtitle = screen.getByText('Find quick answers to common inquiries')
      expect(subtitle).toHaveClass('text-lg', 'sm:text-xl')
    })

    it('handles mobile viewport correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<FAQPreview {...defaultProps} />)
      
      const section = screen.getByRole('region', { name: /faq/i })
      expect(section).toHaveClass('py-16')
    })

    it('applies mobile-friendly touch targets', () => {
      render(<FAQPreview {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-touch-sm')
      })
    })
  })

  describe('Animation and Transitions', () => {
    it('applies transition classes to accordion content', () => {
      render(<FAQPreview {...defaultProps} />)
      
      const accordionContent = document.querySelector('[role="region"]')
      expect(accordionContent).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
    })

    it('respects reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(<FAQPreview {...defaultProps} />)
      
      const section = screen.getByRole('region', { name: /faq/i })
      expect(section).toHaveClass('reduce-motion')
    })
  })

  describe('Content Handling', () => {
    it('handles long questions gracefully', () => {
      const longQuestionFAQs = mockFAQs.map(faq => ({
        ...faq,
        question: 'This is a very long question that should wrap properly and maintain good readability across different screen sizes and viewport configurations?',
      }))
      
      render(<FAQPreview {...defaultProps} faqs={longQuestionFAQs} />)
      
      expect(screen.getByText(/This is a very long question/)).toBeInTheDocument()
    })

    it('handles long answers gracefully', () => {
      const longAnswerFAQs = mockFAQs.map(faq => ({
        ...faq,
        answer: 'This is a very long answer that should wrap properly and maintain good readability across different screen sizes and viewport configurations. It should handle multiple lines of text gracefully.',
      }))
      
      render(<FAQPreview {...defaultProps} faqs={longAnswerFAQs} />)
      
      // Open first FAQ to see the answer
      const firstButton = screen.getByRole('button')
      firstButton.click()
      
      expect(screen.getByText(/This is a very long answer/)).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders efficiently with many FAQs', () => {
      const manyFAQs = Array.from({ length: 50 }, (_, i) => ({
        id: `faq-${i}`,
        question: `Question ${i}?`,
        answer: `Answer ${i}`,
        category: 'general',
        isPopular: i < 10,
      }))
      
      const startTime = performance.now()
      render(<FAQPreview {...defaultProps} faqs={manyFAQs} maxItems={10} />)
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

      render(<FAQPreview {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveClass('dark:text-gray-100')
      
      const accordion = screen.getByRole('region', { name: /faq/i }).querySelector('.bg-white')
      expect(accordion).toHaveClass('dark:bg-gray-800')
    })
  })
})
