'use client'

import React from 'react'
import { Form } from '@/components/molecules'
import type { FormField } from '@/types'

export interface SectionedFormProps {
  id?: string
  fields: FormField[]
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>, isValid: boolean) => void | Promise<void>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  className?: string
}

export function SectionedForm({
  id,
  fields,
  initialData,
  onSubmit,
  validateOnChange,
  validateOnBlur,
  className,
}: SectionedFormProps) {
  // Group fields by section
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || 'General'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(field)
    return acc
  }, {} as Record<string, FormField[]>)

  const sectionOrder = [
    'Información Básica',
    'Clasificación y Procesamiento',
    'Asignación Organizacional',
    'Información de Pago',
    'Requisitos e Instrucciones',
    'Portales Gubernamentales',
    'Información Adicional',
    'General'
  ]

  const orderedSections = sectionOrder.filter(section => groupedFields[section])

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Progress indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">📋</span>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Formulario de Trámite</h4>
            <p className="text-xs text-blue-700 mt-1">
              Complete todos los campos requeridos organizados por secciones
            </p>
          </div>
        </div>
      </div>

      {/* Sectioned Form */}
      <Form
        id={id}
        fields={fields}
        initialData={initialData}
        onSubmit={onSubmit}
        validateOnChange={validateOnChange}
        validateOnBlur={validateOnBlur}
        renderCustom={(formFields, formProps) => (
          <form {...formProps} className="space-y-8">
            {orderedSections.map((sectionName, sectionIndex) => {
              const sectionFields = groupedFields[sectionName]
              const sectionIcons = {
                'Información Básica': '📝',
                'Clasificación y Procesamiento': '🏷️',
                'Asignación Organizacional': '🏢',
                'Información de Pago': '💰',
                'Requisitos e Instrucciones': '📋',
                'Portales Gubernamentales': '🌐',
                'Información Adicional': '📄',
                'General': '📁'
              }

              return (
                <div key={sectionName} className="bg-white border border-gray-200 rounded-lg p-6">
                  {/* Section Header */}
                  <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-gray-100">
                    <span className="text-lg">{sectionIcons[sectionName as keyof typeof sectionIcons] || '📁'}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{sectionName}</h3>
                      <p className="text-sm text-gray-500">
                        Sección {sectionIndex + 1} de {orderedSections.length}
                      </p>
                    </div>
                  </div>

                  {/* Section Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sectionFields.map((field) => {
                      const fieldComponent = formFields.find(f => f.key === field.name)
                      return fieldComponent ? (
                        <div 
                          key={field.name} 
                          className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                        >
                          {fieldComponent.component}
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )
            })}
          </form>
        )}
      />
    </div>
  )
}

export default SectionedForm
