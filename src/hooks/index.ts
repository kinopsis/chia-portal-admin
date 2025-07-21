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

// Additional hooks can be added here as they are created
// export { useLocalStorage } from './useLocalStorage'
// export { useDebounce } from './useDebounce'
// export { useApi } from './useApi'
