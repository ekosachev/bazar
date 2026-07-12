import { useEffect, useState } from 'react'
import { Avatar, Button, IconButton, Input } from '@/components/ui'
import * as authApi from '@/features/auth/api/auth-api'
import { searchUsers } from '@/features/chats/api/users-api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Modal } from '@/features/chats/components/modal'
import { useChatsStore } from '@/features/chats/store/chats-store'
import type { User } from '@/types/chat'

export interface ParticipantsPanelProps {
  chatId: string | null
  onClose: () => void
}

const SEARCH_DEBOUNCE_MS = 300

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
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?.id
  const isAdmin = Boolean(chat && currentUserId && chat.adminIds?.includes(currentUserId))

  const [participants, setParticipants] = useState<User[]>([])
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  const [participantsError, setParticipantsError] = useState<string | null>(null)

  const [isAddingOpen, setIsAddingOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  const participantIds = chat?.participantIds ?? []
  const participantIdsKey = participantIds.join(',')

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
  }, [chatId, currentUser, participantIdsKey])

  useEffect(() => {
    if (!isAddingOpen) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery.length < 2) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true)
        setSearchError(null)

        try {
          const users = await searchUsers(trimmedQuery)
          if (!cancelled) {
            setSearchResults(
              users.filter(
                (user) => user.id !== currentUserId && !participantIds.includes(user.id),
              ),
            )
          }
        } catch (error) {
          if (!cancelled) {
            setSearchError(error instanceof Error ? error.message : 'Не удалось найти пользователей')
          }
        } finally {
          if (!cancelled) {
            setIsSearching(false)
          }
        }
      })()
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [currentUserId, isAddingOpen, participantIds, searchQuery])

  function handleClose() {
    setIsAddingOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setActionError(null)
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

  return (
    <Modal
      open={Boolean(chatId)}
      onClose={handleClose}
      title={chat ? `Участники «${chat.title}»` : 'Участники'}
    >
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
              ) : searchQuery.trim().length < 2 ? (
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
