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
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-_]*$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos')
    .optional(), // Make codigo optional since it will be auto-generated
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
  dependencia_id: z.string()
    .min(1, 'Selecciona una dependencia'),
  subdependencia_id: z.string()
    .min(1, 'Selecciona una subdependencia'),
  categoria: z.enum(['atencion_ciudadana', 'servicios_publicos', 'cultura_deporte', 'salud', 'educacion', 'medio_ambiente', 'infraestructura', 'otros'], {
    required_error: 'Selecciona una categoría'
  }),
  activo: z.boolean(),
  requisitos: z.array(z.string()).optional(),
  instrucciones: z.array(z.string()).optional(), // Add instrucciones field
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
  const [filteredSubdependencias, setFilteredSubdependencias] = useState<Subdependencia[]>([])
  const [requisitos, setRequisitos] = useState<string[]>(initialData?.requisitos || [])
  const [newRequisito, setNewRequisito] = useState('')
  const [instrucciones, setInstrucciones] = useState<string[]>(initialData?.instrucciones || [])
  const [newInstruccion, setNewInstruccion] = useState('')

  // Helper function to get dependencia_id from subdependencia_id
  const getDependenciaIdFromSubdependencia = (subdependenciaId: string): string => {
    if (!subdependenciaId || !subdependencias.length) return ''
    const subdep = subdependencias.find(sub => sub.id === subdependenciaId)
    return subdep?.dependencia_id || ''
  }

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
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      // CRITICAL FIX: Robust service type initialization for OPA editing
      // Priority: serviceType prop > initialData.tipo > initialData.tipo_servicio > default 'tramite'
      tipo: serviceType ||
            (initialData?.tipo === 'opa' ? 'opa' :
             initialData?.tipo === 'tramite' ? 'tramite' :
             initialData?.tipo_servicio === 'opa' ? 'opa' :
             initialData?.tipo_servicio === 'servicio' ? 'tramite' :
             initialData?.tipo_servicio === 'tramite' ? 'tramite' : 'tramite'),
      codigo: mode === 'edit' ? initialData?.codigo : '', // Empty for create mode
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      formulario: '',
      tiempo_respuesta: initialData?.tiempo_respuesta || '',
      tiene_pago: initialData?.requiere_pago || false,
      // Fix: Get dependencia_id from subdependencia relationship or directly from initialData
      dependencia_id: initialData?.subdependencia?.dependencia_id ||
                     initialData?.dependencia_id ||
                     getDependenciaIdFromSubdependencia(initialData?.subdependencia_id || ''),
      // Fix: Get subdependencia_id from nested object or directly from initialData
      subdependencia_id: initialData?.subdependencia?.id || initialData?.subdependencia_id || '',
      categoria: (initialData?.categoria as any) || 'atencion_ciudadana',
      activo: initialData?.activo ?? true,
      requisitos: initialData?.requisitos || [],
      instrucciones: initialData?.instrucciones || [],
      visualizacion_suit: initialData?.url_suit || '',
      visualizacion_gov: initialData?.url_gov || ''
    }
  })

  const watchedTipo = watch('tipo')
  const watchedDependenciaId = watch('dependencia_id')

  // CRITICAL FIX: Reset form when initialData changes (for modal reuse)
  useEffect(() => {
    if (initialData) {
      // Calculate the correct service type using the same logic as defaultValues
      const resolvedTipo = serviceType ||
                          (initialData?.tipo === 'opa' ? 'opa' :
                           initialData?.tipo === 'tramite' ? 'tramite' :
                           initialData?.tipo_servicio === 'opa' ? 'opa' :
                           initialData?.tipo_servicio === 'servicio' ? 'tramite' :
                           initialData?.tipo_servicio === 'tramite' ? 'tramite' : 'tramite')

      // CRITICAL FIX: Update local state variables to match initialData
      const newRequisitos = initialData?.requisitos || []

      const newInstrucciones = initialData?.instrucciones || []

      setRequisitos(newRequisitos)
      setInstrucciones(newInstrucciones)

      // Reset form with new values
      reset({
        tipo: resolvedTipo,
        codigo: mode === 'edit' ? initialData?.codigo : '',
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || '',
        formulario: '',
        tiempo_respuesta: initialData?.tiempo_respuesta || '',
        tiene_pago: initialData?.requiere_pago || false,
        dependencia_id: initialData?.subdependencia?.dependencia_id ||
                       initialData?.dependencia_id ||
                       getDependenciaIdFromSubdependencia(initialData?.subdependencia_id || ''),
        subdependencia_id: initialData?.subdependencia?.id || initialData?.subdependencia_id || '',
        categoria: (initialData?.categoria as any) || 'atencion_ciudadana',
        activo: initialData?.activo ?? true,
        requisitos: newRequisitos,
        instrucciones: newInstrucciones,
        visualizacion_suit: initialData?.url_suit || '',
        visualizacion_gov: initialData?.url_gov || ''
      })
    }
  }, [initialData, serviceType, mode, reset])

  // Initialize form with proper dependencia_id in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.subdependencia_id && subdependencias.length > 0) {
      const subdep = subdependencias.find(sub => sub.id === initialData.subdependencia_id)
      if (subdep && subdep.dependencia_id) {
        const currentDependenciaId = watch('dependencia_id')
        if (!currentDependenciaId || currentDependenciaId !== subdep.dependencia_id) {
          setValue('dependencia_id', subdep.dependencia_id, { shouldValidate: true })
        }
      }
    }
  }, [mode, initialData, subdependencias, setValue, watch])

  // Filter subdependencias based on selected dependencia
  useEffect(() => {
    if (watchedDependenciaId) {
      const filtered = subdependencias.filter(sub => sub.dependencia_id === watchedDependenciaId)
      setFilteredSubdependencias(filtered)
      // Reset subdependencia when dependencia changes (but not during initial load)
      if (filtered.length > 0) {
        const currentSubdep = filtered.find(sub => sub.id === watch('subdependencia_id'))
        if (!currentSubdep && mode === 'create') {
          setValue('subdependencia_id', '', { shouldValidate: true })
        }
      }
    } else {
      setFilteredSubdependencias([])
      if (mode === 'create') {
        setValue('subdependencia_id', '', { shouldValidate: true })
      }
    }
  }, [watchedDependenciaId, subdependencias, setValue, watch, mode])

  // Sync array changes with form state to trigger validation
  useEffect(() => {
    setValue('requisitos', requisitos, { shouldDirty: true, shouldValidate: true })
  }, [requisitos, setValue])

  useEffect(() => {

    setValue('instrucciones', instrucciones, { shouldDirty: true, shouldValidate: true })
  }, [instrucciones, setValue])

  // Handle dependencia change - now handled by React Hook Form Controller

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

  // Handle instrucciones
  const addInstruccion = useCallback(() => {
    if (newInstruccion.trim() && !instrucciones.includes(newInstruccion.trim())) {
      const updatedInstrucciones = [...instrucciones, newInstruccion.trim()]
      setInstrucciones(updatedInstrucciones)
      setValue('instrucciones', updatedInstrucciones)
      setNewInstruccion('')
    }
  }, [newInstruccion, instrucciones, setValue])

  const removeInstruccion = useCallback((index: number) => {
    const updatedInstrucciones = instrucciones.filter((_, i) => i !== index)
    setInstrucciones(updatedInstrucciones)
    setValue('instrucciones', updatedInstrucciones)
  }, [instrucciones, setValue])

  // Form submission
  const onFormSubmit = useCallback(async (data: ServiceFormData) => {
    try {
      if (mode === 'create') {
        const createData: CreateServiceData = {
          tipo: data.tipo,
          codigo: data.codigo || undefined, // Let it be auto-generated if empty
          nombre: data.nombre,
          descripcion: data.descripcion,
          formulario: data.formulario,
          tiempo_respuesta: data.tiempo_respuesta,
          tiene_pago: data.tiene_pago,
          subdependencia_id: data.subdependencia_id,
          categoria: data.categoria,
          activo: data.activo,
          requisitos: requisitos.length > 0 ? requisitos : undefined, // Use state requisitos
          instrucciones: instrucciones.length > 0 ? instrucciones : undefined, // Use state instrucciones
          visualizacion_suit: data.visualizacion_suit || undefined,
          visualizacion_gov: data.visualizacion_gov || undefined
        }
        await onSubmit(createData)
      } else {
        // Validate that we have an ID for update mode
        if (!initialData?.id) {
          throw new Error('Service ID is required for update operation')
        }

        const updateData: UpdateServiceData = {
          id: initialData.id,
          tipo: data.tipo,
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion,
          formulario: data.formulario,
          tiempo_respuesta: data.tiempo_respuesta,
          tiene_pago: data.tiene_pago,
          subdependencia_id: data.subdependencia_id,
          categoria: data.categoria,
          activo: data.activo,
          requisitos: requisitos.length > 0 ? requisitos : undefined, // Use state requisitos
          instrucciones: instrucciones.length > 0 ? instrucciones : undefined, // Use state instrucciones
          visualizacion_suit: data.visualizacion_suit || undefined,
          visualizacion_gov: data.visualizacion_gov || undefined
        }

        console.log('🔧 Form submitting update data:', updateData)
        await onSubmit(updateData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }, [mode, initialData, onSubmit, requisitos, instrucciones])

  // Service type options
  const tipoOptions = [
    { value: 'tramite', label: 'Trámite' },
    { value: 'opa', label: 'OPA (Otros Procedimientos Administrativos)' }
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
                  data-testid="tipo-select"
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
                    disabled={loading}
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

        {/* INFORMACIÓN BÁSICA */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              📋 Información Básica
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Datos principales del servicio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código Inmutable */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Código del Servicio
              </label>
              <div className="relative">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="font-mono text-lg font-semibold text-gray-900">
                    {mode === 'edit' && initialData?.codigo
                      ? initialData.codigo
                      : 'XXX-XXX-XXX'
                    }
                  </span>
                  <div className="flex items-center text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {mode === 'create'
                    ? 'Se generará automáticamente al crear el servicio'
                    : 'Código inmutable - No se puede modificar'
                  }
                </p>
                {mode === 'create' && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    <strong>Formato:</strong> [Dependencia]-[Subdependencia]-[Consecutivo]
                    <br />
                    <strong>Ejemplo:</strong> 080-081-001
                  </div>
                )}
              </div>
            </div>

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
                data-testid="nombre-input"
              />
            )}
          />
        </div>

        {/* ORGANIZACIÓN */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              🏢 Organización
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Dependencia y subdependencia responsable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="dependencia_id"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dependencia *
                  </label>
                  <Select
                    {...field}
                    options={dependenciaOptions}
                    disabled={loading}
                    error={errors.dependencia_id?.message}
                    data-testid="dependencia-select"
                  />
                </div>
              )}
            />

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
                    disabled={loading || !watchedDependenciaId}
                    error={errors.subdependencia_id?.message}
                    data-testid="subdependencia-select"
                  />
                </div>
              )}
            />
          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              ⚙️ Configuración
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Configuración específica del servicio
            </p>
          </div>

          {/* Descripción y Formulario */}
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

          {/* Categoría del Servicio */}
          <Controller
            name="categoria"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría del Servicio *
                </label>
                <Select
                  {...field}
                  options={[
                    { value: 'atencion_ciudadana', label: 'Atención Ciudadana' },
                    { value: 'servicios_publicos', label: 'Servicios Públicos' },
                    { value: 'cultura_deporte', label: 'Cultura y Deporte' },
                    { value: 'salud', label: 'Salud' },
                    { value: 'educacion', label: 'Educación' },
                    { value: 'medio_ambiente', label: 'Medio Ambiente' },
                    { value: 'infraestructura', label: 'Infraestructura' },
                    { value: 'otros', label: 'Otros' }
                  ]}
                  disabled={loading}
                  error={errors.categoria?.message}
                  helperText="Selecciona la categoría que mejor describe el servicio"
                />
              </div>
            )}
          />

          {/* Configuración de Pago y Tiempo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="tiene_pago"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Información de Pago
                  </label>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                      aria-label="Este servicio tiene costo"
                    />
                    <span className="text-sm text-gray-700">
                      Este servicio tiene costo
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Marcar si el servicio requiere pago de derechos
                  </p>
                </div>
              )}
            />

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Estado del Servicio
              </label>
              <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Activo</span>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600 font-medium">
                      {mode === 'create' ? 'Se activará al crear' : 'Configurado'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Los servicios se crean activos por defecto
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ENLACES GUBERNAMENTALES */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              🔗 Enlaces Gubernamentales
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Enlaces a portales oficiales (opcional)
            </p>
          </div>

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
              onKeyDown={(e) => {
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
                    X
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instrucciones
          </label>

          {/* Add new instruction */}
          <div className="flex space-x-2 mb-3">
            <Input
              type="text"
              placeholder="Agregar nueva instrucción"
              value={newInstruccion}
              onChange={(e) => setNewInstruccion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addInstruccion()
                }
              }}
              disabled={loading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addInstruccion}
              disabled={loading || !newInstruccion.trim()}
            >
              Agregar
            </Button>
          </div>

          {/* Instructions list */}
          {instrucciones.length > 0 && (
            <div className="space-y-2">
              {instrucciones.map((instruccion, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-700">{instruccion}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruccion(index)}
                    disabled={loading}
                  >
                    X
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
            isLoading={loading}
            disabled={mode === 'create' ? !isValid : (!isValid || !isDirty)}
            data-testid="submit-button"
          >
            {mode === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default UnifiedServiceForm
