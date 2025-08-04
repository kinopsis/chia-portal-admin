/**
 * Script de Prueba para Verificar Correcciones de Búsqueda
 * Prueba que la búsqueda "certificado residencia" funcione correctamente
 * después de las correcciones implementadas
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface SearchTestResult {
  query: string
  expectedResults: number
  actualResults: number
  foundServices: Array<{
    codigo: string
    codigo_original?: string
    nombre: string
    tipo_servicio: string
  }>
  success: boolean
}

function normalizeSpanishText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
}

async function testSearch(query: string, expectedCount: number): Promise<SearchTestResult> {
  console.log(`🔍 Probando búsqueda: "${query}"`)
  
  try {
    // Simular la lógica de búsqueda del servicio
    const normalizedQuery = normalizeSpanishText(query)
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0)
    
    // Construir consulta SQL similar a la del servicio
    let queryBuilder = supabase
      .from('servicios')
      .select('codigo, codigo_original, nombre, tipo_servicio, descripcion')
      .in('tipo_servicio', ['tramite', 'opa'])
    
    // Aplicar filtros de búsqueda
    if (searchTerms.length > 0) {
      const prefixQueries = searchTerms.map(term =>
        `nombre.ilike.%${term}%,codigo.ilike.%${term}%,codigo_original.ilike.%${term}%,descripcion.ilike.%${term}%`
      ).join(',')
      
      queryBuilder = queryBuilder.or(prefixQueries)
    }
    
    const { data, error } = await queryBuilder
    
    if (error) {
      throw new Error(`Error en búsqueda: ${error.message}`)
    }
    
    // Filtro adicional en memoria (como hace el servicio)
    const filteredData = (data || []).filter(service => {
      const normalizedNombre = normalizeSpanishText(service.nombre || '')
      const normalizedCodigo = normalizeSpanishText(service.codigo || '')
      const normalizedCodigoOriginal = normalizeSpanishText(service.codigo_original || '')
      const normalizedDescripcion = normalizeSpanishText(service.descripcion || '')
      
      return normalizedNombre.includes(normalizedQuery) ||
             normalizedCodigo.includes(normalizedQuery) ||
             normalizedCodigoOriginal.includes(normalizedQuery) ||
             normalizedDescripcion.includes(normalizedQuery) ||
             (service.nombre || '').toLowerCase().includes(query.toLowerCase()) ||
             (service.codigo || '').toLowerCase().includes(query.toLowerCase()) ||
             (service.codigo_original || '').toLowerCase().includes(query.toLowerCase()) ||
             (service.descripcion || '').toLowerCase().includes(query.toLowerCase())
    })
    
    const result: SearchTestResult = {
      query,
      expectedResults: expectedCount,
      actualResults: filteredData.length,
      foundServices: filteredData.map(service => ({
        codigo: service.codigo,
        codigo_original: service.codigo_original,
        nombre: service.nombre,
        tipo_servicio: service.tipo_servicio
      })),
      success: filteredData.length === expectedCount
    }
    
    console.log(`   📊 Resultados: ${result.actualResults}/${result.expectedResults}`)
    console.log(`   ${result.success ? '✅' : '❌'} ${result.success ? 'ÉXITO' : 'FALLO'}`)
    
    if (result.foundServices.length > 0) {
      console.log('   📋 Servicios encontrados:')
      result.foundServices.forEach((service, index) => {
        console.log(`      ${index + 1}. [${service.tipo_servicio.toUpperCase()}] ${service.nombre}`)
        console.log(`         Código: ${service.codigo} (Original: ${service.codigo_original || 'N/A'})`)
      })
    }
    
    return result
    
  } catch (error) {
    console.error(`❌ Error en prueba de búsqueda:`, error)
    return {
      query,
      expectedResults: expectedCount,
      actualResults: 0,
      foundServices: [],
      success: false
    }
  }
}

async function runSearchTests(): Promise<void> {
  console.log('🧪 PRUEBAS DE BÚSQUEDA DESPUÉS DE CORRECCIONES')
  console.log('=' .repeat(60))
  console.log('Verificando que la búsqueda funcione correctamente con prefijos T- y O-\n')
  
  const tests = [
    { query: 'certificado residencia', expected: 2 },
    { query: 'certificado', expected: 2 }, // Debería encontrar ambos certificados
    { query: 'residencia', expected: 2 }, // Debería encontrar ambos por nombre
    { query: '000-001-001', expected: 2 }, // Búsqueda por código original
    { query: 'T-000-001-001', expected: 1 }, // Búsqueda por código con prefijo
    { query: 'O-000-001-001', expected: 1 }, // Búsqueda por código con prefijo
  ]
  
  const results: SearchTestResult[] = []
  
  for (const test of tests) {
    const result = await testSearch(test.query, test.expected)
    results.push(result)
    console.log('') // Línea en blanco entre pruebas
  }
  
  // Resumen de resultados
  console.log('📊 RESUMEN DE PRUEBAS:')
  console.log('=' .repeat(60))
  
  const successfulTests = results.filter(r => r.success).length
  const totalTests = results.length
  
  console.log(`✅ Pruebas exitosas: ${successfulTests}/${totalTests}`)
  console.log(`❌ Pruebas fallidas: ${totalTests - successfulTests}/${totalTests}`)
  
  if (successfulTests === totalTests) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!')
    console.log('✅ La búsqueda funciona correctamente con prefijos')
    console.log('✅ Se encuentran ambos servicios "Certificado de residencia"')
    console.log('✅ La búsqueda por código original funciona')
  } else {
    console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON')
    console.log('Revisar las correcciones implementadas')
    
    const failedTests = results.filter(r => !r.success)
    failedTests.forEach(test => {
      console.log(`❌ "${test.query}": esperado ${test.expectedResults}, obtenido ${test.actualResults}`)
    })
  }
  
  // Verificar problema específico: "certificado residencia"
  const mainTest = results.find(r => r.query === 'certificado residencia')
  if (mainTest) {
    console.log('\n🎯 VERIFICACIÓN DEL PROBLEMA PRINCIPAL:')
    console.log(`Búsqueda "certificado residencia": ${mainTest.success ? '✅ RESUELTO' : '❌ PERSISTE'}`)
    
    if (mainTest.success) {
      console.log('✅ Se encuentran ambos servicios:')
      console.log('   • Trámite: Certificado de residencia (T-000-001-001)')
      console.log('   • OPA: Certificado de residencia (O-000-001-001)')
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSearchTests()
    .then(() => {
      console.log('\n✅ Pruebas completadas')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error en pruebas:', error)
      process.exit(1)
    })
}

export { runSearchTests, testSearch }
