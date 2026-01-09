// X (Twitter) User from archive
export interface XUser {
  accountId: string
  handle: string
  displayName?: string
  bio?: string
  profileImageUrl?: string
  followersCount?: number
  followingCount?: number
}

// Bluesky User
export interface BlueskyUser {
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  followersCount?: number
  followsCount?: number
  indexedAt?: string
}

// Match confidence levels
export type MatchType =
  | 'bio_link'      // Found bsky handle in X bio - highest confidence
  | 'exact_handle'  // Exact handle match
  | 'fuzzy_handle'  // Similar handle (Jaro-Winkler >= 0.85)
  | 'display_name'  // Same display name
  | 'no_match'      // No match found

export interface MatchResult {
  xUser: XUser
  blueskyUser: BlueskyUser | null
  matchType: MatchType
  confidence: number // 0-1
  isAlreadyFollowing: boolean
  isSelected: boolean
}

// Import progress
export interface ImportProgress {
  phase: 'idle' | 'parsing' | 'matching' | 'following' | 'complete' | 'error'
  currentStep: number
  totalSteps: number
  message: string
  error?: string
}

// X API credentials (user-provided)
export interface XApiCredentials {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
}

// Archive parsing result
export interface ParsedArchive {
  users: XUser[]
  totalCount: number
  parseDate: Date
}

// Step in the wizard
export type WizardStep =
  | 'welcome'
  | 'connect-bluesky'
  | 'import-x-data'
  | 'matching'
  | 'review'
  | 'following'
  | 'complete'
