import { TaskRow } from '@/features/catalyst/components/tasks/TaskRow'
import type { TaskItem } from '@/features/catalyst/tasks-data'

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
/* The last column was also called "Action", so the header read
   "Action | Improves | Priority | Action" — two columns claiming the same name,
   and (because the key was the label) two <th> sharing a React key. It holds the
   fix state — Auto fix, Manual, View PR, Done — so "Fix" is what it is. */
const COLS: { label: string; className: string }[] = [
  { label: 'Action', className: 'px-3' },
  { label: 'Improves', className: 'px-3 w-[150px]' },
  { label: 'Priority', className: 'px-3 w-[128px]' },
  { label: 'Fix', className: 'px-3 w-[128px]' },
]

/**
 * Sticky so the columns stay named while you scroll: this list runs to 80+ rows
 * inside a scrolling panel, and the header left the viewport on the first flick.
 *
 * No sort chevrons. Every column used to show a ChevronsUpDown control and none
 * of them sorted anything — nothing here is wired to sort state. A control that
 * does nothing is worse than no control, so they are gone until sorting exists.
 */
function TaskTableHead(): JSX.Element {
  return (
    <thead className="sticky top-0 z-10">
      <tr className="border-b border-[var(--cat-border)] bg-[var(--cat-hover)]">
        {COLS.map(col => (
          <th
            key={col.label}
            className={`py-2.5 text-left text-[12px] font-medium text-[var(--cat-ink-2)] ${col.className}`}
          >
            {col.label}
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
