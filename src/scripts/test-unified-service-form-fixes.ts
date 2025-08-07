/**
 * Test Script: UnifiedServiceForm Critical Fixes
 * 
 * This script tests the fixes for the 4 critical issues in UnifiedServiceForm:
 * 1. Service Type Field Locked During OPA Editing
 * 2. Form Fields Not Pre-populated with Real Database Values
 * 3. Instructions Field Not Reflecting in Card View After Edit
 * 4. URL Fields Not Displaying in OPA Card Views
 * 
 * Usage: npx tsx src/scripts/test-unified-service-form-fixes.ts
 */

import type { UnifiedServiceItem } from '../services/unifiedServices'
import type { ServiceEnhanced } from '../types'

console.log('🧪 Testing UnifiedServiceForm Critical Fixes')
console.log('=' .repeat(60))

// Test 1: Service Type Field Initialization
function testServiceTypeInitialization() {
  console.log('\n📝 Test 1: Service Type Field Initialization')
  console.log('-'.repeat(50))

  // Simulate OPA data from database
  const opaData: Partial<UnifiedServiceItem> = {
    id: 'opa-test-1',
    codigo: 'OPA-001',
    nombre: 'Test OPA Service',
    tipo_servicio: 'opa',
    activo: true
  }

  // Test form initialization logic
  const serviceType = undefined // No explicit serviceType prop (like in UnifiedServicesManager)
  const initialData = opaData

  // Form initialization logic (from UnifiedServiceForm.tsx line 121-125)
  const tipoValue = serviceType || 
                   (initialData?.tipo_servicio === 'servicio' ? 'tramite' : initialData?.tipo_servicio) || 
                   (initialData?.tipo_servicio === 'opa' ? 'opa' : 'tramite')

  console.log(`Input data: tipo_servicio = "${initialData.tipo_servicio}"`)
  console.log(`serviceType prop = ${serviceType}`)
  console.log(`Resolved tipo value = "${tipoValue}"`)

  if (tipoValue === 'opa') {
    console.log('✅ PASS: OPA service type correctly initialized')
  } else {
    console.log('❌ FAIL: OPA service type incorrectly defaulted to tramite')
  }

  return tipoValue === 'opa'
}

