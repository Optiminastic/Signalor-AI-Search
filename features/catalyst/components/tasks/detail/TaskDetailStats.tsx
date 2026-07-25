import { TaskStatCard } from '@/features/catalyst/components/tasks/TaskStatCard'
import { BLUE, BRAND, GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import { formatEffort, formatStatus, type StatCard } from '@/features/catalyst/tasks-data'
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
  return [
    {
      icon: TrendingUp,
      color: GREEN,
      label: 'Measured lift',
      value: task.measuredLift != null ? `+${task.measuredLift} GEO pts` : '—',
    },
    { icon: Timer, color: BLUE, label: 'Effort', value: capitalize(formatEffort(task.effort)) },
    {
      icon: Flag,
      color: PRIORITY_HUE[task.priority] ?? YELLOW,
      label: 'Priority',
      value: capitalize(task.priority),
      fill: true,
    },
    { icon: Gauge, color: BRAND, label: 'Status', value: formatStatus(task.status) },
  ]
}

/** The task's headline numbers: impact, effort, priority and status. */
export function TaskDetailStats({ task }: { task: TaskDetail }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      {buildStats(task).map(stat => (
        <TaskStatCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}
