import { type FormEvent, useEffect, useState } from 'react'
import { Avatar, Button, Input } from '@/components/ui'
import { LogoutButton } from '@/features/auth/components/logout-button'
import { validateDisplayName, validateUsername } from '@/features/auth/lib/validation'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Modal } from '@/features/chats/components/modal'

export interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !user) {
      return
    }

    setUsername(user.username)
    setDisplayName(user.displayName)
    setUsernameError(null)
    setDisplayNameError(null)
    setFormError(null)
  }, [open, user])

  function handleClose() {
    setFormError(null)
    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const nextUsernameError = validateUsername(username) ?? null
    const nextDisplayNameError = validateDisplayName(displayName) ?? null
    setUsernameError(nextUsernameError)
    setDisplayNameError(nextDisplayNameError)
    if (nextUsernameError || nextDisplayNameError) return

    const payload: { username?: string; displayName?: string } = {}
    const trimmedUsername = username.trim()
    const trimmedDisplayName = displayName.trim()

    if (trimmedUsername !== user.username) {
      payload.username = trimmedUsername
    }

    if (trimmedDisplayName !== user.displayName) {
      payload.displayName = trimmedDisplayName
    }

    if (Object.keys(payload).length === 0) {
      handleClose()
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      await updateProfile(payload)
      handleClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось сохранить профиль')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Профиль">
      {user ? (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="flex items-center gap-3">
            <Avatar name={user.displayName} src={user.avatarUrl} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium text-content">{user.displayName}</p>
              <p className="truncate text-caption text-content-muted">@{user.username}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption text-content-muted" htmlFor="profile-username">
              Имя пользователя
            </label>
            <Input
              id="profile-username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              aria-invalid={Boolean(usernameError)}
            />
            {usernameError ? <p className="text-caption text-danger">{usernameError}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-caption text-content-muted" htmlFor="profile-display-name">
              Отображаемое имя
            </label>
            <Input
              id="profile-display-name"
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              aria-invalid={Boolean(displayNameError)}
            />
            {displayNameError ? (
              <p className="text-caption text-danger">{displayNameError}</p>
            ) : null}
          </div>

          {formError ? <p className="text-caption text-danger">{formError}</p> : null}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
          </Button>

          <div className="border-t border-border pt-4">
            <LogoutButton variant="secondary" className="w-full" />
          </div>
        </form>
      ) : null}
    </Modal>
  )
}
