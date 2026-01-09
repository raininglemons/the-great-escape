/**
 * Jaro-Winkler string similarity algorithm
 * Returns a value between 0 (no similarity) and 1 (identical)
 */
export function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1

  const len1 = s1.length
  const len2 = s2.length

  if (len1 === 0 || len2 === 0) return 0

  // Calculate match window
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1
  const s1Matches = new Array(len1).fill(false)
  const s2Matches = new Array(len2).fill(false)

  let matches = 0
  let transpositions = 0

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, len2)

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue
      s1Matches[i] = true
      s2Matches[j] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0

  // Count transpositions
  let k = 0
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }

  // Calculate Jaro similarity
  const jaro =
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3

  // Calculate common prefix (up to 4 characters)
  let prefix = 0
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++
    else break
  }

  // Jaro-Winkler with scaling factor 0.1
  return jaro + prefix * 0.1 * (1 - jaro)
}

/**
 * Normalize a handle for comparison
 * - Lowercase
 * - Remove @ prefix
 * - Remove .bsky.social suffix
 * - Remove underscores and dots
 */
export function normalizeHandle(handle: string): string {
  return handle
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/\.bsky\.social$/, '')
    .replace(/[_.-]/g, '')
}
