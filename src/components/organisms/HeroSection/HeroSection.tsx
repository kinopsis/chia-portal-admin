'use client'

/**
 * HeroSection Component
 * 
 * Main hero section for the homepage with:
 * - Gradient background using CSS custom properties
 * - Responsive typography with semantic font sizes
 * - Integrated search functionality
 * - Mobile-first responsive design
 * - Dark mode support
 * - Full accessibility features
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { ResponsiveContainer } from '@/components/atoms/ResponsiveContainer'
import Button from '@/components/atoms/Button'
import { useTheme } from '@/contexts/ThemeContext'

export interface HeroSectionProps {
  /** Main heading text */
  title?: string
  /** Subtitle/description text */
  subtitle?: string
  /** Search placeholder text */
  searchPlaceholder?: string
  /** Background variant */
  backgroundVariant?: 'gradient' | 'solid' | 'image'
  /** Enable search functionality */
  enableSearch?: boolean
  /** Search handler function */
  onSearch?: (query: string) => void
  /** Additional CSS classes */
  className?: string
  /** Custom background image URL */
  backgroundImage?: string
}

/**
 * Search icon component
 */
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
)

/**
 * HeroSection component
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Servicios municipales al alcance de todos",
  subtitle = "Accede a trámites, información y servicios de manera fácil, rápida y segura. El asistente virtual te guía paso a paso en tus consultas.",
  searchPlaceholder = "Buscar trámite, servicio, información...",
  backgroundVariant = 'gradient',
  enableSearch = true,
  onSearch,
  className,
  backgroundImage,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const router = useRouter()
  const { isDark } = useTheme()

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim())
      } else {
        // Default search behavior - navigate to search page
        router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
      }
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Get background classes based on variant
  const getBackgroundClasses = () => {
    switch (backgroundVariant) {
      case 'gradient':
        return clsx(
          'bg-gradient-to-br',
          'from-primary-yellow/10 via-primary-green/5 to-primary-green/10',
          'dark:from-primary-yellow/5 dark:via-primary-green/5 dark:to-primary-green/10'
        )
      case 'solid':
        return 'bg-gray-50 dark:bg-gray-900'
      case 'image':
        return backgroundImage 
          ? `bg-cover bg-center bg-no-repeat` 
          : 'bg-gray-50 dark:bg-gray-900'
      default:
        return 'bg-gray-50 dark:bg-gray-900'
    }
  }

  return (
    <section 
      className={clsx(
        'relative py-12 sm:py-16 lg:py-20 xl:py-24',
        'overflow-hidden',
        getBackgroundClasses(),
        className
      )}
      style={backgroundVariant === 'image' && backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`
      } : undefined}
      aria-labelledby="hero-title"
    >
      {/* Background overlay for image variant */}
      {backgroundVariant === 'image' && (
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      )}

      {/* Content */}
      <ResponsiveContainer
        layout="stack"
        gap="xl"
        padding="adaptive"
        maxWidth="4xl"
        centered={true}
        className="relative z-10"
      >
        {/* Text Content */}
        <div className="text-center space-y-6 lg:space-y-8">
          {/* Main Title */}
          <h1 
            id="hero-title"
            className={clsx(
              'font-bold leading-tight',
              'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl',
              'text-gray-900 dark:text-gray-100',
              backgroundVariant === 'image' && 'text-white',
              'max-w-4xl mx-auto'
            )}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p className={clsx(
            'text-lg sm:text-xl lg:text-2xl',
            'leading-relaxed',
            'text-gray-600 dark:text-gray-300',
            backgroundVariant === 'image' && 'text-gray-100',
            'max-w-3xl mx-auto'
          )}>
            {subtitle}
          </p>
        </div>

        {/* Search Section */}
        {enableSearch && (
          <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className={clsx(
                'relative flex items-center',
                'bg-white dark:bg-background-tertiary',
                'border-2 border-gray-200 dark:border-border-light',
                'rounded-xl shadow-lg dark:shadow-xl',
                'transition-all duration-200',
                isSearchFocused && 'border-primary-green dark:border-brand-green ring-2 ring-primary-green/20 dark:ring-brand-green/20'
              )}>
                {/* Search Icon */}
                <div className="absolute left-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400 dark:text-text-muted" />
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={searchPlaceholder}
                  className={clsx(
                    'w-full pl-12 pr-4 py-4 lg:py-5',
                    'text-base lg:text-lg',
                    'bg-transparent',
                    'text-gray-900 dark:text-text-primary',
                    'placeholder-gray-500 dark:placeholder-text-muted',
                    'border-none outline-none',
                    'rounded-xl'
                  )}
                  aria-label="Buscar servicios municipales"
                  autoComplete="off"
                />

                {/* Search Button */}
                <div className="absolute right-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className={clsx(
                      'px-6 py-2 lg:px-8 lg:py-3',
                      'font-semibold',
                      'min-h-touch-sm',
                      'shadow-md hover:shadow-lg'
                    )}
                    aria-label="Realizar búsqueda"
                  >
                    <span className="hidden sm:inline">Buscar</span>
                    <SearchIcon className="h-5 w-5 sm:hidden" />
                  </Button>
                </div>
              </div>

              {/* Search Suggestions/Help Text */}
              <div className="mt-3 text-center">
                <p className={clsx(
                  'text-sm text-gray-500 dark:text-text-muted',
                  backgroundVariant === 'image' && 'text-gray-300 dark:text-text-secondary'
                )}>
                  Prueba buscar: "certificado de residencia", "pagos", "citas" o "formularios"
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Optional CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="primary"
            size="lg"
            className="min-w-[200px]"
            onClick={() => router.push('/tramites')}
          >
            Ver todos los trámites
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-w-[200px]"
            onClick={() => router.push('/atencion-ciudadano')}
          >
            Contactar soporte
          </Button>
        </div>
      </ResponsiveContainer>
    </section>
  )
}

/**
 * Preset configurations for different hero section layouts
 */
export const HeroSectionPresets = {
  homepage: {
    backgroundVariant: 'gradient' as const,
    enableSearch: true,
  },
  
  landing: {
    backgroundVariant: 'image' as const,
    enableSearch: true,
    backgroundImage: '/images/hero-bg.jpg',
  },
  
  simple: {
    backgroundVariant: 'solid' as const,
    enableSearch: false,
  },
} as const

export default HeroSection
