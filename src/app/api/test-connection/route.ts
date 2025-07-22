// API route to test Supabase connection

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test basic connection by querying system information
    const { data: connectionTest, error: connectionError } = await supabase
      .from('dependencias')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('Connection error:', connectionError)
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          details: connectionError.message,
        },
        { status: 500 }
      )
    }

    // Test queries to main tables
    const tests = await Promise.allSettled([
      // Test dependencias table
      supabase.from('dependencias').select('id, codigo, nombre, activo').limit(5),

      // Test subdependencias table
      supabase.from('subdependencias').select('id, codigo, nombre, activo').limit(5),

      // Test tramites table
      supabase.from('tramites').select('id, codigo_unico, nombre, activo').limit(5),

      // Test opas table
      supabase.from('opas').select('id, codigo_opa, nombre, activo').limit(5),

      // Test faqs table
      supabase.from('faqs').select('id, pregunta, activo').limit(5),

      // Test users table
      supabase.from('users').select('id, email, rol, activo').limit(5),
    ])

    const results = {
      dependencias: tests[0].status === 'fulfilled' ? tests[0].value : { error: tests[0].reason },
      subdependencias:
        tests[1].status === 'fulfilled' ? tests[1].value : { error: tests[1].reason },
      tramites: tests[2].status === 'fulfilled' ? tests[2].value : { error: tests[2].reason },
      opas: tests[3].status === 'fulfilled' ? tests[3].value : { error: tests[3].reason },
      faqs: tests[4].status === 'fulfilled' ? tests[4].value : { error: tests[4].reason },
      users: tests[5].status === 'fulfilled' ? tests[5].value : { error: tests[5].reason },
    }

    // Count successful connections
    const successfulConnections = tests.filter((test) => test.status === 'fulfilled').length
    const totalTests = tests.length

    return NextResponse.json({
      success: true,
      message: `Database connection successful. ${successfulConnections}/${totalTests} table queries succeeded.`,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        totalTables: totalTests,
        successfulQueries: successfulConnections,
        failedQueries: totalTests - successfulConnections,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
