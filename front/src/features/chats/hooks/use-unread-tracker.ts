import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSocket } from '@/features/messages/hooks/use-socket'
import { useChatsStore } from '@/features/chats/store/chats-store'

/**
 * Global WS listener for the chat list: pulls in chats the current user was just
 * added to (e.g. someone opened a direct chat and messaged first), keeps each
 * chat's preview (last message) fresh, and bumps the unread badge for chats
 * other than the currently open one.
 */
export function useUnreadTracker() {
  const { subscribe } = useSocket()
  const incrementUnread = useChatsStore((state) => state.incrementUnread)
  const setLastMessage = useChatsStore((state) => state.setLastMessage)
  const addOrRefreshChat = useChatsStore((state) => state.addOrRefreshChat)
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    return subscribe((event) => {
      if (event.type !== 'message:new') {
        return
      }

      const { message } = event.payload
      const isOwnMessage = Boolean(userId && message.senderId === userId)

      if (!useChatsStore.getState().hasChat(message.chatId)) {
        void addOrRefreshChat(message.chatId).then(() => {
          if (!isOwnMessage && message.chatId !== useChatsStore.getState().activeChatId) {
            incrementUnread(message.chatId)
          }
        })
        return
      }

      setLastMessage(message.chatId, message.content, message.createdAt)

      if (isOwnMessage || message.chatId === useChatsStore.getState().activeChatId) {
        return
      }

      incrementUnread(message.chatId)
    })
  }, [addOrRefreshChat, incrementUnread, setLastMessage, subscribe, userId])
}
