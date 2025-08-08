// Utility functions for the application
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and tailwind-merge
 * This function allows for conditional classes and merges Tailwind classes intelligently
 * 
 * @param inputs - Class values to combine
 * @returns Merged class string
 * 
 * @example
 * cn('px-2 py-1', 'bg-blue-500', { 'text-white': isActive })
 * cn('px-4', 'px-2') // Returns 'px-2' (tailwind-merge handles conflicts)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a localized string
 * @param date - Date to format
 * @param locale - Locale string (default: 'es-CO')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale: string = 'es-CO',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  return new Intl.DateTimeFormat(locale, options).format(date)
}

/**
 * Formats a time to a localized string
 * @param date - Date to format
 * @param locale - Locale string (default: 'es-CO')
 * @returns Formatted time string
 */
export function formatTime(
  date: Date,
  locale: string = 'es-CO'
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

/**
 * Formats currency for Colombian pesos
 * @param amount - Amount to format
 * @param locale - Locale string (default: 'es-CO')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string = 'es-CO'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Truncates text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Generates a random ID string
 * @param length - Length of the ID (default: 8)
 * @returns Random ID string
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttles a function call
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Checks if a string is a valid email
 * @param email - Email string to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Checks if a string is a valid Colombian phone number
 * @param phone - Phone string to validate
 * @returns True if valid phone number
 */
export function isValidColombianPhone(phone: string): boolean {
  // Colombian phone numbers: +57 followed by 10 digits or just 10 digits
  const phoneRegex = /^(\+57)?[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Formats a Colombian phone number
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatColombianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('57')) {
    const number = cleaned.slice(2)
    return `+57 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
  }
  
  return phone
}

/**
 * Safely parses JSON with error handling
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

/**
 * Creates a delay promise
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Removes accents from Spanish text for search purposes
 * @param text - Text to normalize
 * @returns Normalized text without accents
 */
export function normalizeSpanishText(text: string | null | undefined): string {
  if (!text) return ''

  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Calculates reading time for text
 * @param text - Text to analyze
 * @param wordsPerMinute - Reading speed (default: 200 WPM)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