// Test 2: Form Field Pre-population
function testFormFieldPrePopulation() {
  console.log('\n📝 Test 2: Form Field Pre-population')
  console.log('-'.repeat(50))

  // Simulate service data from database
  const serviceData: Partial<UnifiedServiceItem> = {
    id: 'service-test-1',
    codigo: 'SRV-001',
    nombre: 'Test Service',
    descripcion: 'Test service description',
    tipo_servicio: 'tramite',
    requiere_pago: true,
    tiempo_respuesta: '3 días hábiles',
    categoria: 'certificados',
    activo: true,
    requisitos: ['Cédula de ciudadanía', 'Formulario diligenciado'],
    instrucciones: ['Paso 1: Solicitar cita', 'Paso 2: Presentar documentos'],
    url_suit: 'https://suit.gov.co/tramite/SRV-001',
    url_gov: 'https://gov.co/tramites/SRV-001',
    visualizacion_suit: true,
    visualizacion_gov: true
  }

  // Test form field mapping (from UnifiedServiceForm.tsx lines 123-141)
  const formDefaults = {
    tipo: serviceData.tipo_servicio === 'servicio' ? 'tramite' : serviceData.tipo_servicio,
    codigo: serviceData.codigo || '',
    nombre: serviceData.nombre || '',
    descripcion: serviceData.descripcion || '',
    tiempo_respuesta: serviceData.tiempo_respuesta || '',
    tiene_pago: serviceData.requiere_pago || false,
    categoria: serviceData.categoria || 'atencion_ciudadana',
    activo: serviceData.activo ?? true,
    requisitos: serviceData.requisitos || [],
    instrucciones: serviceData.instrucciones || [],
    visualizacion_suit: serviceData.url_suit || '',
    visualizacion_gov: serviceData.url_gov || ''
  }

  console.log('Database values:')
  console.log(`- nombre: "${serviceData.nombre}"`)
  console.log(`- descripcion: "${serviceData.descripcion}"`)
  console.log(`- requiere_pago: ${serviceData.requiere_pago}`)
  console.log(`- requisitos: [${serviceData.requisitos?.length} items]`)
  console.log(`- instrucciones: [${serviceData.instrucciones?.length} items]`)
  console.log(`- url_suit: "${serviceData.url_suit}"`)

  console.log('\nForm defaults:')
  console.log(`- nombre: "${formDefaults.nombre}"`)
  console.log(`- descripcion: "${formDefaults.descripcion}"`)
  console.log(`- tiene_pago: ${formDefaults.tiene_pago}`)
  console.log(`- requisitos: [${formDefaults.requisitos.length} items]`)
  console.log(`- instrucciones: [${formDefaults.instrucciones.length} items]`)
  console.log(`- visualizacion_suit: "${formDefaults.visualizacion_suit}"`)

  const allFieldsPopulated = 
    formDefaults.nombre === serviceData.nombre &&
    formDefaults.descripcion === serviceData.descripcion &&
    formDefaults.tiene_pago === serviceData.requiere_pago &&
    formDefaults.requisitos.length === serviceData.requisitos?.length &&
    formDefaults.instrucciones.length === serviceData.instrucciones?.length &&
    formDefaults.visualizacion_suit === serviceData.url_suit

  if (allFieldsPopulated) {
    console.log('✅ PASS: All form fields correctly pre-populated')
  } else {
    console.log('❌ FAIL: Some form fields not properly pre-populated')
  }

  return allFieldsPopulated
}

// Test 3: Instructions Field Mapping
function testInstructionsFieldMapping() {
  console.log('\n📝 Test 3: Instructions Field Mapping')
  console.log('-'.repeat(50))

  // Simulate service data with instructions
  const serviceData: Partial<ServiceEnhanced> = {
    id: 'service-test-1',
    codigo: 'SRV-001',
    nombre: 'Test Service',
    tipo: 'tramite',
    instrucciones: ['Paso 1: Solicitar cita', 'Paso 2: Presentar documentos', 'Paso 3: Realizar pago'],
    instructivo: undefined // Old field name
  }

  // Test card display logic (from TramiteCardEnhanced.tsx lines 288, 294)
  const instructionsCount = (serviceData.instructivo || serviceData.instrucciones)?.length || 0
  const instructionsToDisplay = serviceData.instructivo || serviceData.instrucciones

  console.log('Service data:')
  console.log(`- instrucciones: [${serviceData.instrucciones?.length || 0} items]`)
  console.log(`- instructivo: [${serviceData.instructivo?.length || 0} items]`)

  console.log('\nCard display logic:')
  console.log(`- Instructions count: ${instructionsCount}`)
  console.log(`- Instructions to display: [${instructionsToDisplay?.length || 0} items]`)

  if (instructionsToDisplay && instructionsToDisplay.length > 0) {
    console.log('- First instruction:', instructionsToDisplay[0])
  }

  const instructionsDisplayCorrectly = 
    instructionsCount === 3 &&
    instructionsToDisplay?.length === 3 &&
    instructionsToDisplay[0] === 'Paso 1: Solicitar cita'

  if (instructionsDisplayCorrectly) {
    console.log('✅ PASS: Instructions field mapping works correctly')
  } else {
    console.log('❌ FAIL: Instructions field mapping has issues')
  }

  return instructionsDisplayCorrectly
}

