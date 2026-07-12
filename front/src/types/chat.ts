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
  /** ISO 8601 timestamp of the last message, used for display formatting and activity sorting. */
  lastMessageAt?: string
  unreadCount?: number
  isOnline?: boolean
  /** Group chat ("базар") member ids. */
  participantIds?: string[]
  /** Group chat ("базар") admin user ids — only admins can add/remove participants. */
  adminIds?: string[]
  /** Group/channel owner user id — only the owner can rename the chat or change roles. */
  ownerId?: string
  /** Channel ("точка") description. */
  description?: string
  /** Direct chat ("1-на-1") counterpart user id. */
  peerUserId?: string
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
