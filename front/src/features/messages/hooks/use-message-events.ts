import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSocket } from '@/features/messages/hooks/use-socket'
import { useMessagesStore } from '@/features/messages/store/messages-store'

export function useMessageEvents(chatId: string) {
  const { subscribe } = useSocket()
  const addMessage = useMessagesStore((state) => state.addMessage)
  const replaceMessage = useMessagesStore((state) => state.replaceMessage)
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (!chatId) {
      return
    }

    return subscribe((event) => {
      if (event.type === 'message:new') {
        const { message } = event.payload

        if (message.chatId !== chatId) {
          return
        }

        addMessage({
          ...message,
          isOwn: userId ? message.senderId === userId : Boolean(message.isOwn),
        })
        return
      }

      if (event.type === 'message:sent') {
        const { clientMessageId, message } = event.payload

        if (message.chatId !== chatId) {
          return
        }

        replaceMessage(chatId, `local-${clientMessageId}`, {
          ...message,
          isOwn: true,
        })
      }
    })
  }, [addMessage, chatId, replaceMessage, subscribe, userId])
}
