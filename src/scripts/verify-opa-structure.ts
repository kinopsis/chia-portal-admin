/**
 * Script para verificar la estructura actual de OPAs
 * y identificar campos faltantes para unificación con trámites
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Cargar variables de entorno
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface OPAStructureAnalysis {
  totalOPAs: number
  fieldsAnalysis: {
    [key: string]: {
      exists: boolean
      nullCount: number
      sampleValues: any[]
    }
  }
  missingFields: string[]
}

async function verifyOPAStructure(): Promise<OPAStructureAnalysis> {
  console.log('🔍 Verificando estructura actual de OPAs...\n')

  try {
    // Obtener muestra de OPAs para análisis
    const { data: opas, error } = await supabase
      .from('opas')
      .select('*')
      .limit(10)

    if (error) {
      throw error
    }

    if (!opas || opas.length === 0) {
      throw new Error('No se encontraron OPAs en la base de datos')
    }

    // Obtener total de OPAs
    const { count: totalOPAs } = await supabase
      .from('opas')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total de OPAs encontradas: ${totalOPAs}`)

    // Campos esperados para unificación con trámites
    const expectedFields = [
      'id',
      'codigo_opa',
      'nombre',
      'descripcion',
      'formulario',
      'tiempo_respuesta',
      'tiene_pago',
      'visualizacion_suit',
      'visualizacion_gov',
      'requisitos',
      'instructivo',      // FALTANTE
      'modalidad',        // FALTANTE
      'categoria',        // FALTANTE
      'observaciones',    // FALTANTE
      'subdependencia_id',
      'activo',
      'created_at',
      'updated_at'
    ]

    // Analizar estructura de campos
    const fieldsAnalysis: { [key: string]: any } = {}
    const missingFields: string[] = []

    for (const field of expectedFields) {
      const fieldExists = opas[0].hasOwnProperty(field)
      
      if (!fieldExists) {
        missingFields.push(field)
        fieldsAnalysis[field] = {
          exists: false,
          nullCount: totalOPAs || 0,
          sampleValues: []
        }
      } else {
        // Contar valores null para este campo
        const { count: nullCount } = await supabase
          .from('opas')
          .select('*', { count: 'exact', head: true })
          .is(field, null)

        // Obtener valores de muestra
        const sampleValues = opas.map(opa => opa[field]).filter(val => val !== null).slice(0, 3)

        fieldsAnalysis[field] = {
          exists: true,
          nullCount: nullCount || 0,
          sampleValues
        }
      }
    }

    const analysis: OPAStructureAnalysis = {
      totalOPAs: totalOPAs || 0,
      fieldsAnalysis,
      missingFields
    }

    // Mostrar resultados
    console.log('\n📋 ANÁLISIS DE CAMPOS:')
    console.log('=' .repeat(50))

    for (const [field, info] of Object.entries(fieldsAnalysis)) {
      const status = info.exists ? '✅' : '❌'
      const nullPercentage = ((info.nullCount / (totalOPAs || 1)) * 100).toFixed(1)
      
      console.log(`${status} ${field}:`)
      console.log(`   - Existe: ${info.exists}`)
      if (info.exists) {
        console.log(`   - Valores null: ${info.nullCount}/${totalOPAs} (${nullPercentage}%)`)
        console.log(`   - Muestra: ${JSON.stringify(info.sampleValues)}`)
      }
      console.log('')
    }

    console.log('\n🚨 CAMPOS FALTANTES PARA UNIFICACIÓN:')
    console.log('=' .repeat(50))
    if (missingFields.length === 0) {
      console.log('✅ Todos los campos necesarios están presentes')
    } else {
      missingFields.forEach(field => {
        console.log(`❌ ${field}`)
      })
    }

    return analysis

  } catch (error) {
    console.error('Error verificando estructura de OPAs:', error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyOPAStructure()
    .then(analysis => {
      console.log('\n✅ Verificación completada')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error en verificación:', error)
      process.exit(1)
    })
}

export { verifyOPAStructure }
