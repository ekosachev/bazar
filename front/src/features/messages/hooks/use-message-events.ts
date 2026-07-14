import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSocket } from '@/features/messages/hooks/use-socket'
import { useMessagesStore } from '@/features/messages/store/messages-store'

export function useMessageEvents(chatId: string, options?: { trackDeliveryStatus?: boolean }) {
  const trackDeliveryStatus = options?.trackDeliveryStatus ?? false
  const { subscribe } = useSocket()
  const addMessage = useMessagesStore((state) => state.addMessage)
  const replaceMessage = useMessagesStore((state) => state.replaceMessage)
  const markOwnMessagesReadUpTo = useMessagesStore((state) => state.markOwnMessagesReadUpTo)
  const clearDeliveryStatuses = useMessagesStore((state) => state.clearDeliveryStatuses)
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

        const isOwn = userId ? message.senderId === userId : Boolean(message.isOwn)

        if (trackDeliveryStatus && !isOwn) {
          clearDeliveryStatuses(chatId)
        }

        addMessage({
          ...message,
          isOwn,
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
          status: trackDeliveryStatus ? 'sent' : undefined,
        })
        return
      }

      if (event.type === 'message:read') {
        if (!trackDeliveryStatus || event.payload.chatId !== chatId) {
          return
        }

        // Ignore our own read receipts — we need the peer's.
        if (userId && event.payload.userId === userId) {
          return
        }

        markOwnMessagesReadUpTo(chatId, event.payload.messageId)
      }
    })
  }, [
    addMessage,
    chatId,
    clearDeliveryStatuses,
    markOwnMessagesReadUpTo,
    replaceMessage,
    subscribe,
    trackDeliveryStatus,
    userId,
  ])
}
