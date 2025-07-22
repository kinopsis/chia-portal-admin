'use client'

// Search Analytics Service for tracking search behavior and metrics
// Provides insights into user search patterns and popular queries

import { config } from '@/lib/config'

// Search event types for analytics tracking
export type SearchEventType = 
  | 'search_query'           // User performed a search
  | 'search_suggestion_click' // User clicked on a suggestion
  | 'search_result_click'    // User clicked on a search result
  | 'search_no_results'      // Search returned no results
  | 'search_filter_applied'  // User applied filters to search

// Search analytics event interface
export interface SearchAnalyticsEvent {
  type: SearchEventType
  query: string
  timestamp: Date
  sessionId: string
  userId?: string
  metadata?: {
    resultCount?: number
    selectedResultType?: 'tramite' | 'opa' | 'faq'
    selectedResultId?: string
    filterType?: string
    filterValue?: string
    searchDuration?: number
    suggestionIndex?: number
    source?: 'homepage' | 'tramites_page' | 'dependencias_page' | 'pqrs_page'
  }
}

// Popular search terms interface
export interface PopularSearchTerm {
  term: string
  count: number
  lastSearched: Date
  category?: 'tramite' | 'opa' | 'faq' | 'general'
}

// Search analytics summary
export interface SearchAnalyticsSummary {
  totalSearches: number
  uniqueQueries: number
  averageResultsPerSearch: number
  noResultsRate: number
  popularTerms: PopularSearchTerm[]
  searchesByType: Record<string, number>
  searchesBySource: Record<string, number>
}

