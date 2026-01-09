import { Button, Card } from '../../ui'
import { useImportStore } from '../../../store/import-store'

interface CompleteStepProps {
  onRestart: () => void
}

export function CompleteStep({ onRestart }: CompleteStepProps) {
  const { matchResults, reset } = useImportStore()

  const followedCount = matchResults.filter((r) => r.isAlreadyFollowing).length
  const totalMatches = matchResults.filter((r) => r.blueskyUser !== null).length

  const handleRestart = () => {
    reset()
    onRestart()
  }

  return (
    <div className="py-8 sm:py-12 text-center">
      {/* Success animation */}
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-bounce">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        You've Escaped!
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Your X community is now waiting for you on Bluesky
      </p>

      {/* Stats */}
      <Card className="max-w-md mx-auto mb-8">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-bsky-600">{followedCount}</div>
            <div className="text-sm text-gray-600">Accounts Followed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{totalMatches}</div>
            <div className="text-sm text-gray-600">Matches Found</div>
          </div>
        </div>
      </Card>

      {/* Next steps */}
      <Card className="max-w-lg mx-auto text-left mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">What's next?</h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="text-bsky-500">1.</span>
            <span>
              <a
                href="https://bsky.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bsky-500 hover:underline font-medium"
              >
                Open Bluesky
              </a>{' '}
              and check out your new timeline
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-bsky-500">2.</span>
            <span>
              Let your followers know you're on Bluesky by posting your handle
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-bsky-500">3.</span>
            <span>
              Add your Bluesky handle to your X bio so others can find you
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-bsky-500">4.</span>
            <span>
              Share The Great Escape with friends who want to migrate too
            </span>
          </li>
        </ul>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() => window.open('https://bsky.app', '_blank')}
        >
          Open Bluesky
        </Button>
        <Button variant="secondary" size="lg" onClick={handleRestart}>
          Import More Follows
        </Button>
      </div>

      {/* Share */}
      <p className="mt-8 text-sm text-gray-500">
        Made with care for the Bluesky community
      </p>
    </div>
  )
}
