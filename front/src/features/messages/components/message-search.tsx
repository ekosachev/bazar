import { Button, Input } from '@/components/ui'

export interface MessageSearchProps {
  open: boolean
  query: string
  onQueryChange: (query: string) => void
  onClose: () => void
  matchCount?: number
}

export function MessageSearch({
  open,
  query,
  onQueryChange,
  onClose,
  matchCount,
}: MessageSearchProps) {
  if (!open) {
    return null
  }

  const normalizedQuery = query.trim()

  return (
    <div className="border-b border-border bg-bg-elevated px-5 py-3">
      <div className="flex items-center gap-3">
        <Input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Поиск по сообщениям"
          aria-label="Поиск по сообщениям"
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Закрыть
        </Button>
      </div>
      {normalizedQuery ? (
        <p className="mt-2 text-caption text-content-faint">
          {matchCount
            ? `Найдено: ${matchCount}`
            : 'Ничего не найдено'}
        </p>
      ) : null}
    </div>
  )
}
