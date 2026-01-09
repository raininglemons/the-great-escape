import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth-store'
import { createAgent, getCurrentUser } from '../lib/bsky-client'

interface LoginParams {
  identifier: string
  password: string
}

export function useBlueskyAuth() {
  const [error, setError] = useState<string | null>(null)
  const {
    isBlueskyConnected,
    blueskyUser,
    blueskyAgent,
    setBlueskyAuth,
    clearBlueskyAuth,
  } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: async ({ identifier, password }: LoginParams) => {
      setError(null)

      // Normalize identifier (add .bsky.social if no domain)
      const normalizedId = identifier.includes('.')
        ? identifier
        : `${identifier}.bsky.social`

      const agent = await createAgent(normalizedId, password)
      const user = await getCurrentUser(agent)

      return { agent, user }
    },
    onSuccess: ({ agent, user }) => {
      setBlueskyAuth(agent, user)
    },
    onError: (err: Error) => {
      let message = 'Failed to login'

      if (err.message.includes('Invalid identifier or password')) {
        message = 'Invalid handle or app password. Please try again.'
      } else if (err.message.includes('Rate Limit')) {
        message = 'Too many login attempts. Please wait a moment.'
      } else if (err.message.includes('Network')) {
        message = 'Network error. Please check your connection.'
      }

      setError(message)
    },
  })

  const login = useCallback(
    (identifier: string, password: string) => {
      loginMutation.mutate({ identifier, password })
    },
    [loginMutation]
  )

  const logout = useCallback(() => {
    clearBlueskyAuth()
    setError(null)
  }, [clearBlueskyAuth])

  return {
    isConnected: isBlueskyConnected,
    user: blueskyUser,
    agent: blueskyAgent,
    login,
    logout,
    isLoading: loginMutation.isPending,
    error,
    clearError: () => setError(null),
  }
}
