import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Header, Footer } from '@/components'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConditionalLayout } from '@/components/layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
        <ErrorBoundary>
          <AuthProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
