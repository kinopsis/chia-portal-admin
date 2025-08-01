'use client'

/**
 * UX-008: Analytics Hook
 * React hook for easy analytics integration with components
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { analyticsService, AnalyticsEventType, PrivacySettings } from '@/lib/analytics'

// Hook configuration
export interface UseAnalyticsConfig {
  trackPageView?: boolean
  trackClicks?: boolean
  trackScrolling?: boolean
  trackFormInteractions?: boolean
  enableHeatmaps?: boolean
  autoInitialize?: boolean
}

// Analytics hook return type
export interface UseAnalyticsReturn {
  // Tracking methods
  trackEvent: (type: AnalyticsEventType, metadata?: Record<string, any>, element?: HTMLElement) => Promise<void>
  trackClick: (element: HTMLElement, metadata?: Record<string, any>) => Promise<void>
  trackFormInteraction: (element: HTMLElement, eventType: string) => Promise<void>
  trackCustomEvent: (eventName: string, metadata?: Record<string, any>) => Promise<void>
  
  // User management
  setUserId: (userId: string) => void
  
  // Privacy management
  updatePrivacyConsent: (settings: Partial<PrivacySettings>) => Promise<void>
  getPrivacySettings: () => PrivacySettings | null
  
  // Analytics data
  getAnalyticsSummary: (days?: number) => Promise<any>
  
  // State
  isInitialized: boolean
  isTrackingEnabled: boolean
}

// Default configuration
const DEFAULT_CONFIG: Required<UseAnalyticsConfig> = {
  trackPageView: true,
  trackClicks: true,
  trackScrolling: true,
  trackFormInteractions: true,
  enableHeatmaps: true,
  autoInitialize: true
}

/**
 * Analytics hook for React components
 */
export function useAnalytics(config: UseAnalyticsConfig = {}): UseAnalyticsReturn {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const [isInitialized, setIsInitialized] = useState(false)
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false)
  const initializationRef = useRef(false)

  // Initialize analytics service
  useEffect(() => {
    if (!finalConfig.autoInitialize || initializationRef.current) return

    const initializeAnalytics = async () => {
      try {
        await analyticsService.initialize()
        setIsInitialized(true)
        setIsTrackingEnabled(true)
        initializationRef.current = true
      } catch (error) {
        console.warn('Failed to initialize analytics:', error)
      }
    }

    initializeAnalytics()
  }, [finalConfig.autoInitialize])

  // Track page view on mount
  useEffect(() => {
    if (!finalConfig.trackPageView || !isInitialized) return

    const trackPageView = async () => {
      try {
        await analyticsService.trackPageView()
      } catch (error) {
        console.warn('Failed to track page view:', error)
      }
    }

    trackPageView()
  }, [finalConfig.trackPageView, isInitialized])

  // Track page leave on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        analyticsService.trackPageLeave()
      }
    }
  }, [isInitialized])

  // Track event wrapper
  const trackEvent = useCallback(async (
    type: AnalyticsEventType,
    metadata?: Record<string, any>,
    element?: HTMLElement
  ): Promise<void> => {
    if (!isTrackingEnabled) return

    try {
      await analyticsService.trackEvent(type, metadata, element)
    } catch (error) {
      console.warn('Failed to track event:', error)
    }
  }, [isTrackingEnabled])

  // Track click events
  const trackClick = useCallback(async (
    element: HTMLElement,
    metadata?: Record<string, any>
  ): Promise<void> => {
    if (!finalConfig.trackClicks) return

    await trackEvent('click', {
      elementText: element.textContent?.slice(0, 100),
      elementClass: element.className,
      elementId: element.id,
      ...metadata
    }, element)
  }, [trackEvent, finalConfig.trackClicks])

  // Track form interactions
  const trackFormInteraction = useCallback(async (
    element: HTMLElement,
    eventType: string
  ): Promise<void> => {
    if (!finalConfig.trackFormInteractions) return

    await trackEvent('form_interaction', {
      fieldType: element.getAttribute('type'),
      fieldName: element.getAttribute('name'),
      eventType,
      fieldValue: (element as HTMLInputElement).value?.length || 0 // Only track length, not actual value
    }, element)
  }, [trackEvent, finalConfig.trackFormInteractions])

  // Track custom events
  const trackCustomEvent = useCallback(async (
    eventName: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    await trackEvent('click', {
      customEvent: eventName,
      ...metadata
    })
  }, [trackEvent])

  // Set user ID
  const setUserId = useCallback((userId: string): void => {
    analyticsService.setUserId(userId)
  }, [])

  // Update privacy consent
  const updatePrivacyConsent = useCallback(async (
    settings: Partial<PrivacySettings>
  ): Promise<void> => {
    try {
      await analyticsService.updatePrivacyConsent(settings)
      setIsTrackingEnabled(settings.analyticsEnabled ?? isTrackingEnabled)
    } catch (error) {
      console.warn('Failed to update privacy consent:', error)
    }
  }, [isTrackingEnabled])

  // Get privacy settings
  const getPrivacySettings = useCallback((): PrivacySettings | null => {
    if (typeof localStorage === 'undefined') return null
    
    try {
      const stored = localStorage.getItem('analytics_privacy_settings')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to get privacy settings:', error)
      return null
    }
  }, [])

  // Get analytics summary
  const getAnalyticsSummary = useCallback(async (days: number = 7): Promise<any> => {
    try {
      return await analyticsService.getAnalyticsSummary(days)
    } catch (error) {
      console.warn('Failed to get analytics summary:', error)
      return null
    }
  }, [])

  return {
    trackEvent,
    trackClick,
    trackFormInteraction,
    trackCustomEvent,
    setUserId,
    updatePrivacyConsent,
    getPrivacySettings,
    getAnalyticsSummary,
    isInitialized,
    isTrackingEnabled
  }
}

