import clsx from 'clsx'
import type { MatchResult, MatchType } from '../../types'

interface UserMatchCardProps {
  match: MatchResult
  isSelected: boolean
  onToggle: () => void
}

const MATCH_LABELS: Record<MatchType, { label: string; color: string }> = {
  bio_link: { label: 'Bio Link', color: 'bg-green-100 text-green-800' },
  exact_handle: { label: 'Exact Match', color: 'bg-blue-100 text-blue-800' },
  fuzzy_handle: { label: 'Similar Handle', color: 'bg-yellow-100 text-yellow-800' },
  display_name: { label: 'Name Match', color: 'bg-purple-100 text-purple-800' },
  no_match: { label: 'Not Found', color: 'bg-gray-100 text-gray-600' },
}

export function UserMatchCard({
  match,
  isSelected,
  onToggle,
}: UserMatchCardProps) {
  const { xUser, blueskyUser, matchType, confidence, isAlreadyFollowing } = match
  const matchInfo = MATCH_LABELS[matchType]
  const hasMatch = blueskyUser !== null
  const canSelect = hasMatch && !isAlreadyFollowing

  return (
    <div
      className={clsx(
        'border rounded-lg p-3 sm:p-4 transition-all duration-200',
        canSelect && 'cursor-pointer hover:border-bsky-300',
        isSelected && 'border-bsky-500 bg-bsky-50',
        !canSelect && 'opacity-60',
        isAlreadyFollowing && 'bg-green-50 border-green-200'
      )}
      onClick={() => canSelect && onToggle()}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox */}
        {canSelect && (
          <div className="flex-shrink-0 pt-1">
            <div
              className={clsx(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                isSelected
                  ? 'bg-bsky-500 border-bsky-500'
                  : 'border-gray-300 bg-white'
              )}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
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
              )}
            </div>
          </div>
        )}

        {/* X User */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {xUser.displayName || xUser.handle}
            </span>
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              X
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">@{xUser.handle}</p>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 self-center text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>

        {/* Bluesky User or No Match */}
        <div className="flex-1 min-w-0">
          {hasMatch ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                {blueskyUser.avatar && (
                  <img
                    src={blueskyUser.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span className="font-medium text-gray-900 truncate">
                  {blueskyUser.displayName || blueskyUser.handle}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                @{blueskyUser.handle}
              </p>
            </>
          ) : (
            <div className="text-gray-400 text-sm">No match found</div>
          )}
        </div>
      </div>

      {/* Match info bar */}
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <span
          className={clsx(
            'text-xs font-medium px-2 py-1 rounded-full',
            matchInfo.color
          )}
        >
          {matchInfo.label}
          {hasMatch && confidence > 0 && (
            <span className="ml-1 opacity-75">
              ({Math.round(confidence * 100)}%)
            </span>
          )}
        </span>

        {isAlreadyFollowing && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Already following
          </span>
        )}
      </div>
    </div>
  )
}
