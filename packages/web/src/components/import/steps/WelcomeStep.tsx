import { Button, Card } from '../../ui'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      {/* Logo */}
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-bsky-400 to-bsky-600 flex items-center justify-center shadow-lg">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        The Great Escape
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Import your X (Twitter) follows to Bluesky and reconnect with your community
      </p>

      <Button variant="primary" size="lg" onClick={onNext} className="mb-8">
        Get Started
      </Button>

      {/* How it works */}
      <Card className="text-left max-w-lg mx-auto">
        <h2 className="font-semibold text-gray-900 mb-4">How it works</h2>
        <div className="space-y-4">
          <Step
            number={1}
            title="Connect your Bluesky"
            description="Log in with an App Password (never your main password)"
          />
          <Step
            number={2}
            title="Import your X data"
            description="Upload your X archive or use your own API keys"
          />
          <Step
            number={3}
            title="Review matches"
            description="We'll find your X follows on Bluesky"
          />
          <Step
            number={4}
            title="Follow with one click"
            description="Select accounts and follow them all at once"
          />
        </div>
      </Card>

      <p className="mt-8 text-sm text-gray-500">
        Your data stays in your browser. We don't store anything.
      </p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bsky-100 text-bsky-600 flex items-center justify-center font-semibold text-sm">
        {number}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}
