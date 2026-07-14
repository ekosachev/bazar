import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSocket } from '@/features/messages/hooks/use-socket'
import { useChatsStore } from '@/features/chats/store/chats-store'

/**
 * Global WS listener for the chat list: keeps each chat's preview (last message)
 * fresh and bumps the unread badge for chats other than the currently open one.
 */
export function useUnreadTracker() {
  const { subscribe } = useSocket()
  const incrementUnread = useChatsStore((state) => state.incrementUnread)
  const setLastMessage = useChatsStore((state) => state.setLastMessage)
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    return subscribe((event) => {
      if (event.type !== 'message:new') {
        return
      }

      const { message } = event.payload
      setLastMessage(message.chatId, message.content, message.createdAt)

      if (userId && message.senderId === userId) {
        return
      }

      if (message.chatId === useChatsStore.getState().activeChatId) {
        return
      }

      incrementUnread(message.chatId)
    })
  }, [incrementUnread, setLastMessage, subscribe, userId])
}
