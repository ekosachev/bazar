import { type FormEvent, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail, validatePassword } from '@/features/auth/lib/validation'
import type { LoginPayload } from '@/features/auth/types'

interface FieldErrors {
  email?: string
  password?: string
}

export interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ email, password })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось войти')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label className="text-caption text-content-muted" htmlFor="login-email">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className="text-caption text-danger">{errors.email}</p> : null}
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
