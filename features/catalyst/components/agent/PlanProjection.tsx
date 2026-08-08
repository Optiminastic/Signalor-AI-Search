import type { AgentPlan } from '@/lib/api/agent'
import { CalendarClock, CheckCircle2, Inbox, ListTodo, type LucideIcon } from '@/lib/icons'

const TICKS = 44
const BRAND_RED = '#e04a3d'

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function shortDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Single-tone tick meter showing the current GEO score (no fabricated projection). */
function ScoreMeter({ score }: { score: number }): JSX.Element {
  const filled = Math.round((clampScore(score) / 100) * TICKS)
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: TICKS }, (_, i) => (
        <span
          key={i}
          className="h-7 w-[4px] rounded-[1px]"
          style={{ background: i < filled ? BRAND_RED : 'var(--cat-hover)' }}
        />
      ))}
    </div>
  )
}

function CompactStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="shrink-0 text-[var(--cat-ink-3)]" />
      <span className="text-[12px] text-[var(--cat-ink-3)]">{label}</span>
      <span className="ml-auto text-[13px] font-semibold text-[var(--cat-ink)] tabular-nums">
        {value}
      </span>
    </div>
  )
}

function CountsFooter({ plan }: { plan: AgentPlan }): JSX.Element {
  const { today, backlog, done } = plan.counts
  return (
    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-[var(--cat-border-soft)] pt-2.5 sm:grid-cols-2 lg:grid-cols-4">
      <CompactStat icon={ListTodo} label="Today" value={String(today)} />
      <CompactStat icon={Inbox} label="Backlog" value={String(backlog)} />
      <CompactStat icon={CheckCircle2} label="Done" value={String(done)} />
      <CompactStat
        icon={CalendarClock}
        label="Analyzed"
        value={shortDate(plan.brief.last_analyzed_at)}
      />
    </div>
  )
}

/** The run's current GEO score + open/done counts. Honest — no fabricated
 * projection; real lift shows on each task once it's verified. */
export function PlanProjection({ plan }: { plan: AgentPlan | undefined }): JSX.Element | null {
  if (!plan) return null
  const current = plan.brief.score ?? 0

  return (
    <div className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3">
      <div>
        <p className="text-[13px] font-semibold text-[var(--cat-ink)]">GEO Score</p>
        <p className="mt-0.5 text-[12px] text-[var(--cat-ink-3)]">
          Your current AI visibility score
        </p>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <p className="shrink-0 text-[30px] leading-none font-bold text-[var(--cat-ink)] tabular-nums">
          {Math.round(current)}
        </p>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <ScoreMeter score={current} />
        </div>
      </div>
      <CountsFooter plan={plan} />
    </div>
  )
}
