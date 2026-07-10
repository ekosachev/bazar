export function validateChatTitle(value: string): string | undefined {
  if (!value.trim()) return 'Введите название'
  if (value.trim().length < 2) return 'Минимум 2 символа'
  return undefined
}
