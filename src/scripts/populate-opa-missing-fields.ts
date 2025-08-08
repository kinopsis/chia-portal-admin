/**
 * Script para poblar campos faltantes en OPAs
 * para unificación con trámites
 */

// TEMPORALMENTE DESHABILITADO - IMPORTS COMENTADOS
// import { config } from 'dotenv'
// import { createClient } from '@supabase/supabase-js'

// TEMPORALMENTE DESHABILITADO - FUNCIÓN COMENTADA
/*
function initializeSupabase() {
  config({ path: '.env.local' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('❌ Variables de entorno faltantes')
  }

  return createClient(supabaseUrl, supabaseKey)
}
*/

interface OPAWithDependencia {
  id: string
  codigo_opa: string
  nombre: string
  descripcion?: string
  subdependencia_id: string
  subdependencias?: {
    nombre: string
    dependencias?: {
      nombre: string
    }
  }
}

// Mapeo de dependencias a categorías
const dependenciaToCategoria: { [key: string]: string } = {
  'Secretaría de Gobierno': 'gobierno',
  'Secretaría de Hacienda': 'hacienda',
  'Secretaría de Planeación': 'planeacion',
  'Secretaría de Obras Públicas': 'obras_publicas',
  'Secretaría de Desarrollo Social': 'desarrollo_social',
  'Secretaría de Salud': 'salud',
  'Secretaría de Educación': 'educacion',
  'Secretaría de Medio Ambiente': 'ambiental',
  'Alcaldía': 'alcaldia'
}

// Palabras clave para determinar modalidad
const modalidadKeywords = {
  virtual: ['virtual', 'línea', 'digital', 'web', 'portal', 'sistema'],
  presencial: ['presencial', 'oficina', 'ventanilla', 'sede', 'físico'],
  mixto: ['mixto', 'híbrido', 'ambos', 'opcional']
}

function determineModalidad(nombre: string, descripcion?: string): 'virtual' | 'presencial' | 'mixto' {
  const text = `${nombre} ${descripcion || ''}`.toLowerCase()
  
  const virtualScore = modalidadKeywords.virtual.reduce((score, keyword) => 
    score + (text.includes(keyword) ? 1 : 0), 0)
  
  const presencialScore = modalidadKeywords.presencial.reduce((score, keyword) => 
    score + (text.includes(keyword) ? 1 : 0), 0)
  
  if (virtualScore > presencialScore) return 'virtual'
  if (presencialScore > virtualScore) return 'presencial'
  
  // Por defecto, las OPAs suelen ser presenciales
  return 'presencial'
}

function generateInstructivo(nombre: string, categoria: string): string[] {
  const baseInstructions = [
    'Dirigirse a la dependencia correspondiente',
    'Presentar documento de identidad',
    'Completar el formulario requerido'
  ]

  const categorySpecific: { [key: string]: string[] } = {
    'gobierno': ['Verificar requisitos específicos de gobierno', 'Agendar cita previa si es necesario'],
    'hacienda': ['Verificar estado de cuenta', 'Presentar comprobantes de pago'],
    'salud': ['Presentar carnet de salud', 'Verificar afiliación al sistema de salud'],
    'ambiental': ['Revisar normativa ambiental aplicable', 'Presentar estudios técnicos si aplica'],
    'obras_publicas': ['Verificar planos y especificaciones', 'Cumplir con normativa de construcción']
  }

  return [
    ...baseInstructions,
    ...(categorySpecific[categoria] || ['Seguir procedimientos específicos de la dependencia'])
  ]
}

function generateObservaciones(nombre: string, dependencia: string): string {
  const templates = [
    `Servicio administrativo de ${dependencia.toLowerCase()} para ${nombre.toLowerCase()}.`,
    `Proceso gestionado por ${dependencia} según normativa vigente.`,
    `Servicio disponible en horarios de atención de ${dependencia}.`,
    `Consulte requisitos específicos en ${dependencia} antes de iniciar el trámite.`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)]
}

