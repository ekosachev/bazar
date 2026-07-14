import { useEffect, useRef } from 'react'
import { useChatsStore } from '@/features/chats/store/chats-store'
import type { Message } from '@/types/chat'

/** Marks the chat read (locally + on the server) whenever its newest loaded message changes. */
export function useMarkAsRead(chatId: string | undefined, messages: Message[]) {
  const markChatRead = useChatsStore((state) => state.markChatRead)
  const lastMarkedMessageId = useRef<string | null>(null)

  useEffect(() => {
    lastMarkedMessageId.current = null
  }, [chatId])

  useEffect(() => {
    if (!chatId || messages.length === 0) {
      return
    }

    const lastMessage = messages[messages.length - 1]

    if (lastMessage.id.startsWith('local-') || lastMessage.id === lastMarkedMessageId.current) {
      return
    }

    lastMarkedMessageId.current = lastMessage.id
    markChatRead(chatId, lastMessage.id).catch(() => {
      lastMarkedMessageId.current = null
    })
  }, [chatId, markChatRead, messages])
}
