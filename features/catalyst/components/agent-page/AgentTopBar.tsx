import Link from 'next/link'
import { Suspense } from 'react'

import { SignalorMark } from '@/components/SignalorMark'
import { AgentChatHistory } from '@/features/catalyst/components/agent-page/AgentChatHistory'
import { WeeklyReportButton } from '@/features/catalyst/components/agent-page/WeeklyReportButton'
import type { AgentChatSummary } from '@/lib/api/agent-mode-chat'
import { ArrowLeft, Plus } from '@/lib/icons'

interface AgentTopBarProps {
  orgSlug: string
  dashboardHref: string
  agentHref: string
  chats: AgentChatSummary[]
  activeChatId: string | undefined
  onReplayIntro: () => void
}

const CHIP =
  'flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--cat-card-border)] bg-[var(--cat-content)]/85 px-3 text-[13px] text-[var(--cat-ink-2)] backdrop-blur-sm hover:text-[var(--cat-ink)]'

/** Slim header: Agent mode label, weekly report, chat history, new chat and the way back to the site. */
export function AgentTopBar(props: AgentTopBarProps): JSX.Element {
  const { orgSlug, dashboardHref, agentHref, chats, activeChatId, onReplayIntro } = props
  return (
    <header className="relative z-30 flex items-center justify-between px-5 py-4">
      <Link href={agentHref} className="flex items-center gap-2">
        <SignalorMark className="text-primary-ink h-6 w-6" />
        <span className="text-[14px] font-semibold text-[var(--cat-ink)]">Agent mode</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReplayIntro}
          className="hover:text-primary-ink mr-2 text-[12px] text-[var(--cat-ink-3)]"
        >
          Replay intro
        </button>
        <Suspense fallback={null}>
          <WeeklyReportButton orgSlug={orgSlug} />
        </Suspense>
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
