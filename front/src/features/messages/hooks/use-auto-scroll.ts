import { useEffect, useRef } from 'react'
import type { Message } from '@/types/chat'

export function useAutoScroll(messages: Message[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const lastMessage = messages.at(-1)

    if (!container || !lastMessage) {
      return
    }

    const isNewAtEnd = lastMessage.id !== lastMessageIdRef.current
    lastMessageIdRef.current = lastMessage.id

    if (isNewAtEnd) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  return containerRef
}
