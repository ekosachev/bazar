import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { ButtonProps } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function LogoutButton(props: Omit<ButtonProps, 'onClick'>) {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  function handleClick() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Button variant="ghost" {...props} onClick={handleClick}>
      Выйти
    </Button>
  )
}
