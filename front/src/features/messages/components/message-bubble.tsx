import { cn } from '@/lib/cn'
import { formatMessageTime } from '@/features/messages/lib/format-message-time'
import { highlightQuery } from '@/features/messages/lib/highlight-query'
import type { Message } from '@/types/chat'

export interface MessageBubbleProps {
  message: Message
  showSender?: boolean
  highlightQueryText?: string
  isActiveMatch?: boolean
}

export function MessageBubble({
  message,
  showSender = false,
  highlightQueryText,
  isActiveMatch = false,
}: MessageBubbleProps) {
  const isOwn = message.isOwn
  const contentParts = highlightQuery(message.content, highlightQueryText ?? '')

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        'flex w-full scroll-mt-4',
        isOwn ? 'justify-end' : 'justify-start',
        isActiveMatch && 'rounded-lg ring-2 ring-accent/70',
      )}
    >
      <div
        className={cn(
          'max-w-[min(72%,28rem)] rounded-lg px-3.5 py-2 shadow-sm',
          isOwn
            ? 'rounded-br-sm bg-brand text-content'
            : 'rounded-bl-sm bg-surface-muted text-content',
        )}
      >
        {showSender && message.senderName && !isOwn ? (
          <p className="mb-1 text-caption text-content-muted">{message.senderName}</p>
        ) : null}
        <p className="text-body-lg whitespace-pre-wrap">
          {contentParts.map((part, index) =>
            part.highlight ? (
              <mark
                key={`${message.id}-part-${index}`}
                className={cn(
                  'rounded-sm px-0.5',
                  isOwn ? 'bg-white/25 text-content' : 'bg-accent/35 text-content',
                )}
              >
                {part.text}
              </mark>
            ) : (
              <span key={`${message.id}-part-${index}`}>{part.text}</span>
            ),
          )}
        </p>
        <p
          className={cn(
            'mt-1 text-right text-caption',
            isOwn ? 'text-content/70' : 'text-content-faint',
          )}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
