'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'
import { validateForm, FormValidationResult } from '@/lib/validation'
import type { FormField, ValidationRule } from '@/types'

export interface FormProps<T extends Record<string, any>> {
  id?: string
  fields: FormField[]
  initialData?: Partial<T>
  validationSchema?: Record<keyof T, ValidationRule>
  onSubmit: (data: T, isValid: boolean) => void | Promise<void>
  onValidationChange?: (result: FormValidationResult) => void
  loading?: boolean
  disabled?: boolean
  className?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showErrorSummary?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  children?: React.ReactNode
}

const Form = <T extends Record<string, any>>({
  id,
  fields,
  initialData = {},
  validationSchema = {},
  onSubmit,
  onValidationChange,
  loading = false,
  disabled = false,
  className,
  validateOnChange = true,
  validateOnBlur = true,
  showErrorSummary = false,
  autoSave = false,
  autoSaveDelay = 2000,
  submitLabel = 'Enviar',
  cancelLabel = 'Cancelar',
  onCancel,
  children,
}: FormProps<T>) => {
  const [formData, setFormData] = useState<Partial<T>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return

    const timeoutId = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        handleSubmit(new Event('submit') as any, true)
      }
    }, autoSaveDelay)

    return () => clearTimeout(timeoutId)
  }, [formData, autoSave, autoSaveDelay])

  const validateFormData = useCallback(
    (data: Partial<T>) => {
      const result = validateForm(data as T, validationSchema)
      setErrors(result.fieldErrors)
      onValidationChange?.(result)
      return result
    },
    [validationSchema, onValidationChange]
  )

  const handleInputChange = useCallback(
    (name: string, value: any) => {
      const newData = { ...formData, [name]: value }
      setFormData(newData)

      if (validateOnChange && touched[name]) {
        validateFormData(newData)
      }
    },
    [formData, validateOnChange, touched, validateFormData]
  )

  const handleInputBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }))

      if (validateOnBlur) {
        validateFormData(formData)
      }
    },
    [formData, validateOnBlur, validateFormData]
  )

  const handleSubmit = async (e: React.FormEvent, isAutoSave = false) => {
    e.preventDefault()

    if (!isAutoSave) {
      setIsSubmitting(true)
    }

    // Mark all fields as touched for validation display
    const allTouched = fields.reduce(
      (acc, field) => {
        acc[field.name] = true
        return acc
      },
      {} as Record<string, boolean>
    )
    setTouched(allTouched)

    const validationResult = validateFormData(formData)

    try {
      await onSubmit(formData as T, validationResult.isValid)
    } finally {
      if (!isAutoSave) {
        setIsSubmitting(false)
      }
    }
  }

  const renderField = (field: FormField) => {
    const fieldError = touched[field.name] ? errors[field.name] : undefined
    const fieldValue = formData[field.name] || ''
    const isFieldDisabled = disabled || loading || field.disabled

    // Props that are safe to pass to DOM elements
    const domProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      disabled: isFieldDisabled,
      value: fieldValue,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      ) => {
        const value =
          field.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : field.type === 'number'
              ? parseFloat(e.target.value) || 0
              : e.target.value

        // Use custom onChange if provided, otherwise use default handler
        if (field.onChange) {
          field.onChange(value)
        }
        handleInputChange(field.name, value)
      },
      onBlur: () => handleInputBlur(field.name),
    }

    // Component-specific props (not for DOM elements)
    const componentProps = {
      label: field.label,
      error: fieldError,
      helperText: field.helperText,
      fullWidth: field.fullWidth ?? true,
    }

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-text-primary mb-2">
              {componentProps.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              {...domProps}
              rows={field.rows || 4}
              className={clsx(
                'w-full px-4 py-3 border rounded-lg transition-colors duration-200 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-0 bg-background text-text-primary',
                componentProps.error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-border focus:border-primary-green focus:ring-primary-green',
                isFieldDisabled && 'bg-input-disabled cursor-not-allowed opacity-50'
              )}
            />
            {componentProps.error && (
              <p className="mt-1 text-sm text-red-600">{componentProps.error}</p>
            )}
            {componentProps.helperText && !componentProps.error && (
              <p className="mt-1 text-sm text-text-secondary">{componentProps.helperText}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-text-primary mb-2">
              {componentProps.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
            <select
              {...domProps}
              className={clsx(
                'w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 bg-background text-text-primary appearance-none pr-10',
                componentProps.error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-border focus:border-primary-green focus:ring-primary-green',
                isFieldDisabled && 'bg-input-disabled cursor-not-allowed opacity-50'
              )}
              >
                {field.placeholder && (
                  <option value="" disabled>
                    {field.placeholder}
                  </option>
                )}
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            {componentProps.error && (
              <p className="mt-1 text-sm text-red-600">{componentProps.error}</p>
            )}
            {componentProps.helperText && !componentProps.error && (
              <p className="mt-1 text-sm text-text-secondary">{componentProps.helperText}</p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.name} className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...domProps}
                checked={fieldValue}
                className={clsx(
                  'h-4 w-4 text-primary-green focus:ring-primary-green border-border rounded',
                  isFieldDisabled && 'cursor-not-allowed'
                )}
              />
              <label htmlFor={field.name} className="ml-2 block text-sm text-text-primary">
                {componentProps.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {componentProps.error && (
              <p className="mt-1 text-sm text-red-600">{componentProps.error}</p>
            )}
            {componentProps.helperText && !componentProps.error && (
              <p className="mt-1 text-sm text-text-secondary">{componentProps.helperText}</p>
            )}
          </div>
        )

      default:
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-text-primary mb-2">
              {componentProps.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              {...domProps}
              className={clsx(
                'w-full px-4 py-3 border rounded-lg transition-colors duration-200 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-0 bg-background text-text-primary',
                componentProps.error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-border focus:border-primary-green focus:ring-primary-green',
                isFieldDisabled && 'bg-input-disabled cursor-not-allowed opacity-50'
              )}
            />
            {componentProps.error && (
              <p className="mt-1 text-sm text-red-600">{componentProps.error}</p>
            )}
            {componentProps.helperText && !componentProps.error && (
              <p className="mt-1 text-sm text-text-secondary">{componentProps.helperText}</p>
            )}
          </div>
        )
    }
  }

  const errorCount = Object.keys(errors).length
  const hasErrors = errorCount > 0

  return (
    <form onSubmit={handleSubmit} className={clsx('space-y-4', className)}>
      {showErrorSummary && hasErrors && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            {errorCount === 1
              ? 'Hay 1 error en el formulario:'
              : `Hay ${errorCount} errores en el formulario:`}
          </h3>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {fields.map(renderField)}

      {children}
    </form>
  )
}

export default Form
