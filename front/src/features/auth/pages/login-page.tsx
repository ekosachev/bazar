import { Link } from 'react-router-dom'
import logoImage from '@/assets/logo.png'
import { LoginForm } from '@/features/auth/components/login-form'
import type { LoginPayload } from '@/features/auth/types'

export function LoginPage() {
  async function handleSubmit(payload: LoginPayload) {
    console.info('login submit', payload)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-bg-elevated p-6 shadow-md">
        <div className="space-y-2 text-center">
          <img src={logoImage} alt="Bazar" className="mx-auto h-28 w-auto" />
          <p className="pt-2 text-body text-content-muted">Войдите в свой аккаунт</p>
        </div>

        <LoginForm onSubmit={handleSubmit} />

        <p className="text-center text-body text-content-muted">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-content underline underline-offset-2">
            Зарегистрируйтесь
          </Link>
        </p>
      </div>
    </div>
  )
}
