// Database Helper Service
// Provides utilities for checking database schema and handling migrations

import { supabase } from '@/lib/supabase/client'

// Cache for column existence checks to avoid repeated queries
const columnExistenceCache = new Map<string, boolean>()

/**
 * Check if a column exists in a table
 * @param tableName - Name of the table
 * @param columnName - Name of the column to check
 * @returns Promise<boolean> - True if column exists, false otherwise
 */
export async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const cacheKey = `${tableName}.${columnName}`
  
  // Return cached result if available
  if (columnExistenceCache.has(cacheKey)) {
    return columnExistenceCache.get(cacheKey)!
  }

  try {
    // Try to query the column - if it doesn't exist, this will throw an error
    const { error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1)

    const exists = !error || !error.message.includes('does not exist')
    
    // Cache the result
    columnExistenceCache.set(cacheKey, exists)
    
    return exists
  } catch (error) {
    // If there's an error, assume column doesn't exist
    columnExistenceCache.set(cacheKey, false)
    return false
  }
}

/**
 * Get the appropriate select query for tramites based on available columns
 * @returns Promise<string> - The select query string
 */
export async function getTramitesSelectQuery(): Promise<string> {
  const baseQuery = `
    *,
    subdependencias (
      id,
      nombre,
      dependencias (
        id,
        nombre
      )
    )
  `

  // Check if new columns exist
  const [requisitosExists, suitExists, govExists] = await Promise.all([
    checkColumnExists('tramites', 'requisitos'),
    checkColumnExists('tramites', 'visualizacion_suit'),
    checkColumnExists('tramites', 'visualizacion_gov')
  ])

  let additionalFields = ''
  
  if (requisitosExists) {
    additionalFields += ', requisitos'
  }
  
  if (suitExists) {
    additionalFields += ', visualizacion_suit'
  }
  
  if (govExists) {
    additionalFields += ', visualizacion_gov'
  }

  return baseQuery + additionalFields
}

/**
 * Enhanced tramites query with dynamic column selection
 * @param filters - Optional filters to apply
 * @returns Promise with tramites data
 */
export async function queryTramitesWithDynamicColumns(filters?: {
  activo?: boolean
  limit?: number
  subdependencia_id?: string
  query?: string
}) {
  const selectQuery = await getTramitesSelectQuery()
  
  let query = supabase
    .from('tramites')
    .select(selectQuery, { count: 'exact' })
    .order('nombre', { ascending: true })

  // Apply filters
  if (filters?.activo !== undefined) {
    query = query.eq('activo', filters.activo)
  }

  if (filters?.subdependencia_id) {
    query = query.eq('subdependencia_id', filters.subdependencia_id)
  }

  if (filters?.query) {
    query = query.or(`nombre.ilike.%${filters.query}%,formulario.ilike.%${filters.query}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  return query
}

/**
 * Check if the database has been migrated with new columns
 * @returns Promise<boolean> - True if migration is complete
 */
export async function checkMigrationStatus(): Promise<boolean> {
  const [requisitosExists, suitExists, govExists] = await Promise.all([
    checkColumnExists('tramites', 'requisitos'),
    checkColumnExists('tramites', 'visualizacion_suit'),
    checkColumnExists('tramites', 'visualizacion_gov')
  ])

  return requisitosExists && suitExists && govExists
}

/**
 * Clear the column existence cache
 * Call this after running migrations to refresh column checks
 */
export function clearColumnCache(): void {
  columnExistenceCache.clear()
}

/**
 * Get migration status information for debugging
 */
export async function getMigrationInfo() {
  const [requisitosExists, suitExists, govExists] = await Promise.all([
    checkColumnExists('tramites', 'requisitos'),
    checkColumnExists('tramites', 'visualizacion_suit'),
    checkColumnExists('tramites', 'visualizacion_gov')
  ])

  return {
    requisitos: requisitosExists,
    visualizacion_suit: suitExists,
    visualizacion_gov: govExists,
    migrationComplete: requisitosExists && suitExists && govExists
  }
}
