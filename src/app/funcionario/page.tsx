'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import { useAuth } from '@/hooks'

function FuncionarioDashboard() {
  const { userProfile } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel Funcionario</h1>
      <p>Bienvenido, {userProfile?.nombre || 'Usuario'}!</p>
      <p>Dependencia: {userProfile?.dependencia?.nombre || 'No asignada'}</p>
      <p>Rol: {userProfile?.rol || 'No definido'}</p>
    </div>
  )
}

export default FuncionarioDashboard
