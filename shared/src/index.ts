// Shared types for the-great-escape

export interface XUser {
  accountId: string
  handle: string
  displayName?: string
  bio?: string
  profileImageUrl?: string
  followersCount?: number
  followingCount?: number
}

export interface BlueskyUser {
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  followersCount?: number
  followsCount?: number
}

export type MatchType =
  | 'bio_link'
  | 'exact_handle'
  | 'fuzzy_handle'
  | 'display_name'
  | 'no_match'

export interface MatchResult {
  xUser: XUser
  blueskyUser: BlueskyUser | null
  matchType: MatchType
  confidence: number
}
