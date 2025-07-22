// Database verification script
// Tests all database connections and table structures

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface VerificationResult {
  table: string
  exists: boolean
  count: number
  error?: string
}

async function verifyTable(tableName: string): Promise<VerificationResult> {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      return {
        table: tableName,
        exists: false,
        count: 0,
        error: error.message
      }
    }

    return {
      table: tableName,
      exists: true,
      count: count || 0
    }
  } catch (error) {
    return {
      table: tableName,
      exists: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function verifyPQRSFunctionality(): Promise<boolean> {
  try {
    console.log('\n🧪 Testing PQRS functionality...')

    // Test PQRS creation
    const testPQRS = {
      tipo: 'peticion' as const,
      nombre: 'Test User',
      email: 'test@example.com',
      telefono: '3001234567',
      dependencia_id: '', // Will be filled with actual dependencia
      asunto: 'Test PQRS Creation',
      descripcion: 'This is a test PQRS to verify database functionality',
      numero_radicado: `TEST-${Date.now()}`
    }

    // Get a dependencia ID for testing
    const { data: dependencias } = await supabase
      .from('dependencias')
      .select('id')
      .limit(1)

    if (!dependencias || dependencias.length === 0) {
      console.log('⚠️  No dependencias found for PQRS testing')
      return false
    }

    testPQRS.dependencia_id = dependencias[0].id

    // Create test PQRS
    const { data: createdPQRS, error: createError } = await supabase
      .from('pqrs')
      .insert(testPQRS)
      .select()
      .single()

    if (createError) {
      console.log('❌ PQRS creation failed:', createError.message)
      return false
    }

    console.log('✅ PQRS creation successful')

    // Test PQRS retrieval
    const { data: retrievedPQRS, error: retrieveError } = await supabase
      .from('pqrs')
      .select(`
        *,
        dependencias (
          id,
          codigo,
          nombre
        )
      `)
      .eq('id', createdPQRS.id)
      .single()

    if (retrieveError) {
      console.log('❌ PQRS retrieval failed:', retrieveError.message)
      return false
    }

    console.log('✅ PQRS retrieval with relations successful')

    // Test PQRS update
    const { error: updateError } = await supabase
      .from('pqrs')
      .update({ 
        estado: 'en_proceso',
        respuesta: 'Test response'
      })
      .eq('id', createdPQRS.id)

    if (updateError) {
      console.log('❌ PQRS update failed:', updateError.message)
      return false
    }

    console.log('✅ PQRS update successful')

    // Test PQRS search
    const { data: searchResults, error: searchError } = await supabase
      .from('pqrs')
      .select('*')
      .ilike('asunto', '%test%')

    if (searchError) {
      console.log('❌ PQRS search failed:', searchError.message)
      return false
    }

    console.log('✅ PQRS search successful')

    // Clean up test data
    await supabase
      .from('pqrs')
      .delete()
      .eq('id', createdPQRS.id)

    console.log('✅ Test cleanup successful')

    return true
  } catch (error) {
    console.log('❌ PQRS functionality test failed:', error)
    return false
  }
}

async function verifyStatisticsFunction(): Promise<boolean> {
  try {
    console.log('\n📊 Testing statistics function...')

    const { data, error } = await supabase.rpc('get_pqrs_stats')

    if (error) {
      console.log('❌ Statistics function failed:', error.message)
      return false
    }

    console.log('✅ Statistics function successful')
    console.log('📈 Stats result:', JSON.stringify(data, null, 2))

    return true
  } catch (error) {
    console.log('❌ Statistics function test failed:', error)
    return false
  }
}

async function main() {
  console.log('🔍 Starting database verification...\n')

  // Tables to verify
  const tables = [
    'users',
    'dependencias', 
    'subdependencias',
    'tramites',
    'opas',
    'faqs',
    'pqrs' // New table
  ]

  const results: VerificationResult[] = []

  // Verify each table
  for (const table of tables) {
    console.log(`Checking table: ${table}...`)
    const result = await verifyTable(table)
    results.push(result)
    
    if (result.exists) {
      console.log(`✅ ${table}: ${result.count} records`)
    } else {
      console.log(`❌ ${table}: ${result.error}`)
    }
  }

  // Summary
  console.log('\n📋 VERIFICATION SUMMARY')
  console.log('========================')
  
  const existingTables = results.filter(r => r.exists)
  const missingTables = results.filter(r => !r.exists)

  console.log(`✅ Existing tables: ${existingTables.length}/${tables.length}`)
  console.log(`❌ Missing tables: ${missingTables.length}/${tables.length}`)

  if (missingTables.length > 0) {
    console.log('\n❌ Missing tables:')
    missingTables.forEach(table => {
      console.log(`   - ${table.table}: ${table.error}`)
    })
  }

  // Test PQRS functionality if table exists
  const pqrsResult = results.find(r => r.table === 'pqrs')
  if (pqrsResult?.exists) {
    const pqrsFunctional = await verifyPQRSFunctionality()
    const statsFunctional = await verifyStatisticsFunction()
    
    if (pqrsFunctional && statsFunctional) {
      console.log('\n🎉 All PQRS functionality verified successfully!')
    } else {
      console.log('\n⚠️  Some PQRS functionality issues detected')
    }
  }

  // Overall status
  const allTablesExist = missingTables.length === 0
  const pqrsWorking = pqrsResult?.exists || false

  if (allTablesExist && pqrsWorking) {
    console.log('\n🎉 DATABASE VERIFICATION PASSED')
    console.log('All tables exist and PQRS functionality is working correctly.')
    process.exit(0)
  } else {
    console.log('\n❌ DATABASE VERIFICATION FAILED')
    console.log('Some tables are missing or PQRS functionality is not working.')
    process.exit(1)
  }
}

// Run verification
main().catch(error => {
  console.error('💥 Verification script failed:', error)
  process.exit(1)
})
