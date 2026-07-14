import { create } from 'zustand'
import { resolveSenderName } from '@/features/messages/lib/resolve-sender'
import type { Message } from '@/types/chat'

interface MessagesState {
  activeChatId: string | null
  messagesByChatId: Record<string, Message[]>

  setActiveChatId: (chatId: string | null) => void
  setMessages: (chatId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  replaceMessage: (chatId: string, messageId: string, message: Message) => void
  updateMessage: (chatId: string, messageId: string, patch: Partial<Message>) => void
  removeMessage: (chatId: string, messageId: string) => void
  upsertMessage: (message: Message) => void
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

function upsertByCreatedAt(existing: Message[], incoming: Message) {
  if (existing.some((message) => message.id === incoming.id)) {
    return existing.map((message) => (message.id === incoming.id ? incoming : message))
  }

  const next = [...existing, incoming]
  next.sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  )
  return next
}

function patchMessage(chatId: string, messageId: string, patch: Partial<Message>) {
  useMessagesStore.setState((state) => {
    const current = state.messagesByChatId[chatId]
    if (!current) {
      return state
    }

    return {
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: current.map((item) => (item.id === messageId ? { ...item, ...patch } : item)),
      },
    }
  })
}

/** Messages only carry a senderId — fetch and cache the display name once resolved. */
function enrichSenderNames(chatId: string, messages: Message[]) {
  for (const message of messages) {
    if (message.isOwn || message.senderName) {
      continue
    }

    void resolveSenderName(message.senderId).then((senderName) => {
      if (senderName) {
        patchMessage(chatId, message.id, { senderName })
      }
    })
  }
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  activeChatId: null,
  messagesByChatId: {},

  setActiveChatId: (chatId) => set({ activeChatId: chatId }),

  setMessages: (chatId, messages) => {
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: messages,
      },
    }))
    enrichSenderNames(chatId, messages)
  },

  addMessage: (message) => {
    set((state) => {
      const current = state.messagesByChatId[message.chatId] ?? []

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [message.chatId]: mergeMessages(current, [message], 'end'),
        },
      }
    })
    enrichSenderNames(message.chatId, [message])
  },

  replaceMessage: (chatId, messageId, message) => {
    set((state) => {
      const current = state.messagesByChatId[chatId] ?? []
      const hasMessage = current.some((item) => item.id === messageId)

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: hasMessage
            ? current.map((item) => (item.id === messageId ? message : item))
            : mergeMessages(current, [message], 'end'),
        },
      }
    })
    enrichSenderNames(chatId, [message])
  },

  updateMessage: (chatId, messageId, patch) => {
    set((state) => {
      const current = state.messagesByChatId[chatId]
      if (!current) {
        return state
      }

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: current.map((item) =>
            item.id === messageId ? { ...item, ...patch } : item,
          ),
        },
      }
    })
  },

  removeMessage: (chatId, messageId) => {
    set((state) => {
      const current = state.messagesByChatId[chatId]
      if (!current) {
        return state
      }

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: current.filter((item) => item.id !== messageId),
        },
      }
    })
  },

  upsertMessage: (message) => {
    set((state) => {
      const current = state.messagesByChatId[message.chatId] ?? []

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [message.chatId]: upsertByCreatedAt(current, message),
        },
      }
    })
    enrichSenderNames(message.chatId, [message])
  },

  prependMessages: (chatId, messages) => {
    set((state) => {
      const current = state.messagesByChatId[chatId] ?? []

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: mergeMessages(current, messages, 'start'),
        },
      }
    })
    enrichSenderNames(chatId, messages)
  },

  getMessages: (chatId) => get().messagesByChatId[chatId] ?? [],

  clearChat: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...rest } = state.messagesByChatId
      return { messagesByChatId: rest }
    }),
}))

const EMPTY_MESSAGES: Message[] = []

export function useActiveChatMessages() {
  const activeChatId = useMessagesStore((state) => state.activeChatId)
  const messages = useMessagesStore((state) =>
    activeChatId ? (state.messagesByChatId[activeChatId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES,
  )

  return messages
}
