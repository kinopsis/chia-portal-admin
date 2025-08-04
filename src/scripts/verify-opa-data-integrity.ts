/**
 * Script para verificar la integridad de datos de OPAs
 * ACTUALIZADO: Verifica tanto tabla 'opas' original como tabla 'servicios' unificada
 * Identifica discrepancias entre las 722 OPAs esperadas vs las mostradas en UI
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface OPADataIssue {
  id: string
  codigo: string | null
  nombre: string
  descripcion: string
  issue: string
  severity: 'low' | 'medium' | 'high'
}

async function verifyOPADataIntegrity() {
  console.log('🔍 Verificando integridad de datos de OPAs...\n')
  console.log('📊 VERIFICACIÓN COMPLETA: Tabla original vs Tabla unificada\n')

  const issues: OPADataIssue[] = []

  try {
    // 0. Verificar conteos en ambas tablas
    console.log('0. Verificando conteos en ambas tablas...')

    const [opasOriginal, opasUnificada] = await Promise.all([
      supabase.from('opas').select('*', { count: 'exact', head: true }),
      supabase.from('servicios').select('*', { count: 'exact', head: true }).eq('tipo_servicio', 'opa')
    ])

    const totalOriginal = opasOriginal.count || 0
    const totalUnificada = opasUnificada.count || 0
    const diferencia = totalOriginal - totalUnificada

    console.log(`   📋 Tabla 'opas' original: ${totalOriginal} registros`)
    console.log(`   📋 Tabla 'servicios' unificada: ${totalUnificada} registros`)
    console.log(`   ⚠️  Diferencia: ${diferencia} OPAs faltantes en tabla unificada`)

    if (diferencia > 0) {
      issues.push({
        id: 'migration-incomplete',
        codigo: null,
        nombre: `${diferencia} OPAs faltantes en migración`,
        descripcion: 'Migración incompleta de tabla opas a servicios',
        issue: `${diferencia} OPAs no migradas a tabla unificada`,
        severity: 'high'
      })
    }

    // 1. Verificar códigos null en tabla original
    console.log('\n1. Verificando códigos en tabla original (opas)...')
    const { data: nullCodesOriginal, error: nullErrorOriginal } = await supabase
      .from('opas')
      .select('id, codigo_opa, nombre, descripcion')
      .or('codigo_opa.is.null,codigo_opa.eq.')

    if (nullErrorOriginal) {
      console.error('Error consultando códigos null en tabla original:', nullErrorOriginal)
    } else {
      console.log(`   Encontrados ${nullCodesOriginal?.length || 0} registros con codigo_opa null/vacío`)
      nullCodesOriginal?.forEach(item => {
        issues.push({
          id: item.id,
          codigo: item.codigo_opa,
          nombre: item.nombre,
          descripcion: item.descripcion,
          issue: 'codigo_opa null o vacío en tabla original',
          severity: 'high'
        })
      })
    }

    // 2. Verificar códigos null en tabla unificada
    console.log('\n2. Verificando códigos en tabla unificada (servicios)...')
    const { data: nullCodesUnificada, error: nullErrorUnificada } = await supabase
      .from('servicios')
      .select('id, codigo, nombre, descripcion')
      .eq('tipo_servicio', 'opa')
      .or('codigo.is.null,codigo.eq.')

    if (nullErrorUnificada) {
      console.error('Error consultando códigos null en tabla unificada:', nullErrorUnificada)
    } else {
      console.log(`   Encontrados ${nullCodesUnificada?.length || 0} registros con codigo null/vacío`)
      nullCodesUnificada?.forEach(item => {
        issues.push({
          id: item.id,
          codigo: item.codigo,
          nombre: item.nombre,
          descripcion: item.descripcion,
          issue: 'codigo null o vacío en tabla unificada',
          severity: 'high'
        })
      })
    }

    // 2. Verificar descripciones genéricas
    console.log('\n2. Verificando descripciones genéricas...')
    const { data: genericDesc, error: descError } = await supabase
      .from('servicios')
      .select('id, codigo, nombre, descripcion')
      .eq('tipo_servicio', 'opa')
      .or('descripcion.eq.Servicio OPA,descripcion.like.%test%,descripcion.like.%prueba%')

    if (descError) {
      console.error('Error consultando descripciones genéricas:', descError)
    } else {
      console.log(`   Encontrados ${genericDesc?.length || 0} registros con descripción genérica`)
      genericDesc?.forEach(item => {
        issues.push({
          id: item.id,
          codigo: item.codigo,
          nombre: item.nombre,
          descripcion: item.descripcion,
          issue: 'Descripción genérica o de prueba',
          severity: 'medium'
        })
      })
    }

    // 3. Verificar nombres sospechosos
    console.log('\n3. Verificando nombres sospechosos...')
    const { data: suspiciousNames, error: nameError } = await supabase
      .from('servicios')
      .select('id, codigo, nombre, descripcion')
      .eq('tipo_servicio', 'opa')
      .or('nombre.like.%test%,nombre.like.%prueba%,nombre.like.%ejemplo%')

    if (nameError) {
      console.error('Error consultando nombres sospechosos:', nameError)
    } else {
      console.log(`   Encontrados ${suspiciousNames?.length || 0} registros con nombres sospechosos`)
      suspiciousNames?.forEach(item => {
        issues.push({
          id: item.id,
          codigo: item.codigo,
          nombre: item.nombre,
          descripcion: item.descripcion,
          issue: 'Nombre sospechoso (test/prueba/ejemplo)',
          severity: 'high'
        })
      })
    }

    // 4. Verificar dependencias faltantes
    console.log('\n4. Verificando dependencias faltantes...')
    const { data: missingDeps, error: depError } = await supabase
      .from('servicios')
      .select(`
        id, codigo, nombre, descripcion,
        dependencia:dependencias(id, nombre),
        subdependencia:subdependencias(id, nombre)
      `)
      .eq('tipo_servicio', 'opa')
      .or('dependencia_id.is.null,subdependencia_id.is.null')

    if (depError) {
      console.error('Error consultando dependencias faltantes:', depError)
    } else {
      console.log(`   Encontrados ${missingDeps?.length || 0} registros con dependencias faltantes`)
      missingDeps?.forEach(item => {
        if (!item.dependencia) {
          issues.push({
            id: item.id,
            codigo: item.codigo,
            nombre: item.nombre,
            descripcion: item.descripcion,
            issue: 'Dependencia faltante',
            severity: 'medium'
          })
        }
        if (!item.subdependencia) {
          issues.push({
            id: item.id,
            codigo: item.codigo,
            nombre: item.nombre,
            descripcion: item.descripcion,
            issue: 'Subdependencia faltante',
            severity: 'low'
          })
        }
      })
    }

    // 5. Estadísticas generales
    console.log('\n5. Estadísticas generales...')
    const { data: stats, error: statsError } = await supabase
      .from('servicios')
      .select('activo')
      .eq('tipo_servicio', 'opa')

    if (statsError) {
      console.error('Error consultando estadísticas:', statsError)
    } else {
      const total = stats?.length || 0
      const activos = stats?.filter(s => s.activo).length || 0
      const inactivos = total - activos
      
      console.log(`   Total OPAs: ${total}`)
      console.log(`   Activos: ${activos}`)
      console.log(`   Inactivos: ${inactivos}`)
    }

    // Resumen de problemas
    console.log('\n📊 RESUMEN DE PROBLEMAS ENCONTRADOS:')
    console.log('=' .repeat(50))
    
    const highSeverity = issues.filter(i => i.severity === 'high')
    const mediumSeverity = issues.filter(i => i.severity === 'medium')
    const lowSeverity = issues.filter(i => i.severity === 'low')

    console.log(`🔴 Problemas críticos: ${highSeverity.length}`)
    console.log(`🟡 Problemas moderados: ${mediumSeverity.length}`)
    console.log(`🟢 Problemas menores: ${lowSeverity.length}`)
    console.log(`📋 Total de problemas: ${issues.length}`)

    // Mostrar problemas críticos
    if (highSeverity.length > 0) {
      console.log('\n🔴 PROBLEMAS CRÍTICOS:')
      highSeverity.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.issue}`)
        console.log(`   ID: ${issue.id}`)
        console.log(`   Código: ${issue.codigo || 'NULL'}`)
        console.log(`   Nombre: ${issue.nombre}`)
        console.log(`   Descripción: ${issue.descripcion}`)
        console.log('')
      })
    }

    // Mostrar algunos problemas moderados
    if (mediumSeverity.length > 0) {
      console.log('\n🟡 PROBLEMAS MODERADOS (primeros 5):')
      mediumSeverity.slice(0, 5).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.issue}`)
        console.log(`   Código: ${issue.codigo}`)
        console.log(`   Nombre: ${issue.nombre}`)
        console.log('')
      })
      if (mediumSeverity.length > 5) {
        console.log(`   ... y ${mediumSeverity.length - 5} más`)
      }
    }

    return {
      totalIssues: issues.length,
      highSeverity: highSeverity.length,
      mediumSeverity: mediumSeverity.length,
      lowSeverity: lowSeverity.length,
      issues
    }

  } catch (error) {
    console.error('Error durante la verificación:', error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyOPADataIntegrity()
    .then(result => {
      console.log('\n✅ Verificación completada')
      process.exit(result.highSeverity > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('❌ Error en la verificación:', error)
      process.exit(1)
    })
}

export { verifyOPADataIntegrity }
