import { useCallback, useEffect, useState } from 'react'
import { searchChatMessages } from '@/features/messages/api/messages-api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useMessagesStore } from '@/features/messages/store/messages-store'
import type { Message } from '@/types/chat'

const SEARCH_DEBOUNCE_MS = 300
export const MESSAGE_SEARCH_MIN_LENGTH = 2

export function useMessageSearch(chatId: string | undefined, query: string) {
  const currentUserId = useAuthStore((state) => state.user?.id)
  const upsertMessage = useMessagesStore((state) => state.upsertMessage)

  const [matches, setMatches] = useState<Message[]>([])
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedQuery = query.trim()

  useEffect(() => {
    setActiveMatchId(null)

    if (!chatId || normalizedQuery.length < MESSAGE_SEARCH_MIN_LENGTH) {
      setMatches([])
      setError(null)
      setIsSearching(false)
      return
    }

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true)
        setError(null)

        try {
          const results = await searchChatMessages(chatId, normalizedQuery, currentUserId)
          if (!cancelled) {
            setMatches(results)
          }
        } catch (searchError) {
          if (!cancelled) {
            setMatches([])
            setError(
              searchError instanceof Error
                ? searchError.message
                : 'Не удалось найти сообщения',
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
  }, [chatId, currentUserId, normalizedQuery])

  const scrollToMessage = useCallback(
    (messageId: string) => {
      setActiveMatchId(messageId)

      const existing = chatId
        ? useMessagesStore.getState().getMessages(chatId).find((item) => item.id === messageId)
        : undefined

      if (!existing) {
        const match = matches.find((item) => item.id === messageId)
        if (match) {
          upsertMessage(match)
        }
      }

      requestAnimationFrame(() => {
        document.getElementById(`message-${messageId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    },
    [chatId, matches, upsertMessage],
  )

  return {
    matches,
    activeMatchId,
    scrollToMessage,
    isSearching,
    error,
  }
}
