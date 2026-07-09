import { cn } from '@/lib/cn'
import type { ChatType } from '@/types/chat'

interface ChatTypeIconProps {
  type: ChatType
  className?: string
}

export function ChatTypeIcon({ type, className }: ChatTypeIconProps) {
  if (type === 'direct') return null

  return (
    <span
      className={cn(
        'absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full',
        'bg-surface-muted text-content-secondary ring-2 ring-bg-elevated',
        className,
      )}
      aria-hidden
    >
      {type === 'group' ? <GroupGlyph /> : <ChannelGlyph />}
    </span>
  )
}

function GroupGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-2.5">
      <circle cx="5.5" cy="6" r="2" fill="currentColor" />
      <circle cx="10.5" cy="6" r="2" fill="currentColor" />
      <path
        d="M2 13c.4-2.4 1.8-3.5 3.5-3.5S8.6 10.6 9 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M7 13c.4-2.4 1.8-3.5 3.5-3.5S13.6 10.6 14 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChannelGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-2.5">
      <path d="M2 6.5 13 3v10L2 9.5V6.5Z" fill="currentColor" />
      <path
        d="M4 9.5v3a1 1 0 0 0 1 1h.5a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
