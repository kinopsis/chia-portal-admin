// Simple test utility to verify Supabase connectivity
import { supabase } from '@/lib/supabase/client'

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    // Test 1: Basic connection
    console.log('🔗 Test 1: Basic client check')
    console.log('Client exists:', !!supabase)
    
    // Test 2: Simple query
    console.log('🔗 Test 2: Simple dependencias query')
    const { data, error, count } = await supabase
      .from('dependencias')
      .select('id, codigo, nombre, activo', { count: 'exact' })
      .limit(5)
    
    console.log('Query result:', {
      data: data?.length,
      error: error?.message,
      count,
      sampleData: data?.[0]
    })
    
    if (error) {
      console.error('❌ Supabase query failed:', error)
      return { success: false, error: error.message }
    }
    
    if (!data || data.length === 0) {
      console.warn('⚠️ No data returned from query')
      return { success: false, error: 'No data returned' }
    }
    
    console.log('✅ Supabase connection test successful!')
    return { 
      success: true, 
      data, 
      count,
      message: `Successfully fetched ${data.length} dependencias` 
    }
    
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }
  }
}

// Test function to be called from browser console
export async function runSupabaseTest() {
  const result = await testSupabaseConnection()
  console.log('🧪 Test Result:', result)
  return result
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testSupabase = runSupabaseTest
}
