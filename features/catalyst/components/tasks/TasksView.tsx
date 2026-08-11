'use client'

import { useMemo } from 'react'

import { AutoFixProvider } from '@/features/catalyst/components/autofix/AutoFixContext'
import { DataState } from '@/features/catalyst/components/DataState'
import { TasksToolbar } from '@/features/catalyst/components/tasks/TasksToolbar'
import { TaskTable } from '@/features/catalyst/components/tasks/TaskTable'
import { BRAND } from '@/features/catalyst/constants'
import type { ProjectRef, TaskItem } from '@/features/catalyst/tasks-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useTaskMutations, type TaskMutations } from '@/hooks/useTaskMutations'
import { useTasks, type TasksData } from '@/hooks/useTasks'

interface TaskBoardProps {
  data: TasksData | undefined
  isLoading: boolean
  isError: boolean
  mut: TaskMutations
  filter: ActionStatusFilter
}

/** Empty copy that matches the active slice — "no actions yet" is wrong and
 *  slightly alarming when the board is merely filtered to Done. */
const EMPTY_COPY: Record<ActionStatusFilter, { title: string; hint: string }> = {
  backlog: {
    title: 'Nothing in the backlog',
    hint: 'Everything surfaced so far is either scheduled for today or already done.',
  },
  done: {
    title: 'Nothing completed yet',
    hint: 'Actions you finish or verify land here, so you can show what changed.',
  },
  all: {
    title: 'No actions yet',
    hint: 'Run an analysis on this brand to auto-generate GEO improvement actions here.',
  },
}

function TaskBoard({ data, isLoading, isError, mut, filter }: TaskBoardProps): JSX.Element {
  return (
    <div className="mt-3 flex min-w-0 flex-col gap-3">
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data || data.rows.length === 0}
        emptyTitle={EMPTY_COPY[filter].title}
        emptyHint={EMPTY_COPY[filter].hint}
      >
        {data && (
          <div className="cat-rise cat-card-edge overflow-hidden rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
            <TaskTable rows={data.rows} onToggleDone={mut.onToggleDone} busy={mut.busy} />
          </div>
        )}
      </DataState>
    </div>
  )
}

/** Which slice of the board to show. `all` keeps every action. */
export type ActionStatusFilter = 'backlog' | 'done' | 'all'

/** Open work vs finished work, read off the same progress value the row shows. */
function matchesFilter(row: TaskItem, filter: ActionStatusFilter): boolean {
  if (filter === 'done') return row.progress === 100
  if (filter === 'backlog') return row.progress < 100
  return true
}

export function TasksView({ filter = 'all' }: { filter?: ActionStatusFilter } = {}): JSX.Element {
  const { email, activeOrg } = useActiveProject()
  const mut = useTaskMutations(email)

  const project = useMemo<ProjectRef>(
    () => ({
      name: activeOrg?.name ?? 'Brand',
      initial: (activeOrg?.name?.[0] ?? 'B').toUpperCase(),
      color: BRAND,
    }),
    [activeOrg?.name],
  )

  const { data, isLoading, isError } = useTasks(email, project, activeOrg?.id)
  const filtered = useMemo(
    () => (data ? { ...data, rows: data.rows.filter(r => matchesFilter(r, filter)) } : data),
    [data, filter],
  )

  return (
    <AutoFixProvider>
      <TasksToolbar />
      <TaskBoard
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        mut={mut}
        filter={filter}
      />
    </AutoFixProvider>
  )
}
