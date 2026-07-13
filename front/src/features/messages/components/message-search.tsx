import { Button, Input } from '@/components/ui'
import { formatMessageTime } from '@/features/messages/lib/format-message-time'
import { cn } from '@/lib/cn'
import type { Message } from '@/types/chat'

export interface MessageSearchProps {
  open: boolean
  query: string
  onQueryChange: (query: string) => void
  onClose: () => void
  matches?: Message[]
  activeMatchId?: string | null
  onSelectMatch?: (messageId: string) => void
}

function truncatePreview(content: string, maxLength = 72) {
  if (content.length <= maxLength) {
    return content
  }

  return `${content.slice(0, maxLength)}…`
}

export function MessageSearch({
  open,
  query,
  onQueryChange,
  onClose,
  matches = [],
  activeMatchId,
  onSelectMatch,
}: MessageSearchProps) {
  if (!open) {
    return null
  }

  const normalizedQuery = query.trim()

  return (
    <div className="border-b border-border bg-bg-elevated px-5 py-3">
      <div className="flex items-center gap-3">
        <Input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Поиск по сообщениям"
          aria-label="Поиск по сообщениям"
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Закрыть
        </Button>
      </div>

      {normalizedQuery ? (
        <div className="mt-3 space-y-2">
          <p className="text-caption text-content-faint">
            {matches.length ? `Найдено: ${matches.length}` : 'Ничего не найдено'}
          </p>

          {matches.length > 0 ? (
            <ul className="max-h-36 space-y-1 overflow-y-auto">
              {matches.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMatch?.(message.id)}
                    className={cn(
                      'w-full rounded-md px-3 py-2 text-left transition-colors',
                      activeMatchId === message.id
                        ? 'bg-bg-hover'
                        : 'hover:bg-bg-hover/70',
                    )}
                  >
                    <span className="block truncate text-body text-content">
                      {truncatePreview(message.content)}
                    </span>
                    <span className="mt-0.5 block text-caption text-content-faint">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
