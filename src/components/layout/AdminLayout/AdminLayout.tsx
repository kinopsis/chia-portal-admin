import React from 'react'
import { Sidebar } from '@/components/layout'
import { ProtectedRoute } from '@/components'

export interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, className }) => {
  return (
    <ProtectedRoute allowedRoles={['funcionario', 'admin']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default AdminLayout
