// Standardized ThemeProvider from '@/contexts/ThemeContext' provides light/dark/system modes with localStorage persistence and system preference detection.
// The duplicate providers/ThemeContext has been removed to prevent mismatches.
'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ServiceUpdateProvider } from '@/contexts/ServiceUpdateContext'
import { QueryProvider } from '@/providers/QueryProvider'
import { ToastProvider } from '@/components/ui/toast'
import { AccessibilityProvider } from '@/components/providers'
import { PerformanceProvider } from '@/components/providers'
import { MobileOptimizationProvider } from '@/components/providers'
import LayoutSkeleton from '@/components/layout/LayoutSkeleton'

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <LayoutSkeleton />
  }

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <PerformanceProvider enableMonitoring={true}>
          <MobileOptimizationProvider>
            <QueryProvider>
              <AuthProvider>
                <ServiceUpdateProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </ServiceUpdateProvider>
              </AuthProvider>
            </QueryProvider>
          </MobileOptimizationProvider>
        </PerformanceProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  )
}