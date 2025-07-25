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
import { getMainServicesAsCards } from '@/data'

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

  // Get main services data
  const mainServicesCards = getMainServicesAsCards()

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

      {/* Main Services - 6 Service Cards in 2x3 Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <ResponsiveContainer
          layout="stack"
          gap="xl"
          padding="adaptive"
          maxWidth="7xl"
          centered={true}
        >
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
              Servicios más solicitados
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Accede rápidamente a los servicios más utilizados por los ciudadanos
            </p>
          </div>

          {/* Services Grid - 2x3 Layout matching reference image */}
          <ResponsiveContainer
            layout="service-cards"
            gap="lg"
            padding="none"
            className="w-full"
          >
            {mainServicesCards.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
                href={service.href}
                stats={service.stats}
                colorScheme={service.colorScheme}
                buttonText={service.buttonText}
                size="md"
                animated={true}
              />
            ))}
          </ResponsiveContainer>
        </ResponsiveContainer>
      </section>

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
