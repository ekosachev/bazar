import { type FormEvent, useState } from 'react'
import { Button, Input } from '@/components/ui'
import {
  validateConfirmPassword,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/features/auth/lib/validation'
import type { RegisterPayload } from '@/features/auth/types'

interface FieldErrors {
  username?: string
  displayName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export interface RegisterFormProps {
  onSubmit: (payload: RegisterPayload) => Promise<void>
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      username: validateUsername(username),
      displayName: validateDisplayName(displayName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ username, displayName, email, password })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось зарегистрироваться')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label className="text-caption text-content-muted" htmlFor="register-username">
          Имя пользователя
        </label>
        <Input
          id="register-username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={Boolean(errors.username)}
        />
        {errors.username ? <p className="text-caption text-danger">{errors.username}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-caption text-content-muted" htmlFor="register-display-name">
          Имя
        </label>
        <Input
          id="register-display-name"
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          aria-invalid={Boolean(errors.displayName)}
        />
        {errors.displayName ? (
          <p className="text-caption text-danger">{errors.displayName}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-caption text-content-muted" htmlFor="register-email">
          Email
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className="text-caption text-danger">{errors.email}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-caption text-content-muted" htmlFor="register-password">
          Пароль
        </label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className="text-caption text-danger">{errors.password}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-caption text-content-muted" htmlFor="register-confirm-password">
          Повторите пароль
        </label>
        <Input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        {errors.confirmPassword ? (
          <p className="text-caption text-danger">{errors.confirmPassword}</p>
        ) : null}
      </div>

      {formError ? <p className="text-caption text-danger">{formError}</p> : null}

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Регистрируем…' : 'Зарегистрироваться'}
      </Button>
    </form>
  )
}
