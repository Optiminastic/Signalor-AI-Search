import { Check, Wrench } from 'lucide-react'

import { useTaskFix } from '@/features/catalyst/components/autofix/AutoFixContext'
import { AutoFixControl } from '@/features/catalyst/components/autofix/AutoFixControl'
import { AssigneeStack } from '@/features/catalyst/components/tasks/AssigneeStack'
import { PriorityTag } from '@/features/catalyst/components/tasks/PriorityTag'
import { ProgressCell } from '@/features/catalyst/components/tasks/ProgressCell'
import { ProjectTag } from '@/features/catalyst/components/tasks/ProjectTag'
import type { TaskItem } from '@/features/catalyst/tasks-data'
import { useTaskDetailStore } from '@/stores/useTaskDetailStore'

export interface TaskCardProps {
  row: TaskItem
  canAssign: boolean
  assignableEmails: string[]
  onAssign: (taskId: number, assigneeEmail: string) => void
  onToggleDone: (taskId: number, done: boolean) => void
  busy: boolean
}

function DoneToggle({
  done,
  busy,
  onClick,
}: {
  done: boolean
  busy: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={done ? 'Mark task not done' : 'Mark task done'}
      className={`grid h-[16px] w-[16px] shrink-0 place-items-center rounded-sm border disabled:opacity-50 ${
        done
          ? 'border-[#e04a3d] bg-[#e04a3d] text-white'
          : 'border-[var(--cat-border)] hover:border-[#e04a3d]'
      }`}
    >
      {done && <Check size={11} strokeWidth={3} />}
    </button>
  )
}

function CardAssignee({
  row,
  canAssign,
  assignableEmails,
  onAssign,
  busy,
}: Omit<TaskCardProps, 'onToggleDone'>): JSX.Element {
  if (!canAssign) return <AssigneeStack email={row.assigneeEmail} />
  return (
    <select
      value={row.assigneeEmail}
      disabled={busy}
      onClick={e => e.stopPropagation()}
      onChange={e => onAssign(row.taskId, e.target.value)}
      className="h-8 w-full rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-2 text-[12px] font-medium text-[var(--cat-ink-2)] outline-none disabled:opacity-60"
    >
      <option value="">Unassigned</option>
      {assignableEmails.map(email => (
        <option key={email} value={email}>
          {email}
        </option>
      ))}
    </select>
  )
}

function CardAutoFix({ row }: { row: TaskItem }): JSX.Element | null {
  const fix = useTaskFix(row.recommendationId)
  const open = useTaskDetailStore(s => s.open)
  if (!fix) return null
  if (fix.auto) {
    return (
      <div onClick={e => e.stopPropagation()}>
        <AutoFixControl state={fix.state} onFix={fix.onFix} />
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        open({
          recommendationId: row.recommendationId,
          name: row.name,
          description: row.description,
        })
      }}
      className="inline-flex h-8 items-center gap-1.5 self-start rounded-md border border-[var(--cat-border)] px-3 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]"
    >
      <Wrench size={13} />
      Manual fix
    </button>
  )
}

function CardTop({
  row,
  done,
  busy,
  onToggleDone,
}: Pick<TaskCardProps, 'row' | 'busy' | 'onToggleDone'> & { done: boolean }): JSX.Element {
  return (
    <div className="flex items-start gap-2">
      <DoneToggle done={done} busy={busy} onClick={() => onToggleDone(row.taskId, !done)} />
      <span className="min-w-0 flex-1 text-[13px] font-semibold text-[var(--cat-ink)]">
        {row.name}
      </span>
      <PriorityTag priority={row.priority} />
    </div>
  )
}

export function TaskCard(props: TaskCardProps): JSX.Element {
  const { row } = props
  const done = row.progress === 100
  const open = useTaskDetailStore(s => s.open)
  return (
    <div
      onClick={() =>
        open({
          recommendationId: row.recommendationId,
          name: row.name,
          description: row.description,
        })
      }
      className="flex cursor-pointer flex-col gap-3 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3.5 transition-colors hover:bg-[var(--cat-hover)]"
    >
      <CardTop row={row} done={done} busy={props.busy} onToggleDone={props.onToggleDone} />
      <p className="line-clamp-2 text-[12px] text-[var(--cat-ink-2)]">{row.description}</p>
      <div className="flex items-center justify-between gap-2">
        <ProjectTag project={row.project} />
        <span className="text-[12px] whitespace-nowrap text-[var(--cat-ink-3)]">{row.due}</span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[var(--cat-border-soft)] pt-3">
        <div className="min-w-0 flex-1">
          <CardAssignee
            row={row}
            canAssign={props.canAssign}
            assignableEmails={props.assignableEmails}
            onAssign={props.onAssign}
            busy={props.busy}
          />
        </div>
        <ProgressCell value={row.progress} />
      </div>
      <CardAutoFix row={row} />
    </div>
  )
}
