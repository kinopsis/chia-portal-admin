'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components'

export default function TestAdminSetup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const updateUserToAdmin = async () => {
    setLoading(true)
    setMessage('')

    try {
      // Update the user with email juan.perez.test@chia.gov.co to admin role
      const { data, error } = await supabase
        .from('users')
        .update({
          rol: 'admin'
          // apellido: 'Pérez' // Commented out due to missing column in database
        })
        .eq('email', 'juan.perez.test@chia.gov.co')
        .select()

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        setMessage(`✅ Usuario actualizado a admin: ${data[0].nombre} ${data[0].apellido || ''}`)
      } else {
        setMessage('❌ No se encontró el usuario')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkUsers = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      console.log('Users in database:', data)
      setMessage(`📊 Usuarios encontrados: ${data?.length || 0}`)
      
      if (data && data.length > 0) {
        data.forEach(user => {
          console.log(`- ${user.nombre} ${user.apellido || ''} (${user.email}) - Rol: ${user.rol}`)
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Admin Setup Tool</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600 mb-4">
              Use this tool to check users and update roles for testing purposes.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={checkUsers}
              disabled={loading}
              variant="outline"
              fullWidth
            >
              {loading ? 'Checking...' : '📊 Check Users in Database'}
            </Button>

            <Button 
              onClick={updateUserToAdmin}
              disabled={loading}
              variant="primary"
              fullWidth
            >
              {loading ? 'Updating...' : '👑 Make Juan Pérez Admin'}
            </Button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' :
              message.includes('📊') ? 'bg-blue-50 text-blue-800' :
              'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p><strong>Note:</strong> This is a development tool for testing admin functionality.</p>
            <p>After updating the role, refresh the page to see changes in the header.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
