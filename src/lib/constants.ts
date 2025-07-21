// Application constants for the Chía Portal

// Application Information
export const APP_CONFIG = {
  name: 'Portal de Atención Ciudadana - Chía',
  version: '1.0.0',
  description: 'Sistema municipal con IA integrada para la atención ciudadana de Chía',
  author: 'Alcaldía de Chía',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const

// User Roles
export const USER_ROLES = {
  CIUDADANO: 'ciudadano',
  FUNCIONARIO: 'funcionario',
  ADMIN: 'admin',
} as const

export const USER_ROLE_LABELS = {
  [USER_ROLES.CIUDADANO]: 'Ciudadano',
  [USER_ROLES.FUNCIONARIO]: 'Funcionario',
  [USER_ROLES.ADMIN]: 'Administrador',
} as const

// OPA States
export const OPA_ESTADOS = {
  BORRADOR: 'borrador',
  EN_REVISION: 'en_revision',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  PUBLICADO: 'publicado',
  ARCHIVADO: 'archivado',
} as const

export const OPA_ESTADO_LABELS = {
  [OPA_ESTADOS.BORRADOR]: 'Borrador',
  [OPA_ESTADOS.EN_REVISION]: 'En Revisión',
  [OPA_ESTADOS.APROBADO]: 'Aprobado',
  [OPA_ESTADOS.RECHAZADO]: 'Rechazado',
  [OPA_ESTADOS.PUBLICADO]: 'Publicado',
  [OPA_ESTADOS.ARCHIVADO]: 'Archivado',
} as const

// OPA Types
export const OPA_TIPOS = {
  SERVICIO: 'servicio',
  TRAMITE: 'tramite',
  CONSULTA: 'consulta',
  INFORMACION: 'informacion',
  OTRO: 'otro',
} as const

export const OPA_TIPO_LABELS = {
  [OPA_TIPOS.SERVICIO]: 'Servicio',
  [OPA_TIPOS.TRAMITE]: 'Trámite',
  [OPA_TIPOS.CONSULTA]: 'Consulta',
  [OPA_TIPOS.INFORMACION]: 'Información',
  [OPA_TIPOS.OTRO]: 'Otro',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  DEPENDENCIAS: '/api/dependencias',
  SUBDEPENDENCIAS: '/api/subdependencias',
  TRAMITES: '/api/tramites',
  OPAS: '/api/opas',
  FAQS: '/api/faqs',
  SEARCH: '/api/search',
  METRICS: '/api/metrics',
  CHAT: '/api/chat',
  USERS: '/api/users',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMITS: [10, 25, 50, 100],
} as const

// Search
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
  MAX_SUGGESTIONS: 5,
} as const

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
} as const

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+57|57)?[1-9]\d{9}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  CODIGO_REGEX: /^[A-Z0-9-]+$/,
} as const

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: {
    YELLOW: '#FFDC00',
    YELLOW_ALT: '#F8E000',
    YELLOW_DARK: '#E6C600',
    GREEN: '#009045',
    GREEN_ALT: '#009540',
    GREEN_DARK: '#007A3A',
    GREEN_LIGHT: '#00A84F',
  },
  SECONDARY: {
    BLUE: '#0066CC',
    BLUE_LIGHT: '#3385D6',
    GRAY: '#6B7280',
    GRAY_LIGHT: '#9CA3AF',
    GRAY_DARK: '#374151',
  },
  ACCENT: {
    ORANGE: '#F59E0B',
    RED: '#EF4444',
    PURPLE: '#8B5CF6',
  },
} as const

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  XS: 475,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
  '3XL': 1600,
} as const

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'chia_portal_auth_token',
  USER_PREFERENCES: 'chia_portal_user_preferences',
  THEME: 'chia_portal_theme',
  LANGUAGE: 'chia_portal_language',
  SEARCH_HISTORY: 'chia_portal_search_history',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
  NETWORK: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION: 'Por favor, verifica los datos ingresados.',
  SERVER: 'Error del servidor. Por favor, intenta más tarde.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Creado exitosamente.',
  UPDATED: 'Actualizado exitosamente.',
  DELETED: 'Eliminado exitosamente.',
  SAVED: 'Guardado exitosamente.',
  SENT: 'Enviado exitosamente.',
} as const

// Contact Information
export const CONTACT_INFO = {
  PHONE: '(601) 123-4567',
  EMAIL: 'info@chia.gov.co',
  ADDRESS: 'Carrera 11 # 17-25, Chía, Cundinamarca',
  HOURS: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
  SOCIAL: {
    FACEBOOK: 'https://facebook.com/alcaldiachia',
    TWITTER: 'https://twitter.com/alcaldiachia',
    INSTAGRAM: 'https://instagram.com/alcaldiachia',
    YOUTUBE: 'https://youtube.com/alcaldiachia',
  },
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_CHATBOT: process.env.NEXT_PUBLIC_ENABLE_AI_CHATBOT === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
} as const
