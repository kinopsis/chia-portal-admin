// Script to check the actual structure of the tramites table
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTramitesStructure() {
  console.log('🔍 Checking tramites table structure and data...\n')

  try {
    // Get a sample tramite to see the actual structure
    const { data: sampleTramites, error } = await supabase
      .from('tramites')
      .select('*')
      .limit(3)

    if (error) {
      console.error('❌ Error fetching tramites:', error.message)
      return
    }

    if (!sampleTramites || sampleTramites.length === 0) {
      console.log('📊 No tramites found in database')
      return
    }

    console.log('📊 Sample tramites data:')
    sampleTramites.forEach((tramite, index) => {
      console.log(`\n--- Tramite ${index + 1} ---`)
      console.log('ID:', tramite.id)
      console.log('Código:', tramite.codigo_unico)
      console.log('Nombre:', tramite.nombre)
      console.log('Visualización SUIT:', tramite.visualizacion_suit)
      console.log('Visualización GOV:', tramite.visualizacion_gov)
      
      // Check for URL fields
      const urlFields = Object.keys(tramite).filter(key => 
        key.toLowerCase().includes('url') || 
        key.toLowerCase().includes('link') ||
        key.toLowerCase().includes('portal')
      )
      
      if (urlFields.length > 0) {
        console.log('URL Fields found:', urlFields)
        urlFields.forEach(field => {
          console.log(`  ${field}:`, tramite[field])
        })
      } else {
        console.log('No URL fields found')
      }
      
      console.log('All fields:', Object.keys(tramite).join(', '))
    })

    // Check the table schema
    console.log('\n🔍 Checking table schema...')
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'tramites')
      .eq('table_schema', 'public')

    if (schemaError) {
      console.error('❌ Error fetching schema:', schemaError.message)
    } else if (schemaData) {
      console.log('\n📋 Tramites table columns:')
      schemaData.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkTramitesStructure()
