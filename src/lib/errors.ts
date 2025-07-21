/**
 * Error handling utilities for the application
 */

export interface SupabaseError {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
}

export interface RetryOptions {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

export interface NetworkErrorInfo {
  isNetworkError: boolean
  isRetryable: boolean
  errorType: 'connection' | 'timeout' | 'cors' | 'server' | 'unknown'
}

/**
 * Formats a Supabase error for logging and display
 */
export function formatSupabaseError(error: any): string {
  if (!error) return 'Error desconocido'

  // Handle different error types
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  // Handle Supabase error objects
  if (error.code || error.message) {
    const parts: string[] = []

    if (error.message) {
      parts.push(error.message)
    }

    if (error.code) {
      parts.push(`(Código: ${error.code})`)
    }

    if (error.details) {
      parts.push(`Detalles: ${error.details}`)
    }

    if (error.hint) {
      parts.push(`Sugerencia: ${error.hint}`)
    }

    return parts.join(' - ')
  }

  // Fallback for unknown error types
  try {
    return JSON.stringify(error)
  } catch {
    return 'Error desconocido'
  }
}

/**
 * Logs a Supabase error with proper formatting
 */
export function logSupabaseError(context: string, error: any): void {
  const formattedError = formatSupabaseError(error)
  console.error(`${context}:`, formattedError)

  // Also log the raw error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Raw error object:', error)
  }
}

/**
 * Checks if an error indicates a missing table/relation
 */
export function isMissingTableError(error: any): boolean {
  return (
    error?.code === '42P01' ||
    (error?.message?.includes('relation') && error?.message?.includes('does not exist'))
  )
}

/**
 * Checks if an error indicates a missing foreign key relationship
 */
export function isMissingForeignKeyError(error: any): boolean {
  return error?.code === 'PGRST200' || error?.message?.includes('foreign key relationship')
}

/**
 * Detects if an error is a network-related error
 */
export function analyzeNetworkError(error: any): NetworkErrorInfo {
  const errorMessage = error?.message?.toLowerCase() || ''
  const errorString = String(error).toLowerCase()

  // Check for network connection errors
  if (
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('connection closed') ||
    errorString.includes('err_connection_closed') ||
    errorString.includes('err_connection_refused') ||
    errorString.includes('err_network_changed')
  ) {
    return {
      isNetworkError: true,
      isRetryable: true,
      errorType: 'connection',
    }
  }

  // Check for timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorString.includes('err_timed_out')
  ) {
    return {
      isNetworkError: true,
      isRetryable: true,
      errorType: 'timeout',
    }
  }

  // Check for CORS errors
  if (
    errorMessage.includes('cors') ||
    errorMessage.includes('cross-origin') ||
    errorString.includes('cors')
  ) {
    return {
      isNetworkError: true,
      isRetryable: false,
      errorType: 'cors',
    }
  }

  // Check for server errors (5xx)
  if (error?.status >= 500 && error?.status < 600) {
    return {
      isNetworkError: true,
      isRetryable: true,
      errorType: 'server',
    }
  }

  return {
    isNetworkError: false,
    isRetryable: false,
    errorType: 'unknown',
  }
}

/**
 * Implements exponential backoff retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, backoffFactor = 2 } = options

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break
      }

      // Check if error is retryable
      const networkInfo = analyzeNetworkError(error)
      if (!networkInfo.isRetryable) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay)

      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Gets a user-friendly error message for common database issues
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const networkInfo = analyzeNetworkError(error)

  // Handle network errors first
  if (networkInfo.isNetworkError) {
    switch (networkInfo.errorType) {
      case 'connection':
        return 'Error de conexión. Verifique su conexión a internet e intente nuevamente.'
      case 'timeout':
        return 'La operación tardó demasiado tiempo. Intente nuevamente.'
      case 'cors':
        return 'Error de configuración del servidor. Contacte al administrador.'
      case 'server':
        return 'El servidor está experimentando problemas. Intente nuevamente en unos momentos.'
      default:
        return 'Error de red. Verifique su conexión e intente nuevamente.'
    }
  }

  // Handle database-specific errors
  if (isMissingTableError(error)) {
    return 'Algunos datos no están disponibles. Es posible que el sistema esté en configuración.'
  }

  if (isMissingForeignKeyError(error)) {
    return 'Error en la estructura de datos. Contacte al administrador del sistema.'
  }

  if (error?.code === '42501') {
    return 'No tiene permisos para acceder a estos datos.'
  }

  if (error?.code === 'PGRST116') {
    return 'No se encontraron datos.'
  }

  return formatSupabaseError(error)
}
