/**
 * Script para sincronizar OPAs faltantes de tabla 'opas' a tabla 'servicios'
 * Migra las 106 OPAs que están en la tabla original pero no en la unificada
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface MissingOPA {
  id: string
  codigo_opa: string
  nombre: string
  descripcion?: string
  subdependencia_id: string
  activo: boolean
  requisitos?: string[]
  tiempo_respuesta?: string
  tiene_pago?: boolean
  formulario?: string
  visualizacion_suit?: string
  visualizacion_gov?: string
  created_at: string
  updated_at?: string
}

interface SyncResult {
  totalMissing: number
  synced: number
  errors: number
  errorDetails: Array<{ codigo: string; error: string }>
}

async function findMissingOPAs(): Promise<MissingOPA[]> {
  console.log('🔍 Identificando OPAs faltantes...')

  const { data: missingOPAs, error } = await supabase
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
      created_at,
      updated_at,
      subdependencias!inner(
        dependencia_id,
        dependencias!inner(id, nombre)
      )
    `)
    .not('codigo_opa', 'in', `(
      SELECT codigo 
      FROM servicios 
      WHERE tipo_servicio = 'opa' 
      AND codigo IS NOT NULL
    )`)

  if (error) {
    throw new Error(`Error consultando OPAs faltantes: ${error.message}`)
  }

  console.log(`   📋 Encontradas ${missingOPAs?.length || 0} OPAs faltantes`)
  return missingOPAs || []
}

async function syncMissingOPAs(dryRun: boolean = true): Promise<SyncResult> {
  console.log('🔄 Sincronizando OPAs faltantes...')
  console.log(`Modo: ${dryRun ? 'SIMULACIÓN' : 'APLICAR CAMBIOS'}\n`)

  const result: SyncResult = {
    totalMissing: 0,
    synced: 0,
    errors: 0,
    errorDetails: []
  }

  try {
    // Encontrar OPAs faltantes
    const missingOPAs = await findMissingOPAs()
    result.totalMissing = missingOPAs.length

    if (missingOPAs.length === 0) {
      console.log('✅ No hay OPAs faltantes para sincronizar')
      return result
    }

    // Mostrar preview de OPAs a sincronizar
    console.log('📝 PREVIEW DE OPAs A SINCRONIZAR:')
    console.log('=' .repeat(80))
    
    missingOPAs.slice(0, 10).forEach((opa, index) => {
      console.log(`${index + 1}. ${opa.codigo_opa} - ${opa.nombre}`)
      console.log(`   Activo: ${opa.activo ? 'Sí' : 'No'}`)
      console.log(`   Subdependencia: ${opa.subdependencia_id}`)
      console.log('')
    })

    if (missingOPAs.length > 10) {
      console.log(`   ... y ${missingOPAs.length - 10} más\n`)
    }

    // Aplicar sincronización si no es dry run
    if (!dryRun) {
      console.log('💾 Aplicando sincronización...')
      
      for (const opa of missingOPAs) {
        try {
          // Obtener dependencia_id de la subdependencia
          const { data: subdep, error: subdepError } = await supabase
            .from('subdependencias')
            .select('dependencia_id')
            .eq('id', opa.subdependencia_id)
            .single()

          if (subdepError || !subdep) {
            result.errors++
            result.errorDetails.push({
              codigo: opa.codigo_opa,
              error: `No se encontró subdependencia: ${subdepError?.message || 'No existe'}`
            })
            continue
          }

          // Insertar en tabla servicios
          const { error: insertError } = await supabase
            .from('servicios')
            .insert({
              nombre: opa.nombre,
              descripcion: opa.descripcion || `Servicio de atención al ciudadano para ${opa.nombre.toLowerCase()}.`,
              dependencia_id: subdep.dependencia_id,
              subdependencia_id: opa.subdependencia_id,
              categoria: 'opa',
              activo: opa.activo,
              codigo: opa.codigo_opa,
              tipo_servicio: 'opa',
              requiere_pago: opa.tiene_pago || false,
              requisitos: opa.requisitos || [],
              tiempo_respuesta: opa.tiempo_respuesta,
              formulario: opa.formulario,
              visualizacion_suit: opa.visualizacion_suit === 'SI',
              visualizacion_gov: opa.visualizacion_gov === 'SI',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            result.errors++
            result.errorDetails.push({
              codigo: opa.codigo_opa,
              error: insertError.message
            })
            console.error(`❌ Error sincronizando ${opa.codigo_opa}:`, insertError.message)
          } else {
            result.synced++
            if (result.synced % 10 === 0) {
              console.log(`   ✅ Sincronizadas ${result.synced}/${result.totalMissing} OPAs...`)
            }
          }
        } catch (err) {
          result.errors++
          const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
          result.errorDetails.push({
            codigo: opa.codigo_opa,
            error: errorMsg
          })
          console.error(`❌ Error sincronizando ${opa.codigo_opa}:`, errorMsg)
        }
      }

      console.log(`\n📊 RESULTADOS DE SINCRONIZACIÓN:`)
      console.log(`✅ Sincronizadas exitosamente: ${result.synced}`)
      console.log(`❌ Errores: ${result.errors}`)
      console.log(`📋 Total procesadas: ${result.totalMissing}`)

      if (result.errorDetails.length > 0) {
        console.log(`\n❌ DETALLES DE ERRORES:`)
        result.errorDetails.forEach((error, index) => {
          console.log(`${index + 1}. ${error.codigo}: ${error.error}`)
        })
      }
    } else {
      console.log('ℹ️  Ejecuta con --apply para aplicar la sincronización')
    }

    return result

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2)
  const applyChanges = args.includes('--apply')
  
  syncMissingOPAs(!applyChanges)
    .then(result => {
      console.log('\n✅ Proceso completado')
      if (result.synced > 0) {
        console.log(`🎉 Se sincronizaron ${result.synced} OPAs`)
      }
      if (result.errors > 0) {
        console.log(`⚠️  Se encontraron ${result.errors} errores`)
        process.exit(1)
      }
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error en el proceso:', error)
      process.exit(1)
    })
}

export { syncMissingOPAs, findMissingOPAs }
