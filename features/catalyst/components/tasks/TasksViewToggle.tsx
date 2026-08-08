'use client'

import { LayoutGrid, List } from '@/lib/icons'
import { useTasksViewStore } from '@/stores/useTasksViewStore'

function cls(active: boolean): string {
  return `grid h-[28px] w-[28px] place-items-center rounded-sm transition-colors ${active ? 'bg-[var(--cat-track)] text-[var(--cat-ink)]' : 'text-[var(--cat-ink-3)] hover:text-[var(--cat-ink)]'}`
}

export function TasksViewToggle(): JSX.Element {
  const view = useTasksViewStore(s => s.view)
  const setView = useTasksViewStore(s => s.setView)
  return (
    <div className="cat-card-edge hidden items-center gap-0.5 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-0.5 sm:flex">
      <button
        type="button"
        aria-label="List view"
        onClick={() => setView('list')}
        className={cls(view === 'list')}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        aria-label="Grid view"
        onClick={() => setView('grid')}
        className={cls(view === 'grid')}
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  )
}
