'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { AgentChatSummary } from '@/lib/api/agent-mode-chat'
import { ChevronDown, MessageSquare } from '@/lib/icons'

const MAX_LISTED = 20
const CHIP =
  'flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--cat-card-border)] bg-[var(--cat-content)]/85 px-3 text-[13px] text-[var(--cat-ink-2)] backdrop-blur-sm hover:text-[var(--cat-ink)]'
const PANEL =
  'absolute right-0 z-50 mt-2 max-h-[60vh] w-[300px] overflow-y-auto rounded-xl border border-[var(--cat-card-border)] bg-[var(--cat-content)] p-1 shadow-lg'

interface AgentChatHistoryProps {
  chats: AgentChatSummary[]
  activeChatId: string | undefined
  chatHref: (chatId: string) => string
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(iso),
  )
}

interface HistoryListProps extends AgentChatHistoryProps {
  onPick: () => void
}

function HistoryList({ chats, activeChatId, chatHref, onPick }: HistoryListProps): JSX.Element {
  if (chats.length === 0) {
    return <p className="px-3 py-2 text-[12px] text-[var(--cat-ink-3)]">No previous chats yet.</p>
  }
  return (
    <>
      {chats.slice(0, MAX_LISTED).map(chat => (
        <Link
          key={chat.id}
          href={chatHref(chat.id)}
          onClick={onPick}
          className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] hover:bg-[var(--cat-hover)] ${chat.id === activeChatId ? 'bg-[var(--cat-hover)] font-medium text-[var(--cat-ink)]' : 'text-[var(--cat-ink-2)]'}`}
        >
          <span className="truncate">{chat.title}</span>
          <span className="shrink-0 text-[11px] text-[var(--cat-ink-3)]">
            {formatWhen(chat.updatedAt)}
          </span>
        </Link>
      ))}
    </>
  )
}

/** "History" menu in the top bar: the brand's previous chats, each opening its own URL. */
export function AgentChatHistory({
  chats,
  activeChatId,
  chatHref,
}: AgentChatHistoryProps): JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button type="button" className={CHIP} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <MessageSquare size={15} /> History <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className={PANEL}>
            <HistoryList
              chats={chats}
              activeChatId={activeChatId}
              chatHref={chatHref}
              onPick={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  )
}
