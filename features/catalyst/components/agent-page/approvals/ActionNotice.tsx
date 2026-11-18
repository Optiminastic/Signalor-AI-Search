import type { DecisionNotice } from '@/features/catalyst/agent-approvals'
import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { NEG } from '@/features/catalyst/constants'
import { RefreshCw } from '@/lib/icons'

interface ActionNoticeProps {
  notice: DecisionNotice
  refreshing: boolean
  onRefresh: () => void
}

const TITLE: Record<DecisionNotice['kind'], string> = {
  stale: 'This draft has changed',
  closed: 'This action can no longer change',
  gone: 'This action is gone',
  unconfirmed: 'Decision not confirmed',
  error: 'Your decision was not recorded',
}

/**
 * Why the last decision didn't go through. The only way forward is a refresh,
 * which reloads the draft as it is now; it never resubmits the decision.
 */
export function ActionNotice({ notice, refreshing, onRefresh }: ActionNoticeProps): JSX.Element {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-md border bg-[var(--cat-card)] p-3"
      style={{ borderColor: NEG }}
      data-notice={notice.kind}
    >
      <p className="text-[13px] font-semibold text-[var(--cat-ink)]">{TITLE[notice.kind]}</p>
      <p className="text-[12.5px] text-[var(--cat-ink-2)]">{notice.message}</p>
      <button type="button" onClick={onRefresh} disabled={refreshing} className={SECONDARY_BUTTON}>
        <RefreshCw size={14} aria-hidden="true" />
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  )
}
