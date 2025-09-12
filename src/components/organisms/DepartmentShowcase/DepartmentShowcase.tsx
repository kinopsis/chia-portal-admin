'use client'

/**
 * DepartmentShowcase Component
 *
 * Displays department quick access with:
 * - 4-column responsive grid layout
 * - Department icons and names
 * - Subdependency and trámite counts
 * - Mobile-first responsive design
 * - Dark mode support
 * - Accessibility features
 */

import React from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { ResponsiveContainer } from '@/components/atoms/ResponsiveContainer'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'

export interface DepartmentData {
  id: string
  name: string
  icon: string | React.ReactNode
  subdependencies: number
  tramites: number
  href: string
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo' | 'gray'
  description?: string
}

export interface DepartmentShowcaseProps {
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Departments data */
  departments?: DepartmentData[]
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string | null
  /** Layout variant */
  variant?: 'cards' | 'minimal' | 'compact'
  /** Additional CSS classes */
  className?: string
  /** Click handler for departments */
  onDepartmentClick?: (department: DepartmentData) => void
}

/**
 * Default departments data matching the wireframe
 */
const defaultDepartments: DepartmentData[] = [
  {
    id: 'planeacion',
    name: 'Planeación',
    icon: '🏛️',
    subdependencies: 3,
    tramites: 15,
    href: '/dependencias/planeacion',
    color: 'blue',
    description: 'Planificación urbana y desarrollo territorial',
  },
  {
    id: 'hacienda',
    name: 'Hacienda',
    icon: '💼',
    subdependencies: 4,
    tramites: 23,
    href: '/dependencias/hacienda',
    color: 'green',
    description: 'Gestión financiera y tributaria municipal',
  },
  {
    id: 'salud',
    name: 'Salud',
    icon: '🏥',
    subdependencies: 2,
    tramites: 8,
    href: '/dependencias/salud',
    color: 'red',
    description: 'Servicios de salud pública y bienestar',
  },
  {
    id: 'ambiente',
    name: 'Ambiente',
    icon: '🌱',
    subdependencies: 2,
    tramites: 12,
    href: '/dependencias/ambiente',
    color: 'green',
    description: 'Protección ambiental y sostenibilidad',
  },
]

/**
 * Department card component
 */
const DepartmentCard: React.FC<{
  department: DepartmentData
  variant: DepartmentShowcaseProps['variant']
  onClick?: (department: DepartmentData) => void
}> = ({ department, variant, onClick }) => {
  const getColorClasses = () => {
    switch (department.color) {
      case 'blue':
        return {
          iconBg: 'bg-accent/10',
          iconText: 'text-accent',
          accent: 'text-accent',
        }
      case 'green':
        return {
          iconBg: 'bg-success/10',
          iconText: 'text-success',
          accent: 'text-success',
        }
      case 'yellow':
        return {
          iconBg: 'bg-warning/10',
          iconText: 'text-warning',
          accent: 'text-warning',
        }
      case 'purple':
        return {
          iconBg: 'bg-info/10',
          iconText: 'text-info',
          accent: 'text-info',
        }
      case 'red':
        return {
          iconBg: 'bg-error/10',
          iconText: 'text-error',
          accent: 'text-error',
        }
      case 'indigo':
        return {
          iconBg: 'bg-accent/10',
          iconText: 'text-accent',
          accent: 'text-accent',
        }
      default:
        return {
          iconBg: 'bg-neutral/10',
          iconText: 'text-neutral',
          accent: 'text-neutral',
        }
    }
  }

  const colors = getColorClasses()

  const handleClick = () => {
    if (onClick) {
      onClick(department)
    }
  }

  if (variant === 'minimal') {
    return (
      <Link href={department.href} className="block">
        <div
          className="text-center space-y-3 p-4 rounded-lg hover:bg-background-secondary transition-colors duration-200"
          onClick={handleClick}
        >
          {/* Icon */}
          <div
            className={clsx(
              'w-12 h-12 mx-auto rounded-lg flex items-center justify-center',
              colors.iconBg
            )}
          >
            <span className={clsx('text-xl', colors.iconText)}>
              {typeof department.icon === 'string' ? (
                <span role="img" aria-hidden="true">
                  {department.icon}
                </span>
              ) : (
                department.icon
              )}
            </span>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-semibold text-text-primary">{department.name}</h3>
            <p className="text-sm text-text-muted">{department.tramites} trámites</p>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={department.href} className="block">
        <div
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background-secondary transition-colors duration-200"
          onClick={handleClick}
        >
          {/* Icon */}
          <div
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              colors.iconBg
            )}
          >
            <span className={clsx('text-lg', colors.iconText)}>
              {typeof department.icon === 'string' ? (
                <span role="img" aria-hidden="true">
                  {department.icon}
                </span>
              ) : (
                department.icon
              )}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">{department.name}</h3>
            <p className="text-sm text-text-muted">
              {department.subdependencies} subdep. • {department.tramites} trámites
            </p>
          </div>
        </div>
      </Link>
    )
  }

  // Default cards variant
  return (
    <Link href={department.href} className="block h-full">
      <Card
        variant="default"
        padding="lg"
        hover="lift"
        interactive={true}
        className="h-full text-center"
        onClick={handleClick}
      >
        {/* Icon */}
        <div
          className={clsx(
            'w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center',
            colors.iconBg
          )}
        >
          <span className={clsx('text-2xl', colors.iconText)}>
            {typeof department.icon === 'string' ? (
              <span role="img" aria-hidden="true">
                {department.icon}
              </span>
            ) : (
              department.icon
            )}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-text-primary">{department.name}</h3>

          {department.description && (
            <p className="text-sm text-text-secondary leading-relaxed">{department.description}</p>
          )}

          {/* Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Subdependencias:</span>
              <span className={clsx('font-semibold', colors.accent)}>
                {department.subdependencies}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Trámites:</span>
              <span className={clsx('font-semibold', colors.accent)}>{department.tramites}</span>
            </div>
          </div>

          {/* CTA */}
          <Button variant="outline" size="sm" className="w-full mt-4">
            Explorar →
          </Button>
        </div>
      </Card>
    </Link>
  )
}

