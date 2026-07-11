import { useCallback, useEffect, useMemo, useState } from 'react'
import { filterMessagesByQuery } from '@/features/messages/lib/search-query'
import type { Message } from '@/types/chat'

export function useMessageSearch(messages: Message[], query: string) {
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null)
  const normalizedQuery = query.trim()

  const matches = useMemo(
    () => filterMessagesByQuery(messages, normalizedQuery),
    [messages, normalizedQuery],
  )

  useEffect(() => {
    setActiveMatchId(null)
  }, [normalizedQuery])

  const scrollToMessage = useCallback((messageId: string) => {
    setActiveMatchId(messageId)

    requestAnimationFrame(() => {
      document.getElementById(`message-${messageId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }, [])

  return {
    matches,
    activeMatchId,
    scrollToMessage,
  }
}
