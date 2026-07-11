import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { mockOlderMessages } from '@/features/chats/data/mock-chats'
import { getChatMessages } from '@/features/messages/api/messages-api'
import { useMessagesStore } from '@/features/messages/store/messages-store'

const PAGE_SIZE = 20
const SCROLL_THRESHOLD = 64

export function useMessagePagination(chatId: string | undefined) {
  const prependMessages = useMessagesStore((state) => state.prependMessages)
  const currentUserId = useAuthStore((state) => state.user?.id)

  const containerRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setHasMore(true)
  }, [chatId])

  const loadOlder = useCallback(async () => {
    if (!chatId || isLoadingRef.current || !hasMore) {
      return
    }

    const currentMessages = useMessagesStore.getState().getMessages(chatId)
    const oldestMessage = currentMessages[0]

    if (!oldestMessage) {
      setHasMore(false)
      return
    }

    isLoadingRef.current = true
    setIsLoadingMore(true)

    try {
      const { messages, hasMore: more } = await getChatMessages(
        chatId,
        { before: oldestMessage.id, limit: PAGE_SIZE },
        currentUserId,
      )

      if (messages.length > 0) {
        prependMessages(chatId, messages)
      }

      setHasMore(more)
    } catch {
      if (chatId === '1' && oldestMessage.id === 'm1') {
        prependMessages(chatId, mockOlderMessages)
      }

      setHasMore(false)
    } finally {
      isLoadingRef.current = false
      setIsLoadingMore(false)
    }
  }, [chatId, currentUserId, hasMore, prependMessages])

  const handleScroll = useCallback(() => {
    const container = containerRef.current

    if (!container || container.scrollTop > SCROLL_THRESHOLD) {
      return
    }

    void loadOlder()
  }, [loadOlder])

  return {
    containerRef,
    handleScroll,
    isLoadingMore,
    hasMore,
  }
}
