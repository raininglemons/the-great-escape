import { Button, Card, Alert } from '../../ui'
import { MatchList } from '../../users'
import { useImportStore } from '../../../store/import-store'

interface ReviewStepProps {
  onNext: () => void
  onBack: () => void
}

export function ReviewStep({ onNext, onBack }: ReviewStepProps) {
  const { matchResults } = useImportStore()

  const selectedCount = matchResults.filter(
    (r) => r.isSelected && r.blueskyUser && !r.isAlreadyFollowing
  ).length

  const canProceed = selectedCount > 0

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Matches
        </h2>
        <p className="text-gray-600">
          Select the accounts you want to follow on Bluesky
        </p>
      </div>

      {/* Info card */}
      <Alert type="info" className="mb-6">
        <strong>Tip:</strong> Accounts with high confidence matches are
        pre-selected. Review the list and adjust as needed.
      </Alert>

      {/* Match list */}
      <Card padding="sm" className="mb-6">
        <MatchList />
      </Card>

      {/* Selection summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
        <span className="text-2xl font-bold text-bsky-600">{selectedCount}</span>
        <span className="text-gray-600 ml-2">accounts selected to follow</span>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!canProceed}>
          Follow {selectedCount} Account{selectedCount !== 1 ? 's' : ''}
        </Button>
      </div>

      {!canProceed && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Select at least one account to continue
        </p>
      )}
    </div>
  )
}
