'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import type { BreadcrumbItem } from '@/components/molecules/Breadcrumb/Breadcrumb'

interface BreadcrumbConfig {
  [key: string]: {
    label: string
    icon?: React.ReactNode
    dynamic?: boolean
  }
}

// Configuration for breadcrumb labels and icons
const breadcrumbConfig: BreadcrumbConfig = {
  admin: { label: 'Administración', icon: 'Admin' },
  dashboard: { label: 'Dashboard', icon: 'Dashboard' },
  dependencias: { label: 'Dependencias', icon: 'Deps' },
  subdependencias: { label: 'Subdependencias', icon: 'SubDeps' },
  tramites: { label: 'Trámites', icon: 'Tramites' },
  opas: { label: 'OPAs', icon: 'OPAs' },
  faqs: { label: 'Preguntas Frecuentes', icon: 'FAQs' },
  usuarios: { label: 'Usuarios', icon: 'Users' },
  reportes: { label: 'Reportes', icon: 'Reports' },
  configuracion: { label: 'Configuración', icon: 'Config' },
  profile: { label: 'Mi Perfil', icon: 'Profile' },
  auth: { label: 'Autenticación', icon: 'Auth' },
  login: { label: 'Iniciar Sesión', icon: 'Login' },
  register: { label: 'Registrarse', icon: 'Register' },
  'forgot-password': { label: 'Recuperar Contraseña', icon: 'Reset' },
  'test-connection': { label: 'Prueba de Conexión', icon: 'Test' },
  unauthorized: { label: 'No Autorizado', icon: 'Block' },
  notificaciones: { label: 'Notificaciones', icon: 'Bell' },
  'mis-tramites': { label: 'Mis Trámites', icon: 'Docs' },
  estadisticas: { label: 'Estadísticas', icon: 'Stats' },
  general: { label: 'General', icon: 'Settings' },
  seguridad: { label: 'Seguridad', icon: 'Security' },
  integraciones: { label: 'Integraciones', icon: 'Link' },
}

export function useBreadcrumbs(customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    // If custom items are provided, use them
    if (customItems) {
      return customItems
    }

    // Generate breadcrumbs from pathname
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    let currentPath = ''

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Get configuration for this segment
      const config = breadcrumbConfig[segment]
      
      breadcrumbs.push({
        label: config?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
        icon: config?.icon,
        current: isLast,
      })
    })

    return breadcrumbs
  }, [pathname, customItems])
}

// Hook for specific admin breadcrumbs
export function useAdminBreadcrumbs(
  section?: string, 
  subsection?: string,
  customLabel?: string
): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Administración',
        href: '/admin',
        icon: 'Admin',
      },
    ]

    if (section) {
      const config = breadcrumbConfig[section]
      breadcrumbs.push({
        label: config?.label || section.charAt(0).toUpperCase() + section.slice(1),
        href: subsection ? `/admin/${section}` : undefined,
        icon: config?.icon,
        current: !subsection,
      })
    }

    if (subsection) {
      const config = breadcrumbConfig[subsection]
      breadcrumbs.push({
        label: customLabel || config?.label || subsection.charAt(0).toUpperCase() + subsection.slice(1),
        href: undefined,
        icon: config?.icon,
        current: true,
      })
    }

    return breadcrumbs
  }, [section, subsection, customLabel])
}

// Hook for user-specific breadcrumbs
export function useUserBreadcrumbs(section?: string): BreadcrumbItem[] {
  return useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Mi Dashboard',
        href: '/dashboard',
        icon: 'Dashboard',
      },
    ]

    if (section) {
      const config = breadcrumbConfig[section]
      breadcrumbs.push({
        label: config?.label || section.charAt(0).toUpperCase() + section.slice(1),
        href: undefined,
        icon: config?.icon,
        current: true,
      })
    }

    return breadcrumbs
  }, [section])
}

// Hook for public page breadcrumbs
export function usePublicBreadcrumbs(
  section?: string, 
  subsection?: string,
  customLabel?: string
): BreadcrumbItem[] {
  return useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = []

    if (section) {
      const config = breadcrumbConfig[section]
      breadcrumbs.push({
        label: config?.label || section.charAt(0).toUpperCase() + section.slice(1),
        href: subsection ? `/${section}` : undefined,
        icon: config?.icon,
        current: !subsection,
      })
    }

    if (subsection) {
      const config = breadcrumbConfig[subsection]
      breadcrumbs.push({
        label: customLabel || config?.label || subsection.charAt(0).toUpperCase() + subsection.slice(1),
        href: undefined,
        icon: config?.icon,
        current: true,
      })
    }

    return breadcrumbs
  }, [section, subsection, customLabel])
}

export default useBreadcrumbs
