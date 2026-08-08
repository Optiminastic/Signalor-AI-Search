import type { StatCard } from '@/features/catalyst/tasks-data'
import { MoreVertical } from '@/lib/icons'

interface TaskStatCardProps {
  stat: StatCard
}

export function TaskStatCard({ stat }: TaskStatCardProps): JSX.Element {
  const { icon: Icon, color, label, value, fill } = stat
  return (
    <div className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--cat-ink-2)]">
          <Icon size={15} strokeWidth={1.9} style={{ color, fill: fill ? color : 'none' }} />
          {label}
        </span>
        <MoreVertical size={15} className="text-[var(--cat-ink-3)]" />
      </div>
      <div className="mt-2 text-[26px] font-bold tracking-tight text-[var(--cat-ink)]">{value}</div>
    </div>
  )
}
