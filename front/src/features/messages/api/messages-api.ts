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
}

function toMessage(response: MessageApiResponse, currentUserId?: string): Message {
  return {
    id: response.id,
    chatId: response.chat_id,
    senderId: response.sender_id,
    senderName: response.sender_name ?? undefined,
    content: response.content,
    createdAt: response.created_at,
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