/**
 * Loading skeleton
 */
const DepartmentShowcaseSkeleton: React.FC<{ count: number }> = ({ count }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <Card key={index} padding="lg" className="animate-pulse">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-background-secondary rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 bg-background-secondary rounded w-3/4 mx-auto" />
          <div className="h-3 bg-background-secondary rounded w-1/2 mx-auto" />
        </div>
      </div>
    </Card>
  ))

  return (
    <ResponsiveContainer layout="grid" gridCols={{ xs: 1, sm: 2, lg: 4 }} gap="lg" padding="none">
      {skeletonItems}
    </ResponsiveContainer>
  )
}

/**
 * DepartmentShowcase component
 */
export const DepartmentShowcase: React.FC<DepartmentShowcaseProps> = ({
  title = 'Acceso rápido por dependencia',
  subtitle = 'Encuentra los trámites organizados por dependencia municipal',
  departments = defaultDepartments,
  loading = false,
  error = null,
  variant = 'cards',
  className,
  onDepartmentClick,
}) => {
  // Handle loading state
  if (loading) {
    return (
      <section className={clsx('py-16 sm:py-20 lg:py-24', className)}>
        <ResponsiveContainer
          layout="stack"
          gap="xl"
          padding="adaptive"
          maxWidth="6xl"
          centered={true}
        >
          <div className="text-center space-y-4">
            <div className="h-8 bg-background-secondary rounded w-1/2 mx-auto" />
            <div className="h-4 bg-background-secondary rounded w-3/4 mx-auto" />
          </div>
          <DepartmentShowcaseSkeleton count={4} />
        </ResponsiveContainer>
      </section>
    )
  }

  // Handle error state
  if (error) {
    return (
      <section className={clsx('py-16 sm:py-20 lg:py-24', className)}>
        <div className="text-center">
          <div className="text-error text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Error al cargar dependencias
          </h3>
          <p className="text-text-secondary">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className={clsx('py-16 sm:py-20 lg:py-24', className)}
      aria-labelledby="departments-title"
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
            id="departments-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Departments Grid */}
        <ResponsiveContainer
          layout="grid"
          gridCols={{ xs: 1, sm: 2, lg: 4 }}
          gap="lg"
          padding="none"
          className="w-full"
        >
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              variant={variant}
              onClick={onDepartmentClick}
            />
          ))}
        </ResponsiveContainer>
      </ResponsiveContainer>
    </section>
  )
}

/**
 * Preset configurations
 */
export const DepartmentShowcasePresets = {
  homepage: {
    variant: 'cards' as const,
  },

  sidebar: {
    variant: 'compact' as const,
  },

  overview: {
    variant: 'minimal' as const,
  },
} as const

export default DepartmentShowcase
