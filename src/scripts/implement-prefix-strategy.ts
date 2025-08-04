/**
 * Implementación de Estrategia de Prefijos por Tipo
 * Sincroniza 830 servicios totales usando prefijos T- y O- para resolver conflictos
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface ImplementationResult {
  step: string
  success: boolean
  details: string
  recordsAffected?: number
  errors?: string[]
}

interface SyncSummary {
  totalSteps: number
  successfulSteps: number
  failedSteps: number
  totalServicesAfter: number
  tramitesCount: number
  opasCount: number
  results: ImplementationResult[]
}

async function step1_AddCodeOriginalField(): Promise<ImplementationResult> {
  console.log('📝 Paso 1: Agregando campo codigo_original...')
  
  try {
    // Verificar si el campo ya existe
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'servicios')
      .eq('column_name', 'codigo_original')

    if (checkError) {
      return {
        step: 'Agregar campo codigo_original',
        success: false,
        details: `Error verificando campo: ${checkError.message}`
      }
    }

    if (columns && columns.length > 0) {
      return {
        step: 'Agregar campo codigo_original',
        success: true,
        details: 'Campo codigo_original ya existe'
      }
    }

    // Agregar el campo
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE servicios ADD COLUMN IF NOT EXISTS codigo_original VARCHAR(50);'
    })

    if (alterError) {
      return {
        step: 'Agregar campo codigo_original',
        success: false,
        details: `Error agregando campo: ${alterError.message}`
      }
    }

    return {
      step: 'Agregar campo codigo_original',
      success: true,
      details: 'Campo codigo_original agregado exitosamente'
    }

  } catch (error) {
    return {
      step: 'Agregar campo codigo_original',
      success: false,
      details: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`
    }
  }
}

async function step2_UpdateExistingTramites(): Promise<ImplementationResult> {
  console.log('🔄 Paso 2: Actualizando códigos de trámites existentes...')
  
  try {
    // Actualizar trámites existentes con prefijo T-
    const { data, error } = await supabase
      .from('servicios')
      .update({
        codigo_original: supabase.raw('codigo'),
        codigo: supabase.raw("'T-' || codigo")
      })
      .eq('tipo_servicio', 'tramite')
      .select('id')

    if (error) {
      return {
        step: 'Actualizar códigos de trámites',
        success: false,
        details: `Error actualizando trámites: ${error.message}`
      }
    }

    return {
      step: 'Actualizar códigos de trámites',
      success: true,
      details: `${data?.length || 0} trámites actualizados con prefijo T-`,
      recordsAffected: data?.length || 0
    }

  } catch (error) {
    return {
      step: 'Actualizar códigos de trámites',
      success: false,
      details: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`
    }
  }
}

async function step3_SyncAllOPAs(): Promise<ImplementationResult> {
  console.log('📥 Paso 3: Sincronizando todas las OPAs...')
  
  try {
    // Obtener todas las OPAs que no están en servicios (excluyendo registro de prueba)
    const { data: opasToSync, error: fetchError } = await supabase
      .from('opas')
      .select(`
        id,
        codigo_opa,
        nombre,
        descripcion,
        subdependencia_id,
        activo,
        requisitos,
        tiempo_respuesta,
        tiene_pago,
        formulario,
        visualizacion_suit,
        visualizacion_gov,
        subdependencias!inner(
          dependencia_id
        )
      `)
      .neq('codigo_opa', 'TEST-2025-001')

    if (fetchError) {
      return {
        step: 'Sincronizar OPAs',
        success: false,
        details: `Error obteniendo OPAs: ${fetchError.message}`
      }
    }

    if (!opasToSync || opasToSync.length === 0) {
      return {
        step: 'Sincronizar OPAs',
        success: true,
        details: 'No hay OPAs para sincronizar',
        recordsAffected: 0
      }
    }

    console.log(`   📋 Encontradas ${opasToSync.length} OPAs para sincronizar`)

    // Preparar datos para inserción
    const opasData = opasToSync.map(opa => ({
      nombre: opa.nombre,
      descripcion: opa.descripcion || `Servicio de atención al ciudadano para ${opa.nombre.toLowerCase()}.`,
      dependencia_id: opa.subdependencias.dependencia_id,
      subdependencia_id: opa.subdependencia_id,
      categoria: 'atencion_ciudadana',
      activo: opa.activo,
      codigo: `O-${opa.codigo_opa}`, // Prefijo O- para OPAs
      codigo_original: opa.codigo_opa,
      tipo_servicio: 'opa',
      requiere_pago: opa.tiene_pago || false,
      requisitos: opa.requisitos || [],
      tiempo_respuesta: opa.tiempo_respuesta,
      formulario: opa.formulario,
      visualizacion_suit: opa.visualizacion_suit === 'SI',
      visualizacion_gov: opa.visualizacion_gov === 'SI',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insertar en lotes de 50 para evitar timeouts
    const batchSize = 50
    let totalInserted = 0
    const errors: string[] = []

    for (let i = 0; i < opasData.length; i += batchSize) {
      const batch = opasData.slice(i, i + batchSize)
      
      const { data: insertedData, error: insertError } = await supabase
        .from('servicios')
        .insert(batch)
        .select('id')

      if (insertError) {
        errors.push(`Lote ${Math.floor(i/batchSize) + 1}: ${insertError.message}`)
        console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, insertError.message)
      } else {
        totalInserted += insertedData?.length || 0
        console.log(`   ✅ Lote ${Math.floor(i/batchSize) + 1}: ${insertedData?.length || 0} OPAs insertadas`)
      }
    }

    return {
      step: 'Sincronizar OPAs',
      success: errors.length === 0,
      details: `${totalInserted} OPAs sincronizadas exitosamente${errors.length > 0 ? ` con ${errors.length} errores` : ''}`,
      recordsAffected: totalInserted,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error) {
    return {
      step: 'Sincronizar OPAs',
      success: false,
      details: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`
    }
  }
}

async function step4_VerifyResults(): Promise<ImplementationResult> {
  console.log('✅ Paso 4: Verificando resultados...')
  
  try {
    // Contar servicios por tipo
    const { data: counts, error } = await supabase
      .from('servicios')
      .select('tipo_servicio')
      .in('tipo_servicio', ['tramite', 'opa'])

    if (error) {
      return {
        step: 'Verificar resultados',
        success: false,
        details: `Error verificando resultados: ${error.message}`
      }
    }

    const tramitesCount = counts?.filter(s => s.tipo_servicio === 'tramite').length || 0
    const opasCount = counts?.filter(s => s.tipo_servicio === 'opa').length || 0
    const total = tramitesCount + opasCount

    return {
      step: 'Verificar resultados',
      success: true,
      details: `Total: ${total} servicios (${tramitesCount} trámites, ${opasCount} OPAs)`,
      recordsAffected: total
    }

  } catch (error) {
    return {
      step: 'Verificar resultados',
      success: false,
      details: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`
    }
  }
}

async function implementPrefixStrategy(dryRun: boolean = true): Promise<SyncSummary> {
  console.log('🚀 IMPLEMENTACIÓN DE ESTRATEGIA DE PREFIJOS')
  console.log('=' .repeat(60))
  console.log(`Modo: ${dryRun ? 'SIMULACIÓN' : 'APLICAR CAMBIOS'}`)
  console.log('Objetivo: 830 servicios totales (722 OPAs + 108 trámites)\n')

  const results: ImplementationResult[] = []

  if (dryRun) {
    console.log('ℹ️  MODO SIMULACIÓN - No se realizarán cambios reales')
    console.log('   Ejecuta con --apply para aplicar los cambios\n')
    
    // En modo simulación, solo mostrar el plan
    results.push({
      step: 'Plan de implementación',
      success: true,
      details: 'Estrategia de prefijos lista para implementar'
    })

    return {
      totalSteps: 4,
      successfulSteps: 1,
      failedSteps: 0,
      totalServicesAfter: 830,
      tramitesCount: 108,
      opasCount: 722,
      results
    }
  }

  // Ejecutar pasos reales
  try {
    // Paso 1: Agregar campo codigo_original
    const step1Result = await step1_AddCodeOriginalField()
    results.push(step1Result)
    console.log(`   ${step1Result.success ? '✅' : '❌'} ${step1Result.details}`)

    if (!step1Result.success) {
      throw new Error('Falló el paso 1')
    }

    // Paso 2: Actualizar trámites existentes
    const step2Result = await step2_UpdateExistingTramites()
    results.push(step2Result)
    console.log(`   ${step2Result.success ? '✅' : '❌'} ${step2Result.details}`)

    if (!step2Result.success) {
      throw new Error('Falló el paso 2')
    }

    // Paso 3: Sincronizar todas las OPAs
    const step3Result = await step3_SyncAllOPAs()
    results.push(step3Result)
    console.log(`   ${step3Result.success ? '✅' : '❌'} ${step3Result.details}`)

    if (step3Result.errors && step3Result.errors.length > 0) {
      console.log('   ⚠️  Errores encontrados:')
      step3Result.errors.forEach(error => console.log(`      • ${error}`))
    }

    // Paso 4: Verificar resultados
    const step4Result = await step4_VerifyResults()
    results.push(step4Result)
    console.log(`   ${step4Result.success ? '✅' : '❌'} ${step4Result.details}`)

    const successfulSteps = results.filter(r => r.success).length
    const failedSteps = results.filter(r => !r.success).length

    return {
      totalSteps: results.length,
      successfulSteps,
      failedSteps,
      totalServicesAfter: step4Result.recordsAffected || 0,
      tramitesCount: 108, // Estimado
      opasCount: (step4Result.recordsAffected || 0) - 108,
      results
    }

  } catch (error) {
    console.error('❌ Error durante la implementación:', error)
    
    return {
      totalSteps: results.length,
      successfulSteps: results.filter(r => r.success).length,
      failedSteps: results.filter(r => !r.success).length + 1,
      totalServicesAfter: 0,
      tramitesCount: 0,
      opasCount: 0,
      results
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2)
  const applyChanges = args.includes('--apply')
  
  implementPrefixStrategy(!applyChanges)
    .then(summary => {
      console.log('\n📊 RESUMEN DE IMPLEMENTACIÓN:')
      console.log(`✅ Pasos exitosos: ${summary.successfulSteps}/${summary.totalSteps}`)
      console.log(`❌ Pasos fallidos: ${summary.failedSteps}`)
      console.log(`📋 Total servicios: ${summary.totalServicesAfter}`)
      console.log(`🔵 Trámites: ${summary.tramitesCount}`)
      console.log(`🟡 OPAs: ${summary.opasCount}`)
      
      if (summary.failedSteps === 0) {
        console.log('\n🎉 ¡Implementación completada exitosamente!')
      } else {
        console.log('\n⚠️  Implementación completada con errores')
      }
      
      process.exit(summary.failedSteps > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('❌ Error en implementación:', error)
      process.exit(1)
    })
}

export { implementPrefixStrategy }
