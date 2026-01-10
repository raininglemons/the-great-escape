import type { XUser, ParsedArchive } from '../types'

/**
 * Parse X (Twitter) archive following.js file
 *
 * The archive file format is:
 * window.YTD.following.part0 = [
 *   { "following": { "accountId": "123", "userLink": "https://twitter.com/intent/user?user_id=123" } },
 *   ...
 * ]
 *
 * Note: Modern X archives only contain user IDs, not handles.
 * The handles need to be resolved via the X API.
 */
export async function parseArchiveFile(file: File): Promise<ParsedArchive> {
  const text = await file.text()
  return parseArchiveText(text)
}

export function parseArchiveText(text: string): ParsedArchive {
  // Remove the variable assignment to get valid JSON
  const jsonStart = text.indexOf('[')
  const jsonEnd = text.lastIndexOf(']')

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('Invalid archive file format: could not find JSON array')
  }

  const jsonText = text.slice(jsonStart, jsonEnd + 1)

  let data: ArchiveEntry[]
  try {
    data = JSON.parse(jsonText)
  } catch {
    throw new Error('Invalid archive file format: could not parse JSON')
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid archive file format: expected an array')
  }

  const users: XUser[] = data
    .map((entry) => parseArchiveEntry(entry))
    .filter((user): user is XUser => user !== null)

  return {
    users,
    totalCount: users.length,
    parseDate: new Date(),
  }
}

interface ArchiveEntry {
  following?: {
    accountId?: string
    userLink?: string
  }
}

function parseArchiveEntry(entry: ArchiveEntry): XUser | null {
  const following = entry?.following
  if (!following) return null

  const { accountId, userLink } = following
  if (!accountId) return null

  // Try to extract handle from userLink if it's in the old format
  // Old format: https://twitter.com/username
  // New format: https://twitter.com/intent/user?user_id=123
  const handle = userLink ? extractHandleFromUrl(userLink) : undefined

  return {
    accountId,
    // Handle might be undefined if using the new intent URL format
    // In that case, we'll need to resolve it via the X API
    handle: handle || `id:${accountId}`,
    // Mark as needing resolution if we only have the ID
    needsResolution: !handle,
  }
}

function extractHandleFromUrl(url: string): string | null {
  try {
    // Check if it's the intent URL format (user_id based)
    if (url.includes('intent/user?user_id=')) {
      // Can't extract handle from this format
      return null
    }

    // Handle old format: twitter.com/username or x.com/username
    const match = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)(?:\?|$|\/|#)/)
    if (match && match[1] !== 'intent') {
      return match[1]
    }

    return null
  } catch {
    return null
  }
}

/**
 * Extract just the user IDs from the archive (for API resolution)
 */
export function extractUserIds(archive: ParsedArchive): string[] {
  return archive.users.map((user) => user.accountId)
}

/**
 * Check if the archive users need API resolution
 * (i.e., they only have IDs, not handles)
 */
export function needsApiResolution(archive: ParsedArchive): boolean {
  // If any user has the placeholder handle format, we need resolution
  return archive.users.some(
    (user) => user.handle.startsWith('id:') || user.needsResolution
  )
}

/**
 * Parse a more detailed archive format that might include additional user data
 * This handles the follower.js or following.js files that have more details
 */
export function parseDetailedArchive(text: string): ParsedArchive {
  // Try to find any JSON-like structure in the file
  const patterns = [
    /window\.YTD\.following\.part\d+\s*=\s*/,
    /window\.YTD\.follower\.part\d+\s*=\s*/,
  ]

  for (const pattern of patterns) {
    const cleaned = text.replace(pattern, '')
    try {
      return parseArchiveText(cleaned)
    } catch {
      continue
    }
  }

  // Fallback: try parsing as-is
  return parseArchiveText(text)
}

/**
 * Validate that a file is a valid X archive following file
 */
export function validateArchiveFile(file: File): {
  valid: boolean
  error?: string
} {
  // Check file extension
  if (!file.name.endsWith('.js') && !file.name.endsWith('.json')) {
    return {
      valid: false,
      error: 'Please upload a .js or .json file from your X archive',
    }
  }

  // Check file size (shouldn't be too large for a following list)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error:
        'File is too large. Please upload the following.js file specifically.',
    }
  }

  return { valid: true }
}
