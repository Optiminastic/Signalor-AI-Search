import { SECTION_TITLE } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { IndexingReason } from '@/lib/api/agent-mode-indexing'

interface ReasonListProps {
  reasons: IndexingReason[]
}

const TAG = 'rounded-sm px-1.5 text-[10.5px] leading-[16px] font-semibold'

function WhoActs({ fixable }: { fixable: boolean }): JSX.Element {
  return fixable ? (
    <span className={`${TAG} bg-[#e04a3d]/10 text-[#e04a3d]`}>Fixable on your site</span>
  ) : (
    <span className={`${TAG} bg-[var(--cat-hover)] text-[var(--cat-ink-2)]`}>Google decides</span>
  )
}

function ReasonItem({ reason }: { reason: IndexingReason }): JSX.Element {
  const more = reason.count - reason.urls.length
  return (
    <li className="flex flex-col gap-1 rounded-lg border border-[var(--cat-border)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[var(--cat-ink)]">{reason.label}</span>
        <span className="flex items-center gap-2">
          <WhoActs fixable={reason.fixable} />
          <span className="text-[13px] font-semibold text-[var(--cat-ink)] tabular-nums">
            {reason.count}
          </span>
        </span>
      </div>
      <p className="text-[12px] text-[var(--cat-ink-2)]">{reason.explanation}</p>
      <ul className="text-[11.5px] text-[var(--cat-ink-3)]">
        {reason.urls.map(url => (
          <li key={url} className="truncate">
            {url}
          </li>
        ))}
        {more > 0 && <li>and {more} more</li>}
      </ul>
    </li>
  )
}

/** Pages Google hasn't indexed, grouped by Google's reason, in plain words. */
export function ReasonList({ reasons }: ReasonListProps): JSX.Element | null {
  if (reasons.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h3 className={SECTION_TITLE}>Why some pages are not on Google</h3>
      <ul className="flex flex-col gap-2">
        {reasons.map(reason => (
          <ReasonItem key={reason.key} reason={reason} />
        ))}
      </ul>
    </section>
  )
}
