import { type FormEvent, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Modal } from '@/features/chats/components/modal'
import { UserSelectList } from '@/features/chats/components/user-select-list'
import { mockUsers } from '@/features/chats/data/mock-users'
import { validateChatTitle } from '@/features/chats/lib/chat-validation'
import { useChatsStore } from '@/features/chats/store/chats-store'

export interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
}

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const createGroupChat = useChatsStore((state) => state.createGroupChat)

  const [title, setTitle] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [titleError, setTitleError] = useState<string | null>(null)
  const [participantsError, setParticipantsError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleClose() {
    setTitle('')
    setSelectedIds([])
    setTitleError(null)
    setParticipantsError(null)
    setFormError(null)
    onClose()
  }

  function toggleParticipant(userId: string) {
    setSelectedIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextTitleError = validateChatTitle(title) ?? null
    const nextParticipantsError = selectedIds.length === 0 ? 'Выберите хотя бы одного участника' : null
    setTitleError(nextTitleError)
    setParticipantsError(nextParticipantsError)
    if (nextTitleError || nextParticipantsError) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      await createGroupChat(title.trim(), selectedIds)
      handleClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось создать базар')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Новый базар">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label className="text-caption text-content-muted" htmlFor="group-title">
            Название базара
          </label>
          <Input
            id="group-title"
            placeholder="Например, Базар «Малина»"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(titleError)}
          />
          {titleError ? <p className="text-caption text-danger">{titleError}</p> : null}
        </div>

        <div className="space-y-1.5">
          <span className="text-caption text-content-muted">Участники</span>
          <UserSelectList users={mockUsers} selectedIds={selectedIds} onToggle={toggleParticipant} />
          {participantsError ? (
            <p className="text-caption text-danger">{participantsError}</p>
          ) : null}
        </div>

        {formError ? <p className="text-caption text-danger">{formError}</p> : null}

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Создаём…' : 'Создать базар'}
        </Button>
      </form>
    </Modal>
  )
}
