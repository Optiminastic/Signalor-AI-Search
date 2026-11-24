'use client'

import { useMemo } from 'react'

import { AutoFixProvider } from '@/features/catalyst/components/autofix/AutoFixContext'
import { DataState } from '@/features/catalyst/components/DataState'
import { TaskCards } from '@/features/catalyst/components/tasks/TaskCards'
import { TaskDetailModal } from '@/features/catalyst/components/tasks/TaskDetailModal'
import { TaskStatCards } from '@/features/catalyst/components/tasks/TaskStatCards'
import { TasksToolbar } from '@/features/catalyst/components/tasks/TasksToolbar'
import { TaskTable } from '@/features/catalyst/components/tasks/TaskTable'
import { BRAND } from '@/features/catalyst/constants'
import type { ProjectRef, StatusTab, TaskItem } from '@/features/catalyst/tasks-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAgencyMembers } from '@/hooks/useAgencyMembers'
import { useAgencyRole } from '@/hooks/useAgencyRole'
import { useFilteredTasks } from '@/hooks/useFilteredTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { useTasks, type TasksData } from '@/hooks/useTasks'
import { useTasksViewStore } from '@/stores/useTasksViewStore'

const EMPTY_TABS: StatusTab[] = [
  { label: 'To Do', count: 0, key: 'todo' },
  { label: 'In Progress', count: 0, key: 'in_progress' },
  { label: 'Overdue', count: 0, key: 'overdue' },
  { label: 'Completed', count: 0, key: 'completed' },
  { label: 'All', count: 0, key: 'all' },
]

interface BoardShared {
  rows: TaskItem[]
  canAssign: boolean
  assignableEmails: string[]
  onAssign: (taskId: number, assigneeEmail: string) => void
  onToggleDone: (taskId: number, done: boolean) => void
  busy: boolean
}

function EmptyFilterState(): JSX.Element {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center gap-1 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] text-center">
      <p className="text-[13px] font-medium text-[var(--cat-ink)]">No tasks match your filters</p>
      <p className="text-[12px] text-[var(--cat-ink-3)]">
        Try clearing the search, status, assignee, or priority filters.
      </p>
    </div>
  )
}

function BoardContent({ shared }: { shared: BoardShared }): JSX.Element {
  const view = useTasksViewStore(s => s.view)
  if (shared.rows.length === 0) return <EmptyFilterState />
  if (view === 'grid') return <TaskCards {...shared} />
  return (
    <div className="cat-rise overflow-hidden rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)]">
      <TaskTable {...shared} />
    </div>
  )
}

interface TaskBoardProps {
  data: TasksData | undefined
  shared: BoardShared
  isLoading: boolean
  isError: boolean
}

function TaskBoard({ data, shared, isLoading, isError }: TaskBoardProps): JSX.Element {
  return (
    <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data || data.rows.length === 0}
        emptyTitle="No tasks yet"
        emptyHint="Run an analysis on this brand to auto-generate GEO improvement tasks here."
      >
        {data && (
          <>
            <TaskStatCards stats={data.stats} />
            <BoardContent shared={shared} />
          </>
        )}
      </DataState>
    </div>
  )
}

function useAssignableEmails(): string[] {
  const { isAdmin, agencyEmail } = useAgencyRole()
  const { members } = useAgencyMembers(isAdmin)
  return useMemo(
    () => [agencyEmail, ...members.map(m => m.member_email)].filter(Boolean) as string[],
    [agencyEmail, members],
  )
}

export function TasksView(): JSX.Element {
  const { email, activeOrg } = useActiveProject()
  const { isAdmin } = useAgencyRole()
  const mut = useTaskMutations(email)
  const assignableEmails = useAssignableEmails()

  const project = useMemo<ProjectRef>(
    () => ({
      name: activeOrg?.name ?? 'Brand',
      initial: (activeOrg?.name?.[0] ?? 'B').toUpperCase(),
      color: BRAND,
    }),
    [activeOrg?.name],
  )

  const { data, isLoading, isError } = useTasks(email, project, activeOrg?.id)
  const rows = useFilteredTasks(data)

  const shared: BoardShared = {
    rows,
    canAssign: isAdmin,
    assignableEmails,
    onAssign: mut.onAssign,
    onToggleDone: mut.onToggleDone,
    busy: mut.busy,
  }

  return (
    <AutoFixProvider>
      <TasksToolbar tabs={data?.tabs ?? EMPTY_TABS} assignableEmails={assignableEmails} />
      <TaskBoard data={data} shared={shared} isLoading={isLoading} isError={isError} />
      <TaskDetailModal />
    </AutoFixProvider>
  )
}
