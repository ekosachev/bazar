export type ChatType = 'direct' | 'group' | 'channel'

export interface User {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
}

export interface Chat {
  id: string
  type: ChatType
  title: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
  isOnline?: boolean
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName?: string
  content: string
  createdAt: string
  isOwn?: boolean
}
