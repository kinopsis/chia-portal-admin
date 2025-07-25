import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Header, Footer } from '@/components'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/providers/QueryProvider'
import { ConditionalLayout } from '@/components/layout'
import { SkipLink } from '@/components/atoms'
import ErrorBoundary from '@/components/ErrorBoundary'
import { MobileOptimizationProvider, PerformanceProvider, PerformanceMonitor, AccessibilityProvider } from '@/components/providers'
import { initializeAccessibility } from '@/utils/accessibilityUtils'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT/FOUT and reduce CLS
  preload: true,
  fallback: ['system-ui', 'arial'] // Fallback fonts to prevent layout shifts
})

export const metadata: Metadata = {
  title: 'Portal de Atención Ciudadana - Chía',
  description: 'Sistema municipal con IA integrada para la atención ciudadana de Chía',
  keywords: ['Chía', 'Portal Ciudadano', 'Trámites', 'Alcaldía', 'Servicios Municipales'],
  authors: [{ name: 'Alcaldía de Chía' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Skip Links for Keyboard Navigation - WCAG 2.1 SC 2.4.1 */}
        <SkipLink targetId="main-content">
          Saltar al contenido principal
        </SkipLink>
        <SkipLink targetId="main-navigation">
          Saltar a la navegación
        </SkipLink>

        <ErrorBoundary>
          <AccessibilityProvider>
            <PerformanceProvider enableMonitoring={true}>
              <MobileOptimizationProvider>
                <ThemeProvider defaultTheme="system" enableTransitions={true}>
                  <QueryProvider>
                    <AuthProvider>
                      <ConditionalLayout>{children}</ConditionalLayout>
                      <PerformanceMonitor />
                    </AuthProvider>
                  </QueryProvider>
                </ThemeProvider>
              </MobileOptimizationProvider>
            </PerformanceProvider>
          </AccessibilityProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
