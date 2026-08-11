import type { StatCard } from '@/features/catalyst/tasks-data'

interface TaskStatCardProps {
  stat: StatCard
}

/**
 * One headline number on the task detail page.
 *
 * The `⋮` that used to sit in the corner was a bare icon with no menu behind
 * it — an affordance promising an action on every tile and delivering none, so
 * it is gone. `hint` carries the "why is this empty" line for values that
 * legitimately have no number yet, instead of a bare dash the reader has to
 * interpret.
 */
export function TaskStatCard({ stat }: TaskStatCardProps): JSX.Element {
  const { icon: Icon, color, label, value, fill, hint } = stat
  return (
    <div className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3">
      <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--cat-ink-2)]">
        <Icon size={15} strokeWidth={1.9} style={{ color, fill: fill ? color : 'none' }} />
        {label}
      </span>
      <div className="mt-2 text-[26px] leading-tight font-bold tracking-tight text-[var(--cat-ink)]">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11.5px] text-[var(--cat-ink-3)]">{hint}</div>}
    </div>
  )
}
