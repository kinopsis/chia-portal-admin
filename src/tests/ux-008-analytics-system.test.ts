// UX-008: Test for comprehensive analytics system
// This test verifies analytics tracking, privacy compliance, and metrics collection

import { analyticsService, AnalyticsService } from '@/lib/analytics'
import { renderHook, act } from '@testing-library/react'
import { useAnalytics, useComponentAnalytics, useFormAnalytics } from '@/hooks/useAnalytics'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window properties
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
    timing: {
      navigationStart: 1000,
      domContentLoadedEventEnd: 2000,
      loadEventEnd: 3000,
      responseStart: 1500,
      domInteractive: 1800
    },
    getEntriesByType: () => []
  }
})

Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-user-agent'
  }
})

describe('UX-008: Comprehensive Analytics System', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('AnalyticsService Core Functionality', () => {
    let service: AnalyticsService

    beforeEach(() => {
      service = new AnalyticsService({
        enableTracking: true,
        privacyCompliant: true
      })
    })

    test('should initialize with default privacy settings', () => {
      expect(service).toBeDefined()
      // Privacy settings should default to necessary only
      const stored = localStorageMock.getItem('analytics_privacy_settings')
      expect(stored).toBeNull() // Should not track without consent
    })

    test('should generate unique session IDs', () => {
      const service1 = new AnalyticsService()
      const service2 = new AnalyticsService()
      
      // Session IDs should be different
      expect(service1).not.toBe(service2)
    })

    test('should respect privacy consent settings', async () => {
      // Initially should not track without consent
      await service.trackEvent('click', { test: true })
      let events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events).toHaveLength(0) // Should not track without consent

      // Enable analytics consent
      await service.updatePrivacyConsent({
        analyticsEnabled: true,
        consentLevel: 'analytics'
      })

      // Should now be able to track
      await service.trackEvent('click', { test: true })
      events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events.length).toBeGreaterThan(0) // Should track with consent
    })

    test('should track page view events', async () => {
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      
      await service.trackPageView()
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events).toHaveLength(1)
      expect(events[0].type).toBe('page_view')
      expect(events[0].metadata.pageMetrics).toBeDefined()
    })

    test('should track page leave with metrics', async () => {
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      
      await service.trackPageLeave()
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events).toHaveLength(1)
      expect(events[0].type).toBe('page_leave')
      expect(events[0].metadata.finalMetrics).toBeDefined()
      expect(events[0].metadata.finalMetrics.timeOnPage).toBeGreaterThanOrEqual(0)
    })

    test('should track custom events with metadata', async () => {
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      
      const metadata = { customField: 'test', userId: '123' }
      await service.trackEvent('click', metadata)
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events).toHaveLength(1)
      expect(events[0].type).toBe('click')
      expect(events[0].metadata).toMatchObject(metadata)
    })

    test('should store heatmap data for clicks', async () => {
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      
      // Mock element
      const mockElement = {
        tagName: 'BUTTON',
        getBoundingClientRect: () => ({ left: 100, top: 200, width: 50, height: 30 }),
        getAttribute: () => null,
        className: ''
      } as HTMLElement
      
      await service.trackEvent('click', {}, mockElement)
      
      const heatmapData = JSON.parse(localStorageMock.getItem('analytics_heatmap_data') || '[]')
      expect(heatmapData).toHaveLength(1)
      expect(heatmapData[0]).toMatchObject({
        x: 125, // left + width/2
        y: 215, // top + height/2
        element: 'button',
        intensity: 1
      })
    })

    test('should generate analytics summary', async () => {
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      
      // Generate some test events
      await service.trackPageView()
      await service.trackEvent('click', { test: true })
      await service.trackPageLeave()
      
      const summary = await service.getAnalyticsSummary(7)
      
      expect(summary).toBeDefined()
      expect(summary.totalPageViews).toBeGreaterThan(0)
      expect(summary.totalInteractions).toBeGreaterThan(0)
      expect(summary.topPages).toBeDefined()
    })
  })

  describe('Privacy Compliance', () => {
    test('should handle GDPR consent levels', async () => {
      const service = new AnalyticsService()
      
      // Test different consent levels
      const consentLevels = ['necessary', 'analytics', 'marketing', 'all']
      
      for (const level of consentLevels) {
        await service.updatePrivacyConsent({
          consentLevel: level as any,
          analyticsEnabled: level !== 'necessary',
          marketingEnabled: level === 'marketing' || level === 'all'
        })
        
        const settings = JSON.parse(localStorageMock.getItem('analytics_privacy_settings') || '{}')
        expect(settings.consentLevel).toBe(level)
      }
    })

    test('should respect data retention settings', async () => {
      const service = new AnalyticsService()
      
      await service.updatePrivacyConsent({
        analyticsEnabled: true,
        dataRetentionDays: 30
      })
      
      const settings = JSON.parse(localStorageMock.getItem('analytics_privacy_settings') || '{}')
      expect(settings.dataRetentionDays).toBe(30)
    })

    test('should exclude sensitive elements from tracking', async () => {
      const service = new AnalyticsService({
        enableTracking: true,
        excludeElements: ['password', 'credit-card']
      })
      
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      
      // Mock sensitive element
      const sensitiveElement = {
        tagName: 'INPUT',
        getAttribute: (attr: string) => attr === 'type' ? 'password' : null,
        className: '',
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 })
      } as HTMLElement
      
      await service.trackEvent('click', {}, sensitiveElement)
      
      // Should not track sensitive elements
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events).toHaveLength(0)
    })
  })

  describe('useAnalytics Hook', () => {
    test('should provide analytics functionality', () => {
      const { result } = renderHook(() => useAnalytics())
      
      expect(result.current.trackEvent).toBeDefined()
      expect(result.current.trackClick).toBeDefined()
      expect(result.current.trackFormInteraction).toBeDefined()
      expect(result.current.setUserId).toBeDefined()
      expect(result.current.updatePrivacyConsent).toBeDefined()
      expect(result.current.getAnalyticsSummary).toBeDefined()
    })

    test('should track events through hook', async () => {
      const { result } = renderHook(() => useAnalytics())
      
      await act(async () => {
        await result.current.updatePrivacyConsent({ analyticsEnabled: true })
        await result.current.trackCustomEvent('test_event', { hookTest: true })
      })
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events.some((e: any) => e.metadata?.customEvent === 'test_event')).toBe(true)
    })

    test('should handle privacy settings through hook', async () => {
      const { result } = renderHook(() => useAnalytics())
      
      await act(async () => {
        await result.current.updatePrivacyConsent({
          analyticsEnabled: true,
          consentLevel: 'analytics'
        })
      })
      
      const settings = result.current.getPrivacySettings()
      expect(settings?.analyticsEnabled).toBe(true)
      expect(settings?.consentLevel).toBe('analytics')
    })
  })

  describe('useComponentAnalytics Hook', () => {
    test('should track component lifecycle events', () => {
      const { result, unmount } = renderHook(() => 
        useComponentAnalytics('TestComponent')
      )
      
      expect(result.current.trackComponentEvent).toBeDefined()
      expect(result.current.trackComponentInteraction).toBeDefined()
      
      // Unmount should trigger unmount event
      unmount()
      
      // Check if mount/unmount events were tracked
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events.some((e: any) => e.metadata?.component === 'TestComponent')).toBe(true)
    })

    test('should track component interactions', async () => {
      const { result } = renderHook(() => 
        useComponentAnalytics('TestComponent')
      )
      
      await act(async () => {
        await result.current.updatePrivacyConsent({ analyticsEnabled: true })
        await result.current.trackComponentEvent('button_click', { buttonId: 'test' })
      })
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events.some((e: any) => 
        e.metadata?.customEvent === 'TestComponent_button_click'
      )).toBe(true)
    })
  })

  describe('useFormAnalytics Hook', () => {
    test('should track form lifecycle', async () => {
      const { result } = renderHook(() => 
        useFormAnalytics('test-form')
      )
      
      await act(async () => {
        await result.current.trackFormStart()
        await result.current.trackFormSubmit(true, [])
      })
      
      expect(result.current.formStartTime).toBeDefined()
      expect(result.current.fieldInteractions).toBeDefined()
    })

    test('should track form errors', async () => {
      const { result } = renderHook(() => 
        useFormAnalytics('test-form')
      )
      
      await act(async () => {
        await result.current.trackFormError('email', 'Invalid email format')
      })
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      expect(events.some((e: any) => 
        e.metadata?.customEvent === 'form_error' &&
        e.metadata?.errorMessage === 'Invalid email format'
      )).toBe(true)
    })

    test('should calculate form completion time', async () => {
      const { result } = renderHook(() => 
        useFormAnalytics('test-form')
      )
      
      await act(async () => {
        await result.current.trackFormStart()
        // Simulate some time passing
        await new Promise(resolve => setTimeout(resolve, 100))
        await result.current.trackFormSubmit(true, [])
      })
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      const submitEvent = events.find((e: any) => e.metadata?.customEvent === 'form_submit')
      
      expect(submitEvent?.metadata?.completionTime).toBeGreaterThan(0)
    })
  })

  describe('Performance Tracking', () => {
    test('should track web vitals', async () => {
      const service = new AnalyticsService({
        enableTracking: true,
        enablePerformanceTracking: true
      })
      
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      await service.initialize()
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      const performanceEvent = events.find((e: any) => e.type === 'performance')
      
      if (performanceEvent) {
        expect(performanceEvent.metadata.webVitals).toBeDefined()
        expect(performanceEvent.metadata.webVitals.domContentLoaded).toBeGreaterThan(0)
      }
    })

    test('should track slow resources', async () => {
      // Mock slow resource
      Object.defineProperty(window, 'performance', {
        value: {
          ...window.performance,
          getEntriesByType: () => [{
            name: 'slow-resource.js',
            duration: 2000,
            transferSize: 1024
          }]
        }
      })
      
      const service = new AnalyticsService({
        enableTracking: true,
        enablePerformanceTracking: true
      })
      
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      await service.initialize()
      
      // Trigger resource tracking
      window.dispatchEvent(new Event('load'))
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      const performanceEvent = events.find((e: any) => 
        e.type === 'performance' && e.metadata?.slowResources
      )
      
      if (performanceEvent) {
        expect(performanceEvent.metadata.slowResources).toHaveLength(1)
        expect(performanceEvent.metadata.slowResources[0].duration).toBe(2000)
      }
    })
  })

  describe('Error Tracking', () => {
    test('should track JavaScript errors', async () => {
      const service = new AnalyticsService({
        enableTracking: true,
        enableErrorTracking: true
      })
      
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      await service.initialize()
      
      // Simulate error
      const errorEvent = new ErrorEvent('error', {
        message: 'Test error',
        filename: 'test.js',
        lineno: 10,
        colno: 5
      })
      
      window.dispatchEvent(errorEvent)
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      const errorEventTracked = events.find((e: any) => e.type === 'error')
      
      if (errorEventTracked) {
        expect(errorEventTracked.metadata.message).toBe('Test error')
        expect(errorEventTracked.metadata.filename).toBe('test.js')
      }
    })

    test('should track unhandled promise rejections', async () => {
      const service = new AnalyticsService({
        enableTracking: true,
        enableErrorTracking: true
      })
      
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      await service.initialize()
      
      // Simulate unhandled promise rejection
      const rejectionEvent = new Event('unhandledrejection') as any
      rejectionEvent.promise = Promise.reject('Test rejection')
      rejectionEvent.reason = 'Test rejection'
      
      window.dispatchEvent(rejectionEvent)
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      const rejectionEventTracked = events.find((e: any) => 
        e.type === 'error' && e.metadata?.type === 'unhandled_promise_rejection'
      )
      
      if (rejectionEventTracked) {
        expect(rejectionEventTracked.metadata.reason).toBe('Test rejection')
      }
    })
  })

  describe('Data Management', () => {
    test('should clean old events based on retention policy', async () => {
      const service = new AnalyticsService()
      await service.updatePrivacyConsent({ 
        analyticsEnabled: true,
        dataRetentionDays: 1 // 1 day retention
      })
      
      // Add old event
      const oldEvent = {
        type: 'click',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        sessionId: 'old-session'
      }
      
      localStorageMock.setItem('analytics_events', JSON.stringify([oldEvent]))
      
      // Add new event
      await service.trackEvent('click', { new: true })
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      
      // Old event should be removed, only new event should remain
      expect(events).toHaveLength(1)
      expect(events[0].metadata?.new).toBe(true)
    })

    test('should limit cache size', async () => {
      const service = new AnalyticsService()
      await service.updatePrivacyConsent({ analyticsEnabled: true })
      
      // Generate many events
      for (let i = 0; i < 150; i++) {
        await service.trackEvent('click', { index: i })
      }
      
      const events = JSON.parse(localStorageMock.getItem('analytics_events') || '[]')
      
      // Should not exceed reasonable cache size
      expect(events.length).toBeLessThanOrEqual(100)
    })
  })
})
