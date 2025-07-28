// Script to populate content embeddings for AI chatbot
// Epic 4 - US-011: Configuración Base del Chatbot IA Multi-Canal
// This script generates embeddings for existing content (tramites, opas, faqs)

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local FIRST
config({ path: resolve(process.cwd(), '.env.local') })

// Verify critical environment variables are loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment variables')
  console.error('Make sure .env.local exists and contains OPENAI_API_KEY')
  process.exit(1)
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase configuration missing')
  console.error('Make sure .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Local functions for embedding generation (avoiding import issues)
async function generateEmbedding(text: string): Promise<{ embedding: number[], tokens: number }> {
  try {
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input: text.replace(/\n/g, ' ').trim(),
      encoding_format: 'float'
    })

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage.total_tokens
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

async function updateContentEmbeddings(
  contentId: string,
  contentType: string,
  title: string,
  content: string
): Promise<boolean> {
  try {
    // Generate embedding for the content
    const embeddingResult = await generateEmbedding(`${title} ${content}`)

    // Store or update embedding in database
    const { error } = await supabase
      .from('content_embeddings')
      .upsert({
        content_id: contentId,
        content_type: contentType,
        title,
        content,
        embedding: embeddingResult.embedding,
        tokens: embeddingResult.tokens,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing content embedding:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating content embeddings:', error)
    return false
  }
}

interface TramiteData {
  id: string
  codigo_unico: string
  nombre: string
  formulario?: string
  tiempo_respuesta?: string
  requisitos?: string[]
  subdependencias: {
    nombre: string
    dependencias: {
      nombre: string
    }
  }
}

interface OpaData {
  id: string
  codigo_opa: string
  nombre: string
  descripcion?: string
  formulario?: string
  tiempo_respuesta?: string
  requisitos?: string[]
  subdependencias: {
    nombre: string
    dependencias: {
      nombre: string
    }
  }
}

interface FaqData {
  id: string
  pregunta: string
  respuesta: string
  tema?: string
  palabras_clave?: string[]
  subdependencias: {
    nombre: string
    dependencias: {
      nombre: string
    }
  }
}

async function populateTramiteEmbeddings() {
  console.log('🔄 Populating trámite embeddings...')
  
  const { data: tramites, error } = await supabase
    .from('tramites')
    .select(`
      id,
      codigo_unico,
      nombre,
      formulario,
      tiempo_respuesta,
      requisitos,
      subdependencias (
        nombre,
        dependencias (
          nombre
        )
      )
    `)
    .eq('activo', true)

  if (error) {
    console.error('Error fetching trámites:', error)
    return
  }

  let processed = 0
  let errors = 0

  for (const tramite of tramites as TramiteData[]) {
    try {
      const title = `Trámite: ${tramite.nombre}`
      const content = `
Código: ${tramite.codigo_unico}
Nombre: ${tramite.nombre}
Dependencia: ${tramite.subdependencias?.dependencias?.nombre || 'N/A'}
Subdependencia: ${tramite.subdependencias?.nombre || 'N/A'}
${tramite.formulario ? `Formulario: ${tramite.formulario}` : ''}
${tramite.tiempo_respuesta ? `Tiempo de respuesta: ${tramite.tiempo_respuesta}` : ''}
${tramite.requisitos && tramite.requisitos.length > 0 ? `Requisitos: ${tramite.requisitos.join(', ')}` : ''}
      `.trim()

      const success = await updateContentEmbeddings(
        tramite.id,
        'tramite',
        title,
        content
      )

      if (success) {
        processed++
        console.log(`✅ Processed trámite: ${tramite.nombre}`)
      } else {
        errors++
        console.error(`❌ Failed to process trámite: ${tramite.nombre}`)
      }
    } catch (error) {
      errors++
      console.error(`❌ Error processing trámite ${tramite.nombre}:`, error)
    }
  }

  console.log(`📊 Trámites processed: ${processed}, errors: ${errors}`)
}

async function populateOpaEmbeddings() {
  console.log('🔄 Populating OPA embeddings...')
  
  const { data: opas, error } = await supabase
    .from('opas')
    .select(`
      id,
      codigo_opa,
      nombre,
      descripcion,
      formulario,
      tiempo_respuesta,
      requisitos,
      subdependencias (
        nombre,
        dependencias (
          nombre
        )
      )
    `)
    .eq('activo', true)

  if (error) {
    console.error('Error fetching OPAs:', error)
    return
  }

  let processed = 0
  let errors = 0

  for (const opa of opas as OpaData[]) {
    try {
      const title = `OPA: ${opa.nombre}`
      const content = `
Código: ${opa.codigo_opa}
Nombre: ${opa.nombre}
Dependencia: ${opa.subdependencias?.dependencias?.nombre || 'N/A'}
Subdependencia: ${opa.subdependencias?.nombre || 'N/A'}
${opa.descripcion ? `Descripción: ${opa.descripcion}` : ''}
${opa.formulario ? `Formulario: ${opa.formulario}` : ''}
${opa.tiempo_respuesta ? `Tiempo de respuesta: ${opa.tiempo_respuesta}` : ''}
${opa.requisitos && opa.requisitos.length > 0 ? `Requisitos: ${opa.requisitos.join(', ')}` : ''}
      `.trim()

      const success = await updateContentEmbeddings(
        opa.id,
        'opa',
        title,
        content
      )

      if (success) {
        processed++
        console.log(`✅ Processed OPA: ${opa.nombre}`)
      } else {
        errors++
        console.error(`❌ Failed to process OPA: ${opa.nombre}`)
      }
    } catch (error) {
      errors++
      console.error(`❌ Error processing OPA ${opa.nombre}:`, error)
    }
  }

  console.log(`📊 OPAs processed: ${processed}, errors: ${errors}`)
}

async function populateFaqEmbeddings() {
  console.log('🔄 Populating FAQ embeddings...')
  
  const { data: faqs, error } = await supabase
    .from('faqs')
    .select(`
      id,
      pregunta,
      respuesta,
      tema,
      palabras_clave,
      subdependencias (
        nombre,
        dependencias (
          nombre
        )
      )
    `)
    .eq('activo', true)

  if (error) {
    console.error('Error fetching FAQs:', error)
    return
  }

  let processed = 0
  let errors = 0

  for (const faq of faqs as FaqData[]) {
    try {
      const title = `FAQ: ${faq.pregunta}`
      const content = `
Pregunta: ${faq.pregunta}
Respuesta: ${faq.respuesta}
Dependencia: ${faq.subdependencias?.dependencias?.nombre || 'N/A'}
Subdependencia: ${faq.subdependencias?.nombre || 'N/A'}
${faq.tema ? `Tema: ${faq.tema}` : ''}
${faq.palabras_clave && faq.palabras_clave.length > 0 ? `Palabras clave: ${faq.palabras_clave.join(', ')}` : ''}
      `.trim()

      const success = await updateContentEmbeddings(
        faq.id,
        'faq',
        title,
        content
      )

      if (success) {
        processed++
        console.log(`✅ Processed FAQ: ${faq.pregunta}`)
      } else {
        errors++
        console.error(`❌ Failed to process FAQ: ${faq.pregunta}`)
      }
    } catch (error) {
      errors++
      console.error(`❌ Error processing FAQ ${faq.pregunta}:`, error)
    }
  }

  console.log(`📊 FAQs processed: ${processed}, errors: ${errors}`)
}

async function main() {
  console.log('🚀 Starting content embedding population...')
  console.log('⚠️  This process will use OpenAI API tokens and may take several minutes')

  // Debug environment variables
  console.log('\n🔍 Configuration check:')
  console.log('- OpenAI API Key:', process.env.OPENAI_API_KEY ? `✅ Set (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : '❌ Not set')
  console.log('- OpenAI Model:', process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small')
  console.log('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set')
  console.log('- Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set')

  // Test OpenAI connection
  console.log('\n🧪 Testing OpenAI connection...')
  try {
    const testEmbedding = await generateEmbedding('Test connection')
    console.log('✅ OpenAI connection successful')
    console.log(`   - Embedding dimensions: ${testEmbedding.embedding.length}`)
    console.log(`   - Tokens used: ${testEmbedding.tokens}`)
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error)
    process.exit(1)
  }

  console.log('\n📊 Starting content processing...')

  try {
    await populateTramiteEmbeddings()
    await populateOpaEmbeddings()
    await populateFaqEmbeddings()

    console.log('\n✅ Content embedding population completed successfully!')
    console.log('🎉 The AI chatbot is now ready to provide intelligent responses!')
  } catch (error) {
    console.error('❌ Error during embedding population:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
