// Debounce hook for optimizing search performance
// Delays execution of expensive operations like API calls

import { useState, useEffect } from 'react'

/**
 * Hook that debounces a value, delaying updates until after a specified delay
 * Useful for search inputs to avoid excessive API calls
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timer if value changes before delay completes
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook that provides a debounced callback function
 * Useful for debouncing function calls rather than values
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCallback(() => callback)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [callback, delay])

  return debouncedCallback
}

/**
 * Hook that provides both immediate and debounced values
 * Useful when you need to show immediate feedback but delay expensive operations
 * 
 * @param value - The value to track
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Object with immediate and debounced values
 */
export function useImmediateAndDebounced<T>(
  value: T,
  delay: number = 300
): {
  immediate: T
  debounced: T
  isPending: boolean
} {
  const [immediate, setImmediate] = useState<T>(value)
  const [debounced, setDebounced] = useState<T>(value)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setImmediate(value)
    setIsPending(true)

    const timer = setTimeout(() => {
      setDebounced(value)
      setIsPending(false)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return {
    immediate,
    debounced,
    isPending
  }
}

export default useDebounce
