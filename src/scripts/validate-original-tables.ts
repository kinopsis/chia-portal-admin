/**
 * Script de Validación Completa de Tablas Originales
 * Valida integridad de datos en tablas 'opas' y 'tramites' antes de sincronización
 * 
 * Conteos esperados:
 * - OPAs: 722 registros
 * - Trámites: 108 registros
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface ValidationResult {
  table: string
  expectedCount: number
  actualCount: number
  validCodes: number
  nullCodes: number
  emptyCodes: number
  duplicateCodes: number
  invalidRelations: number
  suspiciousRecords: number
  isValid: boolean
  issues: string[]
}

interface ValidationSummary {
  opas: ValidationResult
  tramites: ValidationResult
  overallValid: boolean
  criticalIssues: string[]
  recommendations: string[]
}

async function validateOPAsTable(): Promise<ValidationResult> {
  console.log('🔍 Validando tabla OPAS...')
  
  const result: ValidationResult = {
    table: 'opas',
    expectedCount: 722,
    actualCount: 0,
    validCodes: 0,
    nullCodes: 0,
    emptyCodes: 0,
    duplicateCodes: 0,
    invalidRelations: 0,
    suspiciousRecords: 0,
    isValid: false,
    issues: []
  }

  try {
    // 1. Conteo total
    const { count: totalCount, error: countError } = await supabase
      .from('opas')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      result.issues.push(`Error contando registros: ${countError.message}`)
      return result
    }

    result.actualCount = totalCount || 0
    console.log(`   📊 Total registros: ${result.actualCount} (esperados: ${result.expectedCount})`)

    if (result.actualCount !== result.expectedCount) {
      result.issues.push(`Conteo incorrecto: ${result.actualCount} vs ${result.expectedCount} esperados`)
    }

    // 2. Validar códigos
    const { data: allOPAs, error: dataError } = await supabase
      .from('opas')
      .select('id, codigo_opa, nombre, activo, subdependencia_id')

    if (dataError) {
      result.issues.push(`Error obteniendo datos: ${dataError.message}`)
      return result
    }

    if (!allOPAs) {
      result.issues.push('No se obtuvieron datos de la tabla')
      return result
    }

    // Analizar códigos
    const codesMap = new Map<string, number>()
    
    for (const opa of allOPAs) {
      // Códigos null
      if (opa.codigo_opa === null) {
        result.nullCodes++
        continue
      }

      // Códigos vacíos
      if (opa.codigo_opa === '') {
        result.emptyCodes++
        continue
      }

      // Códigos válidos
      result.validCodes++

      // Detectar duplicados
      const count = codesMap.get(opa.codigo_opa) || 0
      codesMap.set(opa.codigo_opa, count + 1)
      if (count > 0) {
        result.duplicateCodes++
      }

      // Detectar registros sospechosos
      if (opa.nombre.toLowerCase().includes('test') || 
          opa.nombre.toLowerCase().includes('prueba') ||
          opa.nombre.toLowerCase().includes('ejemplo')) {
        result.suspiciousRecords++
      }
    }

    console.log(`   ✅ Códigos válidos: ${result.validCodes}`)
    console.log(`   ❌ Códigos null: ${result.nullCodes}`)
    console.log(`   ❌ Códigos vacíos: ${result.emptyCodes}`)
    console.log(`   ⚠️  Códigos duplicados: ${result.duplicateCodes}`)
    console.log(`   🔍 Registros sospechosos: ${result.suspiciousRecords}`)

    // 3. Validar relaciones con subdependencias
    const { data: invalidRelations, error: relError } = await supabase
      .from('opas')
      .select(`
        id, codigo_opa, nombre,
        subdependencias!left(id, nombre)
      `)
      .is('subdependencias.id', null)

    if (relError) {
      result.issues.push(`Error validando relaciones: ${relError.message}`)
    } else {
      result.invalidRelations = invalidRelations?.length || 0
      console.log(`   🔗 Relaciones inválidas: ${result.invalidRelations}`)
    }

    // Agregar issues específicos
    if (result.nullCodes > 0) {
      result.issues.push(`${result.nullCodes} registros con codigo_opa null`)
    }
    if (result.emptyCodes > 0) {
      result.issues.push(`${result.emptyCodes} registros con codigo_opa vacío`)
    }
    if (result.duplicateCodes > 0) {
      result.issues.push(`${result.duplicateCodes} códigos duplicados`)
    }
    if (result.invalidRelations > 0) {
      result.issues.push(`${result.invalidRelations} relaciones inválidas con subdependencias`)
    }
    if (result.suspiciousRecords > 0) {
      result.issues.push(`${result.suspiciousRecords} registros sospechosos (test/prueba)`)
    }

    // Determinar si es válido
    result.isValid = result.actualCount === result.expectedCount &&
                     result.nullCodes === 0 &&
                     result.emptyCodes === 0 &&
                     result.duplicateCodes === 0 &&
                     result.invalidRelations === 0

    return result

  } catch (error) {
    result.issues.push(`Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`)
    return result
  }
}

async function validateTramitesTable(): Promise<ValidationResult> {
  console.log('\n🔍 Validando tabla TRAMITES...')
  
  const result: ValidationResult = {
    table: 'tramites',
    expectedCount: 108,
    actualCount: 0,
    validCodes: 0,
    nullCodes: 0,
    emptyCodes: 0,
    duplicateCodes: 0,
    invalidRelations: 0,
    suspiciousRecords: 0,
    isValid: false,
    issues: []
  }

  try {
    // 1. Conteo total
    const { count: totalCount, error: countError } = await supabase
      .from('tramites')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      result.issues.push(`Error contando registros: ${countError.message}`)
      return result
    }

    result.actualCount = totalCount || 0
    console.log(`   📊 Total registros: ${result.actualCount} (esperados: ${result.expectedCount})`)

    if (result.actualCount !== result.expectedCount) {
      result.issues.push(`Conteo incorrecto: ${result.actualCount} vs ${result.expectedCount} esperados`)
    }

    // 2. Validar códigos (necesito verificar qué campo usan los trámites)
    const { data: allTramites, error: dataError } = await supabase
      .from('tramites')
      .select('id, codigo, nombre, activo, subdependencia_id')

    if (dataError) {
      result.issues.push(`Error obteniendo datos: ${dataError.message}`)
      return result
    }

    if (!allTramites) {
      result.issues.push('No se obtuvieron datos de la tabla')
      return result
    }

    // Analizar códigos
    const codesMap = new Map<string, number>()
    
    for (const tramite of allTramites) {
      // Códigos null
      if (tramite.codigo === null) {
        result.nullCodes++
        continue
      }

      // Códigos vacíos
      if (tramite.codigo === '') {
        result.emptyCodes++
        continue
      }

      // Códigos válidos
      result.validCodes++

      // Detectar duplicados
      const count = codesMap.get(tramite.codigo) || 0
      codesMap.set(tramite.codigo, count + 1)
      if (count > 0) {
        result.duplicateCodes++
      }

      // Detectar registros sospechosos
      if (tramite.nombre.toLowerCase().includes('test') || 
          tramite.nombre.toLowerCase().includes('prueba') ||
          tramite.nombre.toLowerCase().includes('ejemplo')) {
        result.suspiciousRecords++
      }
    }

    console.log(`   ✅ Códigos válidos: ${result.validCodes}`)
    console.log(`   ❌ Códigos null: ${result.nullCodes}`)
    console.log(`   ❌ Códigos vacíos: ${result.emptyCodes}`)
    console.log(`   ⚠️  Códigos duplicados: ${result.duplicateCodes}`)
    console.log(`   🔍 Registros sospechosos: ${result.suspiciousRecords}`)

    // 3. Validar relaciones con subdependencias
    const { data: invalidRelations, error: relError } = await supabase
      .from('tramites')
      .select(`
        id, codigo, nombre,
        subdependencias!left(id, nombre)
      `)
      .is('subdependencias.id', null)

    if (relError) {
      result.issues.push(`Error validando relaciones: ${relError.message}`)
    } else {
      result.invalidRelations = invalidRelations?.length || 0
      console.log(`   🔗 Relaciones inválidas: ${result.invalidRelations}`)
    }

    // Agregar issues específicos
    if (result.nullCodes > 0) {
      result.issues.push(`${result.nullCodes} registros con codigo null`)
    }
    if (result.emptyCodes > 0) {
      result.issues.push(`${result.emptyCodes} registros con codigo vacío`)
    }
    if (result.duplicateCodes > 0) {
      result.issues.push(`${result.duplicateCodes} códigos duplicados`)
    }
    if (result.invalidRelations > 0) {
      result.issues.push(`${result.invalidRelations} relaciones inválidas con subdependencias`)
    }
    if (result.suspiciousRecords > 0) {
      result.issues.push(`${result.suspiciousRecords} registros sospechosos (test/prueba)`)
    }

    // Determinar si es válido
    result.isValid = result.actualCount === result.expectedCount &&
                     result.nullCodes === 0 &&
                     result.emptyCodes === 0 &&
                     result.duplicateCodes === 0 &&
                     result.invalidRelations === 0

    return result

  } catch (error) {
    result.issues.push(`Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`)
    return result
  }
}

async function validateOriginalTables(): Promise<ValidationSummary> {
  console.log('🔍 VALIDACIÓN COMPLETA DE TABLAS ORIGINALES')
  console.log('=' .repeat(60))
  console.log('Conteos esperados: OPAs=722, Trámites=108\n')

  const [opasResult, tramitesResult] = await Promise.all([
    validateOPAsTable(),
    validateTramitesTable()
  ])

  const summary: ValidationSummary = {
    opas: opasResult,
    tramites: tramitesResult,
    overallValid: opasResult.isValid && tramitesResult.isValid,
    criticalIssues: [],
    recommendations: []
  }

  // Identificar issues críticos
  if (opasResult.actualCount !== opasResult.expectedCount) {
    summary.criticalIssues.push(`OPAs: Conteo incorrecto (${opasResult.actualCount} vs ${opasResult.expectedCount})`)
  }
  if (tramitesResult.actualCount !== tramitesResult.expectedCount) {
    summary.criticalIssues.push(`Trámites: Conteo incorrecto (${tramitesResult.actualCount} vs ${tramitesResult.expectedCount})`)
  }
  if (opasResult.nullCodes > 0 || opasResult.emptyCodes > 0) {
    summary.criticalIssues.push(`OPAs: ${opasResult.nullCodes + opasResult.emptyCodes} códigos inválidos`)
  }
  if (tramitesResult.nullCodes > 0 || tramitesResult.emptyCodes > 0) {
    summary.criticalIssues.push(`Trámites: ${tramitesResult.nullCodes + tramitesResult.emptyCodes} códigos inválidos`)
  }

  // Generar recomendaciones
  if (summary.overallValid) {
    summary.recommendations.push('✅ Todas las validaciones pasaron - SEGURO proceder con sincronización')
  } else {
    summary.recommendations.push('❌ NO proceder con sincronización hasta resolver issues críticos')
    if (opasResult.duplicateCodes > 0) {
      summary.recommendations.push('Resolver códigos duplicados en tabla OPAs')
    }
    if (tramitesResult.duplicateCodes > 0) {
      summary.recommendations.push('Resolver códigos duplicados en tabla Trámites')
    }
    if (opasResult.invalidRelations > 0 || tramitesResult.invalidRelations > 0) {
      summary.recommendations.push('Corregir relaciones inválidas con subdependencias')
    }
  }

  // Mostrar resumen
  console.log('\n📊 RESUMEN DE VALIDACIÓN')
  console.log('=' .repeat(60))
  console.log(`🔵 OPAs: ${opasResult.isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`)
  console.log(`🔵 Trámites: ${tramitesResult.isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`)
  console.log(`🎯 Estado General: ${summary.overallValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`)

  if (summary.criticalIssues.length > 0) {
    console.log('\n🚨 ISSUES CRÍTICOS:')
    summary.criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`)
    })
  }

  console.log('\n💡 RECOMENDACIONES:')
  summary.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`)
  })

  return summary
}

// Ejecutar si se llama directamente
if (require.main === module) {
  validateOriginalTables()
    .then(summary => {
      console.log('\n✅ Validación completada')
      process.exit(summary.overallValid ? 0 : 1)
    })
    .catch(error => {
      console.error('❌ Error en validación:', error)
      process.exit(1)
    })
}

export { validateOriginalTables }
