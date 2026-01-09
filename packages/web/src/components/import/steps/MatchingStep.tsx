import { useEffect } from 'react'
import { Card, ProgressBar, Alert, Button } from '../../ui'
import { useUserMatching } from '../../../hooks/useUserMatching'
import { useImportStore } from '../../../store/import-store'

interface MatchingStepProps {
  onNext: () => void
  onBack: () => void
}

export function MatchingStep({ onNext, onBack }: MatchingStepProps) {
  const { startMatching, isLoading, error, clearError } = useUserMatching()
  const { progress, matchResults, xUsers } = useImportStore()

  // Start matching when component mounts
  useEffect(() => {
    if (matchResults.length === 0 && xUsers.length > 0 && !isLoading) {
      startMatching()
    }
  }, [])

  const isComplete = matchResults.length > 0 && !isLoading
  const matchCount = matchResults.filter((r) => r.blueskyUser !== null).length

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Finding your follows on Bluesky
        </h2>
        <p className="text-gray-600">
          Searching for {xUsers.length} accounts...
        </p>
      </div>

      {error && (
        <Alert type="error" className="mb-6" onDismiss={clearError}>
          {error}
          <Button
            variant="secondary"
            size="sm"
            onClick={startMatching}
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
              total={progress.totalSteps || xUsers.length}
              label={progress.message}
            />
            <div className="flex justify-center">
              <div className="animate-pulse text-sm text-gray-500">
                This may take a few minutes for large following lists...
              </div>
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
              Matching Complete!
            </h3>
            <p className="text-gray-600">
              Found{' '}
              <span className="font-semibold text-bsky-600">{matchCount}</span>{' '}
              of {xUsers.length} accounts on Bluesky
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">Ready to start matching</p>
            <Button
              variant="primary"
              onClick={startMatching}
              className="mt-4"
            >
              Start Matching
            </Button>
          </div>
        )}
      </Card>

      {/* Stats preview */}
      {isComplete && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total"
            value={matchResults.length}
            color="gray"
          />
          <StatCard
            label="Found"
            value={matchCount}
            color="green"
          />
          <StatCard
            label="Already Following"
            value={matchResults.filter((r) => r.isAlreadyFollowing).length}
            color="blue"
          />
          <StatCard
            label="Not Found"
            value={matchResults.filter((r) => r.blueskyUser === null).length}
            color="gray"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!isComplete}
        >
          Review Matches
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'green' | 'blue' | 'gray'
}) {
  const colors = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-50 text-gray-700',
  }

  return (
    <div className={`rounded-lg p-4 text-center ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  )
}
