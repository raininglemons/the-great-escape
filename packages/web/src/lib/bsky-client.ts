import { BskyAgent } from '@atproto/api'
import type { BlueskyUser } from '../types'

const PUBLIC_API = 'https://public.api.bsky.app'

/**
 * Create an authenticated Bluesky agent
 */
export async function createAgent(
  identifier: string,
  password: string
): Promise<BskyAgent> {
  const agent = new BskyAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier, password })
  return agent
}

/**
 * Get the current user's profile
 */
export async function getCurrentUser(agent: BskyAgent): Promise<BlueskyUser> {
  const session = agent.session
  if (!session) throw new Error('Not logged in')

  const response = await agent.getProfile({ actor: session.did })
  return profileToUser(response.data)
}

/**
 * Search for users on Bluesky
 */
export async function searchUsers(
  query: string,
  _agent?: BskyAgent,
  limit = 10
): Promise<BlueskyUser[]> {
  // Use public API for search (no auth needed)
  const url = new URL(`${PUBLIC_API}/xrpc/app.bsky.actor.searchActors`)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(limit))

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`)
  }

  const data = await response.json()
  return (data.actors || []).map(profileToUser)
}

/**
 * Get a user's following list
 */
export async function getFollowing(
  agent: BskyAgent,
  actor?: string,
  cursor?: string
): Promise<{ users: BlueskyUser[]; cursor?: string }> {
  const session = agent.session
  if (!session) throw new Error('Not logged in')

  const response = await agent.getFollows({
    actor: actor || session.did,
    limit: 100,
    cursor,
  })

  return {
    users: response.data.follows.map(profileToUser),
    cursor: response.data.cursor,
  }
}

/**
 * Get all following (handles pagination)
 */
export async function getAllFollowing(agent: BskyAgent): Promise<BlueskyUser[]> {
  const allUsers: BlueskyUser[] = []
  let cursor: string | undefined

  do {
    const { users, cursor: nextCursor } = await getFollowing(agent, undefined, cursor)
    allUsers.push(...users)
    cursor = nextCursor

    // Rate limit protection
    if (cursor) {
      await sleep(100)
    }
  } while (cursor)

  return allUsers
}

/**
 * Follow a user
 */
export async function followUser(agent: BskyAgent, did: string): Promise<void> {
  await agent.follow(did)
}

/**
 * Follow multiple users with rate limiting
 */
export async function followUsers(
  agent: BskyAgent,
  dids: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ succeeded: string[]; failed: string[] }> {
  const succeeded: string[] = []
  const failed: string[] = []

  for (let i = 0; i < dids.length; i++) {
    const did = dids[i]
    onProgress?.(i + 1, dids.length)

    try {
      await followUser(agent, did)
      succeeded.push(did)
    } catch (error) {
      console.error(`Failed to follow ${did}:`, error)
      failed.push(did)
    }

    // Rate limit: ~2 follows per second
    if (i < dids.length - 1) {
      await sleep(500)
    }
  }

  return { succeeded, failed }
}

/**
 * Convert API profile to our BlueskyUser type
 */
function profileToUser(profile: {
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  followersCount?: number
  followsCount?: number
  indexedAt?: string
}): BlueskyUser {
  return {
    did: profile.did,
    handle: profile.handle,
    displayName: profile.displayName,
    description: profile.description,
    avatar: profile.avatar,
    followersCount: profile.followersCount,
    followsCount: profile.followsCount,
    indexedAt: profile.indexedAt,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
