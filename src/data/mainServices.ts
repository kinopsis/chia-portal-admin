/**
 * Main Services Data Structure
 * 
 * Contains the 6 main services displayed on the homepage
 * matching the reference image layout and content.
 */

import type { ServiceCardProps, ServiceCardColorScheme } from '@/components/molecules/ServiceCard'

export interface MainService {
  id: string
  icon: string
  title: string
  description: string
  href: string
  stats: {
    count: number
    label: string
  }
  colorScheme: ServiceCardColorScheme
  buttonText: string
  category: 'certificates' | 'general' | 'consultations' | 'payments' | 'forms'
  priority: number
  keywords: string[]
  requirements?: string[]
  estimatedTime?: string
  isOnline: boolean
  isPopular: boolean
}

/**
 * The 6 main services exactly as shown in the reference image
 * Arranged in 2x3 grid: 3 on top row, 3 on bottom row
 */
export const mainServices: MainService[] = [
  // Top Row - First 3 services
  {
    id: 'certificado-residencia',
    icon: '📝',
    title: 'Solicitar certificado de residencia',
    description: 'Obtén tu certificado de residencia de manera rápida y segura para trámites oficiales',
    href: '/tramites/certificado-residencia',
    stats: { count: 1250, label: 'certificados emitidos este mes' },
    colorScheme: 'service-yellow',
    buttonText: 'Solicitar',
    category: 'certificates',
    priority: 1,
    keywords: ['certificado', 'residencia', 'domicilio', 'constancia', 'documento'],
    requirements: [
      'Cédula de ciudadanía original',
      'Recibo de servicios públicos (no mayor a 3 meses)',
      'Formulario diligenciado'
    ],
    estimatedTime: '1-2 días hábiles',
    isOnline: true,
    isPopular: true,
  },
  
  {
    id: 'tramites-administrativos',
    icon: '📋',
    title: 'Trámites y servicios administrativos',
    description: 'Accede a todos los trámites administrativos disponibles en la alcaldía',
    href: '/tramites',
    stats: { count: 156, label: 'trámites disponibles' },
    colorScheme: 'service-gray',
    buttonText: 'Ver más',
    category: 'general',
    priority: 2,
    keywords: ['trámites', 'servicios', 'administrativos', 'gestión', 'procedimientos'],
    estimatedTime: 'Variable según trámite',
    isOnline: true,
    isPopular: true,
  },
  
  {
    id: 'consulta-ciudadano',
    icon: '👥',
    title: 'Consulta de atención al ciudadano',
    description: 'Obtén información personalizada y resuelve tus dudas con nuestros funcionarios',
    href: '/atencion-ciudadano',
    stats: { count: 890, label: 'consultas atendidas' },
    colorScheme: 'service-blue',
    buttonText: 'Consultar',
    category: 'consultations',
    priority: 3,
    keywords: ['consulta', 'atención', 'ciudadano', 'información', 'dudas', 'asesoría'],
    estimatedTime: 'Inmediato',
    isOnline: true,
    isPopular: true,
  },
  
  // Bottom Row - Last 3 services
  {
    id: 'pagos-online',
    icon: '💰',
    title: 'Pagos en línea',
    description: 'Realiza el pago de impuestos, tasas y servicios municipales desde casa',
    href: '/pagos',
    stats: { count: 2340, label: 'pagos procesados' },
    colorScheme: 'service-green',
    buttonText: 'Pagar',
    category: 'payments',
    priority: 4,
    keywords: ['pagos', 'impuestos', 'tasas', 'servicios', 'online', 'predial', 'industria'],
    requirements: [
      'Número de referencia de pago',
      'Documento de identidad',
      'Medio de pago válido'
    ],
    estimatedTime: 'Inmediato',
    isOnline: true,
    isPopular: true,
  },
  
  {
    id: 'agendar-cita',
    icon: '📞',
    title: 'Solicitar cita de atención',
    description: 'Agenda tu cita presencial para trámites que requieren atención personalizada',
    href: '/agendar-cita',
    stats: { count: 450, label: 'citas disponibles' },
    colorScheme: 'service-purple',
    buttonText: 'Agendar',
    category: 'consultations',
    priority: 5,
    keywords: ['cita', 'agendar', 'presencial', 'atención', 'personalizada', 'turno'],
    requirements: [
      'Documento de identidad',
      'Motivo de la consulta',
      'Disponibilidad de horario'
    ],
    estimatedTime: 'Según disponibilidad',
    isOnline: true,
    isPopular: true,
  },
  
  {
    id: 'formularios-documentos',
    icon: '📄',
    title: 'Formularios y documentos',
    description: 'Descarga formularios oficiales y consulta documentos necesarios para tus trámites',
    href: '/formularios',
    stats: { count: 89, label: 'formularios disponibles' },
    colorScheme: 'service-indigo',
    buttonText: 'Descargar',
    category: 'forms',
    priority: 6,
    keywords: ['formularios', 'documentos', 'descargar', 'oficiales', 'formatos', 'plantillas'],
    estimatedTime: 'Inmediato',
    isOnline: true,
    isPopular: true,
  },
]

/**
 * Get services by category
 */
export const getServicesByCategory = (category: MainService['category']) => {
  return mainServices.filter(service => service.category === category)
}

/**
 * Get popular services
 */
export const getPopularServices = () => {
  return mainServices.filter(service => service.isPopular)
}

/**
 * Get online services
 */
export const getOnlineServices = () => {
  return mainServices.filter(service => service.isOnline)
}

/**
 * Search services by keyword
 */
export const searchServices = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return mainServices.filter(service => 
    service.title.toLowerCase().includes(lowercaseQuery) ||
    service.description.toLowerCase().includes(lowercaseQuery) ||
    service.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  )
}

/**
 * Get service by ID
 */
export const getServiceById = (id: string) => {
  return mainServices.find(service => service.id === id)
}

/**
 * Service categories with metadata
 */
export const serviceCategories = {
  certificates: {
    label: 'Certificados',
    description: 'Solicitud y expedición de certificados oficiales',
    icon: '📜',
    color: 'yellow'
  },
  general: {
    label: 'Trámites Generales',
    description: 'Servicios administrativos y gestión municipal',
    icon: '🏛️',
    color: 'gray'
  },
  consultations: {
    label: 'Consultas y Citas',
    description: 'Atención personalizada y asesoría ciudadana',
    icon: '💬',
    color: 'blue'
  },
  payments: {
    label: 'Pagos',
    description: 'Pagos de impuestos, tasas y servicios municipales',
    icon: '💳',
    color: 'green'
  },
  forms: {
    label: 'Formularios',
    description: 'Documentos y formatos oficiales para trámites',
    icon: '📋',
    color: 'indigo'
  }
} as const

/**
 * Convert MainService to ServiceCardProps
 */
export const serviceToCardProps = (service: MainService): ServiceCardProps => ({
  icon: service.icon,
  title: service.title,
  description: service.description,
  href: service.href,
  stats: service.stats,
  colorScheme: service.colorScheme,
  buttonText: service.buttonText,
})

/**
 * Get all services as ServiceCardProps
 */
export const getMainServicesAsCards = (): ServiceCardProps[] => {
  return mainServices.map(serviceToCardProps)
}

export default mainServices
