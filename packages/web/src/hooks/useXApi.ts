import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { XApiClient, validateBearerToken } from '../lib/x-client'
import { useImportStore } from '../store/import-store'
import type { XUser } from '../types'

const STORAGE_KEY = 'x-api-config'

interface XApiConfig {
  bearerToken: string
  workerUrl?: string
  userId?: string
  username?: string
}

function loadConfig(): XApiConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveConfig(config: XApiConfig | null) {
  if (config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function useXApi() {
  const [config, setConfigState] = useState<XApiConfig | null>(loadConfig)
  const [error, setError] = useState<string | null>(null)
  const { setXUsers, setProgress } = useImportStore()

  const setConfig = useCallback((newConfig: XApiConfig | null) => {
    setConfigState(newConfig)
    saveConfig(newConfig)
  }, [])

  const clearConfig = useCallback(() => {
    setConfig(null)
    setError(null)
  }, [setConfig])

  // Validate token mutation
  const validateMutation = useMutation({
    mutationFn: async (bearerToken: string) => {
      setError(null)
      const result = await validateBearerToken(bearerToken, config?.workerUrl)

      if (!result.valid) {
        throw new Error(result.error || 'Invalid token')
      }

      return result.user!
    },
    onSuccess: (user, bearerToken) => {
      setConfig({
        bearerToken,
        workerUrl: config?.workerUrl,
        userId: user.accountId,
        username: user.handle,
      })
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  // Fetch following mutation
  const fetchFollowingMutation = useMutation({
    mutationFn: async (): Promise<XUser[]> => {
      if (!config?.bearerToken || !config?.userId) {
        throw new Error('Not connected to X API')
      }

      setError(null)
      setProgress({
        phase: 'fetching',
        currentStep: 0,
        totalSteps: 0,
        message: 'Fetching your X following list...',
      })

      const client = new XApiClient({
        bearerToken: config.bearerToken,
        workerUrl: config.workerUrl,
      })

      const users = await client.getAllFollowing(config.userId, (fetched) => {
        setProgress({
          phase: 'fetching',
          currentStep: fetched,
          totalSteps: 0,
          message: `Fetched ${fetched} accounts...`,
        })
      })

      return users
    },
    onSuccess: (users) => {
      setXUsers(users)
      setProgress({
        phase: 'idle',
        currentStep: users.length,
        totalSteps: users.length,
        message: `Found ${users.length} accounts you follow`,
      })
    },
    onError: (err: Error) => {
      setError(err.message)
      setProgress({ phase: 'error', error: err.message })
    },
  })

  return {
    // State
    isConfigured: !!config?.bearerToken && !!config?.userId,
    config,
    error,
    username: config?.username,

    // Validation
    validateToken: validateMutation.mutate,
    isValidating: validateMutation.isPending,

    // Fetch following
    fetchFollowing: fetchFollowingMutation.mutate,
    isFetching: fetchFollowingMutation.isPending,
    followingData: fetchFollowingMutation.data,

    // Actions
    setWorkerUrl: (url: string) =>
      setConfig({ ...config, workerUrl: url } as XApiConfig),
    clearConfig,
    clearError: () => setError(null),
  }
}
