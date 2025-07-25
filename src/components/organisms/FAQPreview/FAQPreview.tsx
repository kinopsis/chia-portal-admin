'use client'

/**
 * FAQPreview Component
 * 
 * Displays frequently asked questions with:
 * - Expandable accordion functionality
 * - Keyboard navigation support
 * - Mobile-first responsive design
 * - Dark mode support
 * - Accessibility features (ARIA attributes)
 * - Link to full FAQ page
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { ResponsiveContainer } from '@/components/atoms/ResponsiveContainer'
import Button from '@/components/atoms/Button'

export interface FAQItem {
  id: string
  question: string
  answer: string
  category?: string
  isPopular?: boolean
}

export interface FAQPreviewProps {
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** FAQ items to display */
  faqs?: FAQItem[]
  /** Maximum number of FAQs to show */
  maxItems?: number
  /** Link to full FAQ page */
  fullFAQLink?: string
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string | null
  /** Additional CSS classes */
  className?: string
}

/**
 * Default FAQ data matching the wireframe
 */
const defaultFAQs: FAQItem[] = [
  {
    id: 'certificado-residencia',
    question: '¿Cómo puedo solicitar un certificado de residencia?',
    answer: 'Para solicitar un certificado de residencia, debes presentar tu cédula de ciudadanía original, un recibo de servicios públicos no mayor a 3 meses y diligenciar el formulario correspondiente. El proceso toma entre 1-2 días hábiles.',
    category: 'certificados',
    isPopular: true
  },
  {
    id: 'agendar-cita',
    question: '¿Qué documentos necesito para agendar una cita?',
    answer: 'Para agendar una cita necesitas tu documento de identidad, especificar el motivo de la consulta y tener disponibilidad de horario. Puedes agendar tu cita a través de nuestro portal web las 24 horas.',
    category: 'citas',
    isPopular: true
  },
  {
    id: 'pagos-online',
    question: '¿Cómo puedo realizar pagos en línea de manera segura?',
    answer: 'Nuestro sistema de pagos en línea utiliza encriptación de última generación. Necesitas el número de referencia de pago, tu documento de identidad y un medio de pago válido (tarjeta débito/crédito o PSE).',
    category: 'pagos',
    isPopular: true
  },
  {
    id: 'formularios',
    question: '¿Dónde puedo descargar los formularios oficiales?',
    answer: 'Todos los formularios oficiales están disponibles en la sección "Formularios y Documentos" de nuestro portal. Puedes descargarlos en formato PDF las 24 horas del día.',
    category: 'formularios',
    isPopular: false
  }
]

/**
 * Chevron icon for accordion
 */
const ChevronIcon: React.FC<{ className?: string; isOpen?: boolean }> = ({ 
  className, 
  isOpen = false 
}) => (
  <svg
    className={clsx(
      'transition-transform duration-200',
      isOpen && 'rotate-180',
      className
    )}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
)

/**
 * FAQ accordion item component
 */
const FAQAccordionItem: React.FC<{
  faq: FAQItem
  isOpen: boolean
  onToggle: () => void
}> = ({ faq, isOpen, onToggle }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* Question Button */}
      <button
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className={clsx(
          'w-full px-6 py-4 text-left',
          'flex items-center justify-between',
          'hover:bg-gray-50 dark:hover:bg-gray-800',
          'focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800',
          'transition-colors duration-200',
          'min-h-touch-sm'
        )}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
        id={`faq-question-${faq.id}`}
      >
        <span className="font-medium text-gray-900 dark:text-gray-100 pr-4">
          {faq.question}
        </span>
        <ChevronIcon 
          className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" 
          isOpen={isOpen}
        />
      </button>

      {/* Answer Content */}
      <div
        id={`faq-answer-${faq.id}`}
        role="region"
        aria-labelledby={`faq-question-${faq.id}`}
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-4">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton
 */
const FAQPreviewSkeleton: React.FC<{ count: number }> = ({ count }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="px-6 py-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  ))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {skeletonItems}
    </div>
  )
}

/**
 * FAQPreview component
 */
export const FAQPreview: React.FC<FAQPreviewProps> = ({
  title = "Preguntas frecuentes",
  subtitle = "Encuentra respuestas rápidas a las consultas más comunes",
  faqs = defaultFAQs,
  maxItems = 4,
  fullFAQLink = "/faqs",
  loading = false,
  error = null,
  className,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(['certificado-residencia']))

  // Handle accordion toggle
  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Get displayed FAQs
  const displayedFAQs = faqs.slice(0, maxItems)

  // Handle loading state
  if (loading) {
    return (
      <section className={clsx('py-16 sm:py-20 lg:py-24', className)}>
        <ResponsiveContainer
          layout="stack"
          gap="xl"
          padding="adaptive"
          maxWidth="4xl"
          centered={true}
        >
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
          </div>
          <FAQPreviewSkeleton count={maxItems} />
        </ResponsiveContainer>
      </section>
    )
  }

  // Handle error state
  if (error) {
    return (
      <section className={clsx('py-16 sm:py-20 lg:py-24', className)}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error al cargar preguntas frecuentes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section 
      className={clsx('py-16 sm:py-20 lg:py-24', className)}
      aria-labelledby="faq-title"
    >
      <ResponsiveContainer
        layout="stack"
        gap="xl"
        padding="adaptive"
        maxWidth="4xl"
        centered={true}
      >
        {/* Section Header */}
        <div className="text-center space-y-4">
          <h2 
            id="faq-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {displayedFAQs.map((faq) => (
            <FAQAccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openItems.has(faq.id)}
              onToggle={() => toggleItem(faq.id)}
            />
          ))}
        </div>

        {/* View All FAQs Link */}
        <div className="text-center">
          <Link href={fullFAQLink}>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              Ver todas las FAQs →
            </Button>
          </Link>
        </div>
      </ResponsiveContainer>
    </section>
  )
}

/**
 * Preset configurations
 */
export const FAQPreviewPresets = {
  homepage: {
    maxItems: 4,
    title: "Preguntas frecuentes",
    subtitle: "Encuentra respuestas rápidas a las consultas más comunes"
  },
  
  compact: {
    maxItems: 3,
    title: "FAQs",
    subtitle: undefined
  },
  
  expanded: {
    maxItems: 6,
    title: "Preguntas frecuentes",
    subtitle: "Resuelve tus dudas antes de iniciar un trámite"
  },
} as const

export default FAQPreview
