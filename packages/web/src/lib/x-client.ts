import type { XUser } from '../types'

const DEFAULT_WORKER_URL = 'https://the-great-escape-api.workers.dev'

export interface XApiConfig {
  workerUrl?: string
  bearerToken: string
}

export interface XApiResponse<T> {
  data: T
  meta?: {
    next_token?: string
    result_count?: number
  }
}

interface XApiUser {
  id: string
  name: string
  username: string
  description?: string
  profile_image_url?: string
  public_metrics?: {
    followers_count: number
    following_count: number
  }
}

/**
 * X API client that proxies requests through Cloudflare Worker
 */
export class XApiClient {
  private workerUrl: string
  private bearerToken: string

  constructor(config: XApiConfig) {
    this.workerUrl = config.workerUrl || DEFAULT_WORKER_URL
    this.bearerToken = config.bearerToken
  }

  /**
   * Get the authenticated user's info
   */
  async getMe(): Promise<XUser> {
    const response = await this.fetch('/api/x/users/me')
    const data = response.data as XApiUser
    return this.transformUser(data)
  }

  /**
   * Get users the authenticated user is following
   */
  async getFollowing(
    userId: string,
    cursor?: string
  ): Promise<{ users: XUser[]; nextCursor?: string }> {
    const params = new URLSearchParams()
    if (cursor) {
      params.set('pagination_token', cursor)
    }

    const url = `/api/x/users/${userId}/following${params.toString() ? `?${params}` : ''}`
    const response = await this.fetch(url)

    const users = ((response.data as XApiUser[]) || []).map((u) =>
      this.transformUser(u)
    )

    return {
      users,
      nextCursor: response.meta?.next_token,
    }
  }

  /**
   * Get all following (handles pagination)
   */
  async getAllFollowing(
    userId: string,
    onProgress?: (fetched: number) => void
  ): Promise<XUser[]> {
    const allUsers: XUser[] = []
    let cursor: string | undefined

    do {
      const { users, nextCursor } = await this.getFollowing(userId, cursor)
      allUsers.push(...users)
      cursor = nextCursor

      onProgress?.(allUsers.length)

      // Rate limit protection - X API has strict limits
      if (cursor) {
        await this.sleep(1000)
      }
    } while (cursor)

    return allUsers
  }

  /**
   * Batch lookup users by ID (max 100 per request)
   */
  async lookupUsers(ids: string[]): Promise<XUser[]> {
    if (ids.length === 0) return []

    const response = await this.post('/api/x/users/lookup', { ids })
    const users = ((response.data as XApiUser[]) || []).map((u) =>
      this.transformUser(u)
    )

    return users
  }

  /**
   * Resolve all user IDs to profiles (handles batching and rate limits)
   */
  async resolveUserIds(
    ids: string[],
    onProgress?: (resolved: number, total: number) => void
  ): Promise<XUser[]> {
    const BATCH_SIZE = 100
    const allUsers: XUser[] = []

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE)
      const users = await this.lookupUsers(batch)
      allUsers.push(...users)

      onProgress?.(allUsers.length, ids.length)

      // Rate limit protection between batches
      if (i + BATCH_SIZE < ids.length) {
        await this.sleep(1000)
      }
    }

    return allUsers
  }

  private async fetch(path: string): Promise<XApiResponse<unknown>> {
    const url = `${this.workerUrl}${path}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse(response)
  }

  private async post(
    path: string,
    body: unknown
  ): Promise<XApiResponse<unknown>> {
    const url = `${this.workerUrl}${path}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return this.handleResponse(response)
  }

  private async handleResponse(
    response: Response
  ): Promise<XApiResponse<unknown>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const message =
        (error as { error?: string }).error ||
        `X API error: ${response.statusText}`

      if (response.status === 401) {
        throw new Error('Invalid or expired Bearer Token')
      }
      if (response.status === 403) {
        throw new Error(
          'Access denied. Make sure your X API app has read access.'
        )
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.')
      }

      throw new Error(message)
    }

    return response.json()
  }

  private transformUser(user: XApiUser): XUser {
    return {
      accountId: user.id,
      handle: user.username,
      displayName: user.name,
      bio: user.description,
      profileImageUrl: user.profile_image_url,
      followersCount: user.public_metrics?.followers_count,
      followingCount: user.public_metrics?.following_count,
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Validate a Bearer Token by making a test request
 */
export async function validateBearerToken(
  bearerToken: string,
  workerUrl?: string
): Promise<{ valid: boolean; user?: XUser; error?: string }> {
  try {
    const client = new XApiClient({ bearerToken, workerUrl })
    const user = await client.getMe()
    return { valid: true, user }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    }
  }
}
