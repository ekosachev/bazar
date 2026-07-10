import { create } from 'zustand'
import { mockChats } from '@/features/chats/data/mock-chats'
import type { Chat } from '@/types/chat'

interface ChatsState {
  chats: Chat[]
  activeChatId: string | undefined
  setActiveChatId: (chatId: string) => void
  createGroupChat: (title: string, participantIds: string[]) => string
  createChannelChat: (title: string, description: string) => string
  openDirectChat: (userId: string, displayName: string) => string
}

function generateChatId() {
  return crypto.randomUUID()
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  chats: mockChats,
  activeChatId: mockChats[0]?.id,

  setActiveChatId: (chatId) => set({ activeChatId: chatId }),

  createGroupChat: (title, participantIds) => {
    const id = generateChatId()
    const chat: Chat = {
      id,
      type: 'group',
      title,
      lastMessageAt: new Date().toISOString(),
      participantIds,
    }
    set((state) => ({ chats: [chat, ...state.chats], activeChatId: id }))
    return id
  },

  createChannelChat: (title, description) => {
    const id = generateChatId()
    const chat: Chat = {
      id,
      type: 'channel',
      title,
      description: description.trim() || undefined,
      lastMessageAt: new Date().toISOString(),
    }
    set((state) => ({ chats: [chat, ...state.chats], activeChatId: id }))
    return id
  },

  openDirectChat: (userId, displayName) => {
    const existing = get().chats.find((chat) => chat.type === 'direct' && chat.peerUserId === userId)
    if (existing) {
      set({ activeChatId: existing.id })
      return existing.id
    }

    const id = generateChatId()
    const chat: Chat = {
      id,
      type: 'direct',
      title: displayName,
      peerUserId: userId,
      lastMessageAt: new Date().toISOString(),
    }
    set((state) => ({ chats: [chat, ...state.chats], activeChatId: id }))
    return id
  },
}))
