/**
 * Script para corregir descripciones genéricas de OPAs
 * Reemplaza "Servicio OPA" con descripciones más específicas basadas en el nombre
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface OPADescriptionFix {
  id: string
  codigo: string
  nombre: string
  oldDescription: string
  newDescription: string
}

function generateDescriptionFromName(nombre: string): string {
  // Convertir a minúsculas para análisis
  const nombreLower = nombre.toLowerCase()
  
  // Patrones específicos para generar descripciones
  if (nombreLower.includes('turismo') || nombreLower.includes('turistico')) {
    return `Servicio de atención personalizada para consultas y trámites relacionados con ${nombre.toLowerCase()}.`
  }
  
  if (nombreLower.includes('emprendimiento') || nombreLower.includes('emprende')) {
    return `Servicio de apoyo y asesoría para ${nombre.toLowerCase()}, incluyendo orientación y acompañamiento empresarial.`
  }
  
  if (nombreLower.includes('agricola') || nombreLower.includes('ganadero') || nombreLower.includes('pecuario')) {
    return `Servicio de atención y gestión para ${nombre.toLowerCase()}, con asesoría técnica especializada.`
  }
  
  if (nombreLower.includes('certificacion') || nombreLower.includes('certificado')) {
    return `Servicio para la obtención de ${nombre.toLowerCase()}, con revisión de requisitos y documentación.`
  }
  
  if (nombreLower.includes('informacion') || nombreLower.includes('consulta')) {
    return `Servicio de información y orientación sobre ${nombre.toLowerCase()}.`
  }
  
  if (nombreLower.includes('capacitacion') || nombreLower.includes('formacion')) {
    return `Servicio de ${nombre.toLowerCase()} dirigido a ciudadanos y empresarios del municipio.`
  }
  
  if (nombreLower.includes('apoyo economico') || nombreLower.includes('credito')) {
    return `Servicio de orientación y gestión para ${nombre.toLowerCase()}, con acompañamiento en el proceso.`
  }
  
  if (nombreLower.includes('maltrato') || nombreLower.includes('abandono')) {
    return `Servicio para reportar y gestionar casos de ${nombre.toLowerCase()}, con seguimiento del proceso administrativo.`
  }
  
  if (nombreLower.includes('impuesto')) {
    return `Servicio de información y gestión relacionado con ${nombre.toLowerCase()}.`
  }
  
  if (nombreLower.includes('adopcion')) {
    return `Servicio municipal de ${nombre.toLowerCase()}, con proceso de evaluación y seguimiento.`
  }
  
  // Descripción genérica mejorada
  return `Servicio de atención al ciudadano para ${nombre.toLowerCase()}, con orientación especializada y seguimiento del proceso.`
}

async function fixOPADescriptions(dryRun: boolean = true) {
  console.log('🔧 Corrigiendo descripciones genéricas de OPAs...')
  console.log(`Modo: ${dryRun ? 'SIMULACIÓN' : 'APLICAR CAMBIOS'}\n`)

  const fixes: OPADescriptionFix[] = []

  try {
    // Obtener OPAs con descripciones genéricas
    const { data: opasToFix, error } = await supabase
      .from('servicios')
      .select('id, codigo, nombre, descripcion')
      .eq('tipo_servicio', 'opa')
      .eq('descripcion', 'Servicio OPA')

    if (error) {
      throw new Error(`Error consultando OPAs: ${error.message}`)
    }

    console.log(`📋 Encontrados ${opasToFix?.length || 0} registros para corregir\n`)

    if (!opasToFix || opasToFix.length === 0) {
      console.log('✅ No hay descripciones genéricas que corregir')
      return { totalFixed: 0, fixes: [] }
    }

    // Generar nuevas descripciones
    for (const opa of opasToFix) {
      const newDescription = generateDescriptionFromName(opa.nombre)
      
      fixes.push({
        id: opa.id,
        codigo: opa.codigo,
        nombre: opa.nombre,
        oldDescription: opa.descripcion,
        newDescription
      })
    }

    // Mostrar preview de cambios
    console.log('📝 PREVIEW DE CAMBIOS:')
    console.log('=' .repeat(80))
    
    fixes.slice(0, 5).forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.codigo} - ${fix.nombre}`)
      console.log(`   Antes: "${fix.oldDescription}"`)
      console.log(`   Después: "${fix.newDescription}"`)
      console.log('')
    })

    if (fixes.length > 5) {
      console.log(`   ... y ${fixes.length - 5} más\n`)
    }

    // Aplicar cambios si no es dry run
    if (!dryRun) {
      console.log('💾 Aplicando cambios...')
      
      let successCount = 0
      let errorCount = 0

      for (const fix of fixes) {
        try {
          const { error: updateError } = await supabase
            .from('servicios')
            .update({ 
              descripcion: fix.newDescription,
              updated_at: new Date().toISOString()
            })
            .eq('id', fix.id)

          if (updateError) {
            console.error(`❌ Error actualizando ${fix.codigo}:`, updateError.message)
            errorCount++
          } else {
            successCount++
          }
        } catch (err) {
          console.error(`❌ Error actualizando ${fix.codigo}:`, err)
          errorCount++
        }
      }

      console.log(`\n📊 RESULTADOS:`)
      console.log(`✅ Actualizados exitosamente: ${successCount}`)
      console.log(`❌ Errores: ${errorCount}`)
      console.log(`📋 Total procesados: ${fixes.length}`)
    } else {
      console.log('ℹ️  Ejecuta con --apply para aplicar los cambios')
    }

    return {
      totalFixed: dryRun ? 0 : fixes.length,
      fixes
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2)
  const applyChanges = args.includes('--apply')
  
  fixOPADescriptions(!applyChanges)
    .then(result => {
      console.log('\n✅ Proceso completado')
      if (result.totalFixed > 0) {
        console.log(`🎉 Se corrigieron ${result.totalFixed} descripciones`)
      }
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error en el proceso:', error)
      process.exit(1)
    })
}

export { fixOPADescriptions }
