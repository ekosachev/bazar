import { type FormEvent, useState } from 'react'
import { Button, Input } from '@/components/ui'

export interface MessageComposerProps {
  onSubmit: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

export function MessageComposer({
  onSubmit,
  placeholder = 'Написать сообщение',
  disabled = false,
}: MessageComposerProps) {
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const content = draft.trim()
    if (!content || disabled) {
      return
    }

    onSubmit(content)
    setDraft('')
  }

  return (
    <form className="flex items-center gap-3" onSubmit={handleSubmit}>
      <Input
        className="flex-1"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
      />
      <Button type="submit" variant="primary" disabled={disabled || !draft.trim()}>
        Газ
      </Button>
    </form>
  )
}
