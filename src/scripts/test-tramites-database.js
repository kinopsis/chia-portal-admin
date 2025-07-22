// Test script to verify tramites database integration
// Tests that requisitos and government portal URLs are properly fetched

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTramitesDatabase() {
  console.log('🧪 Testing tramites database integration...\n')

  try {
    // Test 1: Fetch tramites with new fields
    console.log('📋 Test 1: Fetching tramites with requisitos and portal URLs...')
    const { data: tramites, error } = await supabase
      .from('tramites')
      .select(`
        id,
        codigo_unico,
        nombre,
        requisitos,
        visualizacion_suit,
        visualizacion_gov,
        activo,
        subdependencias (
          nombre,
          dependencias (
            nombre
          )
        )
      `)
      .eq('activo', true)
      .limit(5)

    if (error) {
      console.error('❌ Error fetching tramites:', error.message)
      return
    }

    if (!tramites || tramites.length === 0) {
      console.log('⚠️  No active tramites found')
      return
    }

    console.log(`✅ Found ${tramites.length} active tramites\n`)

    // Test 2: Analyze requisitos data
    console.log('📋 Test 2: Analyzing requisitos data...')
    let tramitesWithRequisitos = 0
    let totalRequisitos = 0

    tramites.forEach((tramite, index) => {
      console.log(`\n--- Tramite ${index + 1}: ${tramite.nombre} ---`)
      console.log(`Código: ${tramite.codigo_unico}`)
      
      if (tramite.requisitos && tramite.requisitos.length > 0) {
        tramitesWithRequisitos++
        totalRequisitos += tramite.requisitos.length
        console.log(`✅ Requisitos (${tramite.requisitos.length}):`)
        tramite.requisitos.forEach((req, i) => {
          console.log(`   ${i + 1}. ${req}`)
        })
      } else {
        console.log('❌ No requisitos found')
      }

      // Test government portal URLs
      if (tramite.visualizacion_suit) {
        console.log(`🏛️  SUIT URL: ${tramite.visualizacion_suit}`)
      } else {
        console.log('❌ No SUIT URL')
      }

      if (tramite.visualizacion_gov) {
        console.log(`🌐 GOV.CO URL: ${tramite.visualizacion_gov}`)
      } else {
        console.log('❌ No GOV.CO URL')
      }
    })

    // Test 3: Statistics
    console.log('\n📊 Test 3: Database Statistics...')
    console.log(`Total tramites tested: ${tramites.length}`)
    console.log(`Tramites with requisitos: ${tramitesWithRequisitos}`)
    console.log(`Average requisitos per tramite: ${totalRequisitos / tramites.length}`)
    
    const tramitesWithSuit = tramites.filter(t => t.visualizacion_suit).length
    const tramitesWithGov = tramites.filter(t => t.visualizacion_gov).length
    
    console.log(`Tramites with SUIT URLs: ${tramitesWithSuit}`)
    console.log(`Tramites with GOV.CO URLs: ${tramitesWithGov}`)

    // Test 4: Unified Search Service Integration
    console.log('\n🔍 Test 4: Testing Unified Search Service...')
    
    // Import and test the unified search service
    const { unifiedSearchService } = require('../services/unifiedSearch')
    
    const searchResult = await unifiedSearchService.search({
      tipo: 'tramite',
      limit: 3
    })

    if (searchResult.success && searchResult.data.length > 0) {
      console.log(`✅ Unified search returned ${searchResult.data.length} results`)
      
      searchResult.data.forEach((result, index) => {
        console.log(`\n--- Search Result ${index + 1} ---`)
        console.log(`Name: ${result.nombre}`)
        console.log(`Code: ${result.codigo}`)
        
        const originalData = result.originalData
        if (originalData.requisitos && originalData.requisitos.length > 0) {
          console.log(`✅ Has ${originalData.requisitos.length} requisitos`)
        } else {
          console.log('❌ No requisitos in search result')
        }

        if (originalData.visualizacion_suit) {
          console.log(`✅ Has SUIT URL: ${originalData.visualizacion_suit}`)
        }

        if (originalData.visualizacion_gov) {
          console.log(`✅ Has GOV.CO URL: ${originalData.visualizacion_gov}`)
        }
      })
    } else {
      console.log('❌ Unified search failed or returned no results')
    }

    console.log('\n🎉 Database integration test completed!')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run the test
testTramitesDatabase()
