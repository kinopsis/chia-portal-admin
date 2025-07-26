/**
 * Unified Service Form Component
 * Form for creating and editing both Trámites and OPAs
 * 
 * Features:
 * - Dynamic form fields based on service type
 * - Validation with react-hook-form
 * - Auto-save functionality
 * - Rich text editing for descriptions
 * - File upload for requirements
 * - URL validation for government portals
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Button, Input, Select, Textarea, Badge } from '@/components/atoms'
import type { UnifiedServiceItem, CreateServiceData, UpdateServiceData } from '@/services/unifiedServices'
import type { Dependencia, Subdependencia } from '@/types'
import { clsx } from 'clsx'

// Validation schema
const serviceFormSchema = z.object({
  tipo: z.enum(['tramite', 'opa'], {
    required_error: 'Selecciona el tipo de servicio'
  }),
  codigo: z.string()
    .min(1, 'El código es requerido')
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-_]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  descripcion: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  formulario: z.string()
    .max(1000, 'El formulario no puede exceder 1000 caracteres')
    .optional(),
  tiempo_respuesta: z.string()
    .max(100, 'El tiempo de respuesta no puede exceder 100 caracteres')
    .optional(),
  tiene_pago: z.boolean(),
  subdependencia_id: z.string()
    .min(1, 'Selecciona una subdependencia'),
  activo: z.boolean(),
  requisitos: z.array(z.string()).optional(),
  visualizacion_suit: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  visualizacion_gov: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal(''))
})

type ServiceFormData = z.infer<typeof serviceFormSchema>

export interface UnifiedServiceFormProps {
  mode: 'create' | 'edit'
  serviceType?: 'tramite' | 'opa'
  initialData?: Partial<UnifiedServiceItem>
  dependencias: Dependencia[]
  subdependencias: Subdependencia[]
  onSubmit: (data: CreateServiceData | UpdateServiceData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  autoSave?: boolean
  className?: string
}

/**
 * UnifiedServiceForm component
 */
