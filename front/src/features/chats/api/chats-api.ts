import { apiFetch } from '@/lib/http-client'

export interface ChatApiResponse {
  id: string
  chat_type: string
  title: string
  description: string
  avatar_url: string | null
  created_by: string
  created_at: string
}

export function createGroupChat(title: string, description: string, memberIds: string[]) {
  return apiFetch<ChatApiResponse>('/chat/group', {
    method: 'POST',
    body: JSON.stringify({ title, description, members: memberIds }),
  })
}

export function createChannelChat(title: string, description: string) {
  return apiFetch<ChatApiResponse>('/chat/channel', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })
}

export function createDirectChat(targetUserId: string) {
  return apiFetch<ChatApiResponse>('/chat/direct', {
    method: 'POST',
    body: JSON.stringify({ target_user_id: targetUserId }),
  })
}

export interface ChatMemberApiResponse {
  chat_id: string
  user_id: string
  role: 'member' | 'admin' | 'owner'
  last_read_message_id: string | null
  invited_by: string
  created_at: string
}

export function getMyChats() {
  return apiFetch<ChatMemberApiResponse[]>('/user/my_chats', { method: 'GET' })
}

export function getChatById(chatId: string) {
  return apiFetch<ChatApiResponse>(`/chat/${chatId}`, { method: 'GET' })
}

export function getChatMembers(chatId: string) {
  return apiFetch<ChatMemberApiResponse[]>(`/chat/${chatId}/members`, { method: 'GET' })
}

export function addChatMember(chatId: string, userId: string) {
  return apiFetch<void>(`/chat/${chatId}/members/add`, {
    method: 'PUT',
    body: JSON.stringify({ user_id: userId }),
  })
}

export function removeChatMember(chatId: string, userId: string) {
  return apiFetch<void>(`/chat/${chatId}/members/remove`, {
    method: 'PUT',
    body: JSON.stringify({ user_id: userId }),
  })
}

export function leaveChat(chatId: string) {
  return apiFetch<void>(`/chat/${chatId}/leave`, { method: 'DELETE' })
}

export function updateChat(chatId: string, payload: { title?: string; description?: string }) {
  return apiFetch<ChatApiResponse>(`/chat/${chatId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function setChatMemberRole(chatId: string, userId: string, newRole: 'admin' | 'member') {
  return apiFetch<void>(`/chat/${chatId}/members/set_role`, {
    method: 'PUT',
    body: JSON.stringify({ user_id: userId, new_role: newRole }),
  })
}
