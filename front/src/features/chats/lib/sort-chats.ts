import type { Chat } from '@/types/chat'

export function sortChatsByActivity(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return bTime - aTime
  })
}
