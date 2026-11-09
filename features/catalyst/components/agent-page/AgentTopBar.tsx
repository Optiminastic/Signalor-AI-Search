import Link from 'next/link'

import { SignalorMark } from '@/components/SignalorMark'
import { ArrowLeft } from '@/lib/icons'

interface AgentTopBarProps {
  dashboardHref: string
  onReplayIntro: () => void
}

/** Slim header over the chat: the Agent mode label and the way back to the site. */
export function AgentTopBar({ dashboardHref, onReplayIntro }: AgentTopBarProps): JSX.Element {
  return (
    <header className="relative flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2">
        <SignalorMark className="h-6 w-6 text-[#e04a3d]" />
        <span className="text-[14px] font-semibold text-[var(--cat-ink)]">Agent mode</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onReplayIntro}
          className="text-[12px] text-[var(--cat-ink-3)] hover:text-[#e04a3d]"
        >
          Replay intro
        </button>
        <Link
          href={dashboardHref}
          className="flex items-center gap-1.5 rounded-md border border-[var(--cat-card-border)] bg-[var(--cat-content)]/85 px-3 py-1.5 text-[13px] text-[var(--cat-ink-2)] backdrop-blur-sm hover:text-[var(--cat-ink)]"
        >
          <ArrowLeft size={15} /> Back to site
        </Link>
      </div>
    </header>
  )
}
