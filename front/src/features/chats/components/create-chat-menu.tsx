import { useState } from 'react'
import { IconButton, PlusIcon } from '@/components/ui'
import { CreateChannelModal } from '@/features/chats/components/create-channel-modal'
import { CreateGroupModal } from '@/features/chats/components/create-group-modal'

type ModalKind = 'group' | 'channel' | null

export function CreateChatMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openModal, setOpenModal] = useState<ModalKind>(null)

  function openAndClose(modal: ModalKind) {
    setOpenModal(modal)
    setIsMenuOpen(false)
  }

  return (
    <div className="relative">
      <IconButton label="Новый чат" onClick={() => setIsMenuOpen((open) => !open)}>
        <PlusIcon />
      </IconButton>

      {isMenuOpen ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-44 space-y-0.5 rounded-lg border border-border bg-bg-elevated p-1.5 shadow-md">
            <button
              type="button"
              onClick={() => openAndClose('group')}
              className="w-full rounded-md px-2.5 py-2 text-left text-body text-content transition-colors hover:bg-bg-hover"
            >
              Новый базар
            </button>
            <button
              type="button"
              onClick={() => openAndClose('channel')}
              className="w-full rounded-md px-2.5 py-2 text-left text-body text-content transition-colors hover:bg-bg-hover"
            >
              Новая точка
            </button>
          </div>
        </>
      ) : null}

      <CreateGroupModal open={openModal === 'group'} onClose={() => setOpenModal(null)} />
      <CreateChannelModal open={openModal === 'channel'} onClose={() => setOpenModal(null)} />
    </div>
  )
}
