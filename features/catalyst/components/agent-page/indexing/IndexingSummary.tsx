import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import type { IndexingReport } from '@/lib/api/agent-mode-indexing'

interface IndexingSummaryProps {
  report: IndexingReport
  checking: boolean
  onCheckNow: () => void
}

const MUTED = 'text-[12px] text-[var(--cat-ink-3)]'

function percent(report: IndexingReport): number {
  return report.checked ? Math.round((report.indexed / report.checked) * 100) : 0
}

function changeLabel(change: number | null): string {
  if (change === null) return 'First check'
  if (change === 0) return 'No change since last week'
  return `${change > 0 ? '+' : ''}${change} since last week`
}

function checkedLabel(report: IndexingReport): string {
  if (report.status === 'checking') return 'Checking every page now…'
  if (!report.checkedAt) return 'Not checked yet'
  const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(report.checkedAt),
  )
  return `Checked ${when} · next check in a week`
}

/** "41 of 52 pages are on Google", the tick meter, the weekly change and Check now. */
export function IndexingSummary({
  report,
  checking,
  onCheckNow,
}: IndexingSummaryProps): JSX.Element {
  const busy = checking || report.status === 'checking'
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[22px] font-semibold text-[var(--cat-ink)] tabular-nums">
            {report.indexed} <span className="text-[14px] font-normal">of {report.checked}</span>
          </p>
          <p className="text-[12.5px] text-[var(--cat-ink-2)]">pages are on Google</p>
        </div>
        <button type="button" disabled={busy} onClick={onCheckNow} className={SECONDARY_BUTTON}>
          {busy ? 'Checking…' : 'Check now'}
        </button>
      </div>
      <TickBar value={percent(report)} />
      <p className={MUTED}>
        {changeLabel(report.indexedChange)} · {checkedLabel(report)}
      </p>
      {report.property && <p className={MUTED}>Search Console property: {report.property}</p>}
    </div>
  )
}
