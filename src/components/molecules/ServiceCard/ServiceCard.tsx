'use client'

/**
 * ServiceCard Component
 * 
 * Displays service information with specific color schemes matching the reference image.
 * Features:
 * - 6 predefined color schemes (yellow, gray, blue, green, purple, indigo)
 * - Responsive design with mobile-first approach
 * - Hover animations and interactions
 * - Accessibility features
 * - Dark mode support
 */

import React from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'

export type ServiceCardColorScheme = 
  | 'service-yellow' 
  | 'service-gray' 
  | 'service-blue' 
  | 'service-green' 
  | 'service-purple' 
  | 'service-indigo'

export interface ServiceCardProps {
  /** Service icon (emoji or React component) */
  icon: string | React.ReactNode
  /** Service title */
  title: string
  /** Service description */
  description: string
  /** Link to service page */
  href: string
  /** Statistics to display */
  stats: {
    count: number
    label: string
  }
  /** Color scheme matching reference image */
  colorScheme: ServiceCardColorScheme
  /** Button text */
  buttonText: string
  /** Additional CSS classes */
  className?: string
  /** Card size */
  size?: 'sm' | 'md' | 'lg'
  /** Enable hover animations */
  animated?: boolean
}

/**
 * ServiceCard component for displaying main services
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  href,
  stats,
  colorScheme,
  buttonText,
  className,
  size = 'md',
  animated = true,
}) => {
  // Size configurations with fixed dimensions to prevent CLS
  const sizeConfig = {
    sm: {
      card: 'h-[240px] sm:h-[280px]', // Fixed height instead of min-height
      icon: 'text-3xl lg:text-4xl mb-3 lg:mb-4',
      title: 'text-base sm:text-lg lg:text-xl mb-2 lg:mb-3',
      description: 'text-sm sm:text-base mb-3 lg:mb-4',
      stats: 'text-xs sm:text-sm mb-3 lg:mb-4',
      button: 'text-sm px-4 py-2',
      padding: 'md' as const,
    },
    md: {
      card: 'h-[280px] sm:h-[320px] lg:h-[360px]', // Fixed height instead of min-height
      icon: 'text-4xl lg:text-5xl mb-4 lg:mb-6',
      title: 'text-lg sm:text-xl lg:text-2xl mb-3 lg:mb-4',
      description: 'text-sm sm:text-base lg:text-lg mb-4 lg:mb-6',
      stats: 'text-xs sm:text-sm lg:text-base mb-4 lg:mb-6',
      button: 'text-sm lg:text-base px-6 py-3',
      padding: 'lg' as const,
    },
    lg: {
      card: 'h-[320px] sm:h-[360px] lg:h-[400px]', // Fixed height instead of min-height
      icon: 'text-5xl lg:text-6xl mb-6 lg:mb-8',
      title: 'text-xl sm:text-2xl lg:text-3xl mb-4 lg:mb-6',
      description: 'text-base sm:text-lg lg:text-xl mb-6 lg:mb-8',
      stats: 'text-sm sm:text-base lg:text-lg mb-6 lg:mb-8',
      button: 'text-base lg:text-lg px-8 py-4',
      padding: 'xl' as const,
    },
  }

  const config = sizeConfig[size]

  // Get button variant based on color scheme
  const getButtonVariant = (): ServiceCardColorScheme => {
    return colorScheme
  }

  return (
    <Link href={href} className="block h-full">
      <Card
        variant={colorScheme}
        padding={config.padding}
        hover={animated ? 'service' : false}
        interactive={true}
        rounded="xl"
        shadow="md"
        border={true}
        className={clsx(
          // Base responsive styles
          'h-full',
          config.card,
          
          // Interactive styles
          'transition-all duration-300 cursor-pointer',
          'border-2',
          
          // Touch optimization
          'min-h-touch-large',
          'focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2',
          
          // Reduced motion support
          'reduced-motion:transition-none reduced-motion:hover:transform-none',
          
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Icon */}
          <div className={clsx(config.icon, 'flex-shrink-0')}>
            {typeof icon === 'string' ? (
              <span role="img" aria-hidden="true">
                {icon}
              </span>
            ) : (
              icon
            )}
          </div>
          
          {/* Title */}
          <h3 className={clsx(
            config.title,
            'font-bold leading-tight flex-shrink-0'
          )}>
            {title}
          </h3>
          
          {/* Description */}
          <p className={clsx(
            config.description,
            'leading-relaxed flex-grow opacity-90'
          )}>
            {description}
          </p>
          
          {/* Stats */}
          <div className={clsx(
            config.stats,
            'font-medium flex-shrink-0 opacity-75'
          )}>
            <span className="font-bold opacity-100">
              {stats.count.toLocaleString()}
            </span>{' '}
            {stats.label}
          </div>
          
          {/* CTA Button */}
          <Button 
            variant={getButtonVariant()}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            className={clsx(
              'self-start flex-shrink-0',
              config.button,
              'font-semibold rounded-lg transition-all duration-200',
              'focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            )}
          >
            {buttonText} →
          </Button>
        </div>
      </Card>
    </Link>
  )
}

/**
 * Preset service card configurations matching the reference image
 */
export const ServiceCardPresets = {
  certificadoResidencia: {
    icon: '📝',
    title: 'Solicitar certificado de residencia',
    description: 'Obtén tu certificado de residencia de manera rápida y segura para trámites oficiales',
    href: '/tramites/certificado-residencia',
    stats: { count: 1250, label: 'certificados emitidos este mes' },
    colorScheme: 'service-yellow' as const,
    buttonText: 'Solicitar'
  },
  
  tramitesAdministrativos: {
    icon: '📋',
    title: 'Trámites y servicios administrativos',
    description: 'Accede a todos los trámites administrativos disponibles en la alcaldía',
    href: '/tramites',
    stats: { count: 156, label: 'trámites disponibles' },
    colorScheme: 'service-gray' as const,
    buttonText: 'Ver más'
  },
  
  consultaCiudadano: {
    icon: '👥',
    title: 'Consulta de atención al ciudadano',
    description: 'Obtén información personalizada y resuelve tus dudas con nuestros funcionarios',
    href: '/atencion-ciudadano',
    stats: { count: 890, label: 'consultas atendidas' },
    colorScheme: 'service-blue' as const,
    buttonText: 'Consultar'
  },
  
  pagosOnline: {
    icon: '💰',
    title: 'Pagos en línea',
    description: 'Realiza el pago de impuestos, tasas y servicios municipales desde casa',
    href: '/pagos',
    stats: { count: 2340, label: 'pagos procesados' },
    colorScheme: 'service-green' as const,
    buttonText: 'Pagar'
  },
  
  agendarCita: {
    icon: '📞',
    title: 'Solicitar cita de atención',
    description: 'Agenda tu cita presencial para trámites que requieren atención personalizada',
    href: '/agendar-cita',
    stats: { count: 450, label: 'citas disponibles' },
    colorScheme: 'service-purple' as const,
    buttonText: 'Agendar'
  },
  
  formulariosDocumentos: {
    icon: '📄',
    title: 'Formularios y documentos',
    description: 'Descarga formularios oficiales y consulta documentos necesarios para tus trámites',
    href: '/formularios',
    stats: { count: 89, label: 'formularios disponibles' },
    colorScheme: 'service-indigo' as const,
    buttonText: 'Descargar'
  },
} as const

export default ServiceCard
