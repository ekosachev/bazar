import { create } from 'zustand'
import * as chatsApi from '@/features/chats/api/chats-api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { mockChats } from '@/features/chats/data/mock-chats'
import type { Chat } from '@/types/chat'

interface ChatsState {
  chats: Chat[]
  activeChatId: string | undefined
  setActiveChatId: (chatId: string) => void
  createGroupChat: (title: string, participantIds: string[]) => Promise<string>
  createChannelChat: (title: string, description: string) => Promise<string>
  openDirectChat: (userId: string, displayName: string) => Promise<string>
  isChatAdmin: (chatId: string, userId: string | undefined) => boolean
  addParticipant: (chatId: string, userId: string) => void
  removeParticipant: (chatId: string, userId: string) => void
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  chats: mockChats,
  activeChatId: mockChats[0]?.id,

  setActiveChatId: (chatId) => set({ activeChatId: chatId }),

  createGroupChat: async (title, participantIds) => {
    const currentUserId = useAuthStore.getState().user?.id
    const response = await chatsApi.createGroupChat(title, '', participantIds)

    const allParticipantIds = currentUserId
      ? Array.from(new Set([currentUserId, ...participantIds]))
      : participantIds

    const chat: Chat = {
      id: response.id,
      type: 'group',
      title: response.title,
      lastMessageAt: response.created_at,
      participantIds: allParticipantIds,
      adminIds: currentUserId ? [currentUserId] : [],
    }
    set((state) => ({ chats: [chat, ...state.chats], activeChatId: chat.id }))
    return chat.id
  },

  createChannelChat: async (title, description) => {
    const response = await chatsApi.createChannelChat(title, description.trim())

    const chat: Chat = {
      id: response.id,
      type: 'channel',
      title: response.title,
      description: response.description || undefined,
      lastMessageAt: response.created_at,
    }
    set((state) => ({ chats: [chat, ...state.chats], activeChatId: chat.id }))
    return chat.id
  },

  openDirectChat: async (userId, displayName) => {
    const existing = get().chats.find((chat) => chat.type === 'direct' && chat.peerUserId === userId)
    if (existing) {
      set({ activeChatId: existing.id })
      return existing.id
    }

    const response = await chatsApi.createDirectChat(userId)

    const chat: Chat = {
      id: response.id,
      type: 'direct',
      title: displayName,
      peerUserId: userId,
      lastMessageAt: response.created_at,
    }
    set((state) => ({ chats: [chat, ...state.chats], activeChatId: chat.id }))
    return chat.id
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
    const isSelfRemoval = useAuthStore.getState().user?.id === userId

    set((state) => {
      // Removing yourself means leaving the group — it should disappear from your chat list.
      const chats = isSelfRemoval
        ? state.chats.filter((chat) => chat.id !== chatId)
        : state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  participantIds: (chat.participantIds ?? []).filter((id) => id !== userId),
                  adminIds: (chat.adminIds ?? []).filter((id) => id !== userId),
                }
              : chat,
          )

      const activeChatId =
        isSelfRemoval && state.activeChatId === chatId ? chats[0]?.id : state.activeChatId

      return { chats, activeChatId }
    })
  },
}))
