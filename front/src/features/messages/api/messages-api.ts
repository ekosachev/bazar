import { apiFetch } from '@/lib/http-client'
import type { Message } from '@/types/chat'

export interface GetChatMessagesParams {
  /** Load messages older than this message id (pagination up). */
  before?: string
  limit?: number
}

interface MessageApiResponse {
  id: string
  chat_id: string
  sender_id: string
  sender_name?: string | null
  content: string
  created_at: string
  updated_at?: string
  reply_to_id?: string | null
}

export function toMessage(response: MessageApiResponse, currentUserId?: string): Message {
  return {
    id: response.id,
    chatId: response.chat_id,
    senderId: response.sender_id,
    senderName: response.sender_name ?? undefined,
    content: response.content,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    replyToId: response.reply_to_id ?? undefined,
    isOwn: currentUserId ? response.sender_id === currentUserId : undefined,
  }
}

function buildQuery(params: GetChatMessagesParams) {
  const search = new URLSearchParams()

  if (params.before) {
    search.set('before', params.before)
  }

  if (params.limit) {
    search.set('limit', String(params.limit))
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function getChatMessages(
  chatId: string,
  params: GetChatMessagesParams = {},
  currentUserId?: string,
): Promise<{ messages: Message[]; hasMore: boolean }> {
  // Backend returns a flat array (newest-first), no pagination metadata.
  const response = await apiFetch<MessageApiResponse[] | null>(
    `/chat/${chatId}/messages${buildQuery(params)}`,
    { method: 'GET' },
  )

  const rawMessages = response ?? []
  const limit = params.limit ?? rawMessages.length

  return {
    // Reverse to the chronological (oldest-first) order the store expects.
    messages: rawMessages.map((message) => toMessage(message, currentUserId)).reverse(),
    hasMore: rawMessages.length >= limit && rawMessages.length > 0,
  }
}

export async function searchChatMessages(
  chatId: string,
  query: string,
  currentUserId?: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ query })
  const response = await apiFetch<MessageApiResponse[] | null>(
    `/chat/${chatId}/messages/search?${params}`,
    { method: 'GET' },
  )

  return (response ?? []).map((message) => toMessage(message, currentUserId))
}

export function updateChatMessage(chatId: string, messageId: string, content: string) {
  return apiFetch<void>(`/chat/${chatId}/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export function deleteChatMessage(chatId: string, messageId: string) {
  return apiFetch<void>(`/chat/${chatId}/messages/${messageId}`, {
    method: 'DELETE',
  })
}
