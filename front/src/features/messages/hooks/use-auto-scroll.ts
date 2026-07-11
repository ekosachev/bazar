import { useEffect, useRef, type RefObject } from 'react'
import type { Message } from '@/types/chat'

export function useAutoScroll(
  messages: Message[],
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const lastMessageIdRef = useRef<string | null>(null)
  const firstMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const lastMessage = messages.at(-1)
    const firstMessage = messages[0]

    if (!container || !lastMessage) {
      return
    }

    const isNewAtEnd = lastMessage.id !== lastMessageIdRef.current
    const isPrependedAtStart =
      firstMessage?.id !== firstMessageIdRef.current &&
      lastMessage.id === lastMessageIdRef.current

    lastMessageIdRef.current = lastMessage.id
    firstMessageIdRef.current = firstMessage?.id ?? null

    if (isNewAtEnd && !isPrependedAtStart) {
      container.scrollTop = container.scrollHeight
    }
  }, [containerRef, messages])
}
