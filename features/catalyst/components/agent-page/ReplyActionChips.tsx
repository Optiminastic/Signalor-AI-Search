'use client'

import { useAgentUi } from '@/features/catalyst/components/agent-page/AgentUiContext'
import {
  CONNECT_LABELS,
  TAB_LABELS,
  type ConnectTool,
  type ReplyActions,
} from '@/features/catalyst/components/agent-page/reply-actions'
import { useGmailConnection } from '@/hooks/useGmailConnection'
import { ArrowUpRight, CornerDownRight, Plug } from '@/lib/icons'

interface ReplyActionChipsProps {
  actions: ReplyActions
  onAsk: (question: string) => void
}

const CHIP =
  'inline-flex items-center gap-1.5 rounded-full border border-[var(--cat-card-border)] bg-[var(--cat-content)]/80 px-3 py-1 text-[12px] text-[var(--cat-ink-2)] transition-colors hover:border-[#e04a3d]/40 hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]'
// The board only shows on wide screens, so tab buttons are hidden below that.
const TAB_CHIP = `${CHIP} hidden lg:inline-flex font-medium text-primary-ink`
const CONNECT_CHIP =
  'inline-flex items-center gap-1.5 rounded-full bg-primary-strong px-3 py-1 text-[12px] font-semibold text-white transition-opacity hover:opacity-90'

interface ConnectChipProps {
  tool: ConnectTool
}

/** Opens the + panel; for Gmail, hidden once the mailbox is already connected. */
function ConnectChip({ tool }: ConnectChipProps): JSX.Element | null {
  const { orgSlug, setToolsOpen } = useAgentUi()
  const gmail = useGmailConnection(tool === 'gmail' ? orgSlug : '')
  if (tool === 'gmail' && gmail.status.connected) return null
  return (
    <button type="button" className={CONNECT_CHIP} onClick={() => setToolsOpen(true)}>
      <Plug size={12} strokeWidth={2.2} aria-hidden="true" />
      Connect {CONNECT_LABELS[tool]}
    </button>
  )
}

/** Next steps under the latest reply: connect a tool, open a board tab, or ask a follow-up. */
export function ReplyActionChips({ actions, onAsk }: ReplyActionChipsProps): JSX.Element | null {
  const { setTab } = useAgentUi()
  const { tabs, followUps, connect } = actions
  if (!connect && tabs.length === 0 && followUps.length === 0) return null
  return (
    <div className="cat-stagger mt-3 flex flex-wrap gap-1.5" aria-label="Suggested next steps">
      {connect && <ConnectChip tool={connect} />}
      {tabs.map(tab => (
        <button key={tab} type="button" className={TAB_CHIP} onClick={() => setTab(tab)}>
          Open {TAB_LABELS[tab]} <ArrowUpRight size={12} strokeWidth={2.2} />
        </button>
      ))}
      {followUps.map(question => (
        <button key={question} type="button" className={CHIP} onClick={() => onAsk(question)}>
          <CornerDownRight size={12} strokeWidth={2} aria-hidden="true" />
          {question}
        </button>
      ))}
    </div>
  )
}
