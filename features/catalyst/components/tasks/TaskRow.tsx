import { useViewTransitionNavigate } from '@/components/providers/view-transition-provider'
import { useTaskFix } from '@/features/catalyst/components/autofix/AutoFixContext'
import { AutoFixControl } from '@/features/catalyst/components/autofix/AutoFixControl'
import { PriorityTag } from '@/features/catalyst/components/tasks/PriorityTag'
import { SignalTag } from '@/features/catalyst/components/tasks/SignalTag'
import { TaskGlyph } from '@/features/catalyst/components/tasks/TaskGlyph'
import type { TaskItem } from '@/features/catalyst/tasks-data'
import { useBrandPath } from '@/hooks/useBrandPath'

export interface TaskRowProps {
  row: TaskItem
  onToggleDone: (taskId: number, done: boolean) => void
  busy: boolean
}

/**
 * Task name with the attribution sentence beneath it — the row now answers
 * "what does completing this do?" instead of repeating the raw finding text.
 */
function TaskNameCell({ row }: Pick<TaskRowProps, 'row'>): JSX.Element {
  return (
    <span className="flex min-w-0 items-start gap-2.5" style={{ paddingLeft: row.child ? 22 : 0 }}>
      <span className="mt-0.5 shrink-0">
        <TaskGlyph title={row.name} description={row.description} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          title={row.name}
          className={`truncate ${row.child ? 'text-[var(--cat-ink)]' : 'font-semibold text-[var(--cat-ink)]'}`}
        >
          {row.name}
        </span>
        <span
          title={row.effect || row.description}
          className="truncate text-[12px] text-[var(--cat-ink-3)]"
        >
          {row.effect || row.description}
        </span>
      </span>
    </span>
  )
}

/** Auto-fix when the agent can do it, otherwise say plainly that it is manual. */
function ActionCell({ recommendationId }: { recommendationId?: number }): JSX.Element {
  const fix = useTaskFix(recommendationId)
  if (!fix) {
    return (
      <span className="inline-flex items-center rounded-md border border-[var(--cat-border)] px-2 py-1 text-[12px] font-medium text-[var(--cat-ink-2)]">
        Manual
      </span>
    )
  }
  return <AutoFixControl state={fix.state} onFix={fix.onFix} />
}

/** One task row. Clicking anywhere opens the task's detail page; the inline
 * auto-fix control stops the click from navigating. */
export function TaskRow({ row }: TaskRowProps): JSX.Element {
  const brandPath = useBrandPath()
  const navigate = useViewTransitionNavigate()
  return (
    <tr
      onClick={() => navigate(brandPath(`tasks/${row.taskId}`))}
      className="cursor-pointer border-t border-[var(--cat-border-soft)] transition-colors hover:bg-[var(--cat-hover)]"
    >
      <td className="px-3 py-2.5">
        <TaskNameCell row={row} />
      </td>
      <td className="px-3 py-2.5">
        <SignalTag signal={row.signal} effect={row.effect} />
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <PriorityTag priority={row.priority} />
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
        <ActionCell recommendationId={row.recommendationId} />
      </td>
    </tr>
  )
}
