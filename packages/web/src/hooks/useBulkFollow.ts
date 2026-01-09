import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth-store'
import { useImportStore } from '../store/import-store'
import { followUsers } from '../lib/bsky-client'

interface BulkFollowResult {
  succeeded: number
  failed: number
}

export function useBulkFollow() {
  const [error, setError] = useState<string | null>(null)
  const { blueskyAgent } = useAuthStore()
  const { matchResults, setProgress, markAsFollowing } = useImportStore()

  const followMutation = useMutation({
    mutationFn: async (): Promise<BulkFollowResult> => {
      if (!blueskyAgent) {
        throw new Error('Not connected to Bluesky')
      }

      setError(null)

      // Get selected users that have matches and aren't already following
      const selectedIndices: number[] = []
      const didsToFollow: string[] = []

      matchResults.forEach((result, index) => {
        if (
          result.isSelected &&
          result.blueskyUser &&
          !result.isAlreadyFollowing
        ) {
          selectedIndices.push(index)
          didsToFollow.push(result.blueskyUser.did)
        }
      })

      if (didsToFollow.length === 0) {
        throw new Error('No users selected to follow')
      }

      setProgress({
        phase: 'following',
        currentStep: 0,
        totalSteps: didsToFollow.length,
        message: 'Following users...',
      })

      const { succeeded, failed } = await followUsers(
        blueskyAgent,
        didsToFollow,
        (current, total) => {
          setProgress({
            phase: 'following',
            currentStep: current,
            totalSteps: total,
            message: `Following ${current} of ${total} users...`,
          })
        }
      )

      // Mark successful follows
      const succeededIndices = selectedIndices.filter((_, i) =>
        succeeded.includes(didsToFollow[i])
      )
      markAsFollowing(succeededIndices)

      return {
        succeeded: succeeded.length,
        failed: failed.length,
      }
    },
    onSuccess: (result) => {
      setProgress({
        phase: 'complete',
        currentStep: result.succeeded,
        totalSteps: result.succeeded + result.failed,
        message: `Successfully followed ${result.succeeded} users${
          result.failed > 0 ? ` (${result.failed} failed)` : ''
        }`,
      })
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to follow users')
      setProgress({ phase: 'error', error: err.message })
    },
  })

  const startFollowing = useCallback(() => {
    followMutation.mutate()
  }, [followMutation])

  const selectedCount = matchResults.filter(
    (r) => r.isSelected && r.blueskyUser && !r.isAlreadyFollowing
  ).length

  return {
    startFollowing,
    isLoading: followMutation.isPending,
    error,
    selectedCount,
    result: followMutation.data,
    clearError: () => setError(null),
  }
}
