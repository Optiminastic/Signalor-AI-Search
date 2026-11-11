'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  actionResults,
  loadErrorMessage,
  type ActionResult,
} from '@/features/catalyst/agent-approvals'
import {
  listApprovals,
  listPlanTaskActions,
  type AgentAction,
} from '@/lib/api/agent-mode-approvals'
import { AgentModeError } from '@/lib/api/agent-mode-request'
import { queryKeys } from '@/lib/query-keys'

const APPROVALS_STALE_MS = 15_000

export interface AgentApprovals {
  /** Drafts awaiting the owner, and approved drafts not sent yet. */
  pending: AgentAction[]
  /** Sent, failed, rejected and outcome-unknown actions from the current plan. */
  results: ActionResult[]
  isLoading: boolean
  error: string | null
  resultsError: string | null
  refresh: () => void
}

/** A backend refusal won't change on a retry; only a network blip might. */
function retryNetworkOnce(count: number, error: unknown): boolean {
  return !(error instanceof AgentModeError) && count < 1
}

export function useAgentApprovals(orgSlug: string): AgentApprovals {
  const queryClient = useQueryClient()
  const approvals = useQuery({
    queryKey: queryKeys.agentMode.approvals(orgSlug),
    queryFn: () => listApprovals(orgSlug),
    enabled: Boolean(orgSlug),
    staleTime: APPROVALS_STALE_MS,
    retry: retryNetworkOnce,
  })
  const plan = useQuery({
    queryKey: queryKeys.agentMode.planActions(orgSlug),
    queryFn: () => listPlanTaskActions(orgSlug),
    enabled: Boolean(orgSlug),
    staleTime: APPROVALS_STALE_MS,
    retry: retryNetworkOnce,
  })
  const refresh = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.approvals(orgSlug) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.planActions(orgSlug) })
  }, [queryClient, orgSlug])
  return {
    pending: approvals.data ?? [],
    results: actionResults(plan.data ?? []),
    isLoading: approvals.isLoading,
    error: approvals.error ? loadErrorMessage(approvals.error) : null,
    resultsError: plan.error ? loadErrorMessage(plan.error) : null,
    refresh,
  }
}
