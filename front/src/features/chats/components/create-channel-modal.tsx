import { type FormEvent, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Modal } from '@/features/chats/components/modal'
import { validateChatTitle } from '@/features/chats/lib/chat-validation'
import { useChatsStore } from '@/features/chats/store/chats-store'
import { cn } from '@/lib/cn'

export interface CreateChannelModalProps {
  open: boolean
  onClose: () => void
}

export function CreateChannelModal({ open, onClose }: CreateChannelModalProps) {
  const createChannelChat = useChatsStore((state) => state.createChannelChat)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleClose() {
    setTitle('')
    setDescription('')
    setTitleError(null)
    setFormError(null)
    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextTitleError = validateChatTitle(title) ?? null
    setTitleError(nextTitleError)
    if (nextTitleError) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      await createChannelChat(title.trim(), description)
      handleClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось создать точку')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Новая точка">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label className="text-caption text-content-muted" htmlFor="channel-title">
            Название точки
          </label>
          <Input
            id="channel-title"
            placeholder="Например, Точка «Смородина»"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(titleError)}
          />
          {titleError ? <p className="text-caption text-danger">{titleError}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-caption text-content-muted" htmlFor="channel-description">
            Описание
          </label>
          <textarea
            id="channel-description"
            placeholder="О чём эта точка"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={cn(
              'w-full resize-none rounded-md border border-border bg-bg-subtle px-3.5 py-2.5',
              'text-body-lg text-content placeholder:text-content-faint',
              'transition-colors hover:border-border-strong',
              'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
            )}
          />
        </div>

        {formError ? <p className="text-caption text-danger">{formError}</p> : null}

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Создаём…' : 'Создать точку'}
        </Button>
      </form>
    </Modal>
  )
}
