// Custom hooks exports

export { useAuth } from './useAuth'
export {
  default as useBreadcrumbs,
  useAdminBreadcrumbs,
  useUserBreadcrumbs,
  usePublicBreadcrumbs,
} from './useBreadcrumbs'

export { default as useAsyncOperation } from './useAsyncOperation'
export type {
  AsyncOperationState,
  AsyncOperationOptions,
  UseAsyncOperationReturn,
} from './useAsyncOperation'

export { default as useBreakpoint } from './useBreakpoint'
export type { Breakpoint, BreakpointConfig, UseBreakpointReturn } from './useBreakpoint'
export { default as useSystemMetrics } from './useSystemMetrics'
export type { SystemMetrics, MetricsFilters } from './useSystemMetrics'

// Sprint 2.1: Smart Search and Enhanced UX Hooks
export { useDebounce } from './useDebounce'
export type {
  SmartSearchConfig,
  SmartSearchState,
  SmartSearchActions
} from './useSmartSearch'
export { default as useSmartSearch } from './useSmartSearch'

// Additional hooks can be added here as they are created
// export { useLocalStorage } from './useLocalStorage'
// export { useApi } from './useApi'