/**
 * Hook for tracking specific component interactions
 */
export function useComponentAnalytics(componentName: string) {
  const analytics = useAnalytics()

  const trackComponentEvent = useCallback(async (
    action: string,
    metadata?: Record<string, any>
  ) => {
    await analytics.trackCustomEvent(`${componentName}_${action}`, {
      component: componentName,
      ...metadata
    })
  }, [analytics, componentName])

  const trackComponentMount = useCallback(async () => {
    await trackComponentEvent('mount')
  }, [trackComponentEvent])

  const trackComponentUnmount = useCallback(async () => {
    await trackComponentEvent('unmount')
  }, [trackComponentEvent])

  const trackComponentInteraction = useCallback(async (
    interactionType: string,
    element?: HTMLElement,
    metadata?: Record<string, any>
  ) => {
    await analytics.trackEvent('click', {
      component: componentName,
      interactionType,
      ...metadata
    }, element)
  }, [analytics, componentName])

  // Auto-track component lifecycle
  useEffect(() => {
    trackComponentMount()
    return () => {
      trackComponentUnmount()
    }
  }, [trackComponentMount, trackComponentUnmount])

  return {
    ...analytics,
    trackComponentEvent,
    trackComponentInteraction
  }
}

/**
 * Hook for tracking form analytics
 */
export function useFormAnalytics(formName: string) {
  const analytics = useAnalytics()
  const [formStartTime, setFormStartTime] = useState<number | null>(null)
  const [fieldInteractions, setFieldInteractions] = useState<Record<string, number>>({})

  const trackFormStart = useCallback(async () => {
    setFormStartTime(Date.now())
    await analytics.trackCustomEvent(`form_start`, {
      formName
    })
  }, [analytics, formName])

  const trackFormSubmit = useCallback(async (success: boolean, errors?: string[]) => {
    const completionTime = formStartTime ? Date.now() - formStartTime : 0
    
    await analytics.trackCustomEvent(`form_submit`, {
      formName,
      success,
      completionTime,
      fieldInteractions: Object.keys(fieldInteractions).length,
      errors
    })
  }, [analytics, formName, formStartTime, fieldInteractions])

  const trackFieldInteraction = useCallback(async (
    fieldName: string,
    element: HTMLElement,
    eventType: string
  ) => {
    setFieldInteractions(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || 0) + 1
    }))

    await analytics.trackFormInteraction(element, eventType)
  }, [analytics])

  const trackFormError = useCallback(async (
    fieldName: string,
    errorMessage: string
  ) => {
    await analytics.trackCustomEvent(`form_error`, {
      formName,
      fieldName,
      errorMessage
    })
  }, [analytics, formName])

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction,
    trackFormError,
    formStartTime,
    fieldInteractions
  }
}

/**
 * Hook for tracking search analytics (extends existing searchAnalytics)
 */
export function useSearchAnalytics() {
  const analytics = useAnalytics()

  const trackSearchQuery = useCallback(async (
    query: string,
    resultCount: number,
    source: string,
    duration?: number
  ) => {
    await analytics.trackCustomEvent('search_query', {
      query: query.toLowerCase().trim(),
      resultCount,
      source,
      duration
    })
  }, [analytics])

  const trackSearchFilter = useCallback(async (
    filterType: string,
    filterValue: string,
    resultCount: number
  ) => {
    await analytics.trackCustomEvent('search_filter', {
      filterType,
      filterValue,
      resultCount
    })
  }, [analytics])

  const trackSearchResult = useCallback(async (
    query: string,
    resultType: string,
    resultId: string,
    position: number
  ) => {
    await analytics.trackCustomEvent('search_result_click', {
      query: query.toLowerCase().trim(),
      resultType,
      resultId,
      position
    })
  }, [analytics])

  return {
    trackSearchQuery,
    trackSearchFilter,
    trackSearchResult
  }
}
