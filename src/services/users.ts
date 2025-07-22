import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/types'

export interface CreateUserData {
  email: string
  password: string
  nombre: string
  apellido?: string
  rol: UserRole
  dependencia_id?: string
  activo: boolean
}

export interface UpdateUserData {
  email?: string
  nombre?: string
  apellido?: string
  rol?: UserRole
  dependencia_id?: string
  activo?: boolean
}

export interface UserFilters {
  query?: string
  rol?: UserRole
  activo?: boolean
  dependencia_id?: string
  page?: number
  limit?: number
}

export class UsersService {
  /**
   * Get all users with optional filtering and pagination
   */
  async getAll(filters: UserFilters = {}) {
    const {
      query,
      rol,
      activo,
      dependencia_id,
      page = 1,
      limit = 20
    } = filters

    let queryBuilder = supabase
      .from('users')
      .select(`
        *,
        dependencias:dependencia_id (
          id,
          nombre,
          codigo
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.or(
        `nombre.ilike.%${query}%,email.ilike.%${query}%`
      )
    }

    if (rol) {
      queryBuilder = queryBuilder.eq('rol', rol)
    }

    if (typeof activo === 'boolean') {
      queryBuilder = queryBuilder.eq('activo', activo)
    }

    if (dependencia_id) {
      queryBuilder = queryBuilder.eq('dependencia_id', dependencia_id)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    queryBuilder = queryBuilder.range(from, to)

    const { data, error, count } = await queryBuilder

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`)
    }

    return {
      data: data as User[],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  /**
   * Get a single user by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        dependencias:dependencia_id (
          id,
          nombre,
          codigo
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching user: ${error.message}`)
    }

    return data as User
  }

  /**
   * Create a new user (both in Auth and users table)
   */
  async create(userData: CreateUserData) {
    try {
      // First create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nombre: userData.nombre,
            apellido: userData.apellido
          }
        }
      })

      if (authError) {
        throw new Error(`Error creating auth user: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No user data returned from auth signup')
      }

      // Then create user profile in users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          rol: userData.rol,
          dependencia_id: userData.dependencia_id,
          activo: userData.activo
        })
        .select(`
          *,
          dependencias:dependencia_id (
            id,
            nombre,
            codigo
          )
        `)
        .single()

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        // Note: In production, you might want to handle this differently
        console.error('Profile creation failed, auth user created:', authData.user.id)
        throw new Error(`Error creating user profile: ${profileError.message}`)
      }

      return profileData as User
    } catch (error) {
      throw error
    }
  }

  /**
   * Update an existing user
   */
  async update(id: string, updates: UpdateUserData) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        dependencias:dependencia_id (
          id,
          nombre,
          codigo
        )
      `)
      .single()

    if (error) {
      throw new Error(`Error updating user: ${error.message}`)
    }

    return data as User
  }

  /**
   * Delete a user (soft delete by setting activo to false)
   */
  async delete(id: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        activo: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`)
    }

    return data as User
  }

  /**
   * Hard delete a user (permanently remove from database)
   * Use with caution - this cannot be undone
   */
  async hardDelete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error permanently deleting user: ${error.message}`)
    }

    return true
  }

  /**
   * Bulk activate users
   */
  async bulkActivate(userIds: string[]) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        activo: true,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select()

    if (error) {
      throw new Error(`Error activating users: ${error.message}`)
    }

    return data as User[]
  }

  /**
   * Bulk deactivate users
   */
  async bulkDeactivate(userIds: string[]) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        activo: false,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select()

    if (error) {
      throw new Error(`Error deactivating users: ${error.message}`)
    }

    return data as User[]
  }

  /**
   * Bulk delete users (soft delete)
   */
  async bulkDelete(userIds: string[]) {
    return this.bulkDeactivate(userIds)
  }

  /**
   * Send password reset email to user (admin function)
   * Note: Direct password changes require service role privileges
   * For now, we'll send a password reset email instead
   */
  async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      throw new Error(`Error sending password reset: ${error.message}`)
    }

    return true
  }

  /**
   * Change user password (placeholder for future admin API)
   * TODO: Implement as Edge Function with service role privileges
   */
  async changePassword(userId: string, newPassword: string) {
    // For now, we'll throw an error indicating this needs to be implemented
    // as an API route with service role privileges
    throw new Error('Password changes require admin API implementation. Use password reset email instead.')
  }

  /**
   * Get user statistics
   */
  async getStatistics() {
    const { data, error } = await supabase
      .from('users')
      .select('rol, activo')

    if (error) {
      throw new Error(`Error fetching user statistics: ${error.message}`)
    }

    const users = data || []
    const stats = {
      total: users.length,
      active: users.filter(u => u.activo).length,
      inactive: users.filter(u => !u.activo).length,
      byRole: {
        admin: users.filter(u => u.rol === 'admin').length,
        funcionario: users.filter(u => u.rol === 'funcionario').length,
        ciudadano: users.filter(u => u.rol === 'ciudadano').length
      }
    }

    return stats
  }
}

// Export singleton instance
export const usersService = new UsersService()
