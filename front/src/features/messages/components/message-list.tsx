import { type RefObject } from 'react'
import { MessageBubble } from '@/features/messages/components/message-bubble'
import { useAutoScroll } from '@/features/messages/hooks/use-auto-scroll'
import type { Message } from '@/types/chat'

export interface MessageListProps {
  messages: Message[]
  showSender?: boolean
  containerRef: RefObject<HTMLDivElement | null>
  onScroll?: () => void
  isLoadingMore?: boolean
  highlightQuery?: string
  emptyText?: string
  activeMatchId?: string | null
}

export function MessageList({
  messages,
  showSender = false,
  containerRef,
  onScroll,
  isLoadingMore = false,
  highlightQuery,
  emptyText = 'Сообщений пока нет',
  activeMatchId,
}: MessageListProps) {
  useAutoScroll(messages, containerRef)

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 py-4">
        <p className="text-body text-content-faint">{emptyText}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
    >
      {isLoadingMore ? (
        <p className="text-center text-caption text-content-faint">Загрузка…</p>
      ) : null}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          showSender={showSender}
          highlightQueryText={highlightQuery}
          isActiveMatch={activeMatchId === message.id}
        />
      ))}
    </div>
  )
}
