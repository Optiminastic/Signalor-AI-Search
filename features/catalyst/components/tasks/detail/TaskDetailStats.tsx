import { TaskStatCard } from '@/features/catalyst/components/tasks/TaskStatCard'
import { BLUE, BRAND, GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import { formatEffort, type StatCard } from '@/features/catalyst/tasks-data'
import type { TaskDetail } from '@/hooks/useTaskDetail'
import { Flag, Gauge, Timer, TrendingUp } from '@/lib/icons'

const PRIORITY_HUE: Record<string, string> = {
  critical: NEG,
  high: NEG,
  medium: YELLOW,
  low: GREEN,
}

function capitalize(word: string): string {
  return word ? word[0].toUpperCase() + word.slice(1) : word
}

function buildStats(task: TaskDetail): StatCard[] {
  const measured = task.measuredLift !== null
  return [
    {
      icon: TrendingUp,
      color: GREEN,
      label: 'Measured lift',
      // A bare "—" reads as missing data. It is not: lift is only known after a
      // verification re-crawl, so the tile says which it is.
      value: measured ? `+${task.measuredLift}` : 'Not yet',
      hint: measured ? 'GEO points gained' : 'Verify this fix to measure it',
    },
    {
      icon: Timer,
      color: BLUE,
      label: 'Effort',
      value: capitalize(formatEffort(task.effort)) || '—',
      hint: 'Estimated hands-on time',
    },
    {
      icon: Flag,
      color: PRIORITY_HUE[task.priority] ?? YELLOW,
      label: 'Priority',
      value: capitalize(task.priority) || '—',
      fill: true,
      hint: task.rank > 0 ? `Ranked #${task.rank} in today's plan` : 'Not in today’s plan',
    },
    {
      icon: Gauge,
      color: BRAND,
      label: 'Auto-fix',
      value: task.canAutoFix ? 'Available' : 'Manual',
      hint: task.canAutoFix ? 'SignalorAI can open a PR' : 'Needs a person to do it',
    },
  ]
}

/**
 * The task's headline numbers.
 *
 * Status is deliberately not here: it already sits as a pill beside the title,
 * and two live copies of the same value is exactly how a page stops being
 * trusted. Auto-fix takes that slot instead — the one thing that changes what
 * the reader does next.
 */
export function TaskDetailStats({ task }: { task: TaskDetail }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      {buildStats(task).map(stat => (
        <TaskStatCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}
