// API endpoint for system metrics
// Provides real-time statistics for homepage dashboard

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface SystemMetrics {
  dependencias: number
  subdependencias: number
  tramites: number
  opas: number
  faqs: number
  usuarios: number
  tramitesActivos: number
  opasActivas: number
  faqsActivas: number
  lastUpdated: string
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Execute all count queries in parallel for better performance
    const [
      dependenciasResult,
      subdependenciasResult,
      tramitesResult,
      opasResult,
      faqsResult,
      usuariosResult,
      tramitesActivosResult,
      opasActivasResult,
      faqsActivasResult
    ] = await Promise.allSettled([
      // Total counts
      supabase
        .from('dependencias')
        .select('*', { count: 'exact', head: true }),
      
      supabase
        .from('subdependencias')
        .select('*', { count: 'exact', head: true }),
      
      supabase
        .from('tramites')
        .select('*', { count: 'exact', head: true }),
      
      supabase
        .from('opas')
        .select('*', { count: 'exact', head: true }),
      
      supabase
        .from('faqs')
        .select('*', { count: 'exact', head: true }),
      
      // Skip users count for now as it requires auth.users access
      Promise.resolve({ count: 0 }),

      // Active counts
      supabase
        .from('tramites')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true),
      
      // Try 'activa' field first for OPAs (common in Spanish databases)
      supabase
        .from('opas')
        .select('*', { count: 'exact', head: true })
        .eq('activa', true),
      
      supabase
        .from('faqs')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
    ])

    // Helper function to extract count from settled promise
    const getCount = (result: PromiseSettledResult<any>, tableName: string = 'unknown'): number => {
      if (result.status === 'fulfilled') {
        if (result.value.count !== null && result.value.count !== undefined) {
          return result.value.count
        }
        console.warn(`Count is null for table ${tableName}:`, result.value)
        return 0
      }
      console.error(`Failed to get count for table ${tableName}:`, result.reason)
      return 0
    }

    // Build metrics object
    const metrics: SystemMetrics = {
      dependencias: getCount(dependenciasResult, 'dependencias'),
      subdependencias: getCount(subdependenciasResult, 'subdependencias'),
      tramites: getCount(tramitesResult, 'tramites'),
      opas: getCount(opasResult, 'opas'),
      faqs: getCount(faqsResult, 'faqs'),
      usuarios: getCount(usuariosResult, 'usuarios'),
      tramitesActivos: getCount(tramitesActivosResult, 'tramites_activos'),
      opasActivas: getCount(opasActivasResult, 'opas_activas'),
      faqsActivas: getCount(faqsActivasResult, 'faqs_activas'),
      lastUpdated: new Date().toISOString()
    }

    // Fallback for OPAs activas if the field doesn't exist or returns 0
    if (metrics.opasActivas === 0 && metrics.opas > 0) {
      try {
        const { count: opasActivoCount } = await supabase
          .from('opas')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)

        if (opasActivoCount && opasActivoCount > 0) {
          metrics.opasActivas = opasActivoCount
        } else {
          // If no active field works, assume all are active
          metrics.opasActivas = metrics.opas
        }
      } catch (error) {
        console.warn('Failed to get OPAs activas with fallback field:', error)
        // Fallback to total count if active field doesn't exist
        metrics.opasActivas = metrics.opas
      }
    }

    // Log metrics for monitoring (only in development or if there are issues)
    if (process.env.NODE_ENV === 'development' || metrics.usuarios === 0 || metrics.opasActivas === 0) {
      console.log('📊 System metrics generated:', {
        summary: `${metrics.dependencias} deps, ${metrics.tramites} trámites, ${metrics.opas} opas, ${metrics.faqs} faqs`,
        issues: {
          ...(metrics.usuarios === 0 && { usuarios: 'No users count available' }),
          ...(metrics.opasActivas === 0 && metrics.opas > 0 && { opasActivas: 'No active OPAs found' })
        },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching system metrics:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch system metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Optional: Add caching headers for better performance
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      'Content-Type': 'application/json'
    }
  })
}
