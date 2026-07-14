import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Avatar, Badge, Button, IconButton, Input } from '@/components/ui'
import * as authApi from '@/features/auth/api/auth-api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Modal } from '@/features/chats/components/modal'
import {
  USER_SEARCH_MIN_LENGTH,
  useUserSearch,
} from '@/features/chats/hooks/use-user-search'
import { validateChatTitle } from '@/features/chats/lib/chat-validation'
import { useChatsStore } from '@/features/chats/store/chats-store'
import type { User } from '@/types/chat'

export interface ParticipantsPanelProps {
  chatId: string | null
  onClose: () => void
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

async function loadParticipantUsers(
  participantIds: string[],
  currentUser: User | null,
): Promise<User[]> {
  const users = await Promise.all(
    participantIds.map(async (userId) => {
      if (currentUser?.id === userId) {
        return currentUser
      }

      try {
        return await authApi.getUserById(userId)
      } catch {
        return {
          id: userId,
          username: userId,
          displayName: 'Пользователь',
        }
      }
    }),
  )

  return users
}

export function ParticipantsPanel({ chatId, onClose }: ParticipantsPanelProps) {
  const chat = useChatsStore((state) => state.chats.find((item) => item.id === chatId))
  const addParticipant = useChatsStore((state) => state.addParticipant)
  const removeParticipant = useChatsStore((state) => state.removeParticipant)
  const updateChat = useChatsStore((state) => state.updateChat)
  const setMemberRole = useChatsStore((state) => state.setMemberRole)
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?.id
  const isAdmin = Boolean(chat && currentUserId && chat.adminIds?.includes(currentUserId))
  const isOwner = Boolean(chat && currentUserId && chat.ownerId === currentUserId)

  const [participants, setParticipants] = useState<User[]>([])
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  const [participantsError, setParticipantsError] = useState<string | null>(null)

  const [isAddingOpen, setIsAddingOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  const [isEditingChat, setIsEditingChat] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTitleError, setEditTitleError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSavingChat, setIsSavingChat] = useState(false)

  const participantIds = chat?.participantIds ?? []
  const participantIdsKey = participantIds.join(',')

  const excludeUserIds = useMemo(
    () => (currentUserId ? [...participantIds, currentUserId] : participantIds),
    // participantIdsKey is the stable, deduplicated form of participantIds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId, participantIdsKey],
  )

  const {
    users: searchResults,
    isSearching,
    error: searchError,
  } = useUserSearch({
    query: searchQuery,
    enabled: isAddingOpen,
    excludeUserIds,
  })

  useEffect(() => {
    if (!chatId) {
      setParticipants([])
      setParticipantsError(null)
      return
    }

    if (participantIds.length === 0) {
      setParticipants([])
      setParticipantsError(null)
      return
    }

    let cancelled = false

    async function loadParticipants() {
      setIsLoadingParticipants(true)
      setParticipantsError(null)

      try {
        const users = await loadParticipantUsers(participantIds, currentUser ?? null)
        if (!cancelled) {
          setParticipants(users)
        }
      } catch (error) {
        if (!cancelled) {
          setParticipantsError(
            error instanceof Error ? error.message : 'Не удалось загрузить участников',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingParticipants(false)
        }
      }
    }

    void loadParticipants()

    return () => {
      cancelled = true
    }
    // participantIds is a new array every render — participantIdsKey is the
    // stable dependency that actually reflects when membership changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, currentUser, participantIdsKey])

  function handleClose() {
    setIsAddingOpen(false)
    setSearchQuery('')
    setActionError(null)
    setIsEditingChat(false)
    setEditError(null)
    onClose()
  }

  async function handleAddParticipant(userId: string) {
    if (!chat) return

    setActionError(null)
    setPendingUserId(userId)

    try {
      await addParticipant(chat.id, userId)
      setSearchQuery('')
      setIsAddingOpen(false)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось добавить участника')
    } finally {
      setPendingUserId(null)
    }
  }

  async function handleRemoveParticipant(userId: string) {
    if (!chat) return

    setActionError(null)
    setPendingUserId(userId)

    try {
      await removeParticipant(chat.id, userId)
      if (userId === currentUserId) {
        handleClose()
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось удалить участника')
    } finally {
      setPendingUserId(null)
    }
  }

  async function handleToggleRole(userId: string, isCurrentlyAdmin: boolean) {
    if (!chat) return

    setActionError(null)
    setPendingUserId(userId)

    try {
      await setMemberRole(chat.id, userId, isCurrentlyAdmin ? 'member' : 'admin')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось изменить роль')
    } finally {
      setPendingUserId(null)
    }
  }

  function startEditingChat() {
    if (!chat) return
    setEditTitle(chat.title)
    setEditDescription(chat.description ?? '')
    setEditTitleError(null)
    setEditError(null)
    setIsEditingChat(true)
  }

  async function handleSaveChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!chat) return

    const nextTitleError = validateChatTitle(editTitle) ?? null
    setEditTitleError(nextTitleError)
    if (nextTitleError) return

    setEditError(null)
    setIsSavingChat(true)
    try {
      await updateChat(chat.id, { title: editTitle.trim(), description: editDescription.trim() })
      setIsEditingChat(false)
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Не удалось сохранить изменения')
    } finally {
      setIsSavingChat(false)
    }
  }

  const trimmedQuery = searchQuery.trim()

  return (
    <Modal
      open={Boolean(chatId)}
      onClose={handleClose}
      title={chat ? `Участники «${chat.title}»` : 'Участники'}
    >
      {isOwner ? (
        <div className="mb-4 space-y-3 border-b border-border pb-4">
          {isEditingChat ? (
            <form className="space-y-3" onSubmit={handleSaveChat} noValidate>
              <div className="space-y-1.5">
                <label className="text-caption text-content-muted" htmlFor="chat-edit-title">
                  Название
                </label>
                <Input
                  id="chat-edit-title"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  aria-invalid={Boolean(editTitleError)}
                />
                {editTitleError ? (
                  <p className="text-caption text-danger">{editTitleError}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-caption text-content-muted" htmlFor="chat-edit-description">
                  Описание
                </label>
                <Input
                  id="chat-edit-description"
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                />
              </div>

              {editError ? <p className="text-caption text-danger">{editError}</p> : null}

              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={isSavingChat}>
                  {isSavingChat ? 'Сохраняем…' : 'Сохранить'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditingChat(false)}
                  disabled={isSavingChat}
                >
                  Отмена
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="secondary" className="w-full" onClick={startEditingChat}>
              Изменить название/описание
            </Button>
          )}
        </div>
      ) : null}

      {isLoadingParticipants ? (
        <p className="text-body text-content-muted">Загрузка участников…</p>
      ) : participantsError ? (
        <p className="text-body text-danger">{participantsError}</p>
      ) : participants.length === 0 ? (
        <p className="text-body text-content-muted">Пока нет участников</p>
      ) : (
        <ul className="max-h-72 space-y-0.5 overflow-y-auto">
          {participants.map((user) => (
            <li key={user.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar name={user.displayName} size="sm" />
              <span className="min-w-0 flex-1 truncate text-body text-content">
                {user.displayName}
              </span>
              {user.id === chat?.ownerId ? (
                <Badge variant="neutral">Создатель</Badge>
              ) : chat?.adminIds?.includes(user.id) ? (
                <Badge variant="neutral">Админ</Badge>
              ) : null}
              {isOwner && user.id !== chat?.ownerId && user.id !== currentUserId ? (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pendingUserId === user.id}
                  onClick={() =>
                    void handleToggleRole(user.id, Boolean(chat?.adminIds?.includes(user.id)))
                  }
                >
                  {chat?.adminIds?.includes(user.id) ? 'Снять админа' : 'Сделать админом'}
                </Button>
              ) : null}
              {isAdmin || user.id === currentUserId ? (
                <IconButton
                  label={user.id === currentUserId ? 'Выйти из базара' : `Удалить ${user.displayName}`}
                  variant="danger"
                  disabled={pendingUserId === user.id}
                  onClick={() => void handleRemoveParticipant(user.id)}
                >
                  <RemoveIcon />
                </IconButton>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {actionError ? <p className="mt-3 text-caption text-danger">{actionError}</p> : null}

      {isAdmin ? (
        <div className="mt-4 border-t border-border pt-4">
          {isAddingOpen ? (
            <div className="space-y-3">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по username"
                aria-label="Поиск пользователя"
                autoFocus
              />

              {isSearching ? (
                <p className="text-body text-content-muted">Ищем…</p>
              ) : searchError ? (
                <p className="text-body text-danger">{searchError}</p>
              ) : trimmedQuery.length < USER_SEARCH_MIN_LENGTH ? (
                <p className="text-body text-content-muted">Введите минимум 2 символа</p>
              ) : searchResults.length === 0 ? (
                <p className="text-body text-content-muted">Никого не нашли</p>
              ) : (
                <ul className="max-h-48 space-y-0.5 overflow-y-auto">
                  {searchResults.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        disabled={pendingUserId === user.id}
                        onClick={() => void handleAddParticipant(user.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-bg-hover/70 disabled:opacity-60"
                      >
                        <Avatar name={user.displayName} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-body text-content">
                          {user.displayName}
                        </span>
                        <span className="shrink-0 text-caption text-content-faint">
                          @{user.username}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <Button variant="secondary" className="w-full" onClick={() => setIsAddingOpen(true)}>
              Добавить участника
            </Button>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
