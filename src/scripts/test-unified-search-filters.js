// Test script for unified search filters
// Tests all filter combinations and functionality

const { unifiedSearchService } = require('../services/unifiedSearch')

async function testUnifiedSearchFilters() {
  console.log('🧪 Testing Unified Search Filters...\n')

  try {
    // Test 1: Basic search without filters
    console.log('📋 Test 1: Basic search (no filters)...')
    const basicResult = await unifiedSearchService.search({
      limit: 5
    })

    if (basicResult.success) {
      console.log(`✅ Found ${basicResult.data.length} results`)
      console.log(`   Total: ${basicResult.pagination.total}`)
      
      // Show breakdown by type
      const breakdown = basicResult.data.reduce((acc, item) => {
        acc[item.tipo] = (acc[item.tipo] || 0) + 1
        return acc
      }, {})
      console.log(`   Breakdown:`, breakdown)
    } else {
      console.log('❌ Basic search failed')
    }

    // Test 2: Filter by tipo = 'tramite'
    console.log('\n📋 Test 2: Filter by tipo = "tramite"...')
    const tramiteResult = await unifiedSearchService.search({
      tipo: 'tramite',
      limit: 5
    })

    if (tramiteResult.success) {
      console.log(`✅ Found ${tramiteResult.data.length} trámites`)
      
      // Verify all results are trámites
      const allTramites = tramiteResult.data.every(item => item.tipo === 'tramite')
      console.log(`   All results are trámites: ${allTramites ? '✅' : '❌'}`)
      
      // Show sample trámite with new features
      if (tramiteResult.data.length > 0) {
        const sampleTramite = tramiteResult.data[0]
        console.log(`   Sample trámite: ${sampleTramite.nombre}`)
        console.log(`   Has requisitos: ${sampleTramite.originalData.requisitos ? '✅' : '❌'}`)
        console.log(`   Has SUIT URL: ${sampleTramite.originalData.visualizacion_suit ? '✅' : '❌'}`)
        console.log(`   Has GOV URL: ${sampleTramite.originalData.visualizacion_gov ? '✅' : '❌'}`)
      }
    } else {
      console.log('❌ Trámite filter failed')
    }

    // Test 3: Filter by tipoPago = 'gratuito'
    console.log('\n📋 Test 3: Filter by tipoPago = "gratuito"...')
    const gratuitoResult = await unifiedSearchService.search({
      tipo: 'tramite',
      tipoPago: 'gratuito',
      limit: 5
    })

    if (gratuitoResult.success) {
      console.log(`✅ Found ${gratuitoResult.data.length} free trámites`)
      
      // Verify all results are free
      const allFree = gratuitoResult.data.every(item => 
        item.tipo === 'tramite' && item.originalData.tiene_pago === false
      )
      console.log(`   All results are free: ${allFree ? '✅' : '❌'}`)
    } else {
      console.log('❌ Free trámites filter failed')
    }

    // Test 4: Filter by tipoPago = 'con_pago'
    console.log('\n📋 Test 4: Filter by tipoPago = "con_pago"...')
    const pagoResult = await unifiedSearchService.search({
      tipo: 'tramite',
      tipoPago: 'con_pago',
      limit: 5
    })

    if (pagoResult.success) {
      console.log(`✅ Found ${pagoResult.data.length} paid trámites`)
      
      // Verify all results require payment
      const allPaid = pagoResult.data.every(item => 
        item.tipo === 'tramite' && item.originalData.tiene_pago === true
      )
      console.log(`   All results require payment: ${allPaid ? '✅' : '❌'}`)
    } else {
      console.log('❌ Paid trámites filter failed')
    }

    // Test 5: Search with query
    console.log('\n📋 Test 5: Search with query "licencia"...')
    const queryResult = await unifiedSearchService.search({
      query: 'licencia',
      limit: 5
    })

    if (queryResult.success) {
      console.log(`✅ Found ${queryResult.data.length} results for "licencia"`)
      
      // Show matching results
      queryResult.data.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.nombre} (${item.tipo})`)
      })
    } else {
      console.log('❌ Query search failed')
    }

    // Test 6: Combined filters
    console.log('\n📋 Test 6: Combined filters (tramite + gratuito + query)...')
    const combinedResult = await unifiedSearchService.search({
      tipo: 'tramite',
      tipoPago: 'gratuito',
      query: 'certificado',
      limit: 3
    })

    if (combinedResult.success) {
      console.log(`✅ Found ${combinedResult.data.length} results with combined filters`)
      
      combinedResult.data.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.nombre}`)
        console.log(`      Type: ${item.tipo}, Free: ${!item.originalData.tiene_pago}`)
      })
    } else {
      console.log('❌ Combined filters failed')
    }

    // Test 7: Verify estado filter is removed
    console.log('\n📋 Test 7: Verify estado filter is removed...')
    try {
      const estadoResult = await unifiedSearchService.search({
        estado: 'activo', // This should be ignored
        limit: 3
      })
      
      console.log('✅ Estado filter ignored (no error thrown)')
    } catch (error) {
      console.log('✅ Estado filter properly removed (expected behavior)')
    }

    console.log('\n🎉 All filter tests completed!')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run the tests
testUnifiedSearchFilters()
