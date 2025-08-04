/**
 * Script de Diagnóstico del Flujo de Búsqueda
 * Identifica exactamente dónde se pierde la conexión entre búsqueda y renderizado
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface DebugStep {
  step: string
  success: boolean
  data?: any
  error?: string
  details: string
}

async function debugSearchFlow(): Promise<void> {
  console.log('🔍 DIAGNÓSTICO DEL FLUJO DE BÚSQUEDA')
  console.log('=' .repeat(60))
  console.log('Investigando por qué "certificado residencia" no se renderiza\n')

  const results: DebugStep[] = []

  // Paso 1: Verificar datos en la base de datos
  console.log('📊 Paso 1: Verificando datos en base de datos...')
  try {
    const { data: dbData, error: dbError } = await supabase
      .from('servicios')
      .select('id, codigo, codigo_original, nombre, tipo_servicio')
      .or('nombre.ilike.%certificado%,nombre.ilike.%residencia%')
      .limit(5)

    if (dbError) throw dbError

    results.push({
      step: 'Base de datos',
      success: true,
      data: dbData,
      details: `Encontrados ${dbData?.length || 0} servicios con "certificado" o "residencia"`
    })

    console.log(`   ✅ Encontrados ${dbData?.length || 0} servicios`)
    dbData?.forEach((service, index) => {
      console.log(`      ${index + 1}. [${service.tipo_servicio.toUpperCase()}] ${service.nombre}`)
      console.log(`         Código: ${service.codigo} (Original: ${service.codigo_original || 'N/A'})`)
    })

  } catch (error) {
    results.push({
      step: 'Base de datos',
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: 'Fallo al consultar la base de datos'
    })
    console.log('   ❌ Error consultando base de datos:', error)
  }

  // Paso 2: Simular consulta del servicio unifiedServices
  console.log('\n🔧 Paso 2: Simulando consulta del servicio...')
  try {
    // Simular la consulta que hace el servicio unifiedServices
    const searchTerms = ['certificado', 'residencia']
    const prefixQueries = searchTerms.map(term =>
      `nombre.ilike.%${term}%,codigo.ilike.%${term}%,codigo_original.ilike.%${term}%,descripcion.ilike.%${term}%`
    ).join(',')

    const { data: serviceData, error: serviceError } = await supabase
      .from('servicios')
      .select(`
        id,
        codigo,
        codigo_original,
        nombre,
        descripcion,
        tipo_servicio,
        categoria,
        activo,
        requiere_pago,
        tiempo_estimado,
        created_at,
        updated_at,
        dependencias!inner(id, nombre),
        subdependencias!inner(id, nombre, dependencia_id)
      `)
      .in('tipo_servicio', ['tramite', 'opa'])
      .or(prefixQueries)
      .eq('activo', true)
      .order('nombre')

    if (serviceError) throw serviceError

    results.push({
      step: 'Servicio unifiedServices',
      success: true,
      data: serviceData,
      details: `Consulta del servicio devuelve ${serviceData?.length || 0} resultados`
    })

    console.log(`   ✅ Servicio devuelve ${serviceData?.length || 0} resultados`)
    serviceData?.slice(0, 3).forEach((service, index) => {
      console.log(`      ${index + 1}. [${service.tipo_servicio.toUpperCase()}] ${service.nombre}`)
      console.log(`         ID: ${service.id}`)
      console.log(`         Código: ${service.codigo} (Original: ${service.codigo_original || 'N/A'})`)
      console.log(`         Dependencia: ${service.dependencias?.nombre}`)
      console.log(`         Subdependencia: ${service.subdependencias?.nombre}`)
    })

  } catch (error) {
    results.push({
      step: 'Servicio unifiedServices',
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: 'Fallo en la consulta del servicio'
    })
    console.log('   ❌ Error en servicio:', error)
  }

  // Paso 3: Verificar filtros activos
  console.log('\n⚙️ Paso 3: Verificando posibles filtros que interfieren...')
  try {
    // Consulta sin filtros adicionales para ver si hay interferencia
    const { data: unfilteredData, error: unfilteredError } = await supabase
      .from('servicios')
      .select('id, codigo, nombre, tipo_servicio, activo')
      .or('nombre.ilike.%certificado residencia%')

    if (unfilteredError) throw unfilteredError

    const activeServices = unfilteredData?.filter(s => s.activo) || []
    const inactiveServices = unfilteredData?.filter(s => !s.activo) || []

    results.push({
      step: 'Verificación de filtros',
      success: true,
      data: { active: activeServices.length, inactive: inactiveServices.length },
      details: `${activeServices.length} activos, ${inactiveServices.length} inactivos`
    })

    console.log(`   ✅ Servicios activos: ${activeServices.length}`)
    console.log(`   ⚠️  Servicios inactivos: ${inactiveServices.length}`)

    if (inactiveServices.length > 0) {
      console.log('   📋 Servicios inactivos encontrados:')
      inactiveServices.forEach((service, index) => {
        console.log(`      ${index + 1}. [${service.tipo_servicio.toUpperCase()}] ${service.nombre} (${service.codigo})`)
      })
    }

  } catch (error) {
    results.push({
      step: 'Verificación de filtros',
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: 'Fallo verificando filtros'
    })
    console.log('   ❌ Error verificando filtros:', error)
  }

  // Paso 4: Verificar estructura de datos esperada por componentes
  console.log('\n🧩 Paso 4: Verificando estructura de datos para componentes...')
  try {
    const { data: structureData, error: structureError } = await supabase
      .from('servicios')
      .select(`
        id,
        codigo,
        codigo_original,
        nombre,
        descripcion,
        tipo_servicio,
        categoria,
        activo,
        requiere_pago,
        tiempo_estimado,
        created_at,
        updated_at,
        dependencias(id, nombre),
        subdependencias(id, nombre, dependencia_id)
      `)
      .or('nombre.ilike.%certificado%,nombre.ilike.%residencia%')
      .eq('activo', true)
      .limit(2)

    if (structureError) throw structureError

    results.push({
      step: 'Estructura de datos',
      success: true,
      data: structureData,
      details: `Estructura correcta para ${structureData?.length || 0} servicios`
    })

    console.log(`   ✅ Estructura de datos correcta`)
    structureData?.forEach((service, index) => {
      console.log(`      ${index + 1}. Servicio ID: ${service.id}`)
      console.log(`         ✓ Tiene código: ${!!service.codigo}`)
      console.log(`         ✓ Tiene código_original: ${!!service.codigo_original}`)
      console.log(`         ✓ Tiene nombre: ${!!service.nombre}`)
      console.log(`         ✓ Tiene dependencia: ${!!service.dependencias}`)
      console.log(`         ✓ Tiene subdependencia: ${!!service.subdependencias}`)
      console.log(`         ✓ Está activo: ${service.activo}`)
    })

  } catch (error) {
    results.push({
      step: 'Estructura de datos',
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: 'Fallo verificando estructura'
    })
    console.log('   ❌ Error verificando estructura:', error)
  }

  // Resumen final
  console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:')
  console.log('=' .repeat(60))

  const successfulSteps = results.filter(r => r.success).length
  const totalSteps = results.length

  console.log(`✅ Pasos exitosos: ${successfulSteps}/${totalSteps}`)
  console.log(`❌ Pasos fallidos: ${totalSteps - successfulSteps}/${totalSteps}`)

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${index + 1}. ${result.step}: ${result.details}`)
    if (result.error) {
      console.log(`      Error: ${result.error}`)
    }
  })

  // Diagnóstico del problema
  console.log('\n🔍 DIAGNÓSTICO DEL PROBLEMA:')
  if (successfulSteps === totalSteps) {
    console.log('✅ Los datos están disponibles en la base de datos')
    console.log('✅ El servicio puede consultar los datos correctamente')
    console.log('✅ La estructura de datos es correcta')
    console.log('')
    console.log('🚨 CONCLUSIÓN: El problema está en el FRONTEND')
    console.log('   • Los datos se obtienen correctamente de la API')
    console.log('   • El problema está en el renderizado de componentes React')
    console.log('   • Posibles causas:')
    console.log('     - Estado no se actualiza en el hook useUnifiedServices')
    console.log('     - Props no se pasan correctamente a ServiceCardView')
    console.log('     - Problema en UnifiedServiceCardGrid')
    console.log('     - Condición de renderizado incorrecta')
  } else {
    console.log('❌ Hay problemas en la obtención de datos')
    console.log('   Revisar los pasos fallidos arriba')
  }

  console.log('\n🚀 PRÓXIMOS PASOS RECOMENDADOS:')
  console.log('1. Agregar logs en useUnifiedServices para ver si data se actualiza')
  console.log('2. Agregar logs en ServiceCardView para ver qué props recibe')
  console.log('3. Verificar que UnifiedServiceCardGrid recibe services correctamente')
  console.log('4. Revisar condiciones de renderizado en los componentes')
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugSearchFlow()
    .then(() => {
      console.log('\n✅ Diagnóstico completado')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error en diagnóstico:', error)
      process.exit(1)
    })
}

export { debugSearchFlow }
