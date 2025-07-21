// Form validation utilities and schemas

import { VALIDATION } from './constants'

export interface ValidationRule {
  required?: boolean | string
  minLength?: number | { value: number; message: string }
  maxLength?: number | { value: number; message: string }
  pattern?: RegExp | { value: RegExp; message: string }
  min?: number | { value: number; message: string }
  max?: number | { value: number; message: string }
  custom?: (value: any) => string | boolean
}

export interface ValidationError {
  field: string
  message: string
  type: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
  fieldErrors: Record<string, string>
}

/**
 * Validates a single field value against validation rules
 */
export function validateField(
  fieldName: string,
  value: any,
  rules: ValidationRule
): ValidationError | null {
  // Required validation
  if (rules.required) {
    const isEmpty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)

    if (isEmpty) {
      const message =
        typeof rules.required === 'string' ? rules.required : `${fieldName} es requerido`
      return { field: fieldName, message, type: 'required' }
    }
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return null
  }

  // String validations
  if (typeof value === 'string') {
    // Min length
    if (rules.minLength) {
      const minLength =
        typeof rules.minLength === 'number' ? rules.minLength : rules.minLength.value
      const message =
        typeof rules.minLength === 'object'
          ? rules.minLength.message
          : `${fieldName} debe tener al menos ${minLength} caracteres`

      if (value.length < minLength) {
        return { field: fieldName, message, type: 'minLength' }
      }
    }

    // Max length
    if (rules.maxLength) {
      const maxLength =
        typeof rules.maxLength === 'number' ? rules.maxLength : rules.maxLength.value
      const message =
        typeof rules.maxLength === 'object'
          ? rules.maxLength.message
          : `${fieldName} no puede tener más de ${maxLength} caracteres`

      if (value.length > maxLength) {
        return { field: fieldName, message, type: 'maxLength' }
      }
    }

    // Pattern validation
    if (rules.pattern) {
      const pattern = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value
      const message =
        rules.pattern instanceof RegExp
          ? `${fieldName} tiene un formato inválido`
          : rules.pattern.message

      if (!pattern.test(value)) {
        return { field: fieldName, message, type: 'pattern' }
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    // Min value
    if (rules.min !== undefined) {
      const min = typeof rules.min === 'number' ? rules.min : rules.min.value
      const message =
        typeof rules.min === 'object'
          ? rules.min.message
          : `${fieldName} debe ser mayor o igual a ${min}`

      if (value < min) {
        return { field: fieldName, message, type: 'min' }
      }
    }

    // Max value
    if (rules.max !== undefined) {
      const max = typeof rules.max === 'number' ? rules.max : rules.max.value
      const message =
        typeof rules.max === 'object'
          ? rules.max.message
          : `${fieldName} debe ser menor o igual a ${max}`

      if (value > max) {
        return { field: fieldName, message, type: 'max' }
      }
    }
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value)
    if (typeof result === 'string') {
      return { field: fieldName, message: result, type: 'custom' }
    }
    if (result === false) {
      return { field: fieldName, message: `${fieldName} es inválido`, type: 'custom' }
    }
  }

  return null
}

/**
 * Validates an entire form object against validation schema
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, ValidationRule>
): FormValidationResult {
  const errors: ValidationError[] = []
  const fieldErrors: Record<string, string> = {}

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName]
    const error = validateField(fieldName, value, rules)

    if (error) {
      errors.push(error)
      fieldErrors[fieldName] = error.message
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  }
}

// Common validation rules
export const commonValidationRules = {
  email: {
    required: 'El email es requerido',
    pattern: {
      value: VALIDATION.EMAIL_REGEX,
      message: 'Ingresa un email válido',
    },
  },
  phone: {
    required: 'El teléfono es requerido',
    pattern: {
      value: VALIDATION.PHONE_REGEX,
      message: 'Ingresa un teléfono válido (ej: +57 300 123 4567)',
    },
  },
  password: {
    required: 'La contraseña es requerida',
    minLength: {
      value: VALIDATION.PASSWORD_MIN_LENGTH,
      message: `La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`,
    },
  },
  name: {
    required: 'El nombre es requerido',
    minLength: {
      value: VALIDATION.NAME_MIN_LENGTH,
      message: `Debe tener al menos ${VALIDATION.NAME_MIN_LENGTH} caracteres`,
    },
    maxLength: {
      value: VALIDATION.NAME_MAX_LENGTH,
      message: `No puede tener más de ${VALIDATION.NAME_MAX_LENGTH} caracteres`,
    },
  },
  codigo: {
    required: 'El código es requerido',
    pattern: {
      value: VALIDATION.CODIGO_REGEX,
      message: 'Solo se permiten letras mayúsculas, números y guiones',
    },
  },
  description: {
    maxLength: {
      value: VALIDATION.DESCRIPTION_MAX_LENGTH,
      message: `No puede tener más de ${VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`,
    },
  },
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email)
}

/**
 * Validates Colombian phone number
 */
export function isValidPhone(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(phone.replace(/\s/g, ''))
}

/**
 * Creates a debounced validation function
 */
export function createDebouncedValidator<T>(
  validator: (data: T) => FormValidationResult,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout

  return (data: T): Promise<FormValidationResult> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        resolve(validator(data))
      }, delay)
    })
  }
}
