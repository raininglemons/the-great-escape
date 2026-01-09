import { useState, useMemo } from 'react'
import { useImportStore } from '../../store/import-store'
import { UserMatchCard } from './UserMatchCard'
import { Button, Input } from '../ui'

type FilterType = 'all' | 'matched' | 'unmatched' | 'already_following'

export function MatchList() {
  const { matchResults, toggleMatchSelection, selectAllMatches, deselectAllMatches } =
    useImportStore()
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  const filteredResults = useMemo(() => {
    let results = matchResults

    // Apply type filter
    switch (filter) {
      case 'matched':
        results = results.filter((r) => r.blueskyUser !== null && !r.isAlreadyFollowing)
        break
      case 'unmatched':
        results = results.filter((r) => r.blueskyUser === null)
        break
      case 'already_following':
        results = results.filter((r) => r.isAlreadyFollowing)
        break
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(
        (r) =>
          r.xUser.handle.toLowerCase().includes(searchLower) ||
          r.xUser.displayName?.toLowerCase().includes(searchLower) ||
          r.blueskyUser?.handle.toLowerCase().includes(searchLower) ||
          r.blueskyUser?.displayName?.toLowerCase().includes(searchLower)
      )
    }

    return results
  }, [matchResults, filter, search])

  const stats = useMemo(() => {
    const total = matchResults.length
    const matched = matchResults.filter(
      (r) => r.blueskyUser !== null && !r.isAlreadyFollowing
    ).length
    const alreadyFollowing = matchResults.filter((r) => r.isAlreadyFollowing).length
    const selected = matchResults.filter((r) => r.isSelected).length
    const unmatched = total - matched - alreadyFollowing

    return { total, matched, alreadyFollowing, selected, unmatched }
  }, [matchResults])

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'matched', label: 'Matched', count: stats.matched },
    { value: 'already_following', label: 'Following', count: stats.alreadyFollowing },
    { value: 'unmatched', label: 'Not Found', count: stats.unmatched },
  ]

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <span className="font-semibold text-bsky-600">{stats.selected}</span>{' '}
          <span className="text-gray-600">selected</span>
        </div>
        <div>
          <span className="font-semibold text-green-600">{stats.matched}</span>{' '}
          <span className="text-gray-600">matches found</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">{stats.alreadyFollowing}</span>{' '}
          <span className="text-gray-600">already following</span>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={selectAllMatches}
          >
            Select All
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={deselectAllMatches}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-bsky-100 text-bsky-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
            <span className="ml-1 opacity-75">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Results list */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filteredResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No users match your search' : 'No users in this category'}
          </div>
        ) : (
          filteredResults.map((match) => {
            // Find original index for toggle
            const originalIndex = matchResults.findIndex(
              (r) => r.xUser.accountId === match.xUser.accountId
            )
            return (
              <UserMatchCard
                key={match.xUser.accountId}
                match={match}
                isSelected={match.isSelected}
                onToggle={() => toggleMatchSelection(originalIndex)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
