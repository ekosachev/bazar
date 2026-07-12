import { type FormEvent, useMemo, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Modal } from '@/features/chats/components/modal'
import { UserSelectList } from '@/features/chats/components/user-select-list'
import {
  USER_SEARCH_MIN_LENGTH,
  useUserSearch,
} from '@/features/chats/hooks/use-user-search'
import { validateChatTitle } from '@/features/chats/lib/chat-validation'
import { useChatsStore } from '@/features/chats/store/chats-store'
import type { User } from '@/types/chat'

export interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
}

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const createGroupChat = useChatsStore((state) => state.createGroupChat)
  const currentUserId = useAuthStore((state) => state.user?.id)

  const [title, setTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [titleError, setTitleError] = useState<string | null>(null)
  const [participantsError, setParticipantsError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { users: searchResults, isSearching, error: searchError } = useUserSearch({
    query: searchQuery,
    enabled: open,
    excludeUserIds: currentUserId ? [currentUserId] : [],
  })

  const selectableUsers = useMemo(() => {
    const byId = new Map<string, User>()
    for (const user of selectedUsers) {
      byId.set(user.id, user)
    }
    for (const user of searchResults) {
      byId.set(user.id, user)
    }
    return Array.from(byId.values())
  }, [searchResults, selectedUsers])

  const selectedIds = useMemo(() => selectedUsers.map((user) => user.id), [selectedUsers])

  function handleClose() {
    setTitle('')
    setSearchQuery('')
    setSelectedUsers([])
    setTitleError(null)
    setParticipantsError(null)
    setFormError(null)
    onClose()
  }

  function toggleParticipant(userId: string) {
    setSelectedUsers((current) => {
      const existing = current.find((user) => user.id === userId)
      if (existing) {
        return current.filter((user) => user.id !== userId)
      }

      const user = selectableUsers.find((item) => item.id === userId)
      return user ? [...current, user] : current
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextTitleError = validateChatTitle(title) ?? null
    const nextParticipantsError =
      selectedUsers.length === 0 ? 'Выберите хотя бы одного участника' : null
    setTitleError(nextTitleError)
    setParticipantsError(nextParticipantsError)
    if (nextTitleError || nextParticipantsError) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      await createGroupChat(
        title.trim(),
        selectedUsers.map((user) => user.id),
      )
      handleClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось создать базар')
    } finally {
      setIsSubmitting(false)
    }
  }

  const trimmedQuery = searchQuery.trim()

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
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск по username"
            aria-label="Поиск участников"
          />

          {isSearching ? (
            <p className="text-body text-content-muted">Ищем…</p>
          ) : searchError ? (
            <p className="text-body text-danger">{searchError}</p>
          ) : trimmedQuery.length > 0 && trimmedQuery.length < USER_SEARCH_MIN_LENGTH ? (
            <p className="text-body text-content-muted">Введите минимум 2 символа</p>
          ) : trimmedQuery.length >= USER_SEARCH_MIN_LENGTH && searchResults.length === 0 ? (
            <p className="text-body text-content-muted">Никого не нашли</p>
          ) : selectedUsers.length === 0 && trimmedQuery.length < USER_SEARCH_MIN_LENGTH ? (
            <p className="text-body text-content-muted">Найдите участников по username</p>
          ) : (
            <UserSelectList
              users={selectableUsers}
              selectedIds={selectedIds}
              onToggle={toggleParticipant}
            />
          )}

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
