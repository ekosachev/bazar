import { useEffect, useState } from 'react'
import { searchUsers } from '@/features/chats/api/users-api'
import type { User } from '@/types/chat'

const SEARCH_DEBOUNCE_MS = 300
export const USER_SEARCH_MIN_LENGTH = 2

interface UseUserSearchOptions {
  query: string
  enabled?: boolean
  excludeUserIds?: string[]
}

export function useUserSearch({
  query,
  enabled = true,
  excludeUserIds = [],
}: UseUserSearchOptions) {
  const [users, setUsers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const excludeKey = excludeUserIds.join(',')

  useEffect(() => {
    if (!enabled) {
      setUsers([])
      setError(null)
      return
    }

    const trimmedQuery = query.trim()
    if (trimmedQuery.length < USER_SEARCH_MIN_LENGTH) {
      setUsers([])
      setError(null)
      return
    }

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true)
        setError(null)

        try {
          const results = await searchUsers(trimmedQuery)
          if (!cancelled) {
            const excludeSet = new Set(excludeUserIds)
            setUsers(results.filter((user) => !excludeSet.has(user.id)))
          }
        } catch (searchError) {
          if (!cancelled) {
            setError(
              searchError instanceof Error
                ? searchError.message
                : 'Не удалось найти пользователей',
            )
          }
        } finally {
          if (!cancelled) {
            setIsSearching(false)
          }
        }
      })()
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
    // excludeKey is the stable, deduplicated form of excludeUserIds — the array
    // itself is intentionally omitted since callers pass a new reference every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, excludeKey, query])

  return { users, isSearching, error }
}
