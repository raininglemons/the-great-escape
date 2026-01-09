import { Button, Card } from '../ui'
import type { BlueskyUser } from '../../types'

interface ConnectedAccountProps {
  user: BlueskyUser
  platform: 'bluesky' | 'x'
  onDisconnect: () => void
}

export function ConnectedAccount({
  user,
  platform,
  onDisconnect,
}: ConnectedAccountProps) {
  const isBluesky = platform === 'bluesky'

  return (
    <Card padding="sm" className="flex items-center gap-3">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.displayName || user.handle}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isBluesky ? 'bg-bsky-100' : 'bg-gray-100'
          }`}
        >
          <span
            className={`text-lg font-semibold ${
              isBluesky ? 'text-bsky-500' : 'text-gray-500'
            }`}
          >
            {(user.displayName || user.handle).charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {user.displayName || user.handle}
        </p>
        <p className="text-sm text-gray-500 truncate">@{user.handle}</p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            isBluesky
              ? 'bg-bsky-100 text-bsky-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isBluesky ? 'Bluesky' : 'X'}
        </span>
        <Button variant="secondary" size="sm" onClick={onDisconnect}>
          Disconnect
        </Button>
      </div>
    </Card>
  )
}
