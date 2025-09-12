'use client'

/**
 * WhyChooseSection Component
 * 
 * Displays the benefits of using the digital portal with:
 * - 3-column responsive layout (Acceso Rápido, Seguridad, Disponible 24/7)
 * - Icon-based visual design
 * - Mobile-first responsive design
 * - Dark mode support
 * - Accessibility features
 */

import React from 'react'
import { clsx } from 'clsx'
import { ResponsiveContainer } from '@/components/atoms/ResponsiveContainer'
import Card from '@/components/atoms/Card'

export interface BenefitItem {
  id: string
  icon: string | React.ReactNode
  title: string
  description: string
  color?: 'primary' | 'secondary' | 'accent' | 'neutral'
}

export interface WhyChooseSectionProps {
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Benefits to display */
  benefits?: BenefitItem[]
  /** Layout variant */
  variant?: 'cards' | 'minimal' | 'icons'
  /** Background style */
  background?: 'none' | 'subtle' | 'gradient'
  /** Additional CSS classes */
  className?: string
}

/**
 * Default benefits data matching the wireframe
 */
const defaultBenefits: BenefitItem[] = [
  {
    id: 'acceso-rapido',
    icon: '🚀',
    title: 'Acceso Rápido',
    description: 'Servicios disponibles 24/7 sin filas ni esperas. Realiza tus trámites desde cualquier lugar.',
    color: 'primary'
  },
  {
    id: 'seguridad',
    icon: '🔒',
    title: 'Seguridad',
    description: 'Tu información está protegida con los más altos estándares de seguridad y privacidad.',
    color: 'secondary'
  },
  {
    id: 'disponible-247',
    icon: '📱',
    title: 'Disponible 24/7',
    description: 'Accede desde cualquier dispositivo, en cualquier momento, desde cualquier lugar.',
    color: 'accent'
  }
]

/**
 * Benefit card component
 */
const BenefitCard: React.FC<{
  benefit: BenefitItem
  variant: WhyChooseSectionProps['variant']
}> = ({ benefit, variant }) => {
  const getColorClasses = () => {
    switch (benefit.color) {
      case 'primary':
        return {
          iconBg: 'bg-primary-green/10 dark:bg-primary-green/20',
          iconText: 'text-primary-green dark:text-primary-green-light',
          titleText: 'text-text-primary'
        }
      case 'secondary':
        return {
          iconBg: 'bg-primary-yellow/10 dark:bg-primary-yellow/15',
          iconText: 'text-primary-yellow-dark dark:text-primary-yellow',
          titleText: 'text-text-primary'
        }
      case 'accent':
        return {
          iconBg: 'bg-primary-blue/10 dark:bg-primary-blue/20',
          iconText: 'text-primary-blue dark:text-primary-blue-light',
          titleText: 'text-text-primary'
        }
      default:
        return {
          iconBg: 'bg-background-secondary dark:bg-background-secondary/60',
          iconText: 'text-text-secondary dark:text-text-secondary-light',
          titleText: 'text-text-primary'
        }
    }
  }

  const colors = getColorClasses()

  if (variant === 'minimal') {
    return (
      <div className="text-center space-y-4">
        {/* Icon */}
        <div className={clsx(
          'w-16 h-16 mx-auto rounded-full flex items-center justify-center',
          colors.iconBg
        )}>
          <span className={clsx('text-2xl', colors.iconText)}>
            {typeof benefit.icon === 'string' ? (
              <span role="img" aria-hidden="true">{benefit.icon}</span>
            ) : (
              benefit.icon
            )}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={clsx(
            'text-lg sm:text-xl font-semibold',
            colors.titleText
          )}>
            {benefit.title}
          </h3>
          <p className="text-text-secondary leading-relaxed">
            {benefit.description}
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'icons') {
    return (
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={clsx(
          'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
          colors.iconBg
        )}>
          <span className={clsx('text-xl', colors.iconText)}>
            {typeof benefit.icon === 'string' ? (
              <span role="img" aria-hidden="true">{benefit.icon}</span>
            ) : (
              benefit.icon
            )}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={clsx(
            'text-lg font-semibold',
            colors.titleText
          )}>
            {benefit.title}
          </h3>
          <p className="text-text-secondary leading-relaxed">
            {benefit.description}
          </p>
        </div>
      </div>
    )
  }

  // Default cards variant
  return (
    <Card
      variant="default"
      padding="lg"
      hover="lift"
      className="h-full text-center"
    >
      {/* Icon */}
      <div className={clsx(
        'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
        colors.iconBg
      )}>
        <span className={clsx('text-3xl', colors.iconText)}>
          {typeof benefit.icon === 'string' ? (
            <span role="img" aria-hidden="true">{benefit.icon}</span>
          ) : (
            benefit.icon
          )}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 className={clsx(
          'text-xl sm:text-2xl font-bold',
          colors.titleText
        )}>
          {benefit.title}
        </h3>
        <p className="text-text-secondary leading-relaxed">
          {benefit.description}
        </p>
      </div>
    </Card>
  )
}

/**
 * WhyChooseSection component
 */
export const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({
  title = "¿Por qué elegir nuestro portal digital?",
  subtitle = "Descubre las ventajas de realizar tus trámites de manera digital",
  benefits = defaultBenefits,
  variant = 'cards',
  background = 'subtle',
  className,
}) => {
  // Get background classes
  const getBackgroundClasses = () => {
    switch (background) {
      case 'gradient':
        return 'bg-gradient-to-br from-background-secondary to-background via-background'
      case 'subtle':
        return 'bg-background-secondary/50'
      default:
        return ''
    }
  }

  return (
    <section 
      className={clsx(
        'py-16 sm:py-20 lg:py-24',
        getBackgroundClasses(),
        className
      )}
      aria-labelledby="why-choose-title"
    >
      <ResponsiveContainer
        layout="stack"
        gap="xl"
        padding="adaptive"
        maxWidth="6xl"
        centered={true}
      >
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2
            id="why-choose-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Benefits Grid */}
        <ResponsiveContainer
          layout="grid"
          gridCols={{ xs: 1, md: 3 }}
          gap="lg"
          padding="none"
          className="w-full"
        >
          {benefits.map((benefit) => (
            <BenefitCard
              key={benefit.id}
              benefit={benefit}
              variant={variant}
            />
          ))}
        </ResponsiveContainer>
      </ResponsiveContainer>
    </section>
  )
}

/**
 * Preset configurations for different layouts
 */
export const WhyChooseSectionPresets = {
  homepage: {
    variant: 'cards' as const,
    background: 'subtle' as const,
  },
  
  landing: {
    variant: 'minimal' as const,
    background: 'gradient' as const,
  },
  
  compact: {
    variant: 'icons' as const,
    background: 'none' as const,
  },
} as const

export default WhyChooseSection
