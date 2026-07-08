const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_]+$/

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Введите email'
  if (!EMAIL_RE.test(value)) return 'Некорректный email'
  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Введите пароль'
  if (value.length < 8) return 'Минимум 8 символов'
  return undefined
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return 'Повторите пароль'
  if (confirmPassword !== password) return 'Пароли не совпадают'
  return undefined
}

export function validateUsername(value: string): string | undefined {
  if (!value.trim()) return 'Введите имя пользователя'
  if (value.length < 3) return 'Минимум 3 символа'
  if (!USERNAME_RE.test(value)) return 'Только латиница, цифры и _'
  return undefined
}

export function validateDisplayName(value: string): string | undefined {
  if (!value.trim()) return 'Введите имя'
  return undefined
}
