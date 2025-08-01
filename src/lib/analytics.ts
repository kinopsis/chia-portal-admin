'use client'

/**
 * UX-008: Comprehensive Analytics System
 * Implements tracking of user interactions, page metrics, heatmaps, and GDPR compliance
 */

import { config } from './config'

// Analytics event types
export type AnalyticsEventType = 
  | 'page_view'
  | 'page_leave'
  | 'click'
  | 'scroll'
  | 'form_interaction'
  | 'search'
  | 'filter_applied'
  | 'download'
  | 'error'
  | 'performance'

// User interaction event
export interface AnalyticsEvent {
  type: AnalyticsEventType
  timestamp: Date
  sessionId: string
  userId?: string
  page: string
  element?: string
  elementType?: string
  coordinates?: { x: number; y: number }
  metadata?: Record<string, any>
  userAgent?: string
  viewport?: { width: number; height: number }
  referrer?: string
}

// Page metrics interface
export interface PageMetrics {
  url: string
  title: string
  loadTime: number
  timeOnPage: number
  scrollDepth: number
  interactions: number
  bounceRate: boolean
  exitPage: boolean
  timestamp: Date
  sessionId: string
  userId?: string
}

// Heatmap data point
export interface HeatmapPoint {
  x: number
  y: number
  intensity: number
  element?: string
  timestamp: Date
  sessionId: string
  page: string
}

// Privacy consent levels
export type ConsentLevel = 'necessary' | 'analytics' | 'marketing' | 'all'

// Privacy settings
export interface PrivacySettings {
  consentLevel: ConsentLevel
  consentDate: Date
  analyticsEnabled: boolean
  marketingEnabled: boolean
  dataRetentionDays: number
}

// Analytics configuration
export interface AnalyticsConfig {
  enableTracking: boolean
  enableHeatmaps: boolean
  enablePerformanceTracking: boolean
  enableErrorTracking: boolean
  sampleRate: number
  privacyCompliant: boolean
  dataRetentionDays: number
  excludeElements: string[]
  trackingDomains: string[]
}

export class AnalyticsService {
  private sessionId: string
  private userId?: string
  private pageStartTime: number = Date.now()
  private scrollDepth: number = 0
  private interactions: number = 0
  private heatmapPoints: HeatmapPoint[] = []
  private eventQueue: AnalyticsEvent[] = []
  private privacySettings: PrivacySettings | null = null
  private config: AnalyticsConfig
  private isInitialized: boolean = false

  constructor(customConfig?: Partial<AnalyticsConfig>) {
    this.sessionId = this.generateSessionId()
    this.config = {
      enableTracking: config.analytics.enableTracking,
      enableHeatmaps: true,
      enablePerformanceTracking: config.analytics.enablePerformanceTracking,
      enableErrorTracking: true,
      sampleRate: 1.0,
      privacyCompliant: true,
      dataRetentionDays: 30,
      excludeElements: ['password', 'credit-card', 'ssn'],
      trackingDomains: [config.analytics.trackingDomain],
      ...customConfig
    }
    
    this.initializePrivacySettings()
  }

  /**
   * Initialize analytics with privacy compliance
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return

    try {
      // Check privacy consent
      await this.checkPrivacyConsent()
      
      if (!this.canTrack()) {
        console.log('Analytics tracking disabled due to privacy settings')
        return
      }

      // Set up event listeners
      this.setupEventListeners()
      
      // Track initial page view
      await this.trackPageView()
      
      // Initialize performance monitoring
      if (this.config.enablePerformanceTracking) {
        this.initializePerformanceTracking()
      }

      // Initialize error tracking
      if (this.config.enableErrorTracking) {
        this.initializeErrorTracking()
      }

      this.isInitialized = true
      console.log('Analytics initialized successfully')
      
    } catch (error) {
      console.warn('Failed to initialize analytics:', error)
    }
  }

  /**
   * Track a custom analytics event
   */
  async trackEvent(
    type: AnalyticsEventType,
    metadata?: Record<string, any>,
    element?: HTMLElement
  ): Promise<void> {
    if (!this.canTrack()) return

    try {
      const event: AnalyticsEvent = {
        type,
        timestamp: new Date(),
        sessionId: this.sessionId,
        userId: this.userId,
        page: window.location.pathname,
        element: element?.tagName?.toLowerCase(),
        elementType: element?.getAttribute?.('type') || undefined,
        coordinates: element ? this.getElementCoordinates(element) : undefined,
        metadata,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        referrer: document.referrer
      }

      // Add to queue for batch processing
      this.eventQueue.push(event)
      
      // Process queue if it's getting full
      if (this.eventQueue.length >= 10) {
        await this.processEventQueue()
      }

      // Track heatmap data for clicks
      if (type === 'click' && element && this.config.enableHeatmaps) {
        await this.trackHeatmapPoint(element)
      }

    } catch (error) {
      console.warn('Failed to track event:', error)
    }
  }

