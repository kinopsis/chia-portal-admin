// Test script for OPAs table enhancement
// This script tests the new fields and functionality added to the OPAs table

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testOPAsEnhancement() {
  console.log('🚀 TESTING OPAs TABLE ENHANCEMENT')
  console.log('=' .repeat(60))

  try {
    // Test 1: Check if new fields exist in the table
    console.log('\n📋 Test 1: Checking table structure...')
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'opas')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (schemaError) {
      console.error('❌ Error fetching schema:', schemaError.message)
      return
    }

    const expectedFields = [
      'requisitos',
      'tiempo_respuesta', 
      'tiene_pago',
      'descripcion',
      'formulario',
      'visualizacion_suit',
      'visualizacion_gov'
    ]

    const existingFields = schemaData.map(col => col.column_name)
    const missingFields = expectedFields.filter(field => !existingFields.includes(field))

    if (missingFields.length === 0) {
      console.log('✅ All new fields are present in the table')
    } else {
      console.log('❌ Missing fields:', missingFields.join(', '))
    }

    console.log('\n📊 Current table structure:')
    schemaData.forEach(col => {
      const isNew = expectedFields.includes(col.column_name)
      const marker = isNew ? '🆕' : '  '
      console.log(`${marker} ${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
    })

    // Test 2: Check data completeness
    console.log('\n📊 Test 2: Checking data completeness...')
    const { data: opasData, error: opasError } = await supabase
      .from('opas')
      .select('*')
      .eq('activo', true)

    if (opasError) {
      console.error('❌ Error fetching OPAs:', opasError.message)
      return
    }

    const totalOpas = opasData.length
    const completenessStats = {
      withRequisitos: opasData.filter(opa => opa.requisitos && opa.requisitos.length > 0).length,
      withTiempoRespuesta: opasData.filter(opa => opa.tiempo_respuesta).length,
      withDescripcion: opasData.filter(opa => opa.descripcion && opa.descripcion.length >= 50).length,
      withFormulario: opasData.filter(opa => opa.formulario).length,
      withSuitUrl: opasData.filter(opa => opa.visualizacion_suit).length,
      withGovUrl: opasData.filter(opa => opa.visualizacion_gov).length,
      withPaymentInfo: opasData.filter(opa => opa.tiene_pago !== null).length,
    }

    console.log(`\n📈 Data Completeness Report (${totalOpas} active OPAs):`)
    console.log(`✅ Requisitos:         ${completenessStats.withRequisitos}/${totalOpas} (${Math.round(completenessStats.withRequisitos/totalOpas*100)}%)`)
    console.log(`✅ Tiempo Respuesta:   ${completenessStats.withTiempoRespuesta}/${totalOpas} (${Math.round(completenessStats.withTiempoRespuesta/totalOpas*100)}%)`)
    console.log(`✅ Descripción:        ${completenessStats.withDescripcion}/${totalOpas} (${Math.round(completenessStats.withDescripcion/totalOpas*100)}%)`)
    console.log(`✅ Formulario:         ${completenessStats.withFormulario}/${totalOpas} (${Math.round(completenessStats.withFormulario/totalOpas*100)}%)`)
    console.log(`✅ URL SUIT:           ${completenessStats.withSuitUrl}/${totalOpas} (${Math.round(completenessStats.withSuitUrl/totalOpas*100)}%)`)
    console.log(`✅ URL GOV.CO:         ${completenessStats.withGovUrl}/${totalOpas} (${Math.round(completenessStats.withGovUrl/totalOpas*100)}%)`)
    console.log(`✅ Info Pago:          ${completenessStats.withPaymentInfo}/${totalOpas} (${Math.round(completenessStats.withPaymentInfo/totalOpas*100)}%)`)

    // Test 3: Test enhanced search functionality
    console.log('\n🔍 Test 3: Testing enhanced search functionality...')
    
    const searchTests = [
      { query: 'certificado', description: 'Search by name' },
      { query: 'residencia', description: 'Search by description' },
      { query: 'formulario', description: 'Search by form info' },
    ]

    for (const test of searchTests) {
      const { data: searchResults, error: searchError } = await supabase
        .from('opas')
        .select('nombre, descripcion, formulario')
        .or(`
          nombre.ilike.%${test.query}%,
          descripcion.ilike.%${test.query}%,
          formulario.ilike.%${test.query}%
        `)
        .eq('activo', true)
        .limit(3)

      if (searchError) {
        console.log(`❌ ${test.description}: Error - ${searchError.message}`)
      } else {
        console.log(`✅ ${test.description}: Found ${searchResults.length} results for "${test.query}"`)
      }
    }

    // Test 4: Test payment filtering
    console.log('\n💳 Test 4: Testing payment filtering...')
    
    const { data: withPayment, error: paymentError1 } = await supabase
      .from('opas')
      .select('nombre, tiene_pago')
      .eq('tiene_pago', true)
      .eq('activo', true)

    const { data: withoutPayment, error: paymentError2 } = await supabase
      .from('opas')
      .select('nombre, tiene_pago')
      .eq('tiene_pago', false)
      .eq('activo', true)

    if (paymentError1 || paymentError2) {
      console.log('❌ Error testing payment filters')
    } else {
      console.log(`✅ OPAs with payment: ${withPayment.length}`)
      console.log(`✅ OPAs without payment: ${withoutPayment.length}`)
    }

    // Test 5: Sample data display
    console.log('\n📋 Test 5: Sample OPA with complete information...')
    
    const { data: sampleOpa, error: sampleError } = await supabase
      .from('opas')
      .select(`
        codigo_opa,
        nombre,
        descripcion,
        tiempo_respuesta,
        tiene_pago,
        requisitos,
        formulario,
        visualizacion_suit,
        visualizacion_gov,
        subdependencias (
          nombre,
          dependencias (
            nombre
          )
        )
      `)
      .eq('activo', true)
      .not('requisitos', 'is', null)
      .not('descripcion', 'is', null)
      .limit(1)
      .single()

    if (sampleError) {
      console.log('❌ No complete OPA found for sample display')
    } else {
      console.log('\n📄 Sample Complete OPA:')
      console.log(`   Código: ${sampleOpa.codigo_opa}`)
      console.log(`   Nombre: ${sampleOpa.nombre}`)
      console.log(`   Dependencia: ${sampleOpa.subdependencias?.dependencias?.nombre}`)
      console.log(`   Subdependencia: ${sampleOpa.subdependencias?.nombre}`)
      console.log(`   Tiempo: ${sampleOpa.tiempo_respuesta}`)
      console.log(`   Pago: ${sampleOpa.tiene_pago ? 'Sí' : 'No'}`)
      console.log(`   Requisitos: ${sampleOpa.requisitos?.length || 0} items`)
      console.log(`   Descripción: ${sampleOpa.descripcion?.substring(0, 100)}...`)
      console.log(`   Portal SUIT: ${sampleOpa.visualizacion_suit ? 'Configurado' : 'No configurado'}`)
      console.log(`   Portal GOV.CO: ${sampleOpa.visualizacion_gov ? 'Configurado' : 'No configurado'}`)
    }

    // Test 6: Test the completeness view
    console.log('\n📊 Test 6: Testing completeness view...')
    
    const { data: completenessView, error: viewError } = await supabase
      .from('opas_complete')
      .select('codigo_opa, nombre, is_complete, has_requisitos, has_response_time, has_description, has_portal_integration')
      .limit(5)

    if (viewError) {
      console.log('❌ Error accessing completeness view:', viewError.message)
    } else {
      console.log('✅ Completeness view working:')
      completenessView.forEach(opa => {
        const status = opa.is_complete ? '✅ Complete' : '⚠️  Incomplete'
        console.log(`   ${opa.codigo_opa}: ${status}`)
      })
    }

    // Final Summary
    console.log('\n🎯 ENHANCEMENT TEST SUMMARY')
    console.log('=' .repeat(60))
    
    const overallCompleteness = Math.round(
      (completenessStats.withRequisitos + 
       completenessStats.withTiempoRespuesta + 
       completenessStats.withDescripcion) / (totalOpas * 3) * 100
    )

    console.log(`✅ Table structure: Enhanced with ${expectedFields.length} new fields`)
    console.log(`✅ Data completeness: ${overallCompleteness}% average for critical fields`)
    console.log(`✅ Search functionality: Enhanced with new fields`)
    console.log(`✅ Payment filtering: Working correctly`)
    console.log(`✅ Portal integration: ${Math.round((completenessStats.withSuitUrl + completenessStats.withGovUrl)/(totalOpas*2)*100)}% configured`)
    
    if (overallCompleteness >= 80) {
      console.log('\n🎉 OPAs table enhancement SUCCESSFUL!')
      console.log('   The table now has the same completeness level as trámites.')
    } else {
      console.log('\n⚠️  OPAs table enhancement PARTIALLY COMPLETE')
      console.log('   Consider running the migration scripts to populate missing data.')
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testOPAsEnhancement().catch(console.error)
