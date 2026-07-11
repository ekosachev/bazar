import { Button, Input } from '@/components/ui'

export interface MessageSearchProps {
  open: boolean
  query: string
  onQueryChange: (query: string) => void
  onClose: () => void
}

export function MessageSearch({ open, query, onQueryChange, onClose }: MessageSearchProps) {
  if (!open) {
    return null
  }

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
    </div>
  )
}
