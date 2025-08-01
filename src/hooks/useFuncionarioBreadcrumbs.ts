'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useAuth } from './useAuth'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export function useFuncionarioBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  const { userProfile } = useAuth()

  return useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Panel Funcionario',
        href: '/funcionario',
      },
    ]

    // Add dependencia context if available
    if (userProfile?.dependencia?.nombre) {
      breadcrumbs.push({
        label: userProfile.dependencia.nombre,
        href: '/funcionario',
      })
    }

    // Parse current path
    const pathSegments = pathname.split('/').filter(Boolean)
    
    if (pathSegments.length > 1) {
      const section = pathSegments[1]
      
      switch (section) {
        case 'tramites':
          breadcrumbs.push({
            label: 'Trámites',
            href: '/funcionario/tramites',
            current: pathSegments.length === 2,
          })
          break
          
        case 'opas':
          breadcrumbs.push({
            label: 'OPAs',
            href: '/funcionario/opas',
            current: pathSegments.length === 2,
          })
          break
          
        case 'faqs':
          breadcrumbs.push({
            label: 'FAQs',
            href: '/funcionario/faqs',
            current: pathSegments.length === 2,
          })
          break
          
        case 'subdependencias':
          breadcrumbs.push({
            label: 'Subdependencias',
            href: '/funcionario/subdependencias',
            current: pathSegments.length === 2,
          })
          break
          
        default:
          // For unknown sections, just add the segment
          breadcrumbs.push({
            label: section.charAt(0).toUpperCase() + section.slice(1),
            current: true,
          })
      }
    } else {
      // We're on the main dashboard
      breadcrumbs[breadcrumbs.length - 1].current = true
    }

    return breadcrumbs
  }, [pathname, userProfile?.dependencia?.nombre])
}
