// Global type definitions for the Chía Portal

// User and Authentication Types
export interface User {
  id: string
  email: string
  nombre: string
  apellido?: string // Optional due to missing column in database
  rol: UserRole
  dependencia_id?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export type UserRole = 'ciudadano' | 'funcionario' | 'admin'

// Dependencias and Organization Types
export interface Dependencia {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  activa: boolean
  created_at: string
  updated_at: string
}

export interface Subdependencia {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  dependencia_id: string
  activa: boolean
  created_at: string
  updated_at: string
}

// Tramites Types
export interface Tramite {
  id: string
  codigo_unico: string
  nombre: string
  formulario?: string
  tiempo_respuesta?: string
  tiene_pago: boolean
  visualizacion_suit: boolean
  visualizacion_gov: boolean
  subdependencia_id: string
  activo: boolean
  created_at: string
  updated_at: string
  // Relations for display
  subdependencias?: {
    id: string
    codigo: string
    nombre: string
    dependencia_id: string
    dependencias?: {
      id: string
      codigo: string
      nombre: string
    }
  }
}

// OPAs Types
export interface OPA {
  id: string
  codigo_opa: string
  nombre: string
  subdependencia_id: string
  activo: boolean
  created_at: string
  updated_at: string
  // Relations for display
  subdependencias?: {
    id: string
    codigo: string
    nombre: string
    dependencia_id: string
    dependencias?: {
      id: string
      codigo: string
      nombre: string
    }
  }
}

export type OPAEstado = 'borrador' | 'en_revision' | 'aprobado' | 'rechazado' | 'publicado' | 'archivado'

export type OPATipo = 'servicio' | 'tramite' | 'consulta' | 'informacion' | 'otro'

// Temas Types for FAQ hierarchical structure
export interface Tema {
  id: string
  nombre: string
  descripcion?: string
  subdependencia_id: string
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
  // Relations for display
  subdependencias?: {
    id: string
    nombre: string
    codigo: string
    dependencia_id: string
    dependencias?: {
      id: string
      nombre: string
      codigo: string
    }
  }
  faqs_count?: number
}

// FAQs Types
export interface FAQ {
  id: string
  pregunta: string
  respuesta: string
  palabras_clave?: string[]
  dependencia_id: string
  subdependencia_id: string
  tema?: string // Legacy field - will be replaced by tema_id
  tema_id?: string // New field for hierarchical structure
  orden?: number
  activo: boolean
  created_at: string
  updated_at: string
  // Relations for display
  dependencias?: {
    id: string
    nombre: string
    codigo: string
  }
  subdependencias?: {
    id: string
    nombre: string
    codigo: string
    dependencia_id: string
  }
  temas?: {
    id: string
    nombre: string
    descripcion?: string
  }
}

// Hierarchical FAQ structure for display
export interface FAQHierarchy {
  dependencia: {
    id: string
    nombre: string
    codigo: string
  }
  subdependencias: {
    id: string
    nombre: string
    codigo: string
    temas: {
      id: string
      nombre: string
      descripcion?: string
      faqs: FAQ[]
    }[]
  }[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
  message?: string
}

// Search and Filter Types
export interface SearchFilters {
  query?: string
  dependencia_id?: string
  subdependencia_id?: string
  tipo?: string
  estado?: string
  activo?: boolean
}

export interface SearchResult {
  id: string
  type: 'tramite' | 'opa' | 'faq'
  title: string
  description: string
  url: string
  relevance: number
}

// System Metrics Types
export interface SystemMetrics {
  dependencias: number
  subdependencias: number
  tramites: number
  opas: number
  faqs: number
  usuarios: number
}

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'number'
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
  }
  helperText?: string
  disabled?: boolean
  fullWidth?: boolean
  rows?: number // for textarea
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: unknown
}

// Navigation Types
export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  children?: NavItem[]
  roles?: UserRole[]
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: {
      yellow: string
      'yellow-alt': string
      green: string
      'green-alt': string
    }
    secondary: Record<string, string>
    accent: Record<string, string>
  }
  fonts: {
    sans: string[]
    heading: string[]
  }
}
