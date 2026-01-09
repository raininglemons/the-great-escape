import { useEffect } from 'react'
import { Card, ProgressBar, Alert, Button } from '../../ui'
import { useBulkFollow } from '../../../hooks/useBulkFollow'
import { useImportStore } from '../../../store/import-store'

interface FollowingStepProps {
  onNext: () => void
  onBack: () => void
}

export function FollowingStep({ onNext, onBack }: FollowingStepProps) {
  const { startFollowing, isLoading, error, selectedCount, result, clearError } =
    useBulkFollow()
  const { progress } = useImportStore()

  // Start following when component mounts
  useEffect(() => {
    if (selectedCount > 0 && !isLoading && !result) {
      startFollowing()
    }
  }, [])

  const isComplete = result !== undefined && !isLoading

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Following Accounts
        </h2>
        <p className="text-gray-600">
          Please wait while we follow the selected accounts
        </p>
      </div>

      {error && (
        <Alert type="error" className="mb-6" onDismiss={clearError}>
          {error}
          <Button
            variant="secondary"
            size="sm"
            onClick={startFollowing}
            className="mt-2"
          >
            Try Again
          </Button>
        </Alert>
      )}

      <Card className="mb-6">
        {isLoading ? (
          <div className="space-y-4">
            <ProgressBar
              current={progress.currentStep}
              total={progress.totalSteps || selectedCount}
              label={progress.message}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="animate-pulse text-sm text-gray-500">
                Following accounts at a safe rate...
              </div>
              <p className="text-xs text-gray-400">
                Please don't close this window
              </p>
            </div>
          </div>
        ) : isComplete ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Done!
            </h3>
            <p className="text-gray-600">
              Successfully followed{' '}
              <span className="font-semibold text-bsky-600">
                {result.succeeded}
              </span>{' '}
              account{result.succeeded !== 1 ? 's' : ''}
              {result.failed > 0 && (
                <span className="text-red-600">
                  {' '}
                  ({result.failed} failed)
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">Ready to follow {selectedCount} accounts</p>
            <Button
              variant="primary"
              onClick={startFollowing}
              className="mt-4"
            >
              Start Following
            </Button>
          </div>
        )}
      </Card>

      {/* Rate limit info */}
      <Alert type="info" className="mb-6">
        <strong>Note:</strong> We follow accounts at a rate of ~2 per second to
        respect Bluesky's rate limits. This helps keep your account safe.
      </Alert>

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        {!isLoading && !isComplete && (
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
        )}
        {isComplete && (
          <Button variant="primary" onClick={onNext}>
            Finish
          </Button>
        )}
      </div>
    </div>
  )
}