  /**
   * Track page view with timing metrics
   */
  async trackPageView(): Promise<void> {
    if (!this.canTrack()) return

    const loadTime = performance.timing ? 
      performance.timing.loadEventEnd - performance.timing.navigationStart : 0

    const pageMetrics: PageMetrics = {
      url: window.location.href,
      title: document.title,
      loadTime,
      timeOnPage: 0,
      scrollDepth: 0,
      interactions: 0,
      bounceRate: false,
      exitPage: false,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    await this.trackEvent('page_view', { pageMetrics })
    this.pageStartTime = Date.now()
  }

  /**
   * Track page leave with final metrics
   */
  async trackPageLeave(): Promise<void> {
    if (!this.canTrack()) return

    const timeOnPage = Date.now() - this.pageStartTime
    const bounceRate = this.interactions === 0 && timeOnPage < 30000 // Less than 30 seconds with no interactions

    const finalMetrics: PageMetrics = {
      url: window.location.href,
      title: document.title,
      loadTime: 0,
      timeOnPage,
      scrollDepth: this.scrollDepth,
      interactions: this.interactions,
      bounceRate,
      exitPage: true,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    await this.trackEvent('page_leave', { finalMetrics })
    
    // Process remaining events
    await this.processEventQueue()
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId
  }

  /**
   * Update privacy consent
   */
  async updatePrivacyConsent(settings: Partial<PrivacySettings>): Promise<void> {
    this.privacySettings = {
      ...this.privacySettings,
      ...settings,
      consentDate: new Date()
    } as PrivacySettings

    // Store in localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('analytics_privacy_settings', JSON.stringify(this.privacySettings))
    }

    // Reinitialize if consent was granted
    if (settings.analyticsEnabled && !this.isInitialized) {
      await this.initialize()
    }
  }

  /**
   * Get analytics summary for dashboard
   */
  async getAnalyticsSummary(days: number = 7): Promise<any> {
    try {
      // This would typically fetch from a backend API
      // For now, return cached data from localStorage
      const events = this.getStoredEvents(days)
      
      return {
        totalPageViews: events.filter(e => e.type === 'page_view').length,
        totalInteractions: events.filter(e => e.type === 'click').length,
        averageTimeOnPage: this.calculateAverageTimeOnPage(events),
        bounceRate: this.calculateBounceRate(events),
        topPages: this.getTopPages(events),
        heatmapData: this.getHeatmapData(),
        performanceMetrics: this.getPerformanceMetrics(events)
      }
    } catch (error) {
      console.warn('Failed to get analytics summary:', error)
      return null
    }
  }

  // Private helper methods
  private generateSessionId(): string {
    return `analytics_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  private async checkPrivacyConsent(): Promise<void> {
    if (typeof localStorage === 'undefined') return

    const stored = localStorage.getItem('analytics_privacy_settings')
    if (stored) {
      this.privacySettings = JSON.parse(stored)
    } else {
      // Default to necessary only until consent is given
      this.privacySettings = {
        consentLevel: 'necessary',
        consentDate: new Date(),
        analyticsEnabled: false,
        marketingEnabled: false,
        dataRetentionDays: 30
      }
    }
  }

  private canTrack(): boolean {
    if (!this.config.enableTracking) return false
    if (!this.privacySettings?.analyticsEnabled) return false
    if (Math.random() > this.config.sampleRate) return false
    return true
  }

  private initializePrivacySettings(): void {
    // Set default privacy-compliant settings
    if (!this.privacySettings) {
      this.privacySettings = {
        consentLevel: 'necessary',
        consentDate: new Date(),
        analyticsEnabled: false,
        marketingEnabled: false,
        dataRetentionDays: 30
      }
    }
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    // Click tracking
    document.addEventListener('click', this.handleClick.bind(this), true)

    // Scroll tracking
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true })

    // Form interaction tracking
    document.addEventListener('input', this.handleFormInteraction.bind(this), true)
    document.addEventListener('change', this.handleFormInteraction.bind(this), true)

    // Page unload tracking
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this))

    // Visibility change tracking
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  private async handleClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement
    if (!target || this.shouldExcludeElement(target)) return

    this.interactions++
    await this.trackEvent('click', {
      elementText: target.textContent?.slice(0, 100),
      elementClass: target.className,
      elementId: target.id
    }, target)
  }

  private handleScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercentage = Math.round((scrollTop / documentHeight) * 100)

    if (scrollPercentage > this.scrollDepth) {
      this.scrollDepth = scrollPercentage
    }
  }

  private async handleFormInteraction(event: Event): Promise<void> {
    const target = event.target as HTMLElement
    if (!target || this.shouldExcludeElement(target)) return

    await this.trackEvent('form_interaction', {
      fieldType: target.getAttribute('type'),
      fieldName: target.getAttribute('name'),
      eventType: event.type
    }, target)
  }

  private async handlePageUnload(): Promise<void> {
    await this.trackPageLeave()
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page became hidden, track as potential exit
      this.trackPageLeave()
    }
  }

  private shouldExcludeElement(element: HTMLElement): boolean {
    try {
      const tagName = element.tagName?.toLowerCase() || ''
      const type = element.getAttribute?.('type')?.toLowerCase() || ''
      const className = element.className?.toLowerCase() || ''

      // Exclude sensitive elements
      if (this.config.excludeElements.some(excluded =>
        tagName.includes(excluded) ||
        type.includes(excluded) ||
        className.includes(excluded)
      )) {
        return true
      }

      return false
    } catch (error) {
      return true // Exclude if we can't determine element properties
    }
  }

  private getElementCoordinates(element: HTMLElement): { x: number; y: number } {
    try {
      const rect = element.getBoundingClientRect?.() || { left: 0, top: 0, width: 0, height: 0 }
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    } catch (error) {
      return { x: 0, y: 0 }
    }
  }

  private async trackHeatmapPoint(element: HTMLElement): Promise<void> {
    const coordinates = this.getElementCoordinates(element)

    const heatmapPoint: HeatmapPoint = {
      x: coordinates.x,
      y: coordinates.y,
      intensity: 1,
      element: element.tagName.toLowerCase(),
      timestamp: new Date(),
      sessionId: this.sessionId,
      page: window.location.pathname
    }

    this.heatmapPoints.push(heatmapPoint)

    // Store in localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('analytics_heatmap_data') || '[]'
      const heatmapData = JSON.parse(stored)
      heatmapData.push(heatmapPoint)

      // Keep only recent data
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recentData = heatmapData.filter((point: HeatmapPoint) =>
        new Date(point.timestamp) > weekAgo
      )

      localStorage.setItem('analytics_heatmap_data', JSON.stringify(recentData))
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return

    try {
      // Store events in localStorage
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('analytics_events') || '[]'
        const events = JSON.parse(stored)
        events.push(...this.eventQueue)

        // Keep only recent events
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const recentEvents = events.filter((event: AnalyticsEvent) =>
          new Date(event.timestamp) > weekAgo
        )

        localStorage.setItem('analytics_events', JSON.stringify(recentEvents))
      }

      // Send to external analytics service (Google Analytics, etc.)
      await this.sendToExternalService(this.eventQueue)

      // Clear the queue
      this.eventQueue = []

    } catch (error) {
      console.warn('Failed to process event queue:', error)
    }
  }

  private async sendToExternalService(events: AnalyticsEvent[]): Promise<void> {
    // Google Analytics 4 integration
    if (config.analytics.googleAnalyticsId && typeof window !== 'undefined' && (window as any).gtag) {
      events.forEach(event => {
        (window as any).gtag('event', event.type, {
          event_category: 'user_interaction',
          event_label: event.element,
          custom_parameters: event.metadata
        })
      })
    }

    // Could also send to custom analytics backend
    // await fetch('/api/analytics/events', {
    //   method: 'POST',
    //   body: JSON.stringify(events),
    //   headers: { 'Content-Type': 'application/json' }
    // })
  }

  private initializePerformanceTracking(): void {
    if (typeof window === 'undefined') return

    // Track Core Web Vitals
    this.trackWebVitals()

    // Track resource loading times
    window.addEventListener('load', () => {
      setTimeout(() => this.trackResourceMetrics(), 1000)
    })
  }

  private trackWebVitals(): void {
    // This would integrate with web-vitals library
    // For now, track basic performance metrics
    if (performance.timing) {
      const timing = performance.timing
      const metrics = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        firstPaint: timing.responseStart - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart
      }

      this.trackEvent('performance', { webVitals: metrics })
    }
  }

  private trackResourceMetrics(): void {
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource')
      const slowResources = resources.filter((resource: any) => resource.duration > 1000)

      if (slowResources.length > 0) {
        this.trackEvent('performance', {
          slowResources: slowResources.map((r: any) => ({
            name: r.name,
            duration: r.duration,
            size: r.transferSize
          }))
        })
      }
    }
  }

  private initializeErrorTracking(): void {
    if (typeof window === 'undefined') return

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackEvent('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', {
        type: 'unhandled_promise_rejection',
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      })
    })
  }

  private getStoredEvents(days: number): AnalyticsEvent[] {
    if (typeof localStorage === 'undefined') return []

    try {
      const stored = localStorage.getItem('analytics_events') || '[]'
      const events = JSON.parse(stored)
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      return events.filter((event: AnalyticsEvent) =>
        new Date(event.timestamp) > cutoffDate
      )
    } catch (error) {
      console.warn('Failed to get stored events:', error)
      return []
    }
  }

  private calculateAverageTimeOnPage(events: AnalyticsEvent[]): number {
    const pageLeaveEvents = events.filter(e => e.type === 'page_leave')
    if (pageLeaveEvents.length === 0) return 0

    const totalTime = pageLeaveEvents.reduce((sum, event) =>
      sum + (event.metadata?.finalMetrics?.timeOnPage || 0), 0
    )

    return Math.round(totalTime / pageLeaveEvents.length / 1000) // Convert to seconds
  }

  private calculateBounceRate(events: AnalyticsEvent[]): number {
    const pageLeaveEvents = events.filter(e => e.type === 'page_leave')
    if (pageLeaveEvents.length === 0) return 0

    const bounces = pageLeaveEvents.filter(event =>
      event.metadata?.finalMetrics?.bounceRate === true
    ).length

    return Math.round((bounces / pageLeaveEvents.length) * 100)
  }

  private getTopPages(events: AnalyticsEvent[]): Array<{ page: string; views: number }> {
    const pageViews = events.filter(e => e.type === 'page_view')
    const pageCounts: Record<string, number> = {}

    pageViews.forEach(event => {
      const page = event.page
      pageCounts[page] = (pageCounts[page] || 0) + 1
    })

    return Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }

  private getHeatmapData(): HeatmapPoint[] {
    if (typeof localStorage === 'undefined') return []

    try {
      const stored = localStorage.getItem('analytics_heatmap_data') || '[]'
      return JSON.parse(stored)
    } catch (error) {
      console.warn('Failed to get heatmap data:', error)
      return []
    }
  }

  private getPerformanceMetrics(events: AnalyticsEvent[]): any {
    const performanceEvents = events.filter(e => e.type === 'performance')

    return {
      totalEvents: performanceEvents.length,
      webVitals: performanceEvents.find(e => e.metadata?.webVitals)?.metadata?.webVitals,
      slowResources: performanceEvents
        .filter(e => e.metadata?.slowResources)
        .flatMap(e => e.metadata?.slowResources || [])
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()
