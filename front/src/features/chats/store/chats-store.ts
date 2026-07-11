import { create } from 'zustand'
import * as authApi from '@/features/auth/api/auth-api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import * as chatsApi from '@/features/chats/api/chats-api'
import type { Chat, ChatType } from '@/types/chat'

interface ChatsState {
  chats: Chat[]
  activeChatId: string | undefined
  isLoadingChats: boolean
  loadChats: () => Promise<void>
  setActiveChatId: (chatId: string) => void
  createGroupChat: (title: string, participantIds: string[]) => Promise<string>
  createChannelChat: (title: string, description: string) => Promise<string>
  openDirectChat: (userId: string, displayName: string) => Promise<string>
  isChatAdmin: (chatId: string, userId: string | undefined) => boolean
  addParticipant: (chatId: string, userId: string) => void
  removeParticipant: (chatId: string, userId: string) => void
}

async function loadChatFromMembership(
  membership: chatsApi.ChatMemberApiResponse,
  currentUserId: string | undefined,
): Promise<Chat> {
  const details = await chatsApi.getChatById(membership.chat_id)
  const members = await chatsApi.getChatMembers(details.id)

  const participantIds = members.map((member) => member.user_id)
  const adminIds = members
    .filter((member) => member.role === 'owner' || member.role === 'admin')
    .map((member) => member.user_id)

  if (details.chat_type === 'direct') {
    const peer = members.find((member) => member.user_id !== currentUserId)
    const peerUser = peer ? await authApi.getUserById(peer.user_id).catch(() => null) : null

    return {
      id: details.id,
      type: 'direct',
      title: peerUser?.displayName ?? 'Личный чат',
      peerUserId: peer?.user_id,
      lastMessageAt: details.created_at,
    }
  }

  return {
    id: details.id,
    type: details.chat_type as ChatType,
    title: details.title,
    description: details.description || undefined,
    lastMessageAt: details.created_at,
    participantIds,
    adminIds,
  }
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
