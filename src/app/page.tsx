'use client'

/**
 * Enhanced Homepage - Complete Integration
 *
 * Integrates all components built in Phases 1 and 2:
 * - HeroSection with search integration
 * - MetricsGrid with system statistics
 * - ServiceCard components (6 cards in 2x3 grid layout)
 * - WhyChooseSection (3-column benefits)
 * - DepartmentShowcase (4-column department grid)
 * - FAQPreview with accordion functionality
 */

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import React from 'react'
import {
  HeroSection,
  WhyChooseSection,
  DepartmentShowcase,
  FAQPreview
} from '@/components/organisms'
import { ServiceCard } from '@/components/molecules'
import { ResponsiveContainer } from '@/components/atoms'
import { HomepageServices } from '@/components/organisms/HomepageServices'

/**
 * Enhanced Homepage Component
 */
export default function Home() {
  // Handle search functionality
  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Redirect to unified search page with query parameter
      window.location.href = `/tramites?q=${encodeURIComponent(query.trim())}`
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section with Search Integration */}
      <HeroSection
        title="Servicios municipales al alcance de todos"
        subtitle="Accede a trámites, información y servicios de manera fácil, rápida y segura. El asistente virtual te guía paso a paso en tus consultas."
        searchPlaceholder="Buscar trámite, servicio, información..."
        backgroundVariant="gradient"
        enableSearch={true}
        onSearch={handleSearch}
      />

      {/* Metrics section removed for cleaner homepage experience */}

      {/* Main Services Section - Dynamic from Database */}
      <HomepageServices />

      {/* Why Choose Our Digital Portal */}
      <WhyChooseSection
        title="¿Por qué elegir nuestro portal digital?"
        subtitle="Descubre las ventajas de realizar tus trámites de manera digital"
        variant="cards"
        background="subtle"
      />

      {/* Department Quick Access */}
      <DepartmentShowcase
        title="Acceso rápido por dependencia"
        subtitle="Encuentra los trámites organizados por dependencia municipal"
        variant="cards"
      />

      {/* FAQ Preview */}
      <FAQPreview
        title="Preguntas frecuentes"
        subtitle="Encuentra respuestas rápidas a las consultas más comunes"
        maxItems={4}
        fullFAQLink="/faqs"
      />
    </main>
  )
}
