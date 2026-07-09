import { Avatar, Badge } from '@/components/ui'
import { getChatTypeLabel } from '@/features/chats/lib/chat-labels'
import { ChatTypeIcon } from '@/features/chats/components/chat-type-icon'
import { getChatTypeLabel } from '@/features/chats/lib/chat-labels'
import { formatChatTimestamp } from '@/features/chats/lib/format-time'
import { cn } from '@/lib/cn'
import type { Chat } from '@/types/chat'

interface ChatListItemProps {
  chat: Chat
  active?: boolean
  onSelect?: (chatId: string) => void
}

export function ChatListItem({ chat, active = false, onSelect }: ChatListItemProps) {
  const typeLabel = getChatTypeLabel(chat.type)

  return (
    <button
      type="button"
      onClick={() => onSelect?.(chat.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        active ? 'bg-bg-hover' : 'hover:bg-bg-hover/70',
      )}
    >
      <Avatar
        name={chat.title}
        size="lg"
        online={chat.type === 'direct' ? chat.isOnline : undefined}
      />
      <div className="relative shrink-0">
        <Avatar
          name={chat.title}
          size="lg"
          online={chat.type === 'direct' ? chat.isOnline : undefined}
        />
        <ChatTypeIcon type={chat.type} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-content">{chat.title}</span>
            {typeLabel ? (
              <span className="shrink-0 text-caption text-content-faint">{typeLabel}</span>
            ) : null}
          </div>
          {chat.lastMessageAt ? (
            <span className="shrink-0 text-caption text-content-faint">{chat.lastMessageAt}</span>
            <span className="shrink-0 text-caption text-content-faint">
              {formatChatTimestamp(chat.lastMessageAt)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-body text-content-muted">{chat.lastMessage}</p>
          {chat.unreadCount ? (
            <Badge variant="unread">{chat.unreadCount}</Badge>
          ) : null}
        </div>
      </div>
    </button>
  )
}
