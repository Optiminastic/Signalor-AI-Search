'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import { satelliteTopics, type SatelliteTopic } from '@/features/catalyst/satellite-topics'
import {
  listPlanTaskActions,
  setPlanTaskStatus,
  type PlanTaskChoice,
} from '@/lib/api/agent-mode-approvals'
import { queryKeys } from '@/lib/query-keys'

export interface SatelliteTopics {
  topics: SatelliteTopic[]
  setStatus: (taskId: number, status: PlanTaskChoice) => void
  busyTaskId: number | null
  error: string | null
}

/** The month's satellite topics from the plan, and skipping or restoring one. */
export function useSatelliteTopics(orgSlug: string): SatelliteTopics {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.planActions(orgSlug)
  const plan = useQuery({
    queryKey: key,
    queryFn: () => listPlanTaskActions(orgSlug),
    enabled: Boolean(orgSlug),
  })
  const change = useMutation({
    mutationFn: (input: { taskId: number; status: PlanTaskChoice }) =>
      setPlanTaskStatus(orgSlug, input.taskId, input.status),
    retry: false,
    onSettled: () => void queryClient.invalidateQueries({ queryKey: key }),
  })
  const failed = change.error ?? plan.error
  return {
    topics: satelliteTopics(plan.data ?? []),
    setStatus: (taskId, status) => change.mutate({ taskId, status }),
    busyTaskId: change.isPending ? (change.variables?.taskId ?? null) : null,
    error: failed ? loadErrorMessage(failed) : null,
  }
}
