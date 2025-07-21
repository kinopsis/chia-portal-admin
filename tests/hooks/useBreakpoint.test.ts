import { renderHook, act } from '@testing-library/react'
import useBreakpoint from '@/hooks/useBreakpoint'

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: mockWindow.innerWidth,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: mockWindow.innerHeight,
})

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.addEventListener,
})

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.removeEventListener,
})

describe('useBreakpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWindow.innerWidth = 1024
    mockWindow.innerHeight = 768
  })

  it('returns correct initial breakpoint', () => {
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('lg')
    expect(result.current.width).toBe(1024)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.isLg).toBe(true)
  })

  it('detects mobile breakpoint correctly', () => {
    mockWindow.innerWidth = 640
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('sm')
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.isSm).toBe(true)
  })

  it('detects tablet breakpoint correctly', () => {
    mockWindow.innerWidth = 768
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('md')
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.isMd).toBe(true)
  })

  it('detects xs breakpoint correctly', () => {
    mockWindow.innerWidth = 480
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('xs')
    expect(result.current.isXs).toBe(true)
    expect(result.current.isMobile).toBe(true)
  })

  it('detects xl breakpoint correctly', () => {
    mockWindow.innerWidth = 1280
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('xl')
    expect(result.current.isXl).toBe(true)
    expect(result.current.isDesktop).toBe(true)
  })

  it('detects 2xl breakpoint correctly', () => {
    mockWindow.innerWidth = 1536
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('2xl')
    expect(result.current.is2xl).toBe(true)
    expect(result.current.isDesktop).toBe(true)
  })

  it('uses custom breakpoints', () => {
    const customBreakpoints = {
      xs: 0,
      sm: 480,
      md: 600,
      lg: 900,
      xl: 1200,
      '2xl': 1600,
    }

    mockWindow.innerWidth = 700
    const { result } = renderHook(() => useBreakpoint(customBreakpoints))
    
    expect(result.current.breakpoint).toBe('md')
    expect(result.current.isMobile).toBe(false) // Because md >= 600 which is >= default md (768)
  })

  it('handles window resize events', () => {
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('lg')
    
    // Simulate window resize
    act(() => {
      mockWindow.innerWidth = 640
      window.innerWidth = 640
      
      // Find the resize handler that was added
      const resizeHandler = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1]
      
      if (resizeHandler) {
        resizeHandler()
      }
    })
    
    expect(result.current.breakpoint).toBe('sm')
    expect(result.current.width).toBe(640)
    expect(result.current.isMobile).toBe(true)
  })

  it('adds and removes event listeners correctly', () => {
    const { unmount } = renderHook(() => useBreakpoint())
    
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    
    unmount()
    
    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('handles server-side rendering', () => {
    // Mock window as undefined (SSR environment)
    const originalWindow = global.window
    // @ts-ignore
    delete global.window
    
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.width).toBe(1024) // Default fallback
    expect(result.current.breakpoint).toBe('lg')
    
    // Restore window
    global.window = originalWindow
  })

  it('correctly categorizes all breakpoint ranges', () => {
    const testCases = [
      { width: 320, expected: 'xs', isMobile: true, isTablet: false, isDesktop: false },
      { width: 640, expected: 'sm', isMobile: true, isTablet: false, isDesktop: false },
      { width: 768, expected: 'md', isMobile: false, isTablet: true, isDesktop: false },
      { width: 1024, expected: 'lg', isMobile: false, isTablet: false, isDesktop: true },
      { width: 1280, expected: 'xl', isMobile: false, isTablet: false, isDesktop: true },
      { width: 1536, expected: '2xl', isMobile: false, isTablet: false, isDesktop: true },
    ]

    testCases.forEach(({ width, expected, isMobile, isTablet, isDesktop }) => {
      mockWindow.innerWidth = width
      const { result } = renderHook(() => useBreakpoint())
      
      expect(result.current.breakpoint).toBe(expected)
      expect(result.current.isMobile).toBe(isMobile)
      expect(result.current.isTablet).toBe(isTablet)
      expect(result.current.isDesktop).toBe(isDesktop)
    })
  })

  it('handles edge cases at breakpoint boundaries', () => {
    // Test exactly at breakpoint values
    const edgeCases = [
      { width: 767, expected: 'sm' }, // Just below md
      { width: 768, expected: 'md' }, // Exactly at md
      { width: 1023, expected: 'md' }, // Just below lg
      { width: 1024, expected: 'lg' }, // Exactly at lg
    ]

    edgeCases.forEach(({ width, expected }) => {
      mockWindow.innerWidth = width
      const { result } = renderHook(() => useBreakpoint())
      
      expect(result.current.breakpoint).toBe(expected)
    })
  })
})