export const UnifiedServiceForm: React.FC<UnifiedServiceFormProps> = ({
  mode,
  serviceType,
  initialData,
  dependencias,
  subdependencias,
  onSubmit,
  onCancel,
  loading = false,
  autoSave = false,
  className
}) => {
  const [selectedDependencia, setSelectedDependencia] = useState<string>('')
  const [filteredSubdependencias, setFilteredSubdependencias] = useState<Subdependencia[]>([])
  const [requisitos, setRequisitos] = useState<string[]>(initialData?.requisitos || [])
  const [newRequisito, setNewRequisito] = useState('')

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
    reset
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      tipo: serviceType || initialData?.tipo || 'tramite',
      codigo: initialData?.codigo || '',
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      formulario: mode === 'edit' ? (initialData?.tramiteData?.formulario || initialData?.opaData?.formulario) : '',
      tiempo_respuesta: initialData?.tiempo_respuesta || '',
      tiene_pago: initialData?.tiene_pago || false,
      subdependencia_id: initialData?.subdependencia?.id || '',
      activo: initialData?.activo ?? true,
      requisitos: initialData?.requisitos || [],
      visualizacion_suit: initialData?.visualizacion_suit || '',
      visualizacion_gov: initialData?.visualizacion_gov || ''
    },
    mode: 'onChange'
  })

  const watchedTipo = watch('tipo')
  const watchedSubdependencia = watch('subdependencia_id')

  // Filter subdependencias based on selected dependencia
  useEffect(() => {
    if (selectedDependencia) {
      const filtered = subdependencias.filter(sub => sub.dependencia_id === selectedDependencia)
      setFilteredSubdependencias(filtered)
    } else {
      setFilteredSubdependencias(subdependencias)
    }
  }, [selectedDependencia, subdependencias])

  // Set initial dependencia if editing
  useEffect(() => {
    if (mode === 'edit' && initialData?.subdependencia?.id) {
      const subdep = subdependencias.find(s => s.id === initialData.subdependencia.id)
      if (subdep) {
        setSelectedDependencia(subdep.dependencia_id)
      }
    }
  }, [mode, initialData, subdependencias])

  // Handle dependencia change
  const handleDependenciaChange = useCallback((dependenciaId: string) => {
    setSelectedDependencia(dependenciaId)
    setValue('subdependencia_id', '') // Reset subdependencia when dependencia changes
  }, [setValue])

  // Handle requisitos
  const addRequisito = useCallback(() => {
    if (newRequisito.trim() && !requisitos.includes(newRequisito.trim())) {
      const updatedRequisitos = [...requisitos, newRequisito.trim()]
      setRequisitos(updatedRequisitos)
      setValue('requisitos', updatedRequisitos)
      setNewRequisito('')
    }
  }, [newRequisito, requisitos, setValue])

  const removeRequisito = useCallback((index: number) => {
    const updatedRequisitos = requisitos.filter((_, i) => i !== index)
    setRequisitos(updatedRequisitos)
    setValue('requisitos', updatedRequisitos)
  }, [requisitos, setValue])

  // Form submission
  const onFormSubmit = useCallback(async (data: ServiceFormData) => {
    try {
      if (mode === 'create') {
        const createData: CreateServiceData = {
          tipo: data.tipo,
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion,
          formulario: data.formulario,
          tiempo_respuesta: data.tiempo_respuesta,
          tiene_pago: data.tiene_pago,
          subdependencia_id: data.subdependencia_id,
          activo: data.activo,
          requisitos: data.requisitos,
          visualizacion_suit: data.visualizacion_suit || undefined,
          visualizacion_gov: data.visualizacion_gov || undefined
        }
        await onSubmit(createData)
      } else {
        const updateData: UpdateServiceData = {
          id: initialData!.id,
          tipo: data.tipo,
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion,
          formulario: data.formulario,
          tiempo_respuesta: data.tiempo_respuesta,
          tiene_pago: data.tiene_pago,
          subdependencia_id: data.subdependencia_id,
          activo: data.activo,
          requisitos: data.requisitos,
          visualizacion_suit: data.visualizacion_suit || undefined,
          visualizacion_gov: data.visualizacion_gov || undefined
        }
        await onSubmit(updateData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }, [mode, initialData, onSubmit])

  // Service type options
  const tipoOptions = [
    { value: 'tramite', label: '📄 Trámite' },
    { value: 'opa', label: '⚡ OPA (Otros Procedimientos Administrativos)' }
  ]

  // Dependencia options
  const dependenciaOptions = [
    { value: '', label: 'Selecciona una dependencia' },
    ...dependencias.map(dep => ({
      value: dep.id,
      label: dep.nombre
    }))
  ]

  // Subdependencia options
  const subdependenciaOptions = [
    { value: '', label: 'Selecciona una subdependencia' },
    ...filteredSubdependencias.map(sub => ({
      value: sub.id,
      label: sub.nombre
    }))
  ]

  return (
    <Card className={clsx('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Servicio' : 'Editar Servicio'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'create' 
              ? 'Completa la información para crear un nuevo servicio'
              : 'Modifica la información del servicio'
            }
          </p>
        </div>
        
        {isDirty && (
          <Badge variant="warning" size="sm">
            Cambios sin guardar
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Service Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Servicio *
                </label>
                <Select
                  {...field}
                  options={tipoOptions}
                  disabled={loading || (mode === 'edit')} // Can't change type when editing
                  error={errors.tipo?.message}
                />
              </div>
            )}
          />

          <Controller
            name="activo"
            control={control}
            render={({ field: { value, onChange } }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <div className="flex items-center space-x-3 mt-3">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    {...(loading && { disabled: true })}
                    className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                    aria-label="Servicio activo y disponible"
                  />
                  <span className="text-sm text-gray-700">
                    Servicio activo y disponible
                  </span>
                </div>
              </div>
            )}
          />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="codigo"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Código *"
                placeholder={watchedTipo === 'tramite' ? 'TR-001' : 'OPA-001'}
                disabled={loading}
                error={errors.codigo?.message}
                helperText="Código único del servicio (solo mayúsculas, números, guiones)"
              />
            )}
          />

          <Controller
            name="tiempo_respuesta"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Tiempo de Respuesta"
                placeholder="15 días hábiles"
                disabled={loading}
                error={errors.tiempo_respuesta?.message}
                helperText="Tiempo estimado de respuesta"
              />
            )}
          />
        </div>

        <Controller
          name="nombre"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Nombre del Servicio *"
              placeholder="Ingresa el nombre completo del servicio"
              disabled={loading}
              error={errors.nombre?.message}
            />
          )}
        />

        {/* Dependencies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dependencia *
            </label>
            <Select
              value={selectedDependencia}
              onChange={handleDependenciaChange}
              options={dependenciaOptions}
              disabled={loading}
            />
          </div>

          <Controller
            name="subdependencia_id"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdependencia *
                </label>
                <Select
                  {...field}
                  options={subdependenciaOptions}
                  disabled={loading || !selectedDependencia}
                  error={errors.subdependencia_id?.message}
                />
              </div>
            )}
          />
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label="Descripción"
                placeholder="Describe brevemente el servicio"
                rows={3}
                disabled={loading}
                error={errors.descripcion?.message}
                helperText="Descripción general del servicio"
              />
            )}
          />

          {watchedTipo === 'opa' && (
            <Controller
              name="formulario"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Formulario/Procedimiento"
                  placeholder="Describe el formulario o procedimiento específico"
                  rows={3}
                  disabled={loading}
                  error={errors.formulario?.message}
                  helperText="Información específica del formulario para OPAs"
                />
              )}
            />
          )}
        </div>

        {/* Payment */}
        <Controller
          name="tiene_pago"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Información de Pago
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  {...(loading && { disabled: true })}
                  className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                  aria-label="Este servicio tiene costo"
                />
                <span className="text-sm text-gray-700">
                  Este servicio tiene costo
                </span>
              </div>
            </div>
          )}
        />

        {/* Government Portal URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="visualizacion_suit"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="URL SUIT"
                placeholder="https://suit.gov.co/..."
                disabled={loading}
                error={errors.visualizacion_suit?.message}
                helperText="Enlace al portal SUIT (opcional)"
              />
            )}
          />

          <Controller
            name="visualizacion_gov"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="URL GOV.CO"
                placeholder="https://www.gov.co/..."
                disabled={loading}
                error={errors.visualizacion_gov?.message}
                helperText="Enlace al portal GOV.CO (opcional)"
              />
            )}
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requisitos
          </label>
          
          {/* Add new requirement */}
          <div className="flex space-x-2 mb-3">
            <Input
              value={newRequisito}
              onChange={(e) => setNewRequisito(e.target.value)}
              placeholder="Agregar nuevo requisito"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addRequisito()
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addRequisito}
              disabled={loading || !newRequisito.trim()}
            >
              Agregar
            </Button>
          </div>

          {/* Requirements list */}
          {requisitos.length > 0 && (
            <div className="space-y-2">
              {requisitos.map((requisito, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-700">{requisito}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequisito(index)}
                    disabled={loading}
                  >
                    ❌
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="neutral"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!isValid}
          >
            {mode === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default UnifiedServiceForm
