// Script to analyze database schema for tramites and opas tables
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeTableSchema(tableName) {
  console.log(`\n🔍 Analyzing ${tableName} table schema...`)
  
  try {
    // Get table schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (schemaError) {
      console.error(`❌ Error fetching ${tableName} schema:`, schemaError.message)
      return null
    }

    if (!schemaData || schemaData.length === 0) {
      console.log(`⚠️  No schema found for ${tableName} table`)
      return null
    }

    console.log(`\n📋 ${tableName.toUpperCase()} TABLE STRUCTURE:`)
    console.log('=' .repeat(50))
    
    const schema = {}
    schemaData.forEach(col => {
      schema[col.column_name] = {
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default
      }
      
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
      console.log(`  ${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | ${nullable}${defaultVal}`)
    })

    // Get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (!sampleError && sampleData && sampleData.length > 0) {
      console.log(`\n📊 Sample ${tableName} fields:`)
      console.log('Available fields:', Object.keys(sampleData[0]).join(', '))
    }

    return schema
  } catch (error) {
    console.error(`❌ Unexpected error analyzing ${tableName}:`, error)
    return null
  }
}

async function compareSchemas() {
  console.log('🔍 DATABASE SCHEMA ANALYSIS FOR PORTAL DE ATENCIÓN CIUDADANA DE CHÍA')
  console.log('=' .repeat(80))

  // Analyze both tables
  const tramitesSchema = await analyzeTableSchema('tramites')
  const opasSchema = await analyzeTableSchema('opas')

  if (!tramitesSchema || !opasSchema) {
    console.log('❌ Could not analyze both schemas')
    return
  }

  // Compare schemas
  console.log('\n🔄 SCHEMA COMPARISON:')
  console.log('=' .repeat(50))

  const tramitesFields = Object.keys(tramitesSchema)
  const opasFields = Object.keys(opasSchema)

  console.log(`\n📋 TRAMITES fields (${tramitesFields.length}):`)
  tramitesFields.forEach(field => {
    const type = tramitesSchema[field].type
    console.log(`  ✅ ${field} (${type})`)
  })

  console.log(`\n⚡ OPAS fields (${opasFields.length}):`)
  opasFields.forEach(field => {
    const type = opasSchema[field].type
    console.log(`  ✅ ${field} (${type})`)
  })

  // Find missing fields in OPAs
  const missingInOpas = tramitesFields.filter(field => !opasFields.includes(field))
  const missingInTramites = opasFields.filter(field => !tramitesFields.includes(field))

  console.log('\n🔍 MISSING FIELDS ANALYSIS:')
  console.log('=' .repeat(50))

  if (missingInOpas.length > 0) {
    console.log(`\n❌ Fields present in TRAMITES but missing in OPAS (${missingInOpas.length}):`)
    missingInOpas.forEach(field => {
      const fieldInfo = tramitesSchema[field]
      console.log(`  🔸 ${field} (${fieldInfo.type}) - ${fieldInfo.nullable ? 'NULL' : 'NOT NULL'}`)
    })
  }

  if (missingInTramites.length > 0) {
    console.log(`\n❌ Fields present in OPAS but missing in TRAMITES (${missingInTramites.length}):`)
    missingInTramites.forEach(field => {
      const fieldInfo = opasSchema[field]
      console.log(`  🔸 ${field} (${fieldInfo.type}) - ${fieldInfo.nullable ? 'NULL' : 'NOT NULL'}`)
    })
  }

  // Identify key fields for enhancement
  const keyFieldsForOpas = [
    'requisitos',
    'tiempo_respuesta', 
    'tiene_pago',
    'formulario',
    'visualizacion_suit',
    'visualizacion_gov'
  ]

  console.log('\n🎯 RECOMMENDED FIELDS TO ADD TO OPAS:')
  console.log('=' .repeat(50))

  keyFieldsForOpas.forEach(field => {
    if (tramitesFields.includes(field) && !opasFields.includes(field)) {
      const fieldInfo = tramitesSchema[field]
      console.log(`  ⭐ ${field}`)
      console.log(`     Type: ${fieldInfo.type}`)
      console.log(`     Nullable: ${fieldInfo.nullable ? 'YES' : 'NO'}`)
      console.log(`     Purpose: ${getFieldPurpose(field)}`)
      console.log('')
    }
  })
}

function getFieldPurpose(fieldName) {
  const purposes = {
    'requisitos': 'Array of requirements needed to complete the OPA',
    'tiempo_respuesta': 'Processing timeframe for the OPA',
    'tiene_pago': 'Whether payment is required for the OPA',
    'formulario': 'Description or URL of the form needed',
    'visualizacion_suit': 'URL for SUIT government portal integration',
    'visualizacion_gov': 'URL for GOV.CO government portal integration'
  }
  return purposes[fieldName] || 'Field purpose to be defined'
}

// Run the analysis
compareSchemas().catch(console.error)