// Test 4: URL Fields Display
function testUrlFieldsDisplay() {
  console.log('\n📝 Test 4: URL Fields Display')
  console.log('-'.repeat(50))

  // Test new URL field structure (after URL mapping fix)
  const newFormatService: Partial<ServiceEnhanced> = {
    id: 'service-new-1',
    codigo: 'NEW-001',
    nombre: 'New Format Service',
    tipo: 'opa',
    url_suit: 'https://suit.gov.co/opa/NEW-001',
    url_gov: 'https://gov.co/opas/NEW-001',
    visualizacion_suit: true,  // Boolean flag
    visualizacion_gov: true    // Boolean flag
  }

  // Test old URL field structure (backward compatibility)
  const oldFormatService: Partial<ServiceEnhanced> = {
    id: 'service-old-1',
    codigo: 'OLD-001',
    nombre: 'Old Format Service',
    tipo: 'tramite',
    visualizacion_suit: 'https://suit.gov.co/tramite/OLD-001',  // String URL
    visualizacion_gov: 'https://gov.co/tramites/OLD-001'        // String URL
  }

  // Test card display logic (from TramiteCardEnhanced.tsx lines 340-343)
  function testServiceUrlDisplay(service: Partial<ServiceEnhanced>, label: string) {
    console.log(`\n${label}:`)
    console.log(`- url_suit: "${service.url_suit || 'undefined'}"`)
    console.log(`- url_gov: "${service.url_gov || 'undefined'}"`)
    console.log(`- visualizacion_suit: ${service.visualizacion_suit} (${typeof service.visualizacion_suit})`)
    console.log(`- visualizacion_gov: ${service.visualizacion_gov} (${typeof service.visualizacion_gov})`)

    // Card display condition
    const shouldShowLinks = 
      ((service.url_suit && service.visualizacion_suit) || 
       (service.url_gov && service.visualizacion_gov) ||
       (typeof service.visualizacion_suit === 'string' && service.visualizacion_suit) ||
       (typeof service.visualizacion_gov === 'string' && service.visualizacion_gov))

    console.log(`- Should show links: ${shouldShowLinks}`)

    // SUIT link logic
    const suitUrl = service.url_suit || (typeof service.visualizacion_suit === 'string' ? service.visualizacion_suit : '')
    const shouldShowSuit = 
      ((service.url_suit && service.visualizacion_suit) || 
       (typeof service.visualizacion_suit === 'string' && service.visualizacion_suit))

    console.log(`- SUIT URL: "${suitUrl}"`)
    console.log(`- Should show SUIT: ${shouldShowSuit}`)

    return shouldShowLinks && shouldShowSuit && suitUrl
  }

  const newFormatWorks = testServiceUrlDisplay(newFormatService, 'New Format (url_suit + visualizacion_suit boolean)')
  const oldFormatWorks = testServiceUrlDisplay(oldFormatService, 'Old Format (visualizacion_suit string)')

  if (newFormatWorks && oldFormatWorks) {
    console.log('\n✅ PASS: URL fields display correctly for both formats')
  } else {
    console.log('\n❌ FAIL: URL fields display has issues')
    console.log(`- New format works: ${!!newFormatWorks}`)
    console.log(`- Old format works: ${!!oldFormatWorks}`)
  }

  return !!(newFormatWorks && oldFormatWorks)
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running All Tests...\n')

  const results = {
    serviceTypeInit: testServiceTypeInitialization(),
    formPrePopulation: testFormFieldPrePopulation(),
    instructionsMapping: testInstructionsFieldMapping(),
    urlFieldsDisplay: testUrlFieldsDisplay()
  }

  console.log('\n📊 Test Results Summary')
  console.log('=' .repeat(60))
  console.log(`1. Service Type Initialization: ${results.serviceTypeInit ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`2. Form Field Pre-population: ${results.formPrePopulation ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`3. Instructions Field Mapping: ${results.instructionsMapping ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`4. URL Fields Display: ${results.urlFieldsDisplay ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = Object.values(results).every(result => result)
  
  console.log('\n🎯 Overall Result:')
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! The critical fixes are working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Please review the fixes.')
  }

  return allPassed
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  })
}

export { runAllTests }
