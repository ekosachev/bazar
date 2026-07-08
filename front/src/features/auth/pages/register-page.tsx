import { Link, useNavigate } from 'react-router-dom'
import logoImage from '@/assets/logo.png'
import { RegisterForm } from '@/features/auth/components/register-form'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { RegisterPayload } from '@/features/auth/types'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)

  async function handleSubmit(payload: RegisterPayload) {
    await register(payload)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-bg-elevated p-6 shadow-md">
        <div className="space-y-2 text-center">
          <img src={logoImage} alt="Bazar" className="mx-auto h-28 w-auto" />
          <p className="pt-2 text-body text-content-muted">Создайте аккаунт</p>
        </div>

        <RegisterForm onSubmit={handleSubmit} />

        <p className="text-center text-body text-content-muted">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-content underline underline-offset-2">
            Войдите
          </Link>
        </p>
      </div>
    </div>
  )
}
