'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveProject } from '@/hooks/useActiveProject'
import { getAgentPlan, refreshAgentPlan, type AgentPlan } from '@/lib/api/agent'
import { ApiError } from '@/lib/api/client'
import { updateActionStatus } from '@/lib/api/tasks'
import { queryKeys } from '@/lib/query-keys'

interface UseAgentPlanResult {
  plan: AgentPlan | undefined
  isLoading: boolean
  isError: boolean
  /** No completed analysis run yet for this brand. */
  noRun: boolean
}

/** Today's ranked task plan for the active brand. */
export function useAgentPlan(): UseAgentPlanResult {
  const { email, slug, isLoading: projectLoading } = useActiveProject()

  const query = useQuery({
    queryKey: queryKeys.catalyst.agentPlan(slug ?? ''),
    enabled: Boolean(email && slug),
    queryFn: () => getAgentPlan(slug as string, email as string),
  })

  return {
    plan: query.data,
    isLoading: projectLoading || (Boolean(slug) && query.isLoading),
    isError: query.isError,
    // No run slug once loading settles ⇒ the brand has no analysis run yet.
    noRun: !projectLoading && Boolean(email) && !slug,
  }
}

interface UseAgentMutationsResult {
  refresh: () => void
  setStatus: (actionId: number, status: string) => void
  isRefreshing: boolean
  busyActionId: number | null
}

/** Mutations for the plan — refresh, and per-task status changes.
 *  Both invalidate the plan AND the Tasks queries, since they share one table. */
export function useAgentMutations(): UseAgentMutationsResult {
  const { email, slug } = useActiveProject()
  const queryClient = useQueryClient()

  const invalidate = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['catalyst', 'agent-plan'] })
    void queryClient.invalidateQueries({ queryKey: ['catalyst', 'tasks'] })
  }

  const refreshMutation = useMutation({
    mutationFn: () => {
      toast.loading('Refreshing your plan…', { id: 'agent-refresh' })
      return refreshAgentPlan(slug as string, email as string)
    },
    onSuccess: plan => {
      invalidate()
      toast.success(`Plan refreshed — ${plan.counts.backlog} open task(s).`, {
        id: 'agent-refresh',
      })
    },
    onError: (err: unknown) => {
      const rateLimited = err instanceof ApiError && err.status === 429
      invalidate() // pick up refresh_available_at so the button locks
      toast.error(
        rateLimited
          ? 'You can refresh the plan once a day.'
          : 'Could not refresh the plan. Please try again.',
        { id: 'agent-refresh' },
      )
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ actionId, status }: { actionId: number; status: string }) =>
      updateActionStatus(actionId, status, email),
    onSuccess: invalidate,
    onError: () => toast.error('Could not update the task. Please try again.'),
  })

  return {
    refresh: () => {
      if (email && slug) refreshMutation.mutate()
      else toast.error('No analysis run to refresh yet.')
    },
    setStatus: (actionId, status) => statusMutation.mutate({ actionId, status }),
    isRefreshing: refreshMutation.isPending,
    busyActionId: statusMutation.isPending ? (statusMutation.variables?.actionId ?? null) : null,
  }
}
