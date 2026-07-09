import { create } from 'zustand'
import type { Message } from '@/types/chat'

interface MessagesState {
  activeChatId: string | null
  messagesByChatId: Record<string, Message[]>

  setActiveChatId: (chatId: string | null) => void
  setMessages: (chatId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  prependMessages: (chatId: string, messages: Message[]) => void
  getMessages: (chatId: string) => Message[]
  clearChat: (chatId: string) => void
}

function mergeMessages(existing: Message[], incoming: Message[], position: 'start' | 'end') {
  const knownIds = new Set(existing.map((message) => message.id))
  const uniqueIncoming = incoming.filter((message) => !knownIds.has(message.id))

  if (uniqueIncoming.length === 0) {
    return existing
  }

  return position === 'start'
    ? [...uniqueIncoming, ...existing]
    : [...existing, ...uniqueIncoming]
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  activeChatId: null,
  messagesByChatId: {},

  setActiveChatId: (chatId) => set({ activeChatId: chatId }),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: messages,
      },
    })),

  addMessage: (message) =>
    set((state) => {
      const current = state.messagesByChatId[message.chatId] ?? []

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [message.chatId]: mergeMessages(current, [message], 'end'),
        },
      }
    }),

  prependMessages: (chatId, messages) =>
    set((state) => {
      const current = state.messagesByChatId[chatId] ?? []

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: mergeMessages(current, messages, 'start'),
        },
      }
    }),

  getMessages: (chatId) => get().messagesByChatId[chatId] ?? [],

  clearChat: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...rest } = state.messagesByChatId
      return { messagesByChatId: rest }
    }),
}))

export function useActiveChatMessages() {
  const activeChatId = useMessagesStore((state) => state.activeChatId)
  const messages = useMessagesStore((state) =>
    activeChatId ? (state.messagesByChatId[activeChatId] ?? []) : [],
  )

  return messages
}
