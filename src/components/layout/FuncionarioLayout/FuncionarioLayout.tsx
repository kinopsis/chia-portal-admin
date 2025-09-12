import React from 'react'
import { FuncionarioSidebar } from '@/components/layout'
import { ProtectedRoute } from '@/components'

export interface FuncionarioLayoutProps {
  children: React.ReactNode
  className?: string
}

const FuncionarioLayout: React.FC<FuncionarioLayoutProps> = ({ children, className }) => {
  return (
    <ProtectedRoute allowedRoles={['funcionario']}>
      <div className="flex h-screen bg-background">
        <FuncionarioSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default FuncionarioLayout
