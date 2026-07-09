import { type FormEvent, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { validatePassword, validateUsername } from '@/features/auth/lib/validation'
import type { LoginPayload } from '@/features/auth/types'

interface FieldErrors {
  username?: string
  password?: string
}

export interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
    }
    setErrors(nextErrors)
    if (nextErrors.username || nextErrors.password) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ username, password })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось войти')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label className="text-caption text-content-muted" htmlFor="login-username">
          Имя пользователя
        </label>
        <Input
          id="login-username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={Boolean(errors.username)}
        />
        {errors.username ? <p className="text-caption text-danger">{errors.username}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-caption text-content-muted" htmlFor="login-password">
          Пароль
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className="text-caption text-danger">{errors.password}</p> : null}
      </div>

      {formError ? <p className="text-caption text-danger">{formError}</p> : null}

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  )
}
