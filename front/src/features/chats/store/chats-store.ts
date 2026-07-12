import { create } from 'zustand'
import { useAuthStore } from '@/features/auth/store/auth-store'
import * as chatsApi from '@/features/chats/api/chats-api'
import { buildChatFromApi } from '@/features/chats/lib/build-chat-from-api'
import type { Chat } from '@/types/chat'

interface ChatsState {
  chats: Chat[]
  activeChatId: string | undefined
  isLoadingChats: boolean
  loadChats: () => Promise<void>
  refreshChat: (chatId: string) => Promise<void>
  setActiveChatId: (chatId: string) => void
  createGroupChat: (title: string, participantIds: string[]) => Promise<string>
  createChannelChat: (title: string, description: string) => Promise<string>
  openDirectChat: (userId: string, displayName: string) => Promise<string>
  isChatAdmin: (chatId: string, userId: string | undefined) => boolean
  addParticipant: (chatId: string, userId: string) => Promise<void>
  removeParticipant: (chatId: string, userId: string) => Promise<void>
}

async function loadChatFromMembership(
  membership: chatsApi.ChatMemberApiResponse,
  currentUserId: string | undefined,
): Promise<Chat> {
  return buildChatFromApi(membership.chat_id, currentUserId)
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  chats: [],
  activeChatId: undefined,
  isLoadingChats: false,

  loadChats: async () => {
    set({ isLoadingChats: true })
    try {
      const currentUserId = useAuthStore.getState().user?.id
      const memberships = await chatsApi.getMyChats()

      const chats = await Promise.all(
        memberships.map((membership) => loadChatFromMembership(membership, currentUserId)),
      )

      set((state) => ({ chats, activeChatId: state.activeChatId ?? chats[0]?.id }))
    } finally {
      set({ isLoadingChats: false })
    }
  },

  refreshChat: async (chatId) => {
    const currentUserId = useAuthStore.getState().user?.id
    const chat = await buildChatFromApi(chatId, currentUserId)

    set((state) => ({
      chats: state.chats.map((item) => (item.id === chatId ? chat : item)),
    }))
  },

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

  addParticipant: async (chatId, userId) => {
    await chatsApi.addChatMember(chatId, userId)
    await get().refreshChat(chatId)
  },

  removeParticipant: async (chatId, userId) => {
    const isSelfRemoval = useAuthStore.getState().user?.id === userId

    if (isSelfRemoval) {
      await chatsApi.leaveChat(chatId)
      set((state) => {
        const chats = state.chats.filter((chat) => chat.id !== chatId)
        const activeChatId =
          state.activeChatId === chatId ? chats[0]?.id : state.activeChatId

        return { chats, activeChatId }
      })
      return
    }

    await chatsApi.removeChatMember(chatId, userId)
    await get().refreshChat(chatId)
  },
}))
