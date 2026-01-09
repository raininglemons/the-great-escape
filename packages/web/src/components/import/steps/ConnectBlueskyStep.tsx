import { BlueskyLoginForm, ConnectedAccount } from '../../auth'
import { Button, Card } from '../../ui'
import { useBlueskyAuth } from '../../../hooks/useBlueskyAuth'

interface ConnectBlueskyStepProps {
  onNext: () => void
  onBack: () => void
  isConnected: boolean
}

export function ConnectBlueskyStep({
  onNext,
  onBack,
  isConnected,
}: ConnectBlueskyStepProps) {
  const { user, logout } = useBlueskyAuth()

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect to Bluesky
        </h2>
        <p className="text-gray-600">
          We'll use this account to search for and follow users
        </p>
      </div>

      {isConnected && user ? (
        <div className="space-y-6">
          <ConnectedAccount
            user={user}
            platform="bluesky"
            onDisconnect={logout}
          />
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
            <Button variant="primary" onClick={onNext}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <BlueskyLoginForm />
          <div className="flex justify-center">
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Security note */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900">Why App Password?</h3>
            <p className="text-sm text-blue-700 mt-1">
              App Passwords are secure, limited-access credentials that can be
              revoked anytime in your{' '}
              <a
                href="https://bsky.app/settings/app-passwords"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                Bluesky settings
              </a>
              . We never see your main password.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
