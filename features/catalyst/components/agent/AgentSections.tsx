import { ActionTable } from '@/features/catalyst/components/agent/ActionTable'
import { DataState } from '@/features/catalyst/components/DataState'
import type { AgentPlan } from '@/lib/api/agent'

function GroupHeading({ children }: { children: string }): JSX.Element {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[13px] font-semibold text-[var(--cat-ink)]">{children}</span>
      <span className="h-px flex-1 bg-[var(--cat-border-soft)]" />
    </div>
  )
}

interface AgentSectionsProps {
  plan: AgentPlan | undefined
  isLoading: boolean
  isError: boolean
}

export function AgentSections({ plan, isLoading, isError }: AgentSectionsProps): JSX.Element {
  const groups = plan?.groups.filter(g => g.actions.length > 0) ?? []
  return (
    <div className="flex flex-col gap-3">
      <GroupHeading>Today’s actions</GroupHeading>
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={groups.length === 0}
        emptyTitle="You’re all caught up"
        emptyHint="No open actions for this brand. Run an analysis or refresh the plan to surface new work."
      >
        {groups.map(g => (
          <ActionTable key={g.pillar} group={g.pillar} actions={g.actions} />
        ))}
      </DataState>
    </div>
  )
}
