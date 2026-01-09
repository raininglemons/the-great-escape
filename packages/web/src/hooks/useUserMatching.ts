import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth-store'
import { useImportStore } from '../store/import-store'
import { findMatches } from '../lib/matching'
import { searchUsers, getAllFollowing } from '../lib/bsky-client'
import type { MatchResult } from '../types'

export function useUserMatching() {
  const [error, setError] = useState<string | null>(null)
  const { blueskyAgent } = useAuthStore()
  const {
    xUsers,
    setMatchResults,
    setProgress,
    setBlueskyFollowingSet,
  } = useImportStore()

  const matchMutation = useMutation({
    mutationFn: async (): Promise<MatchResult[]> => {
      if (!blueskyAgent) {
        throw new Error('Not connected to Bluesky')
      }

      if (xUsers.length === 0) {
        throw new Error('No X users to match')
      }

      setError(null)
      setProgress({
        phase: 'matching',
        currentStep: 0,
        totalSteps: xUsers.length,
        message: 'Loading your Bluesky following list...',
      })

      // First, get current Bluesky following for deduplication
      const following = await getAllFollowing(blueskyAgent)
      const followingSet = new Set<string>()
      for (const user of following) {
        followingSet.add(user.did)
        followingSet.add(user.handle.toLowerCase())
      }
      setBlueskyFollowingSet(followingSet)

      setProgress({
        phase: 'matching',
        currentStep: 0,
        totalSteps: xUsers.length,
        message: 'Searching for matches...',
      })

      // Find matches
      const results = await findMatches(xUsers, {
        searchBluesky: (query) => searchUsers(query, blueskyAgent),
        followingSet,
        onProgress: (current, total, message) => {
          setProgress({
            phase: 'matching',
            currentStep: current,
            totalSteps: total,
            message,
          })
        },
      })

      return results
    },
    onSuccess: (results) => {
      setMatchResults(results)
      const matchCount = results.filter((r) => r.blueskyUser !== null).length
      setProgress({
        phase: 'idle',
        message: `Found ${matchCount} matches out of ${results.length} accounts`,
      })
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to find matches')
      setProgress({ phase: 'error', error: err.message })
    },
  })

  const startMatching = useCallback(() => {
    matchMutation.mutate()
  }, [matchMutation])

  return {
    startMatching,
    isLoading: matchMutation.isPending,
    error,
    clearError: () => setError(null),
  }
}
