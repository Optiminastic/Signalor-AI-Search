'use client'

import { useMemo } from 'react'

import { AutoFixProvider } from '@/features/catalyst/components/autofix/AutoFixContext'
import { DataState } from '@/features/catalyst/components/DataState'
import { TasksToolbar } from '@/features/catalyst/components/tasks/TasksToolbar'
import { TaskTable } from '@/features/catalyst/components/tasks/TaskTable'
import { BRAND } from '@/features/catalyst/constants'
import type { ProjectRef } from '@/features/catalyst/tasks-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useTaskMutations, type TaskMutations } from '@/hooks/useTaskMutations'
import { useTasks, type TasksData } from '@/hooks/useTasks'

interface TaskBoardProps {
  data: TasksData | undefined
  isLoading: boolean
  isError: boolean
  mut: TaskMutations
}

function TaskBoard({ data, isLoading, isError, mut }: TaskBoardProps): JSX.Element {
  return (
    <div className="mt-3 flex min-w-0 flex-col gap-3">
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data || data.rows.length === 0}
        emptyTitle="No tasks yet"
        emptyHint="Run an analysis on this brand to auto-generate GEO improvement tasks here."
      >
        {data && (
          <div className="cat-rise overflow-hidden rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)]">
            <TaskTable rows={data.rows} onToggleDone={mut.onToggleDone} busy={mut.busy} />
          </div>
        )}
      </DataState>
    </div>
  )
}

export function TasksView(): JSX.Element {
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

  return (
    <AutoFixProvider>
      <TasksToolbar />
      <TaskBoard data={data} isLoading={isLoading} isError={isError} mut={mut} />
    </AutoFixProvider>
  )
}
