import { renderHook, act } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'

// Mock auth
jest.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))

describe('useChat error handling for non-JSON responses', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('handles HTML error response without throwing JSON parse error', async () => {
    const fetchMock = jest.spyOn(global as any, 'fetch').mockImplementation(async (...args: any[]) => {
      const input = args[0]
      if (typeof input === 'string' && input.startsWith('/api/chat')) {
        return new Response('<html>Internal Server Error</html>', {
          status: 500,
          headers: { 'Content-Type': 'text/html' }
        }) as any
      }
      throw new Error('Unexpected call')
    })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Hola')
    })

    expect(result.current.error).toMatch(/HTTP 500/i)

    fetchMock.mockRestore()
  })
})

