'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * OPAs Page - Redirects to unified search with OPAs filter
 * This page has been deprecated in favor of the unified search experience
 */

export default function OPAsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to unified search with OPAs filter applied
    router.replace('/tramites?tipo=opa')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Redirigiendo a OPAs...
        </h1>
        <p className="text-gray-600">
          Te estamos llevando al buscador unificado de servicios
        </p>
      </div>
    </div>
  )
}
