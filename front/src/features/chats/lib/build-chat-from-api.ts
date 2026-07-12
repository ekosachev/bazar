import * as authApi from '@/features/auth/api/auth-api'
import * as chatsApi from '@/features/chats/api/chats-api'
import type { Chat, ChatType } from '@/types/chat'

export async function buildChatFromApi(
  chatId: string,
  currentUserId: string | undefined,
): Promise<Chat> {
  const details = await chatsApi.getChatById(chatId)
  const members = await chatsApi.getChatMembers(chatId)

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
