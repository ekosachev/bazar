export function formatChatTimestamp(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'вчера'
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' })
  }

  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}
