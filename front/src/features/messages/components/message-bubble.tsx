import { cn } from '@/lib/cn'
import type { Message } from '@/types/chat'

export interface MessageBubbleProps {
  message: Message
  showSender?: boolean
}

export function MessageBubble({ message, showSender = false }: MessageBubbleProps) {
  const isOwn = message.isOwn

  return (
    <div className={cn('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
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
        <p className="text-body-lg whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'mt-1 text-right text-caption',
            isOwn ? 'text-content/70' : 'text-content-faint',
          )}
        >
          {message.createdAt}
        </p>
      </div>
    </div>
  )
}
