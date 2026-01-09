import type { XUser, BlueskyUser, MatchResult, MatchType } from '../../types'
import { jaroWinkler, normalizeHandle } from './jaro-winkler'
import { extractBlueskyHandle } from './bio-parser'

const FUZZY_THRESHOLD = 0.85

export interface MatchOptions {
  searchBluesky: (query: string) => Promise<BlueskyUser[]>
  followingSet: Set<string>
  onProgress?: (current: number, total: number, message: string) => void
}

/**
 * Find Bluesky matches for a list of X users
 */
export async function findMatches(
  xUsers: XUser[],
  options: MatchOptions
): Promise<MatchResult[]> {
  const { searchBluesky, followingSet, onProgress } = options
  const results: MatchResult[] = []

  for (let i = 0; i < xUsers.length; i++) {
    const xUser = xUsers[i]
    onProgress?.(i + 1, xUsers.length, `Searching for @${xUser.handle}...`)

    const result = await findSingleMatch(xUser, searchBluesky, followingSet)
    results.push(result)

    // Rate limit: small delay between searches
    if (i < xUsers.length - 1) {
      await sleep(100)
    }
  }

  // Sort results: matches first (by confidence), then no-matches
  results.sort((a, b) => {
    if (a.blueskyUser && !b.blueskyUser) return -1
    if (!a.blueskyUser && b.blueskyUser) return 1
    return b.confidence - a.confidence
  })

  return results
}

/**
 * Find a Bluesky match for a single X user
 */
async function findSingleMatch(
  xUser: XUser,
  searchBluesky: (query: string) => Promise<BlueskyUser[]>,
  followingSet: Set<string>
): Promise<MatchResult> {
  // 1. Check bio for Bluesky handle (highest confidence)
  const bioHandle = extractBlueskyHandle(xUser.bio)
  if (bioHandle) {
    const profiles = await searchBluesky(bioHandle)
    const exactMatch = profiles.find(
      (p) => p.handle.toLowerCase() === bioHandle.toLowerCase()
    )
    if (exactMatch) {
      return createMatchResult(xUser, exactMatch, 'bio_link', 1.0, followingSet)
    }
  }

  // 2. Search by X handle
  const handleResults = await searchBluesky(xUser.handle)

  for (const profile of handleResults) {
    const normalizedBsky = normalizeHandle(profile.handle)
    const normalizedX = normalizeHandle(xUser.handle)

    // Exact handle match
    if (normalizedBsky === normalizedX) {
      return createMatchResult(xUser, profile, 'exact_handle', 0.95, followingSet)
    }

    // Fuzzy handle match
    const similarity = jaroWinkler(normalizedBsky, normalizedX)
    if (similarity >= FUZZY_THRESHOLD) {
      return createMatchResult(
        xUser,
        profile,
        'fuzzy_handle',
        similarity * 0.9,
        followingSet
      )
    }
  }

  // 3. Search by display name (if different from handle)
  if (xUser.displayName && xUser.displayName !== xUser.handle) {
    const nameResults = await searchBluesky(xUser.displayName)

    for (const profile of nameResults) {
      if (
        profile.displayName &&
        profile.displayName.toLowerCase() === xUser.displayName.toLowerCase()
      ) {
        return createMatchResult(xUser, profile, 'display_name', 0.7, followingSet)
      }
    }
  }

  // No match found
  return createMatchResult(xUser, null, 'no_match', 0, followingSet)
}

function createMatchResult(
  xUser: XUser,
  blueskyUser: BlueskyUser | null,
  matchType: MatchType,
  confidence: number,
  followingSet: Set<string>
): MatchResult {
  const isAlreadyFollowing = blueskyUser
    ? followingSet.has(blueskyUser.did) || followingSet.has(blueskyUser.handle)
    : false

  return {
    xUser,
    blueskyUser,
    matchType,
    confidence,
    isAlreadyFollowing,
    // Auto-select high confidence matches that aren't already followed
    isSelected:
      blueskyUser !== null && confidence >= 0.85 && !isAlreadyFollowing,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { jaroWinkler, normalizeHandle } from './jaro-winkler'
export { extractBlueskyHandle, containsBlueskyMention } from './bio-parser'
