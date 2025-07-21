'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { PageHeader, DataTable, Button, Modal, Form, PasswordChangeModal } from '@/components'
import { useAuth, useAdminBreadcrumbs, useAsyncOperation } from '@/hooks'
import { supabase } from '@/lib/supabase'
import { validateForm, commonValidationRules } from '@/lib/validation'
import type { Column } from '@/components/organisms/DataTable'
import type { SortConfig } from '@/components/organisms/DataTable/DataTable'
import type {
  FilterConfig,
  FilterValue,
  FilterPreset,
  AdvancedFilterConfig,
  FilterGroup,
  RowAction,
  BulkAction,
} from '@/components/molecules'

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: 'ciudadano' | 'funcionario' | 'admin'
  activo: boolean
  created_at: string
  updated_at: string
}

function UsuariosPage() {
  const { userProfile } = useAuth()
  const breadcrumbs = useAdminBreadcrumbs('usuarios')
  const [users, setUsers] = useState<User[]>([])
  const {
    state: asyncState,
    execute: executeAsync,
    retry: retryAsync,
  } = useAsyncOperation<User[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig<User>[]>([
    { key: 'created_at', direction: 'desc', priority: 0 },
  ])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<FilterValue>({})
  const [advancedFilterGroup, setAdvancedFilterGroup] = useState<FilterGroup | undefined>()
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([
    {
      id: 'active-users',
      name: 'Usuarios Activos',
      filters: { activo: true },
      isDefault: true,
    },
    {
      id: 'admins',
      name: 'Administradores',
      filters: { rol: 'admin' },
    },
    {
      id: 'recent-users',
      name: 'Usuarios Recientes',
      filters: {
        created_at: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
      },
    },
  ])

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form fields for user creation/editing
  const getFormFields = () => [
    {
      name: 'nombre',
      label: 'Nombre Completo',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese el nombre completo',
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email' as const,
      required: true,
      placeholder: 'usuario@ejemplo.com',
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password' as const,
      required: !editingUser, // Only required for new users
      placeholder: 'Mínimo 8 caracteres',
      description: editingUser ? 'Dejar en blanco para mantener la contraseña actual' : undefined,
    },
    {
      name: 'rol',
      label: 'Rol',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Ciudadano', value: 'ciudadano' },
        { label: 'Funcionario', value: 'funcionario' },
        { label: 'Administrador', value: 'admin' },
      ],
    },
    {
      name: 'activo',
      label: 'Usuario Activo',
      type: 'checkbox' as const,
          },
  ]

  // Validation schema for user forms
  const validationSchema: Record<string, any> = {
    nombre: {
      ...commonValidationRules.name,
      required: 'El nombre es obligatorio',
    },
    email: {
      ...commonValidationRules.email,
      required: 'El correo electrónico es obligatorio',
    },
    password: editingUser
      ? {}
      : {
          ...commonValidationRules.password,
          required: 'La contraseña es obligatoria',
        },
    rol: {
      required: 'Debe seleccionar un rol',
    },
  }

  // Define advanced filter configuration
  const advancedFilterConfig: AdvancedFilterConfig[] = [
    {
      field: 'nombre',
      label: 'Nombre',
      dataType: 'string',
    },
    {
      field: 'apellido',
      label: 'Apellido',
      dataType: 'string',
    },
    {
      field: 'email',
      label: 'Email',
      dataType: 'string',
    },
    {
      field: 'rol',
      label: 'Rol',
      dataType: 'string',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Funcionario', value: 'funcionario' },
        { label: 'Ciudadano', value: 'ciudadano' },
      ],
    },
    {
      field: 'activo',
      label: 'Estado Activo',
      dataType: 'boolean',
    },
    {
      field: 'created_at',
      label: 'Fecha de Creación',
      dataType: 'date',
    },
    {
      field: 'updated_at',
      label: 'Fecha de Actualización',
      dataType: 'date',
    },
  ]

  // Define filter configuration
  const filterConfig: FilterConfig[] = [
    {
      key: 'rol',
      label: 'Rol',
      type: 'select',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Funcionario', value: 'funcionario' },
        { label: 'Ciudadano', value: 'ciudadano' },
      ],
    },
    {
      key: 'activo',
      label: 'Estado',
      type: 'boolean',
    },
    {
      key: 'created_at',
      label: 'Fecha de Registro',
      type: 'dateRange',
    },
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Buscar por nombre...',
    },
  ]

  // Fetch users data with enhanced error handling
  const fetchUsers = useCallback(async () => {
    return executeAsync(
      async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setUsers(data || [])
        return data || []
      },
      {
        retryAttempts: 2,
        retryDelay: 1000,
        onSuccess: (data) => {
          console.log('Users loaded successfully:', data.length)
        },
        onError: (error) => {
          console.error('Error fetching users:', error)
        },
      }
    )
  }, [executeAsync])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Define table columns with enhanced sorting
  const columns: Column<User>[] = [
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      sorter: (a, b) => {
        const nameA = `${a.nombre} ${a.apellido}`.toLowerCase()
        const nameB = `${b.nombre} ${b.apellido}`.toLowerCase()
        return nameA.localeCompare(nameB)
      },
      render: (value: any, record: User) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.nombre} {record.apellido}
          </div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      key: 'rol',
      title: 'Rol',
      sortable: true,
      align: 'center',
      render: (value: string) => {
        const roleColors: Record<string, string> = {
          admin: 'bg-red-100 text-red-800',
          funcionario: 'bg-blue-100 text-blue-800',
          ciudadano: 'bg-green-100 text-green-800',
        }

        const roleLabels: Record<string, string> = {
          admin: 'Administrador',
          funcionario: 'Funcionario',
          ciudadano: 'Ciudadano',
        }

        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[value] || 'bg-gray-100 text-gray-800'}`}
          >
            {roleLabels[value] || value}
          </span>
        )
      },
    },
    {
      key: 'activo',
      title: 'Estado',
      sortable: true,
      align: 'center',
      render: (value: boolean) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Fecha de Registro',
      sortable: true,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (value: string) => new Date(value).toLocaleDateString('es-CO'),
    },
  ]

  // Handle sorting
  const handleSort = (newSortConfig: SortConfig<User>[]) => {
    setSortConfig(newSortConfig)
    console.log('Sort config changed:', newSortConfig)
  }

  // Handle pagination
  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page)
    setPageSize(size)
    console.log('Pagination changed:', { page, size })
  }

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setCurrentPage(1) // Reset to first page when searching
    console.log('Search changed:', value)
  }

  // Handle filters
  const handleFiltersChange = (filters: FilterValue) => {
    setFilterValues(filters)
    setCurrentPage(1) // Reset to first page when filtering
    console.log('Filters changed:', filters)
  }

  // Handle filter preset selection
  const handleFilterPresetSelect = (preset: FilterPreset) => {
    setFilterValues(preset.filters)
    setCurrentPage(1)
    console.log('Preset selected:', preset)
  }

  // Handle filter preset save
  const handleFilterPresetSave = (name: string, filters: FilterValue) => {
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      filters,
    }
    setFilterPresets((prev) => [...prev, newPreset])
    console.log('Preset saved:', newPreset)
  }

  // Handle advanced filters
  const handleAdvancedFiltersChange = (filterGroup: FilterGroup) => {
    setAdvancedFilterGroup(filterGroup)
    setCurrentPage(1) // Reset to first page when filtering
    console.log('Advanced filters changed:', filterGroup)
  }

  // Validate advanced filters
  const handleAdvancedFilterValidate = (filterGroup: FilterGroup): string[] => {
    const errors: string[] = []

    // Validate that all conditions have values where required
    const validateGroup = (group: FilterGroup) => {
      group.conditions.forEach((condition) => {
        if (!['is_null', 'is_not_null'].includes(condition.operator)) {
          if (
            !condition.value ||
            (Array.isArray(condition.value) && condition.value.some((v) => !v))
          ) {
            errors.push(`La condición "${condition.field}" requiere un valor`)
          }
        }
      })
      group.groups.forEach(validateGroup)
    }

    validateGroup(filterGroup)
    return errors
  }

  // Handle create user
  const handleCreateUser = async (formData: any) => {
    setFormLoading(true)
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
          },
        },
      })

      if (authError) throw authError

      // Create user profile in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            email: formData.email,
            nombre: formData.nombre,
            rol: formData.rol || 'ciudadano',
            activo: formData.activo !== false,
          },
        ])
        .select()
        .single()

      if (userError) throw userError

      // Update local state
      setUsers((prev) => [userData, ...prev])
      setIsCreateModalOpen(false)
      console.log('Usuario creado exitosamente:', userData)
    } catch (error) {
      console.error('Error creating user:', error)
      // TODO: Show error message to user
    } finally {
      setFormLoading(false)
    }
  }

  // Handle edit user
  const handleEditUser = async (formData: any) => {
    if (!editingUser) return

    setFormLoading(true)
    try {
      const updateData: any = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
        activo: formData.activo !== false,
      }

      // Only update password if provided
      if (formData.password && formData.password.trim()) {
        // Update password in Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({
          password: formData.password,
        })
        if (authError) throw authError
      }

      // Update user profile in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingUser.id)
        .select()
        .single()

      if (userError) throw userError

      // Update local state
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? userData : u)))
      setIsEditModalOpen(false)
      setEditingUser(null)
      console.log('Usuario actualizado exitosamente:', userData)
    } catch (error) {
      console.error('Error updating user:', error)
      // TODO: Show error message to user
    } finally {
      setFormLoading(false)
    }
  }

  // Define row actions
  const rowActions: RowAction<User>[] = [
    {
      key: 'view',
      label: 'Ver',
      icon: '👁️',
      variant: 'ghost',
      onClick: (user) => {
        console.log('Ver usuario:', user)
        // TODO: Navigate to user detail page
      },
      tooltip: 'Ver detalles del usuario',
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: '✏️',
      variant: 'ghost',
      onClick: (user) => {
        console.log('Editar usuario:', user)
        // TODO: Open edit modal or navigate to edit page
      },
      tooltip: 'Editar usuario',
      shortcut: 'e',
    },
    {
      key: 'change-password',
      label: 'Cambiar Contraseña',
      icon: '🔒',
      variant: 'ghost',
      onClick: (user) => {
        setPasswordChangeUser(user)
        setIsPasswordChangeModalOpen(true)
      },
      tooltip: 'Cambiar contraseña del usuario',
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      variant: 'danger',
      onClick: async (user) => {
        try {
          const { error } = await supabase.from('user_profiles').delete().eq('id', user.id)

          if (error) throw error

          // Update local state
          setUsers((prev) => prev.filter((u) => u.id !== user.id))
          console.log('Usuario eliminado:', user)
        } catch (err) {
          console.error('Error deleting user:', err)
        }
      },
      disabled: (user) => user.rol === 'admin', // Can't delete admin users
      tooltip: 'Eliminar usuario',
      confirmMessage:
        '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.',
      confirmTitle: 'Confirmar eliminación',
      shortcut: 'Delete',
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction<User>[] = [
    {
      key: 'activate',
      label: 'Activar seleccionados',
      icon: '🔓',
      variant: 'primary',
      onClick: async (selectedUsers) => {
        try {
          const userIds = selectedUsers.map((user) => user.id)
          const { error } = await supabase
            .from('user_profiles')
            .update({ activo: true })
            .in('id', userIds)

          if (error) throw error

          // Update local state
          setUsers((prev) =>
            prev.map((user) => (userIds.includes(user.id) ? { ...user, activo: true } : user))
          )
          console.log('Usuarios activados:', selectedUsers.length)
        } catch (err) {
          console.error('Error activating users:', err)
        }
      },
      disabled: (selectedUsers) => selectedUsers.every((user) => user.activo),
      minSelection: 1,
    },
    {
      key: 'deactivate',
      label: 'Desactivar seleccionados',
      icon: '🔒',
      variant: 'secondary',
      onClick: async (selectedUsers) => {
        try {
          const userIds = selectedUsers.map((user) => user.id)
          const { error } = await supabase
            .from('user_profiles')
            .update({ activo: false })
            .in('id', userIds)

          if (error) throw error

          // Update local state
          setUsers((prev) =>
            prev.map((user) => (userIds.includes(user.id) ? { ...user, activo: false } : user))
          )
          console.log('Usuarios desactivados:', selectedUsers.length)
        } catch (err) {
          console.error('Error deactivating users:', err)
        }
      },
      disabled: (selectedUsers) => selectedUsers.every((user) => !user.activo),
      minSelection: 1,
    },
    {
      key: 'export',
      label: 'Exportar seleccionados',
      icon: '📥',
      variant: 'secondary',
      onClick: (selectedUsers) => {
        const csvContent = [
          'Nombre,Apellido,Email,Rol,Estado,Fecha de Registro',
          ...selectedUsers.map(
            (user) =>
              `${user.nombre},${user.apellido},${user.email},${user.rol},${user.activo ? 'Activo' : 'Inactivo'},${new Date(user.created_at).toLocaleDateString()}`
          ),
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `usuarios-seleccionados-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        console.log('Usuarios exportados:', selectedUsers.length)
      },
      minSelection: 1,
    },
    {
      key: 'delete-bulk',
      label: 'Eliminar seleccionados',
      icon: '🗑️',
      variant: 'danger',
      onClick: async (selectedUsers) => {
        try {
          const userIds = selectedUsers.map((user) => user.id)
          const { error } = await supabase.from('user_profiles').delete().in('id', userIds)

          if (error) throw error

          // Update local state
          setUsers((prev) => prev.filter((user) => !userIds.includes(user.id)))
          console.log('Usuarios eliminados:', selectedUsers.length)
        } catch (err) {
          console.error('Error deleting users:', err)
        }
      },
      disabled: (selectedUsers) => selectedUsers.some((user) => user.rol === 'admin'),
      confirmMessage:
        '¿Estás seguro de que quieres eliminar los usuarios seleccionados? Esta acción no se puede deshacer.',
      confirmTitle: 'Confirmar eliminación masiva',
      minSelection: 1,
      maxSelection: 10, // Limit bulk delete to 10 users at a time
    },
  ]

  // Handle row selection
  const handleSelectionChange = (selectedKeys: (string | number)[], selectedRows: User[]) => {
    setSelectedRowKeys(selectedKeys)
    console.log('Selected users:', selectedRows)
  }

  // Handle row actions
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsEditModalOpen(true)
  }

  const handleDelete = (user: User) => {
    console.log('Delete user:', user)
    // TODO: Implement delete functionality
  }

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administrar usuarios del sistema y sus permisos"
        breadcrumbs={breadcrumbs}
        variant="admin"
        actions={
          <div className="flex space-x-2">
            <Button variant="neutral" size="sm">
              Exportar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              Nuevo Usuario
            </Button>
          </div>
        }
      />

      <div className="container-custom py-6">
        <div className="space-y-6">
          {/* Sorting Info */}
          {sortConfig.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-800">Ordenado por:</span>
                  <span className="text-sm text-blue-700 ml-2">
                    {sortConfig.map((sort, index) => (
                      <span key={sort.key}>
                        {String(sort.key)} ({sort.direction === 'asc' ? '↑' : '↓'})
                        {index < sortConfig.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="text-xs text-blue-600">
                  💡 Tip: Mantén Shift + Click para ordenamiento múltiple
                </div>
              </div>
            </div>
          )}

          {/* Selection Actions */}
          {selectedRowKeys.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedRowKeys.length} usuario(s) seleccionado(s)
                </span>
                <div className="flex space-x-2">
                  <Button variant="neutral" size="sm">
                    Activar
                  </Button>
                  <Button variant="neutral" size="sm">
                    Desactivar
                  </Button>
                  <Button variant="neutral" size="sm">
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            data={users}
            columns={columns}
            loading={asyncState.loading}
            error={asyncState.error}
            loadingType="skeleton"
            loadingMessage="Cargando usuarios..."
            onRetry={retryAsync}
            showErrorDetails={true}
            errorBoundary={true}
            selectable={true}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={handleSelectionChange}
            rowKey="id"
            sortable={true}
            multiSort={true}
            sortConfig={sortConfig}
            onSort={handleSort}
            showSearchAndFilters={true}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar usuarios por nombre, email..."
            filters={filterConfig}
            filterValues={filterValues}
            onFiltersChange={handleFiltersChange}
            filterPresets={filterPresets}
            onFilterPresetSelect={handleFilterPresetSelect}
            onFilterPresetSave={handleFilterPresetSave}
            showAdvancedFilters={true}
            advancedFilterFields={advancedFilterConfig}
            advancedFilterGroup={advancedFilterGroup}
            onAdvancedFiltersChange={handleAdvancedFiltersChange}
            onAdvancedFilterValidate={handleAdvancedFilterValidate}
            rowActions={rowActions}
            rowActionsConfig={{
              variant: 'dropdown',
              maxVisibleActions: 2,
            }}
            bulkActions={bulkActions}
            bulkActionsConfig={{
              variant: 'bar',
              position: 'floating',
            }}
            mobileBreakpoint={768}
            mobileLayout="card"
            mobileColumns={{
              primary: 'nombre',
              secondary: 'email',
              hidden: ['created_at', 'updated_at'],
            }}
            swipeActions={{
              right: [
                {
                  key: 'edit',
                  label: 'Editar',
                  icon: '✏️',
                  color: 'blue',
                  onClick: () => console.log('Edit via swipe'),
                },
                {
                  key: 'delete',
                  label: 'Eliminar',
                  icon: '🗑️',
                  color: 'red',
                  onClick: () => console.log('Delete via swipe'),
                },
              ],
            }}
            touchOptimized={true}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: users.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: true,
              showFirstLast: true,
              pageSizeOptions: [5, 10, 25, 50],
              onChange: handlePaginationChange,
              onShowSizeChange: handlePaginationChange,
            }}
            onRowClick={(record) => console.log('Row clicked:', record)}
            size="medium"
            bordered={true}
            striped={true}
            hover={true}
            responsive={true}
          />
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Usuario"
        size="lg"
        footer={
          <>
            <Button
              variant="neutral"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={formLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              isLoading={formLoading}
              onClick={() => {
                // Trigger form submission by finding the form element
                const form = document.querySelector('form')
                if (form) {
                  form.requestSubmit()
                }
              }}
            >
              Crear Usuario
            </Button>
          </>
        }
      >
        <Form
          fields={getFormFields()}
          validationSchema={validationSchema}
          onSubmit={handleCreateUser}
          initialData={{ activo: true, rol: 'ciudadano' }}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingUser(null)
        }}
        title="Editar Usuario"
        size="lg"
        footer={
          <>
            <Button
              variant="neutral"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingUser(null)
              }}
              disabled={formLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              isLoading={formLoading}
              onClick={() => {
                // Trigger form submission by finding the form element
                const forms = document.querySelectorAll('form')
                const editForm = forms[forms.length - 1] // Get the last form (edit form)
                if (editForm) {
                  editForm.requestSubmit()
                }
              }}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <Form
          fields={getFormFields()}
          validationSchema={validationSchema}
          onSubmit={handleEditUser}
          initialData={editingUser || {}}
        />
      </Modal>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordChangeModalOpen}
        onClose={() => {
          setIsPasswordChangeModalOpen(false)
          setPasswordChangeUser(null)
        }}
        user={passwordChangeUser}
        onSuccess={() => {
          console.log('Password changed successfully for user:', passwordChangeUser?.nombre)
          // Optionally reload users or show a success message
        }}
      />
    </div>
  )
}

export default UsuariosPage
