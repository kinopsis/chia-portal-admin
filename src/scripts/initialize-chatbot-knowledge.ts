// Script to initialize chatbot knowledge base with existing content
// Epic 4 - US-011: Configuración Base del Chatbot IA Multi-Canal

import { createClient } from '@supabase/supabase-js'
import { storeKnowledgeContent } from '../services/openai'
import { config } from '../lib/config'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
)

interface ContentItem {
  id: string
  title: string
  content: string
  type: string
  metadata?: Record<string, any>
}

/**
 * Fetch all trámites for knowledge base
 */
async function fetchTramites(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('tramites')
    .select(`
      id,
      nombre,
      formulario,
      requisitos,
      tiempo_estimado,
      costo,
      subdependencias!inner(
        nombre,
        dependencias!inner(nombre)
      )
    `)
    .eq('activo', true)

  if (error) {
    console.error('Error fetching trámites:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    title: `Trámite: ${item.nombre}`,
    content: `
      Nombre: ${item.nombre}
      Descripción: ${item.formulario || 'No disponible'}
      Requisitos: ${Array.isArray(item.requisitos) ? item.requisitos.join(', ') : 'No especificados'}
      Tiempo estimado: ${item.tiempo_estimado || 'No especificado'}
      Costo: ${item.costo ? `$${item.costo.toLocaleString('es-CO')}` : 'Gratuito'}
      Dependencia: ${item.subdependencias?.dependencias?.nombre || 'No especificada'}
      Subdependencia: ${item.subdependencias?.nombre || 'No especificada'}
    `.trim(),
    type: 'tramite',
    metadata: {
      costo: item.costo,
      tiempo_estimado: item.tiempo_estimado,
      dependencia: item.subdependencias?.dependencias?.nombre,
      subdependencia: item.subdependencias?.nombre
    }
  }))
}

/**
 * Fetch all OPAs for knowledge base
 */
async function fetchOPAs(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('opas')
    .select(`
      id,
      nombre,
      descripcion,
      formulario,
      requisitos,
      tiempo_respuesta,
      tiene_pago,
      subdependencias!inner(
        nombre,
        dependencias!inner(nombre)
      )
    `)
    .eq('activo', true)

  if (error) {
    console.error('Error fetching OPAs:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    title: `OPA: ${item.nombre}`,
    content: `
      Nombre: ${item.nombre}
      Descripción: ${item.descripcion || item.formulario || 'No disponible'}
      Requisitos: ${Array.isArray(item.requisitos) ? item.requisitos.join(', ') : 'No especificados'}
      Tiempo de respuesta: ${item.tiempo_respuesta || 'No especificado'}
      Requiere pago: ${item.tiene_pago ? 'Sí' : 'No'}
      Dependencia: ${item.subdependencias?.dependencias?.nombre || 'No especificada'}
      Subdependencia: ${item.subdependencias?.nombre || 'No especificada'}
    `.trim(),
    type: 'opa',
    metadata: {
      tiene_pago: item.tiene_pago,
      tiempo_respuesta: item.tiempo_respuesta,
      dependencia: item.subdependencias?.dependencias?.nombre,
      subdependencia: item.subdependencias?.nombre
    }
  }))
}

/**
 * Fetch all FAQs for knowledge base
 */
async function fetchFAQs(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select(`
      id,
      pregunta,
      respuesta,
      dependencias!inner(nombre)
    `)
    .eq('activo', true)

  if (error) {
    console.error('Error fetching FAQs:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    title: `FAQ: ${item.pregunta}`,
    content: `
      Pregunta: ${item.pregunta}
      Respuesta: ${item.respuesta}
      Dependencia: ${item.dependencias?.nombre || 'General'}
    `.trim(),
    type: 'faq',
    metadata: {
      dependencia: item.dependencias?.nombre
    }
  }))
}

/**
 * Fetch all dependencias for knowledge base
 */
async function fetchDependencias(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('dependencias')
    .select(`
      id,
      nombre,
      descripcion,
      codigo,
      subdependencias(nombre, descripcion)
    `)
    .eq('activo', true)

  if (error) {
    console.error('Error fetching dependencias:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    title: `Dependencia: ${item.nombre}`,
    content: `
      Nombre: ${item.nombre}
      Código: ${item.codigo}
      Descripción: ${item.descripcion || 'No disponible'}
      Subdependencias: ${item.subdependencias?.map(sub => sub.nombre).join(', ') || 'Ninguna'}
    `.trim(),
    type: 'dependencia',
    metadata: {
      codigo: item.codigo,
      subdependencias_count: item.subdependencias?.length || 0
    }
  }))
}

