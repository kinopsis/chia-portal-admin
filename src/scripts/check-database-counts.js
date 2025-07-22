// Quick script to check database counts
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCounts() {
  console.log('🔍 Checking database counts...\n')

  try {
    // Check dependencias
    const { count: dependenciasCount, error: depError } = await supabase
      .from('dependencias')
      .select('*', { count: 'exact', head: true })

    if (depError) {
      console.error('❌ Error checking dependencias:', depError.message)
    } else {
      console.log(`📊 Dependencias: ${dependenciasCount}`)
    }

    // Check subdependencias
    const { count: subdependenciasCount, error: subError } = await supabase
      .from('subdependencias')
      .select('*', { count: 'exact', head: true })

    if (subError) {
      console.error('❌ Error checking subdependencias:', subError.message)
    } else {
      console.log(`📊 Subdependencias: ${subdependenciasCount}`)
    }

    // Check tramites
    const { count: tramitesCount, error: tramError } = await supabase
      .from('tramites')
      .select('*', { count: 'exact', head: true })

    if (tramError) {
      console.error('❌ Error checking tramites:', tramError.message)
    } else {
      console.log(`📊 Trámites: ${tramitesCount}`)
    }

    // Check active tramites
    const { count: activeTramitesCount, error: activeTramError } = await supabase
      .from('tramites')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    if (activeTramError) {
      console.error('❌ Error checking active tramites:', activeTramError.message)
    } else {
      console.log(`📊 Trámites Activos: ${activeTramitesCount}`)
    }

    // Check opas
    const { count: opasCount, error: opasError } = await supabase
      .from('opas')
      .select('*', { count: 'exact', head: true })

    if (opasError) {
      console.error('❌ Error checking opas:', opasError.message)
    } else {
      console.log(`📊 OPAs: ${opasCount}`)
    }

    // Check active opas
    const { count: activeOpasCount, error: activeOpasError } = await supabase
      .from('opas')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    if (activeOpasError) {
      console.error('❌ Error checking active opas:', activeOpasError.message)
    } else {
      console.log(`📊 OPAs Activas: ${activeOpasCount}`)
    }

    // Check faqs
    const { count: faqsCount, error: faqsError } = await supabase
      .from('faqs')
      .select('*', { count: 'exact', head: true })

    if (faqsError) {
      console.error('❌ Error checking faqs:', faqsError.message)
    } else {
      console.log(`📊 FAQs: ${faqsCount}`)
    }

    console.log('\n✅ Database count check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkCounts()
