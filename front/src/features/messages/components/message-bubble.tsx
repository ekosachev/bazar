import { type FormEvent, useEffect, useState } from 'react'
import { Button, IconButton, Input } from '@/components/ui'
import { formatMessageTime } from '@/features/messages/lib/format-message-time'
import { highlightQuery } from '@/features/messages/lib/highlight-query'
import { cn } from '@/lib/cn'
import type { Message } from '@/types/chat'

export interface MessageBubbleProps {
  message: Message
  showSender?: boolean
  highlightQueryText?: string
  isActiveMatch?: boolean
  isPending?: boolean
  onEdit?: (messageId: string, content: string) => Promise<void>
  onDelete?: (messageId: string) => Promise<void>
}

function isEdited(message: Message) {
  if (!message.updatedAt) {
    return false
  }

  return new Date(message.updatedAt).getTime() - new Date(message.createdAt).getTime() > 1000
}

function EditIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5">
      <path
        d="M11.5 2.5l2 2M2.5 13.5l.7-3.5L10.5 2.7l2.3 2.3L5.5 12.3l-3.5.7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5">
      <path
        d="M3.5 4.5h9M6.5 4.5V3.5h3v1M5.5 4.5v8h5v-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeliveryStatusIcon({ status }: { status: 'sent' | 'read' }) {
  if (status === 'read') {
    return (
      <span
        className="inline-block size-1.5 rounded-full bg-accent"
        aria-label="Прочитано"
        title="Прочитано"
      />
    )
  }

  return (
    <span
      className="inline-block size-1.5 rounded-full border border-current opacity-70"
      aria-label="Отправлено"
      title="Отправлено"
    />
  )
}

export function MessageBubble({
  message,
  showSender = false,
  highlightQueryText,
  isActiveMatch = false,
  isPending = false,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const isOwn = message.isOwn
  const canManage = Boolean(isOwn && onEdit && onDelete && !message.id.startsWith('local-'))
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(message.content)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditing) {
      setDraft(message.content)
    }
  }, [isEditing, message.content])

  const contentParts = highlightQuery(message.content, highlightQueryText ?? '')

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!onEdit) {
      return
    }

    const content = draft.trim()
    if (!content || content === message.content) {
      setIsEditing(false)
      return
    }

    setActionError(null)
    try {
      await onEdit(message.id, content)
      setIsEditing(false)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось сохранить')
    }
  }

  async function handleDelete() {
    if (!onDelete) {
      return
    }

    setActionError(null)
    try {
      await onDelete(message.id)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось удалить')
    }
  }

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        'group flex w-full scroll-mt-4',
        isOwn ? 'justify-end' : 'justify-start',
        isActiveMatch && 'rounded-lg ring-2 ring-accent/70',
      )}
    >
      <div className={cn('flex max-w-[min(72%,28rem)] flex-col gap-1', isOwn && 'items-end')}>
        {canManage && !isEditing ? (
          <div
            className={cn(
              'flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100',
              isPending && 'opacity-50',
            )}
          >
            <IconButton
              label="Редактировать сообщение"
              className="size-7"
              disabled={isPending}
              onClick={() => {
                setActionError(null)
                setIsEditing(true)
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              label="Удалить сообщение"
              variant="danger"
              className="size-7"
              disabled={isPending}
              onClick={() => void handleDelete()}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        ) : null}

        <div
          className={cn(
            'w-full rounded-lg px-3.5 py-2 shadow-sm',
            isOwn
              ? 'rounded-br-sm bg-brand text-content'
              : 'rounded-bl-sm bg-surface-muted text-content',
            isPending && 'opacity-70',
          )}
        >
          {showSender && message.senderName && !isOwn ? (
            <p className="mb-1 text-caption text-content-muted">{message.senderName}</p>
          ) : null}

          {isEditing ? (
            <form className="space-y-2" onSubmit={(event) => void handleSave(event)}>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="Текст сообщения"
                autoFocus
                disabled={isPending}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    setIsEditing(false)
                    setDraft(message.content)
                    setActionError(null)
                  }}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={isPending || !draft.trim()}
                >
                  {isPending ? 'Сохраняем…' : 'Сохранить'}
                </Button>
              </div>
            </form>
          ) : (
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
          )}

          {!isEditing ? (
            <p
              className={cn(
                'mt-1 flex items-center justify-end gap-1.5 text-caption',
                isOwn ? 'text-content/70' : 'text-content-faint',
              )}
            >
              {isEdited(message) ? <span>изм.</span> : null}
              <span>{formatMessageTime(message.createdAt)}</span>
              {isOwn && message.status ? <DeliveryStatusIcon status={message.status} /> : null}
            </p>
          ) : null}
        </div>

        {actionError ? <p className="text-caption text-danger">{actionError}</p> : null}
      </div>
    </div>
  )
}
