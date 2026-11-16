'use client'

import { useBoardTab } from '@/features/catalyst/components/agent-page/BoardTabContext'
import {
  TAB_LABELS,
  type ReplyActions,
} from '@/features/catalyst/components/agent-page/reply-actions'
import { ArrowUpRight, CornerDownRight } from '@/lib/icons'

interface ReplyActionChipsProps {
  actions: ReplyActions
  onAsk: (question: string) => void
}

const CHIP =
  'inline-flex items-center gap-1.5 rounded-full border border-[var(--cat-card-border)] bg-[var(--cat-content)]/80 px-3 py-1 text-[12px] text-[var(--cat-ink-2)] transition-colors hover:border-[#e04a3d]/40 hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]'
// The board only shows on wide screens, so tab buttons are hidden below that.
const TAB_CHIP = `${CHIP} hidden lg:inline-flex font-medium text-[#e04a3d]`

/** One-click next steps under the latest reply: open a board tab, or ask a follow-up. */
export function ReplyActionChips({ actions, onAsk }: ReplyActionChipsProps): JSX.Element | null {
  const { setTab } = useBoardTab()
  if (actions.tabs.length === 0 && actions.followUps.length === 0) return null
  return (
    <div className="cat-stagger mt-3 flex flex-wrap gap-1.5" aria-label="Suggested next steps">
      {actions.tabs.map(tab => (
        <button key={tab} type="button" className={TAB_CHIP} onClick={() => setTab(tab)}>
          Open {TAB_LABELS[tab]} <ArrowUpRight size={12} strokeWidth={2.2} />
        </button>
      ))}
      {actions.followUps.map(question => (
        <button key={question} type="button" className={CHIP} onClick={() => onAsk(question)}>
          <CornerDownRight size={12} strokeWidth={2} aria-hidden="true" />
          {question}
        </button>
      ))}
    </div>
  )
}
