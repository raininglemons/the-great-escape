import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useImportStore } from '../store/import-store'
import {
  parseArchiveFile,
  validateArchiveFile,
} from '../lib/archive-parser'
import type { ParsedArchive } from '../types'

export function useArchiveParser() {
  const [error, setError] = useState<string | null>(null)
  const { setXUsers, setProgress } = useImportStore()

  const parseMutation = useMutation({
    mutationFn: async (file: File): Promise<ParsedArchive> => {
      setError(null)
      setProgress({ phase: 'parsing', message: 'Reading archive file...' })

      // Validate file first
      const validation = validateArchiveFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      return parseArchiveFile(file)
    },
    onSuccess: (result) => {
      setXUsers(result.users)
      setProgress({
        phase: 'idle',
        message: `Found ${result.totalCount} accounts`,
      })
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to parse archive file')
      setProgress({ phase: 'error', error: err.message })
    },
  })

  const parseFile = useCallback(
    (file: File) => {
      parseMutation.mutate(file)
    },
    [parseMutation]
  )

  return {
    parseFile,
    isLoading: parseMutation.isPending,
    error,
    result: parseMutation.data,
    clearError: () => setError(null),
  }
}
