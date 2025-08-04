/**
 * Unified Services Management Page - Funcionarios
 * Identical to admin services page with unified interface for managing both Trámites and OPAs
 *
 * Features:
 * - Unified data management
 * - Advanced filtering
 * - Real-time metrics
 * - Multiple view modes
 * - Bulk operations
 * - Backward compatibility
 */

'use client'

import React from 'react'
import { RoleGuard } from '@/components/auth'
import { UnifiedServicesManager } from '@/components/organisms'
import { MainContent } from '@/components/atoms'

/**
 * Unified Services Management Page Component - Funcionarios
 */
export default function FuncionariosServiciosPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'funcionario']}>
      <MainContent>
        <UnifiedServicesManager
          serviceType="both"
          defaultServiceType="both"
          viewMode="cards"
          defaultViewMode="cards"
          enableMetrics={true}
          enableAdvancedFilters={true}
          enableBulkActions={true}
          enableExport={true}
          permissions={{
            create: true,
            read: true,
            update: true,
            delete: true,
            export: true
          }}
          showHeader={true}
          showBreadcrumbs={true}
          compactMode={false}
          onServiceTypeChange={(type) => {
            console.log('Service type changed to:', type)
          }}
          onViewModeChange={(mode) => {
            console.log('View mode changed to:', mode)
          }}
          onItemSelect={(item) => {
            console.log('Item selected:', item)
          }}
          onBulkAction={(action, items) => {
            console.log('Bulk action:', action, 'on items:', items)
          }}
        />
      </MainContent>
    </RoleGuard>
  )
}
