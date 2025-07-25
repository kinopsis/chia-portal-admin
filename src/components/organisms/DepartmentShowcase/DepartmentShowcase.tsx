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
    description: 'Planificación urbana y desarrollo territorial'
  },
  {
    id: 'hacienda',
    name: 'Hacienda',
    icon: '💼',
    subdependencies: 4,
    tramites: 23,
    href: '/dependencias/hacienda',
    color: 'green',
    description: 'Gestión financiera y tributaria municipal'
  },
  {
    id: 'salud',
    name: 'Salud',
    icon: '🏥',
    subdependencies: 2,
    tramites: 8,
    href: '/dependencias/salud',
    color: 'red',
    description: 'Servicios de salud pública y bienestar'
  },
  {
    id: 'ambiente',
    name: 'Ambiente',
    icon: '🌱',
    subdependencies: 2,
    tramites: 12,
    href: '/dependencias/ambiente',
    color: 'green',
    description: 'Protección ambiental y sostenibilidad'
  }
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
          iconBg: 'bg-blue-50 dark:bg-blue-900/30',
          iconText: 'text-blue-600 dark:text-blue-400',
          accent: 'text-blue-600 dark:text-blue-400'
        }
      case 'green':
        return {
          iconBg: 'bg-green-50 dark:bg-green-900/30',
          iconText: 'text-green-600 dark:text-green-400',
          accent: 'text-green-600 dark:text-green-400'
        }
      case 'yellow':
        return {
          iconBg: 'bg-yellow-50 dark:bg-yellow-900/30',
          iconText: 'text-yellow-600 dark:text-yellow-400',
          accent: 'text-yellow-600 dark:text-yellow-400'
        }
      case 'purple':
        return {
          iconBg: 'bg-purple-50 dark:bg-purple-900/30',
          iconText: 'text-purple-600 dark:text-purple-400',
          accent: 'text-purple-600 dark:text-purple-400'
        }
      case 'red':
        return {
          iconBg: 'bg-red-50 dark:bg-red-900/30',
          iconText: 'text-red-600 dark:text-red-400',
          accent: 'text-red-600 dark:text-red-400'
        }
      case 'indigo':
        return {
          iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
          iconText: 'text-indigo-600 dark:text-indigo-400',
          accent: 'text-indigo-600 dark:text-indigo-400'
        }
      default:
        return {
          iconBg: 'bg-gray-100 dark:bg-gray-700',
          iconText: 'text-gray-600 dark:text-gray-300',
          accent: 'text-gray-600 dark:text-gray-300'
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
          className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          onClick={handleClick}
        >
          {/* Icon */}
          <div className={clsx(
            'w-12 h-12 mx-auto rounded-lg flex items-center justify-center',
            colors.iconBg
          )}>
            <span className={clsx('text-xl', colors.iconText)}>
              {typeof department.icon === 'string' ? (
                <span role="img" aria-hidden="true">{department.icon}</span>
              ) : (
                department.icon
              )}
            </span>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {department.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {department.tramites} trámites
            </p>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={department.href} className="block">
        <div 
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          onClick={handleClick}
        >
          {/* Icon */}
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            colors.iconBg
          )}>
            <span className={clsx('text-lg', colors.iconText)}>
              {typeof department.icon === 'string' ? (
                <span role="img" aria-hidden="true">{department.icon}</span>
              ) : (
                department.icon
              )}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {department.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
        <div className={clsx(
          'w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center',
          colors.iconBg
        )}>
          <span className={clsx('text-2xl', colors.iconText)}>
            {typeof department.icon === 'string' ? (
              <span role="img" aria-hidden="true">{department.icon}</span>
            ) : (
              department.icon
            )}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {department.name}
          </h3>

          {department.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {department.description}
            </p>
          )}

          {/* Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Subdependencias:</span>
              <span className={clsx('font-semibold', colors.accent)}>
                {department.subdependencies}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Trámites:</span>
              <span className={clsx('font-semibold', colors.accent)}>
                {department.tramites}
              </span>
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
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
        <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
        </div>
      </div>
    </Card>
  ))

  return (
    <ResponsiveContainer
      layout="grid"
      gridCols={{ xs: 1, sm: 2, lg: 4 }}
      gap="lg"
      padding="none"
    >
      {skeletonItems}
    </ResponsiveContainer>
  )
}

/**
 * DepartmentShowcase component
 */
export const DepartmentShowcase: React.FC<DepartmentShowcaseProps> = ({
  title = "Acceso rápido por dependencia",
  subtitle = "Encuentra los trámites organizados por dependencia municipal",
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
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
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
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error al cargar dependencias
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {subtitle}
            </p>
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
