import { useCallback } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useMessagesStore } from '@/features/messages/store/messages-store'
import type { Message } from '@/types/chat'

function formatMessageTime(date: Date) {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function createOptimisticMessage(chatId: string, content: string, senderId: string): Message {
  return {
    id: `local-${crypto.randomUUID()}`,
    chatId,
    senderId,
    content,
    createdAt: formatMessageTime(new Date()),
    isOwn: true,
  }
}

export function useSendMessage(chatId: string) {
  const addMessage = useMessagesStore((state) => state.addMessage)
  const senderId = useAuthStore((state) => state.user?.id ?? 'me')

  const sendMessage = useCallback(
    (content: string) => {
      addMessage(createOptimisticMessage(chatId, content, senderId))
    },
    [addMessage, chatId, senderId],
  )

  return { sendMessage }
}
