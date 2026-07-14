import { useCallback, useState } from 'react'
import {
  deleteChatMessage,
  updateChatMessage,
} from '@/features/messages/api/messages-api'
import { useMessagesStore } from '@/features/messages/store/messages-store'

export function useMessageActions(chatId: string) {
  const updateMessage = useMessagesStore((state) => state.updateMessage)
  const removeMessage = useMessagesStore((state) => state.removeMessage)
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      const trimmed = content.trim()
      if (!chatId || !trimmed) {
        return
      }

      setError(null)
      setPendingMessageId(messageId)

      try {
        await updateChatMessage(chatId, messageId, trimmed)
        updateMessage(chatId, messageId, {
          content: trimmed,
          updatedAt: new Date().toISOString(),
        })
      } catch (editError) {
        setError(
          editError instanceof Error ? editError.message : 'Не удалось изменить сообщение',
        )
        throw editError
      } finally {
        setPendingMessageId(null)
      }
    },
    [chatId, updateMessage],
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!chatId) {
        return
      }

      setError(null)
      setPendingMessageId(messageId)

      try {
        await deleteChatMessage(chatId, messageId)
        removeMessage(chatId, messageId)
      } catch (deleteError) {
        setError(
          deleteError instanceof Error ? deleteError.message : 'Не удалось удалить сообщение',
        )
        throw deleteError
      } finally {
        setPendingMessageId(null)
      }
    },
    [chatId, removeMessage],
  )

  return {
    editMessage,
    deleteMessage,
    pendingMessageId,
    error,
    clearError: () => setError(null),
  }
}
