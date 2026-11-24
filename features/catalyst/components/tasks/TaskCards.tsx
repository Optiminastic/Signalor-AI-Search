import { TaskCard } from '@/features/catalyst/components/tasks/TaskCard'
import type { TaskItem } from '@/features/catalyst/tasks-data'

export interface TaskCardsProps {
  rows: TaskItem[]
  canAssign: boolean
  assignableEmails: string[]
  onAssign: (taskId: number, assigneeEmail: string) => void
  onToggleDone: (taskId: number, done: boolean) => void
  busy: boolean
}

export function TaskCards({
  rows,
  canAssign,
  assignableEmails,
  onAssign,
  onToggleDone,
  busy,
}: TaskCardsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map(row => (
        <TaskCard
          key={row.taskId}
          row={row}
          canAssign={canAssign}
          assignableEmails={assignableEmails}
          onAssign={onAssign}
          onToggleDone={onToggleDone}
          busy={busy}
        />
      ))}
    </div>
  )
}