export class SearchAnalyticsService {
  private sessionId: string
  private searchCache: Map<string, SearchAnalyticsEvent[]> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeCache()
  }

  /**
   * Track a search analytics event
   */
  async trackSearchEvent(event: Omit<SearchAnalyticsEvent, 'timestamp' | 'sessionId'>): Promise<void> {
    try {
      // Only track if analytics are enabled
      if (!config.analytics.enableTracking) {
        return
      }

      const fullEvent: SearchAnalyticsEvent = {
        ...event,
        timestamp: new Date(),
        sessionId: this.sessionId
      }

      // Store in local cache for immediate access
      this.addToCache(fullEvent)

      // Send to analytics service (Google Analytics, custom backend, etc.)
      await this.sendToAnalyticsService(fullEvent)

      // Store in local storage for offline capability
      this.storeInLocalStorage(fullEvent)

    } catch (error) {
      console.warn('Failed to track search event:', error)
      // Don't throw error to avoid breaking user experience
    }
  }

  /**
   * Track search query with debouncing to avoid excessive tracking
   */
  async trackSearch(
    query: string, 
    resultCount: number, 
    source: string = 'homepage',
    searchDuration?: number
  ): Promise<void> {
    await this.trackSearchEvent({
      type: 'search_query',
      query: query.toLowerCase().trim(),
      metadata: {
        resultCount,
        source: source as any,
        searchDuration
      }
    })
  }

  /**
   * Track suggestion click
   */
  async trackSuggestionClick(
    query: string, 
    suggestion: string, 
    index: number,
    source: string = 'homepage'
  ): Promise<void> {
    await this.trackSearchEvent({
      type: 'search_suggestion_click',
      query: suggestion.toLowerCase().trim(),
      metadata: {
        suggestionIndex: index,
        source: source as any
      }
    })
  }

  /**
   * Track result click
   */
  async trackResultClick(
    query: string,
    resultType: 'tramite' | 'opa' | 'faq',
    resultId: string,
    source: string = 'homepage'
  ): Promise<void> {
    await this.trackSearchEvent({
      type: 'search_result_click',
      query: query.toLowerCase().trim(),
      metadata: {
        selectedResultType: resultType,
        selectedResultId: resultId,
        source: source as any
      }
    })
  }

  /**
   * Get popular search terms from cache and analytics
   */
  async getPopularSearchTerms(limit: number = 10): Promise<PopularSearchTerm[]> {
    try {
      // Get from cache first for immediate response
      const cachedTerms = this.getPopularTermsFromCache(limit)
      
      // Return cached terms immediately, fetch fresh data in background
      this.refreshPopularTermsInBackground()
      
      return cachedTerms
    } catch (error) {
      console.warn('Failed to get popular search terms:', error)
      return this.getFallbackPopularTerms()
    }
  }

  /**
   * Get contextual suggestions based on query and user behavior
   */
  async getContextualSuggestions(
    query: string, 
    limit: number = 5,
    source: string = 'homepage'
  ): Promise<string[]> {
    try {
      const normalizedQuery = query.toLowerCase().trim()
      
      if (normalizedQuery.length < 2) {
        return this.getFallbackSuggestions(source)
      }

      // Get suggestions from multiple sources
      const [
        popularTerms,
        cachedSuggestions,
        contextualSuggestions
      ] = await Promise.all([
        this.getPopularSearchTerms(20),
        this.getCachedSuggestions(normalizedQuery),
        this.getContextualSuggestionsFromSource(normalizedQuery, source)
      ])

      // Combine and rank suggestions
      const allSuggestions = [
        ...cachedSuggestions,
        ...contextualSuggestions,
        ...popularTerms.map(term => term.term)
      ]

      // Filter and rank by relevance
      const filteredSuggestions = allSuggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(normalizedQuery) ||
          normalizedQuery.includes(suggestion.toLowerCase())
        )
        .filter((suggestion, index, array) => array.indexOf(suggestion) === index) // Remove duplicates
        .slice(0, limit)

      return filteredSuggestions
    } catch (error) {
      console.warn('Failed to get contextual suggestions:', error)
      return this.getFallbackSuggestions(source)
    }
  }

  /**
   * Get search analytics summary
   */
  async getAnalyticsSummary(days: number = 30): Promise<SearchAnalyticsSummary> {
    try {
      const events = this.getEventsFromCache(days)
      
      const totalSearches = events.filter(e => e.type === 'search_query').length
      const uniqueQueries = new Set(events.map(e => e.query)).size
      const noResultsCount = events.filter(e => 
        e.type === 'search_no_results' || 
        (e.metadata?.resultCount === 0)
      ).length
      
      const averageResults = events
        .filter(e => e.metadata?.resultCount !== undefined)
        .reduce((sum, e) => sum + (e.metadata?.resultCount || 0), 0) / totalSearches || 0

      return {
        totalSearches,
        uniqueQueries,
        averageResultsPerSearch: Math.round(averageResults * 100) / 100,
        noResultsRate: totalSearches > 0 ? (noResultsCount / totalSearches) * 100 : 0,
        popularTerms: await this.getPopularSearchTerms(10),
        searchesByType: this.getSearchesByType(events),
        searchesBySource: this.getSearchesBySource(events)
      }
    } catch (error) {
      console.warn('Failed to get analytics summary:', error)
      return this.getDefaultAnalyticsSummary()
    }
  }

  // Private helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  private initializeCache(): void {
    // Only initialize cache in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return // Skip initialization on server-side
    }

    // Load existing events from localStorage if available
    try {
      const stored = localStorage.getItem('search_analytics_cache')
      if (stored) {
        const events = JSON.parse(stored) as SearchAnalyticsEvent[]
        events.forEach(event => this.addToCache(event))
      }
    } catch (error) {
      console.warn('Failed to initialize analytics cache:', error)
    }
  }

  private addToCache(event: SearchAnalyticsEvent): void {
    const key = event.query || 'unknown'
    const existing = this.searchCache.get(key) || []
    existing.push(event)
    
    // Limit cache size
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100)
    }
    
    this.searchCache.set(key, existing)
    
    // Clean old entries if cache is too large
    if (this.searchCache.size > this.MAX_CACHE_SIZE) {
      const oldestKey = this.searchCache.keys().next().value
      this.searchCache.delete(oldestKey)
    }
  }

  private async sendToAnalyticsService(event: SearchAnalyticsEvent): Promise<void> {
    // Integration with Google Analytics 4
    if (config.analytics.googleAnalyticsId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: event.query,
        event_category: 'search',
        event_label: event.type,
        custom_parameters: event.metadata
      })
    }

    // Could also send to custom analytics backend
    // await fetch('/api/analytics/search', { method: 'POST', body: JSON.stringify(event) })
  }

  private storeInLocalStorage(event: SearchAnalyticsEvent): void {
    // Only store in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return // Skip storage on server-side
    }

    try {
      const stored = localStorage.getItem('search_analytics_cache')
      const events = stored ? JSON.parse(stored) : []
      events.push(event)

      // Keep only recent events (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recentEvents = events.filter((e: SearchAnalyticsEvent) =>
        new Date(e.timestamp) > weekAgo
      )

      localStorage.setItem('search_analytics_cache', JSON.stringify(recentEvents))
    } catch (error) {
      console.warn('Failed to store analytics in localStorage:', error)
    }
  }

  private getPopularTermsFromCache(limit: number): PopularSearchTerm[] {
    const termCounts = new Map<string, { count: number, lastSearched: Date }>()
    
    for (const events of this.searchCache.values()) {
      for (const event of events) {
        if (event.type === 'search_query' && event.query) {
          const existing = termCounts.get(event.query) || { count: 0, lastSearched: new Date(0) }
          termCounts.set(event.query, {
            count: existing.count + 1,
            lastSearched: new Date(Math.max(existing.lastSearched.getTime(), event.timestamp.getTime()))
          })
        }
      }
    }
    
    return Array.from(termCounts.entries())
      .map(([term, data]) => ({
        term,
        count: data.count,
        lastSearched: data.lastSearched
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  private async refreshPopularTermsInBackground(): Promise<void> {
    // This would fetch fresh data from analytics service in the background
    // Implementation depends on specific analytics backend
  }

  private getFallbackPopularTerms(): PopularSearchTerm[] {
    return [
      { term: 'certificados', count: 150, lastSearched: new Date() },
      { term: 'licencias', count: 120, lastSearched: new Date() },
      { term: 'pagos', count: 100, lastSearched: new Date() },
      { term: 'permisos', count: 80, lastSearched: new Date() },
      { term: 'impuestos', count: 75, lastSearched: new Date() }
    ]
  }

  private getCachedSuggestions(query: string): string[] {
    const suggestions: string[] = []
    
    for (const events of this.searchCache.values()) {
      for (const event of events) {
        if (event.query && event.query.includes(query)) {
          suggestions.push(event.query)
        }
      }
    }
    
    return [...new Set(suggestions)].slice(0, 3)
  }

  private getContextualSuggestionsFromSource(query: string, source: string): string[] {
    // Return contextual suggestions based on the source page
    const contextualSuggestions: Record<string, string[]> = {
      homepage: ['certificados', 'licencias', 'pagos', 'permisos', 'impuestos'],
      tramites_page: ['certificado residencia', 'licencia construcción', 'permiso funcionamiento'],
      dependencias_page: ['planeación', 'hacienda', 'salud', 'ambiente', 'obras'],
      pqrs_page: ['queja', 'reclamo', 'sugerencia', 'petición']
    }
    
    return contextualSuggestions[source] || contextualSuggestions.homepage
  }

  private getFallbackSuggestions(source: string): string[] {
    return this.getContextualSuggestionsFromSource('', source).slice(0, 5)
  }

  private getEventsFromCache(days: number): SearchAnalyticsEvent[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const events: SearchAnalyticsEvent[] = []
    
    for (const eventList of this.searchCache.values()) {
      events.push(...eventList.filter(e => new Date(e.timestamp) > cutoffDate))
    }
    
    return events
  }

  private getSearchesByType(events: SearchAnalyticsEvent[]): Record<string, number> {
    const typeCount: Record<string, number> = {}
    
    events.forEach(event => {
      const type = event.metadata?.selectedResultType || 'unknown'
      typeCount[type] = (typeCount[type] || 0) + 1
    })
    
    return typeCount
  }

  private getSearchesBySource(events: SearchAnalyticsEvent[]): Record<string, number> {
    const sourceCount: Record<string, number> = {}
    
    events.forEach(event => {
      const source = event.metadata?.source || 'unknown'
      sourceCount[source] = (sourceCount[source] || 0) + 1
    })
    
    return sourceCount
  }

  private getDefaultAnalyticsSummary(): SearchAnalyticsSummary {
    return {
      totalSearches: 0,
      uniqueQueries: 0,
      averageResultsPerSearch: 0,
      noResultsRate: 0,
      popularTerms: this.getFallbackPopularTerms(),
      searchesByType: {},
      searchesBySource: {}
    }
  }
}

// Lazy initialization to avoid SSR issues
let _searchAnalyticsService: SearchAnalyticsService | null = null

export const getSearchAnalyticsService = (): SearchAnalyticsService => {
  if (!_searchAnalyticsService) {
    _searchAnalyticsService = new SearchAnalyticsService()
  }
  return _searchAnalyticsService
}

// Export service instance (lazy)
export const searchAnalyticsService = getSearchAnalyticsService()
export default searchAnalyticsService