async function populateOPAMissingFields() {
  // TEMPORALMENTE DESHABILITADO
  return

  console.log('🚀 Iniciando población de campos faltantes en OPAs...\n')

  const supabase = initializeSupabase()

  try {
    // 1. Verificar si los campos ya existen
    console.log('1. Verificando estructura de tabla...')

    const { data: sampleOPA } = await supabase
      .from('opas')
      .select('*')
      .limit(1)
      .single()

    if (!sampleOPA) {
      throw new Error('No se encontraron OPAs para verificar estructura')
    }

    const missingFields = []
    if (!sampleOPA.hasOwnProperty('instructivo')) missingFields.push('instructivo')
    if (!sampleOPA.hasOwnProperty('modalidad')) missingFields.push('modalidad')
    if (!sampleOPA.hasOwnProperty('categoria')) missingFields.push('categoria')
    if (!sampleOPA.hasOwnProperty('observaciones')) missingFields.push('observaciones')

    if (missingFields.length > 0) {
      console.log(`❌ Campos faltantes detectados: ${missingFields.join(', ')}`)
      console.log('⚠️  Nota: Los campos deben agregarse manualmente a la base de datos primero')
      console.log('   Ejecute las siguientes consultas SQL en Supabase:')
      console.log('')
      console.log('   ALTER TABLE opas ADD COLUMN IF NOT EXISTS instructivo TEXT[];')
      console.log('   ALTER TABLE opas ADD COLUMN IF NOT EXISTS modalidad VARCHAR(20) DEFAULT \'presencial\';')
      console.log('   ALTER TABLE opas ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);')
      console.log('   ALTER TABLE opas ADD COLUMN IF NOT EXISTS observaciones TEXT;')
      console.log('')
      console.log('   Después ejecute este script nuevamente.')
      return
    }

    console.log('✅ Todos los campos necesarios están presentes')

    // 2. Obtener todas las OPAs con información de dependencias
    console.log('\n2. Obteniendo OPAs para actualizar...')
    
    const { data: opas, error } = await supabase
      .from('opas')
      .select(`
        id,
        codigo_opa,
        nombre,
        descripcion,
        subdependencia_id,
        instructivo,
        modalidad,
        categoria,
        observaciones,
        subdependencias (
          nombre,
          dependencias (
            nombre
          )
        )
      `)
      .is('instructivo', null)  // Solo actualizar los que no tienen instructivo

    if (error) {
      throw error
    }

    console.log(`📊 Encontradas ${opas?.length || 0} OPAs para actualizar`)

    if (!opas || opas.length === 0) {
      console.log('✅ Todas las OPAs ya tienen los campos poblados')
      return
    }

    // 3. Procesar OPAs en lotes
    console.log('\n3. Procesando OPAs...')
    
    const batchSize = 50
    let processed = 0
    let errors = 0

    for (let i = 0; i < opas.length; i += batchSize) {
      const batch = opas.slice(i, i + batchSize)
      
      console.log(`   Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(opas.length / batchSize)}...`)

      for (const opa of batch) {
        try {
          const dependenciaNombre = opa.subdependencias?.dependencias?.nombre || 'General'
          const categoria = dependenciaToCategoria[dependenciaNombre] || 'general'
          const modalidad = determineModalidad(opa.nombre, opa.descripcion)
          const instructivo = generateInstructivo(opa.nombre, categoria)
          const observaciones = generateObservaciones(opa.nombre, dependenciaNombre)

          const { error: updateError } = await supabase
            .from('opas')
            .update({
              instructivo,
              modalidad,
              categoria,
              observaciones
            })
            .eq('id', opa.id)

          if (updateError) {
            console.error(`   ❌ Error actualizando OPA ${opa.codigo_opa}:`, updateError.message)
            errors++
          } else {
            processed++
          }

        } catch (err) {
          console.error(`   ❌ Error procesando OPA ${opa.codigo_opa}:`, err)
          errors++
        }
      }

      // Pausa pequeña entre lotes
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN:')
    console.log('=' .repeat(40))
    console.log(`✅ OPAs procesadas exitosamente: ${processed}`)
    console.log(`❌ Errores: ${errors}`)
    console.log(`📊 Total: ${processed + errors}`)

    if (errors === 0) {
      console.log('\n🎉 ¡Población de campos completada exitosamente!')
    } else {
      console.log('\n⚠️  Población completada con algunos errores')
    }

  } catch (error) {
    console.error('❌ Error en población de campos:', error)
    throw error
  }
}

// Ejecutar si se llama directamente
// TEMPORALMENTE DESHABILITADO PARA EVITAR EJECUCIÓN AUTOMÁTICA
/*
if (require.main === module && process.argv.includes('--run')) {
  populateOPAMissingFields()
    .then(() => {
      console.log('\n✅ Script completado')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error en script:', error)
      process.exit(1)
    })
}
*/

export { populateOPAMissingFields }
