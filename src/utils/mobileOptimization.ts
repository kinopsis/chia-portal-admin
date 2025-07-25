/**
 * Mobile Optimization Utilities
 * 
 * Utilities for optimizing mobile experience including:
 * - Touch target sizing
 * - Viewport detection
 * - Mobile-specific interactions
 * - Performance optimizations
 */

/**
 * Check if device is mobile based on user agent and touch capabilities
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth < 768
  
  return isMobileUA || (hasTouchScreen && isSmallScreen)
}

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Get current viewport size category
 */
export const getViewportCategory = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Mobile-specific breakpoints
 */
export const MOBILE_BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

/**
 * Touch target minimum sizes (WCAG 2.1 SC 2.5.5)
 */
export const TOUCH_TARGETS = {
  minimum: 44, // 44px minimum
  comfortable: 48, // 48px comfortable
  large: 56, // 56px large
  extraLarge: 64, // 64px extra large
} as const

/**
 * Mobile typography scale
 */
export const MOBILE_TYPOGRAPHY = {
  hero: {
    title: 'text-3xl sm:text-4xl lg:text-5xl',
    subtitle: 'text-lg sm:text-xl lg:text-2xl',
  },
  section: {
    title: 'text-2xl sm:text-3xl lg:text-4xl',
    subtitle: 'text-base sm:text-lg lg:text-xl',
  },
  card: {
    title: 'text-lg sm:text-xl lg:text-2xl',
    description: 'text-sm sm:text-base lg:text-lg',
    stats: 'text-xs sm:text-sm lg:text-base',
  },
  button: {
    small: 'text-sm px-3 py-2',
    medium: 'text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3',
    large: 'text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4',
  },
} as const

/**
 * Mobile spacing utilities
 */
export const MOBILE_SPACING = {
  section: 'py-12 sm:py-16 lg:py-20',
  container: 'px-4 sm:px-6 lg:px-8',
  gap: {
    small: 'gap-4 sm:gap-6',
    medium: 'gap-6 sm:gap-8 lg:gap-10',
    large: 'gap-8 sm:gap-10 lg:gap-12',
  },
  margin: {
    small: 'mb-4 sm:mb-6',
    medium: 'mb-6 sm:mb-8 lg:mb-10',
    large: 'mb-8 sm:mb-10 lg:mb-12',
  },
} as const

/**
 * Mobile grid configurations
 */
export const MOBILE_GRIDS = {
  services: {
    mobile: 'grid-cols-1',
    tablet: 'sm:grid-cols-2',
    desktop: 'lg:grid-cols-3',
  },
  metrics: {
    mobile: 'grid-cols-2',
    tablet: 'sm:grid-cols-3',
    desktop: 'md:grid-cols-5',
  },
  benefits: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-3',
  },
  departments: {
    mobile: 'grid-cols-1',
    tablet: 'sm:grid-cols-2',
    desktop: 'lg:grid-cols-4',
  },
} as const

/**
 * Optimize touch targets for mobile
 */
export const optimizeTouchTarget = (element: HTMLElement): void => {
  if (!isTouchDevice()) return
  
  const computedStyle = window.getComputedStyle(element)
  const height = parseInt(computedStyle.height)
  const width = parseInt(computedStyle.width)
  
  if (height < TOUCH_TARGETS.minimum) {
    element.style.minHeight = `${TOUCH_TARGETS.minimum}px`
  }
  
  if (width < TOUCH_TARGETS.minimum) {
    element.style.minWidth = `${TOUCH_TARGETS.minimum}px`
  }
}

/**
 * Prevent zoom on input focus (iOS Safari)
 */
export const preventInputZoom = (input: HTMLInputElement): void => {
  if (!isMobileDevice()) return
  
  // Set font-size to 16px to prevent zoom on iOS
  if (parseInt(window.getComputedStyle(input).fontSize) < 16) {
    input.style.fontSize = '16px'
  }
}

/**
 * Mobile-optimized scroll behavior
 */
