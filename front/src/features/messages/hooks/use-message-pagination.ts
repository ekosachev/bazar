import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { getChatMessages } from '@/features/messages/api/messages-api'
import { useMessagesStore } from '@/features/messages/store/messages-store'

const PAGE_SIZE = 20
const SCROLL_THRESHOLD = 64

function prependWithScrollPreserved(
  container: HTMLDivElement,
  prepend: () => void,
  onRestored?: () => void,
) {
  const previousScrollHeight = container.scrollHeight
  const previousScrollTop = container.scrollTop

  prepend()

  requestAnimationFrame(() => {
    const nextScrollHeight = container.scrollHeight
    container.scrollTop = nextScrollHeight - previousScrollHeight + previousScrollTop
    onRestored?.()
  })
}

export function useMessagePagination(chatId: string | undefined) {
  const prependMessages = useMessagesStore((state) => state.prependMessages)
  const setMessages = useMessagesStore((state) => state.setMessages)
  const currentUserId = useAuthStore((state) => state.user?.id)

  const containerRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)
  const isRestoringScrollRef = useRef(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setHasMore(true)

    if (!chatId || useMessagesStore.getState().getMessages(chatId).length > 0) {
      return
    }

    let cancelled = false
    setIsLoadingInitial(true)

    getChatMessages(chatId, { limit: PAGE_SIZE }, currentUserId)
      .then(({ messages, hasMore: more }) => {
        if (cancelled) {
          return
        }

        setMessages(chatId, messages)
        setHasMore(more)
      })
      .catch(() => {
        if (!cancelled) {
          setHasMore(false)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingInitial(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [chatId, currentUserId, setMessages])

  const loadOlder = useCallback(async () => {
    if (!chatId || isLoadingRef.current || !hasMore) {
      return
    }

    const container = containerRef.current
    if (!container) {
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
        isRestoringScrollRef.current = true
        prependWithScrollPreserved(container, () => prependMessages(chatId, messages), () => {
          isRestoringScrollRef.current = false
        })
      }

      setHasMore(more)
    } catch {
      setHasMore(false)
    } finally {
      isLoadingRef.current = false
      setIsLoadingMore(false)
    }
  }, [chatId, currentUserId, hasMore, prependMessages])

  const handleScroll = useCallback(() => {
    if (isRestoringScrollRef.current) {
      return
    }

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
    isLoadingInitial,
    hasMore,
  }
}
