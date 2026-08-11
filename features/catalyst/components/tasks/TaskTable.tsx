import { TaskRow } from '@/features/catalyst/components/tasks/TaskRow'
import type { TaskItem } from '@/features/catalyst/tasks-data'
import { ChevronsUpDown } from '@/lib/icons'

/**
 * Deliberately narrow. Project was the same value on every row (the dashboard is
 * scoped to one brand); Description now lives under the task name as the
 * attribution sentence; Due Date was the creation date, not a deadline; and
 * Progress duplicated the status tabs above the table.
 *
 * What survives answers the only questions the list needs to: what is it, what
 * does it improve, how urgent, and can Signalor do it for me.
 *
 * The table is fixed-layout (never scrolls horizontally), so these widths MUST
 * stay in sync with TaskRow's cells, which truncate to fit.
 */
const COLS: { label: string; className: string }[] = [
  { label: 'Action', className: 'px-3' },
  { label: 'Improves', className: 'px-3 w-[150px]' },
  { label: 'Priority', className: 'px-3 w-[128px]' },
]

const ACTION_COL = { label: 'Action', className: 'px-3 w-[128px]' }

function TaskTableHead(): JSX.Element {
  const cols = [...COLS, ACTION_COL]
  return (
    <thead>
      <tr className="border-b border-[var(--cat-border)] bg-[var(--cat-hover)]">
        {cols.map(col => (
          <th
            key={col.label}
            className={`py-2.5 text-left text-[12px] font-medium text-[var(--cat-ink-2)] ${col.className}`}
          >
            <span className="inline-flex items-center gap-1">
              {col.label}
              <ChevronsUpDown size={12} className="text-[var(--cat-ink-3)]" />
            </span>
          </th>
        ))}
      </tr>
    </thead>
  )
}

export interface TaskTableProps {
  rows: TaskItem[]
  onToggleDone: (taskId: number, done: boolean) => void
  busy: boolean
}

export function TaskTable({ rows, onToggleDone, busy }: TaskTableProps): JSX.Element {
  return (
    <div className="w-full">
      <table className="w-full table-fixed border-collapse text-[13px]">
        <TaskTableHead />
        <tbody>
          {rows.map(row => (
            <TaskRow key={row.taskId} row={row} onToggleDone={onToggleDone} busy={busy} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
