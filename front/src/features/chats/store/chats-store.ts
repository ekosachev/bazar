import { create } from 'zustand'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { mockChats } from '@/features/chats/data/mock-chats'
import type { Chat } from '@/types/chat'

interface ChatsState {
  chats: Chat[]
  activeChatId: string | undefined
  setActiveChatId: (chatId: string) => void
  createGroupChat: (title: string, participantIds: string[]) => string
  createChannelChat: (title: string, description: string) => string
  openDirectChat: (userId: string, displayName: string) => string
  isChatAdmin: (chatId: string, userId: string | undefined) => boolean
  addParticipant: (chatId: string, userId: string) => void
  removeParticipant: (chatId: string, userId: string) => void
}

function generateChatId() {
  return crypto.randomUUID()
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  chats: mockChats,
  activeChatId: mockChats[0]?.id,

  setActiveChatId: (chatId) => set({ activeChatId: chatId }),

  createGroupChat: (title, participantIds) => {
    const currentUserId = useAuthStore.getState().user?.id
    const allParticipantIds = currentUserId
      ? Array.from(new Set([currentUserId, ...participantIds]))
      : participantIds

    const id = generateChatId()
    const chat: Chat = {
      id,
      type: 'group',
      title,
      lastMessageAt: new Date().toISOString(),
      participantIds: allParticipantIds,
      adminIds: currentUserId ? [currentUserId] : [],
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

  isChatAdmin: (chatId, userId) => {
    if (!userId) return false
    const chat = get().chats.find((item) => item.id === chatId)
    return Boolean(chat?.adminIds?.includes(userId))
  },

  addParticipant: (chatId, userId) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId && !chat.participantIds?.includes(userId)
          ? { ...chat, participantIds: [...(chat.participantIds ?? []), userId] }
          : chat,
      ),
    }))
  },

  removeParticipant: (chatId, userId) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              participantIds: (chat.participantIds ?? []).filter((id) => id !== userId),
              adminIds: (chat.adminIds ?? []).filter((id) => id !== userId),
            }
          : chat,
      ),
    }))
  },
}))