/**
 * Add general municipal information
 */
function getGeneralInformation(): ContentItem[] {
  return [
    {
      id: 'general-contact',
      title: 'Información de Contacto del Municipio',
      content: `
        Municipio de Chía, Cundinamarca
        Teléfono: (601) 123-4567
        Email: info@chia.gov.co
        Dirección: Carrera 11 # 17-25, Chía, Cundinamarca
        Horario de atención: Lunes a Viernes de 8:00 AM a 5:00 PM
        
        Redes sociales:
        - Facebook: @alcaldiachia
        - Twitter: @alcaldiachia
        - Instagram: @alcaldiachia
      `.trim(),
      type: 'general',
      metadata: {
        category: 'contact'
      }
    },
    {
      id: 'general-hours',
      title: 'Horarios de Atención',
      content: `
        Horarios de atención al público:
        - Lunes a Viernes: 8:00 AM a 5:00 PM
        - Sábados, domingos y festivos: Cerrado
        
        Atención virtual disponible 24/7 a través del chatbot
        Para emergencias, contactar línea de emergencias 123
      `.trim(),
      type: 'general',
      metadata: {
        category: 'hours'
      }
    },
    {
      id: 'general-location',
      title: 'Ubicación y Cómo Llegar',
      content: `
        Alcaldía Municipal de Chía
        Dirección: Carrera 11 # 17-25, Chía, Cundinamarca
        
        Cómo llegar:
        - En transporte público: Tomar bus intermunicipal desde Bogotá
        - En vehículo particular: Autopista Norte, salida Chía
        - Estacionamiento disponible en las instalaciones
        
        Puntos de referencia: Centro comercial Centro Chía, Parque Principal
      `.trim(),
      type: 'general',
      metadata: {
        category: 'location'
      }
    }
  ]
}

/**
 * Initialize knowledge base with all content
 */
async function initializeKnowledgeBase(): Promise<void> {
  console.log('🚀 Starting chatbot knowledge base initialization...')
  
  try {
    // Check if OpenAI is configured
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
    }

    // Clear existing knowledge base
    console.log('🧹 Clearing existing knowledge base...')
    const { error: clearError } = await supabase
      .from('chatbot_knowledge')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (clearError) {
      console.error('Error clearing knowledge base:', clearError)
    }

    // Fetch all content
    console.log('📥 Fetching content from database...')
    const [tramites, opas, faqs, dependencias] = await Promise.all([
      fetchTramites(),
      fetchOPAs(),
      fetchFAQs(),
      fetchDependencias()
    ])

    const generalInfo = getGeneralInformation()
    const allContent = [...tramites, ...opas, ...faqs, ...dependencias, ...generalInfo]

    console.log(`📊 Found ${allContent.length} items to process:`)
    console.log(`  - Trámites: ${tramites.length}`)
    console.log(`  - OPAs: ${opas.length}`)
    console.log(`  - FAQs: ${faqs.length}`)
    console.log(`  - Dependencias: ${dependencias.length}`)
    console.log(`  - General info: ${generalInfo.length}`)

    // Process content in batches to avoid rate limits
    const batchSize = 5
    let processed = 0
    let errors = 0

    for (let i = 0; i < allContent.length; i += batchSize) {
      const batch = allContent.slice(i, i + batchSize)
      
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allContent.length / batchSize)}...`)
      
      const batchPromises = batch.map(async (item) => {
        try {
          await storeKnowledgeContent(
            item.type,
            item.type === 'general' ? null : item.id,
            item.title,
            item.content,
            item.metadata || {}
          )
          processed++
          console.log(`  ✅ Processed: ${item.title}`)
        } catch (error) {
          errors++
          console.error(`  ❌ Error processing ${item.title}:`, error)
        }
      })

      await Promise.all(batchPromises)
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < allContent.length) {
        console.log('⏳ Waiting 2 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log('\n🎉 Knowledge base initialization completed!')
    console.log(`✅ Successfully processed: ${processed} items`)
    if (errors > 0) {
      console.log(`❌ Errors encountered: ${errors} items`)
    }
    console.log(`📈 Success rate: ${((processed / allContent.length) * 100).toFixed(1)}%`)

  } catch (error) {
    console.error('💥 Fatal error during initialization:', error)
    process.exit(1)
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeKnowledgeBase()
    .then(() => {
      console.log('✨ Initialization script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Initialization script failed:', error)
      process.exit(1)
    })
}

export { initializeKnowledgeBase }