export const enableSmoothScrolling = (): void => {
  if (typeof window === 'undefined') return
  
  // Enable smooth scrolling with momentum on iOS
  document.documentElement.style.webkitOverflowScrolling = 'touch'
  document.documentElement.style.overflowScrolling = 'touch'
}

/**
 * Optimize images for mobile
 */
export const optimizeImageForMobile = (img: HTMLImageElement): void => {
  if (!isMobileDevice()) return
  
  // Add loading="lazy" for better performance
  img.loading = 'lazy'
  
  // Add decoding="async" for better performance
  img.decoding = 'async'
  
  // Optimize for mobile viewport
  if (!img.sizes) {
    img.sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }
}

/**
 * Mobile-specific event handlers
 */
export const addMobileEventListeners = (element: HTMLElement): void => {
  if (!isTouchDevice()) return
  
  // Add touch feedback
  element.addEventListener('touchstart', () => {
    element.style.opacity = '0.8'
  }, { passive: true })
  
  element.addEventListener('touchend', () => {
    element.style.opacity = '1'
  }, { passive: true })
  
  element.addEventListener('touchcancel', () => {
    element.style.opacity = '1'
  }, { passive: true })
}

/**
 * Optimize animations for mobile
 */
export const optimizeAnimationsForMobile = (): void => {
  if (typeof window === 'undefined') return
  
  // Reduce animations on low-end devices
  const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                        (navigator as any).deviceMemory <= 2
  
  if (isLowEndDevice || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0ms')
    document.documentElement.classList.add('reduce-animations')
  }
}

/**
 * Mobile viewport meta tag optimization
 */
export const optimizeViewport = (): void => {
  if (typeof document === 'undefined') return
  
  let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
  
  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.name = 'viewport'
    document.head.appendChild(viewport)
  }
  
  // Optimize viewport for mobile
  viewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover'
}

/**
 * Mobile-specific CSS classes generator
 */
export const getMobileClasses = (config: {
  touchOptimized?: boolean
  responsiveText?: boolean
  responsiveSpacing?: boolean
}) => {
  const classes: string[] = []
  
  if (config.touchOptimized) {
    classes.push(
      'touch:min-h-touch-sm',
      'touch:min-w-touch-sm',
      'touch:p-mobile-sm'
    )
  }
  
  if (config.responsiveText) {
    classes.push(
      'text-sm sm:text-base lg:text-lg',
      'leading-relaxed'
    )
  }
  
  if (config.responsiveSpacing) {
    classes.push(
      'p-mobile-sm sm:p-mobile-md lg:p-6',
      'm-mobile-sm sm:m-mobile-md lg:m-6'
    )
  }
  
  return classes.join(' ')
}

/**
 * Initialize mobile optimizations
 */
export const initializeMobileOptimizations = (): void => {
  if (typeof window === 'undefined') return
  
  // Optimize viewport
  optimizeViewport()
  
  // Enable smooth scrolling
  enableSmoothScrolling()
  
  // Optimize animations
  optimizeAnimationsForMobile()
  
  // Add mobile-specific classes to body
  if (isMobileDevice()) {
    document.body.classList.add('mobile-device')
  }
  
  if (isTouchDevice()) {
    document.body.classList.add('touch-device')
  }
  
  // Add viewport category class
  document.body.classList.add(`viewport-${getViewportCategory()}`)
  
  // Update on resize
  window.addEventListener('resize', () => {
    document.body.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop')
    document.body.classList.add(`viewport-${getViewportCategory()}`)
  }, { passive: true })
}

export default {
  isMobileDevice,
  isTouchDevice,
  getViewportCategory,
  MOBILE_BREAKPOINTS,
  TOUCH_TARGETS,
  MOBILE_TYPOGRAPHY,
  MOBILE_SPACING,
  MOBILE_GRIDS,
  optimizeTouchTarget,
  preventInputZoom,
  enableSmoothScrolling,
  optimizeImageForMobile,
  addMobileEventListeners,
  optimizeAnimationsForMobile,
  optimizeViewport,
  getMobileClasses,
  initializeMobileOptimizations,
}
