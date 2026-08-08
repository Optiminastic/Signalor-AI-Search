import { TasksViewToggle } from '@/features/catalyst/components/tasks/TasksViewToggle'
import { TaskToolbarActions } from '@/features/catalyst/components/tasks/TaskToolbarActions'
import { Search } from '@/lib/icons'

export function TasksToolbar(): JSX.Element {
  return (
    <div className="cat-rise flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--cat-border)] pb-3">
      <div className="relative">
        <Search
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--cat-ink-3)]"
        />
        <input
          placeholder="Search..."
          className="h-[36px] w-[200px] rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] pr-3 pl-9 text-[13px] text-[var(--cat-ink)] placeholder:text-[var(--cat-ink-3)] focus:border-[#e04a3d] focus:outline-none"
        />
      </div>
      <TasksViewToggle />
      <div className="ml-auto">
        <TaskToolbarActions />
      </div>
    </div>
  )
}
