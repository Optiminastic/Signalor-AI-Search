import Link from 'next/link'

import type { AgentChatSummary } from '@/lib/api/agent-mode-chat'
import { MessageSquare } from '@/lib/icons'

const MAX_RECENT = 4

export interface RecentChatsProps {
  chats: AgentChatSummary[]
  href: (chatId: string) => string
}

/** The latest few chats under the composer on the new-chat screen. */
export function AgentRecentChats({ chats, href }: RecentChatsProps): JSX.Element | null {
  if (chats.length === 0) return null
  return (
    <div className="w-full">
      <p className="mb-2 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Recent chats
      </p>
      <ul className="space-y-1">
        {chats.slice(0, MAX_RECENT).map(chat => (
          <li key={chat.id}>
            <Link
              href={href(chat.id)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--cat-ink-2)] hover:bg-[var(--cat-content)]/70 hover:text-[var(--cat-ink)]"
            >
              <MessageSquare size={14} className="shrink-0 text-[#e04a3d]" />
              <span className="truncate">{chat.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
