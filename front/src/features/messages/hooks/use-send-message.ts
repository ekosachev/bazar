import { useCallback } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSocket } from '@/features/messages/hooks/use-socket'
import { useMessagesStore } from '@/features/messages/store/messages-store'
import type { Message } from '@/types/chat'

function createOptimisticMessage(
  chatId: string,
  content: string,
  senderId: string,
  clientMessageId: string,
): Message {
  return {
    id: `local-${clientMessageId}`,
    chatId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    isOwn: true,
  }
}

export function useSendMessage(chatId: string) {
  const addMessage = useMessagesStore((state) => state.addMessage)
  const senderId = useAuthStore((state) => state.user?.id ?? 'me')
  const { send } = useSocket()

  const sendMessage = useCallback(
    (content: string) => {
      if (!chatId) {
        return
      }

      const clientMessageId = crypto.randomUUID()
      const optimisticMessage = createOptimisticMessage(
        chatId,
        content,
        senderId,
        clientMessageId,
      )

      addMessage(optimisticMessage)
      send({
        type: 'message:send',
        payload: {
          chatId,
          content,
          clientMessageId,
        },
      })
    },
    [addMessage, chatId, send, senderId],
  )

  return { sendMessage }
}
