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
