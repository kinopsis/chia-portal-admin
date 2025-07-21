'use client'

import { useState, useCallback, useRef } from 'react'

export interface AsyncOperationState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  progress?: number
}

export interface AsyncOperationOptions {
  retryAttempts?: number
  retryDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onProgress?: (progress: number) => void
}

export interface UseAsyncOperationReturn<T = any> {
  state: AsyncOperationState<T>
  execute: (operation: () => Promise<T>, options?: AsyncOperationOptions) => Promise<T | null>
  retry: () => Promise<T | null>
  reset: () => void
  setProgress: (progress: number) => void
}

const useAsyncOperation = <T = any>(initialData: T | null = null): UseAsyncOperationReturn<T> => {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: initialData,
    loading: false,
    error: null,
    progress: undefined,
  })

  const lastOperationRef = useRef<{
    operation: () => Promise<T>
    options?: AsyncOperationOptions
  } | null>(null)

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }))
  }, [])

  const execute = useCallback(
    async (operation: () => Promise<T>, options: AsyncOperationOptions = {}): Promise<T | null> => {
      const { retryAttempts = 0, retryDelay = 1000, onSuccess, onError, onProgress } = options

      // Store the operation for retry functionality
      lastOperationRef.current = { operation, options }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        progress: onProgress ? 0 : undefined,
      }))

      let lastError: Error | null = null
      let attempt = 0

      while (attempt <= retryAttempts) {
        try {
          if (onProgress) {
            onProgress(0)
            setState((prev) => ({ ...prev, progress: 0 }))
          }

          const result = await operation()

          if (onProgress) {
            onProgress(100)
            setState((prev) => ({ ...prev, progress: 100 }))
          }

          setState((prev) => ({
            ...prev,
            data: result,
            loading: false,
            error: null,
            progress: undefined,
          }))

          onSuccess?.(result)
          return result
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))

          if (attempt < retryAttempts) {
            attempt++
            console.warn(`Operation failed, retrying (${attempt}/${retryAttempts})...`, lastError)

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt))
          } else {
            break
          }
        }
      }

      // All attempts failed
      const errorMessage = lastError?.message || 'Operación fallida'

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        progress: undefined,
      }))

      onError?.(lastError!)
      return null
    },
    []
  )

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastOperationRef.current) {
      console.warn('No operation to retry')
      return null
    }

    const { operation, options } = lastOperationRef.current
    return execute(operation, options)
  }, [execute])

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      progress: undefined,
    })
    lastOperationRef.current = null
  }, [initialData])

  return {
    state,
    execute,
    retry,
    reset,
    setProgress,
  }
}

export default useAsyncOperation
