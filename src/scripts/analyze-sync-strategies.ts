/**
 * Análisis de Estrategias para Sincronización Completa
 * Evalúa opciones técnicas para sincronizar 830 servicios (722 OPAs + 108 trámites)
 * resolviendo conflictos de códigos duplicados
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface SyncStrategy {
  name: string
  description: string
  pros: string[]
  cons: string[]
  implementation: string
  uiChangesRequired: boolean
  riskLevel: 'low' | 'medium' | 'high'
  recommendationScore: number
}

interface ConflictAnalysis {
  totalConflicts: number
  conflictDetails: Array<{
    codigo: string
    opaName: string
    tramiteName: string
    sameService: boolean
  }>
}

async function analyzeCodeConflicts(): Promise<ConflictAnalysis> {
  console.log('🔍 Analizando conflictos de códigos...')

  const { data: conflicts, error } = await supabase
    .from('opas')
    .select(`
      codigo_opa,
      nombre,
      tramites!inner(codigo_unico, nombre)
    `)
    .eq('tramites.codigo_unico', supabase.raw('opas.codigo_opa'))

  if (error) {
    throw new Error(`Error analizando conflictos: ${error.message}`)
  }

  const conflictDetails = (conflicts || []).map(item => ({
    codigo: item.codigo_opa,
    opaName: item.nombre,
    tramiteName: item.tramites[0]?.nombre || '',
    sameService: item.nombre.toLowerCase().includes(item.tramites[0]?.nombre.toLowerCase() || '') ||
                 item.tramites[0]?.nombre.toLowerCase().includes(item.nombre.toLowerCase() || '')
  }))

  return {
    totalConflicts: conflictDetails.length,
    conflictDetails
  }
}

function defineStrategies(): SyncStrategy[] {
  return [
    {
      name: "Estrategia 1: Prefijos por Tipo",
      description: "Agregar prefijos T- para trámites y O- para OPAs en el campo codigo",
      pros: [
        "Solución simple y clara",
        "Códigos únicos garantizados",
        "Fácil identificación visual del tipo",
        "Preserva código original en campo separado"
      ],
      cons: [
        "Requiere actualizar UI para mostrar códigos con prefijos",
        "Cambio en la estructura de códigos existente",
        "Posible confusión inicial para usuarios"
      ],
      implementation: `
        1. Agregar campo 'codigo_original' a tabla servicios
        2. Actualizar códigos existentes: T-{codigo} para trámites
        3. Insertar OPAs con códigos: O-{codigo_opa}
        4. Actualizar componentes UI para manejar prefijos
      `,
      uiChangesRequired: true,
      riskLevel: 'medium',
      recommendationScore: 8
    },
    {
      name: "Estrategia 2: Código Compuesto",
      description: "Usar formato {tipo_servicio}-{codigo_original} manteniendo separación lógica",
      pros: [
        "Códigos autodescriptivos",
        "Mantiene lógica organizacional",
        "Fácil filtrado por tipo",
        "Escalable para futuros tipos"
      ],
      cons: [
        "Códigos más largos",
        "Requiere actualización de UI",
        "Cambio en lógica de búsqueda"
      ],
      implementation: `
        1. Formato: 'tramite-{codigo}' y 'opa-{codigo_opa}'
        2. Mantener codigo_original para referencia
        3. Actualizar índices de búsqueda
        4. Modificar componentes de visualización
      `,
      uiChangesRequired: true,
      riskLevel: 'medium',
      recommendationScore: 7
    },
    {
      name: "Estrategia 3: Campo Código Único + Original",
      description: "Generar códigos únicos automáticos manteniendo código original separado",
      pros: [
        "Códigos únicos garantizados",
        "Preserva códigos originales intactos",
        "No afecta lógica organizacional existente",
        "Flexible para futuras expansiones"
      ],
      cons: [
        "Requiere lógica adicional para mostrar código apropiado",
        "Dos campos de código pueden confundir",
        "Complejidad en búsquedas"
      ],
      implementation: `
        1. Campo 'codigo' = UUID o secuencial único
        2. Campo 'codigo_original' = código original (puede duplicarse)
        3. Campo 'codigo_display' = código a mostrar en UI
        4. Lógica condicional en componentes
      `,
      uiChangesRequired: true,
      riskLevel: 'high',
      recommendationScore: 5
    },
    {
      name: "Estrategia 4: Sufijos Numéricos",
      description: "Mantener códigos originales y agregar sufijos para duplicados",
      pros: [
        "Mínimo cambio en códigos existentes",
        "Preserva códigos originales mayormente",
        "Fácil de entender",
        "Cambios mínimos en UI"
      ],
      cons: [
        "Sufijos pueden ser confusos",
        "No es autodescriptivo del tipo",
        "Requiere lógica para asignar sufijos",
        "Puede generar códigos largos"
      ],
      implementation: `
        1. Mantener códigos únicos como están
        2. Duplicados: {codigo}-2, {codigo}-3, etc.
        3. Campo tipo_servicio para diferenciación
        4. Mínimos cambios en UI
      `,
      uiChangesRequired: false,
      riskLevel: 'low',
      recommendationScore: 6
    },
    {
      name: "Estrategia 5: Híbrida - Prefijos Solo para Duplicados",
      description: "Mantener códigos únicos sin cambios, prefijos solo para conflictos",
      pros: [
        "Mínimo impacto en códigos existentes",
        "Solo afecta códigos duplicados",
        "Preserva la mayoría de códigos originales",
        "Cambios mínimos en UI"
      ],
      cons: [
        "Lógica compleja para determinar cuándo usar prefijos",
        "Inconsistencia en formato de códigos",
        "Puede confundir a usuarios"
      ],
      implementation: `
        1. Mantener códigos únicos existentes
        2. Solo duplicados: O-{codigo} para OPAs nuevas
        3. Lógica condicional en UI
        4. Campo 'has_prefix' para control
      `,
      uiChangesRequired: true,
      riskLevel: 'medium',
      recommendationScore: 7
    }
  ]
}

async function evaluateStrategies(): Promise<void> {
  console.log('📊 ANÁLISIS DE ESTRATEGIAS PARA SINCRONIZACIÓN COMPLETA')
  console.log('=' .repeat(70))
  console.log('Objetivo: 830 servicios totales (722 OPAs + 108 trámites)\n')

  // Analizar conflictos
  const conflicts = await analyzeCodeConflicts()
  console.log(`🔍 Conflictos identificados: ${conflicts.totalConflicts}`)
  
  // Mostrar algunos ejemplos de conflictos
  console.log('\n📋 Ejemplos de conflictos:')
  conflicts.conflictDetails.slice(0, 5).forEach((conflict, index) => {
    const status = conflict.sameService ? '✅ Mismo servicio' : '⚠️  Servicios diferentes'
    console.log(`${index + 1}. ${conflict.codigo}`)
    console.log(`   OPA: ${conflict.opaName}`)
    console.log(`   Trámite: ${conflict.tramiteName}`)
    console.log(`   ${status}\n`)
  })

  // Evaluar estrategias
  const strategies = defineStrategies()
  
  console.log('🎯 EVALUACIÓN DE ESTRATEGIAS:\n')
  
  strategies
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .forEach((strategy, index) => {
      console.log(`${index + 1}. ${strategy.name}`)
      console.log(`   📝 ${strategy.description}`)
      console.log(`   🎯 Puntuación: ${strategy.recommendationScore}/10`)
      console.log(`   ⚠️  Riesgo: ${strategy.riskLevel.toUpperCase()}`)
      console.log(`   🔧 Cambios UI: ${strategy.uiChangesRequired ? 'SÍ' : 'NO'}`)
      
      console.log('   ✅ Pros:')
      strategy.pros.forEach(pro => console.log(`      • ${pro}`))
      
      console.log('   ❌ Contras:')
      strategy.cons.forEach(con => console.log(`      • ${con}`))
      
      console.log(`   🛠️  Implementación:${strategy.implementation}`)
      console.log('')
    })

  // Recomendación final
  const recommended = strategies.reduce((prev, current) => 
    prev.recommendationScore > current.recommendationScore ? prev : current
  )

  console.log('🏆 ESTRATEGIA RECOMENDADA:')
  console.log(`${recommended.name}`)
  console.log(`Puntuación: ${recommended.recommendationScore}/10`)
  console.log(`Riesgo: ${recommended.riskLevel}`)
  console.log('\n💡 Justificación:')
  console.log('- Balance óptimo entre funcionalidad y simplicidad')
  console.log('- Códigos únicos garantizados')
  console.log('- Preserva información original')
  console.log('- Cambios controlados en UI')
}

// Ejecutar si se llama directamente
if (require.main === module) {
  evaluateStrategies()
    .then(() => {
      console.log('\n✅ Análisis completado')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error en análisis:', error)
      process.exit(1)
    })
}

export { evaluateStrategies, analyzeCodeConflicts, defineStrategies }
