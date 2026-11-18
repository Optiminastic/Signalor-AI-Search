import Link from 'next/link'

import { SignalorMark } from '@/components/SignalorMark'
import { AgentChatHistory } from '@/features/catalyst/components/agent-page/AgentChatHistory'
import type { AgentChatSummary } from '@/lib/api/agent-mode-chat'
import { ArrowLeft, Plus } from '@/lib/icons'

interface AgentTopBarProps {
  dashboardHref: string
  agentHref: string
  chats: AgentChatSummary[]
  activeChatId: string | undefined
  onReplayIntro: () => void
}

const CHIP =
  'flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--cat-card-border)] bg-[var(--cat-content)]/85 px-3 text-[13px] text-[var(--cat-ink-2)] backdrop-blur-sm hover:text-[var(--cat-ink)]'

/** Slim header: Agent mode label, chat history, new chat and the way back to the site. */
export function AgentTopBar(props: AgentTopBarProps): JSX.Element {
  const { dashboardHref, agentHref, chats, activeChatId, onReplayIntro } = props
  return (
    <header className="relative z-30 flex items-center justify-between px-5 py-4">
      <Link href={agentHref} className="flex items-center gap-2">
        <SignalorMark className="h-6 w-6 text-[#e04a3d]" />
        <span className="text-[14px] font-semibold text-[var(--cat-ink)]">Agent mode</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReplayIntro}
          className="mr-2 text-[12px] text-[var(--cat-ink-3)] hover:text-[#e04a3d]"
        >
          Replay intro
        </button>
        <AgentChatHistory
          chats={chats}
          activeChatId={activeChatId}
          chatHref={id => `${agentHref}/${id}`}
        />
        {activeChatId && (
          <Link href={agentHref} className={CHIP}>
            <Plus size={15} /> New chat
          </Link>
        )}
        <Link href={dashboardHref} className={CHIP}>
          <ArrowLeft size={15} /> Back to site
        </Link>
      </div>
    </header>
  )
}
