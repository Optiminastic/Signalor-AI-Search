import Link from 'next/link'

import { SignalorMark } from '@/components/SignalorMark'
import { ArrowLeft, MessageSquare } from '@/lib/icons'

const MAX_RECENTS = 8

interface AgentSidebarProps {
  brandName: string
  dashboardHref: string
  recentQuestions: string[]
  user: { name: string; email: string }
  onReplayIntro: () => void
}

function RecentQuestions({ questions }: { questions: string[] }): JSX.Element {
  return (
    <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
      <p className="px-2 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Recent
      </p>
      {questions.length === 0 ? (
        <p className="px-2 pt-2 text-[12px] text-[var(--cat-ink-3)]">
          Your questions will appear here.
        </p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {questions.slice(0, MAX_RECENTS).map((question, i) => (
            <li
              key={`${i}-${question}`}
              className="truncate rounded-md px-2 py-1.5 text-[12px] text-[var(--cat-ink-2)]"
            >
              {question}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Left rail: brand, way back to the dashboard, the chat, recent questions, account. */
export function AgentSidebar(props: AgentSidebarProps): JSX.Element {
  const { brandName, dashboardHref, recentQuestions, user, onReplayIntro } = props
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--cat-border)] bg-[var(--cat-content)] p-3 md:flex">
      <div className="flex items-center gap-2 px-2 py-1">
        <SignalorMark className="h-6 w-6 text-[#e04a3d]" />
        <span className="truncate text-[14px] font-semibold text-[var(--cat-ink)]">
          {brandName}
        </span>
      </div>
      <nav className="mt-4 space-y-0.5" aria-label="Agent">
        <Link
          href={dashboardHref}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[var(--cat-ink-2)] hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>
        <span className="flex items-center gap-2 rounded-md bg-[var(--cat-hover)] px-2 py-1.5 text-[13px] font-medium text-[var(--cat-ink)]">
          <MessageSquare size={15} className="text-[#e04a3d]" /> Agent chat
        </span>
      </nav>
      <RecentQuestions questions={recentQuestions} />
      <div className="mt-3 border-t border-[var(--cat-border)] px-2 pt-3">
        <p className="truncate text-[13px] font-medium text-[var(--cat-ink)]">
          {user.name || user.email}
        </p>
        {user.name && <p className="truncate text-[11px] text-[var(--cat-ink-3)]">{user.email}</p>}
        <button
          type="button"
          onClick={onReplayIntro}
          className="mt-2 text-[11px] text-[var(--cat-ink-3)] hover:text-[#e04a3d]"
        >
          Replay intro
        </button>
      </div>
    </aside>
  )
}
