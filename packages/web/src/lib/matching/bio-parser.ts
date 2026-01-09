/**
 * Extract Bluesky handle from X bio or display name
 */

const BLUESKY_PATTERNS = [
  // Full handle with domain
  /@?([a-z0-9][a-z0-9._-]*\.bsky\.social)/i,
  // Custom domain (e.g., @jay.bsky.team, @user.dev)
  /@?([a-z0-9][a-z0-9._-]*\.[a-z]{2,})/i,
  // Profile URL
  /bsky\.app\/profile\/([a-z0-9][a-z0-9._-]*(?:\.[a-z0-9._-]+)*)/i,
  // Explicit mention
  /(?:bluesky|bsky|🦋)\s*[:\-]?\s*@?([a-z0-9][a-z0-9._-]*(?:\.[a-z0-9._-]+)*)/i,
  // Butterfly emoji followed by handle
  /🦋\s*@?([a-z0-9][a-z0-9._-]*(?:\.[a-z0-9._-]+)*)/i,
]

// Domains that are NOT Bluesky handles
const EXCLUDED_DOMAINS = [
  'twitter.com',
  'x.com',
  't.co',
  'instagram.com',
  'facebook.com',
  'linkedin.com',
  'youtube.com',
  'tiktok.com',
  'github.com',
  'twitch.tv',
  'discord.gg',
  'reddit.com',
  'threads.net',
  'mastodon.social',
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
]

export function extractBlueskyHandle(text: string | undefined): string | null {
  if (!text) return null

  for (const pattern of BLUESKY_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const handle = match[1].toLowerCase()

      // Skip excluded domains
      if (EXCLUDED_DOMAINS.some((domain) => handle.endsWith(domain))) {
        continue
      }

      // Skip if it looks like an email
      if (text.includes(`${handle}@`) || text.includes(`@${handle}.`)) {
        continue
      }

      // Ensure it has at least one dot (valid domain)
      if (!handle.includes('.')) {
        // Add .bsky.social if no domain
        return `${handle}.bsky.social`
      }

      return handle
    }
  }

  return null
}

/**
 * Check if bio contains any Bluesky-related keywords
 */
export function containsBlueskyMention(text: string | undefined): boolean {
  if (!text) return false

  const keywords = ['bluesky', 'bsky', '🦋', 'bsky.app', 'bsky.social']
  const lowerText = text.toLowerCase()

  return keywords.some((keyword) => lowerText.includes(keyword))
}
