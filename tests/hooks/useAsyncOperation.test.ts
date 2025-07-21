import { renderHook, act, waitFor } from '@testing-library/react'
import useAsyncOperation from '@/hooks/useAsyncOperation'

describe('useAsyncOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAsyncOperation())
    
    expect(result.current.state).toEqual({
      data: null,
      loading: false,
      error: null,
      progress: undefined,
    })
  })

  it('initializes with custom initial data', () => {
    const initialData = { test: 'data' }
    const { result } = renderHook(() => useAsyncOperation(initialData))
    
    expect(result.current.state.data).toEqual(initialData)
  })

  it('handles successful operation', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockData = { success: true }
    const mockOperation = jest.fn().mockResolvedValue(mockData)
    
    let executePromise: Promise<any>
    
    act(() => {
      executePromise = result.current.execute(mockOperation)
    })
    
    // Should be loading
    expect(result.current.state.loading).toBe(true)
    expect(result.current.state.error).toBe(null)
    
    await act(async () => {
      await executePromise
    })
    
    // Should have completed successfully
    expect(result.current.state.loading).toBe(false)
    expect(result.current.state.data).toEqual(mockData)
    expect(result.current.state.error).toBe(null)
    expect(mockOperation).toHaveBeenCalledTimes(1)
  })

  it('handles failed operation', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockError = new Error('Test error')
    const mockOperation = jest.fn().mockRejectedValue(mockError)
    
    let executePromise: Promise<any>
    
    act(() => {
      executePromise = result.current.execute(mockOperation)
    })
    
    await act(async () => {
      await executePromise
    })
    
    // Should have error state
    expect(result.current.state.loading).toBe(false)
    expect(result.current.state.data).toBe(null)
    expect(result.current.state.error).toBe('Test error')
  })

  it('handles retry functionality', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockData = { success: true }
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(mockData)

    // First execution should fail and retry automatically
    await act(async () => {
      await result.current.execute(mockOperation, { retryAttempts: 1 })
    })

    // Should succeed after retry
    expect(result.current.state.data).toEqual(mockData)
    expect(result.current.state.error).toBe(null)
    expect(mockOperation).toHaveBeenCalledTimes(2) // Original + 1 retry
  })

  it('handles multiple retry attempts', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockError = new Error('Persistent error')
    const mockOperation = jest.fn().mockRejectedValue(mockError)

    await act(async () => {
      await result.current.execute(mockOperation, { retryAttempts: 3, retryDelay: 10 })
    })

    // Should have tried 4 times total (original + 3 retries)
    expect(mockOperation).toHaveBeenCalledTimes(4)
    expect(result.current.state.error).toBe('Persistent error')
  }, 10000)

  it('calls success callback', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockData = { success: true }
    const mockOperation = jest.fn().mockResolvedValue(mockData)
    const onSuccess = jest.fn()
    
    await act(async () => {
      await result.current.execute(mockOperation, { onSuccess })
    })
    
    expect(onSuccess).toHaveBeenCalledWith(mockData)
  })

  it('calls error callback', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockError = new Error('Test error')
    const mockOperation = jest.fn().mockRejectedValue(mockError)
    const onError = jest.fn()
    
    await act(async () => {
      await result.current.execute(mockOperation, { onError })
    })
    
    expect(onError).toHaveBeenCalledWith(mockError)
  })

  it('handles progress updates', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockOperation = jest.fn().mockResolvedValue('success')
    const onProgress = jest.fn()
    
    await act(async () => {
      await result.current.execute(mockOperation, { onProgress })
    })
    
    expect(onProgress).toHaveBeenCalledWith(0) // Start
    expect(onProgress).toHaveBeenCalledWith(100) // End
  })

  it('allows manual progress updates', () => {
    const { result } = renderHook(() => useAsyncOperation())
    
    act(() => {
      result.current.setProgress(50)
    })
    
    expect(result.current.state.progress).toBe(50)
  })

  it('resets state correctly', () => {
    const initialData = { initial: true }
    const { result } = renderHook(() => useAsyncOperation(initialData))
    
    // Set some state
    act(() => {
      result.current.setProgress(75)
    })
    
    // Reset
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.state).toEqual({
      data: initialData,
      loading: false,
      error: null,
      progress: undefined,
    })
  })

  it('handles retry delay', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('First fail'))
      .mockResolvedValueOnce('success')

    const startTime = Date.now()

    await act(async () => {
      await result.current.execute(mockOperation, {
        retryAttempts: 1,
        retryDelay: 50 // Reduced delay for faster tests
      })
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    // Should have waited at least 50ms for retry
    expect(duration).toBeGreaterThanOrEqual(50)
    expect(result.current.state.data).toBe('success')
  })

  it('handles non-Error exceptions', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockOperation = jest.fn().mockRejectedValue('String error')
    
    await act(async () => {
      await result.current.execute(mockOperation)
    })
    
    expect(result.current.state.error).toBe('String error')
  })

  it('prevents retry when no operation stored', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    
    const retryResult = await act(async () => {
      return result.current.retry()
    })
    
    expect(retryResult).toBe(null)
  })

  it('handles concurrent operations correctly', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    const mockOperation1 = jest.fn().mockResolvedValue('result1')
    const mockOperation2 = jest.fn().mockResolvedValue('result2')
    
    // Start two operations
    const promise1 = act(() => result.current.execute(mockOperation1))
    const promise2 = act(() => result.current.execute(mockOperation2))
    
    await act(async () => {
      await Promise.all([promise1, promise2])
    })
    
    // The last operation should win
    expect(result.current.state.data).toBe('result2')
  })
})
