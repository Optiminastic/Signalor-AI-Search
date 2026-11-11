'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import {
  loadErrorMessage,
  noticeFor,
  type DecisionNotice,
} from '@/features/catalyst/agent-approvals'
import {
  decideAction,
  getAction,
  type AgentActionDetail,
  type DecisionVerb,
} from '@/lib/api/agent-mode-approvals'
import { queryKeys } from '@/lib/query-keys'

export interface AgentActionReview {
  action: AgentActionDetail | null
  isLoading: boolean
  loadError: string | null
  /** Set when a decision failed. Decisions stay blocked until `refresh`. */
  notice: DecisionNotice | null
  deciding: boolean
  /** A refresh is loading; decisions wait for it. */
  refreshing: boolean
  decide: (verb: DecisionVerb, reason?: string) => void
  refresh: () => void
}

/**
 * One action under review. The decision always carries the version and hash
 * of the draft currently on screen. The draft is not refetched in the
 * background (no refetch on focus), so it can only change when the owner
 * presses Refresh, never under them while they read it.
 */
export function useAgentAction(orgSlug: string, actionId: string): AgentActionReview {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.action(orgSlug, actionId)
  const [notice, setNotice] = useState<DecisionNotice | null>(null)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getAction(orgSlug, actionId),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: false,
  })

  const refreshLists = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.approvals(orgSlug) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.planActions(orgSlug) })
  }, [queryClient, orgSlug])

  const mutation = useMutation({
    mutationFn: decideAction,
    retry: false,
    onSuccess: detail => queryClient.setQueryData(key, detail),
    onError: error => setNotice(noticeFor(error)),
    onSettled: refreshLists,
  })

  const action = query.data ?? null
  // Until a refresh lands, the draft on screen may be the outdated one.
  const blocked = Boolean(notice) || mutation.isPending || query.isFetching
  const decide = (verb: DecisionVerb, reason?: string): void => {
    if (!action || action.version === null || blocked) return
    mutation.mutate({
      orgSlug,
      actionId,
      verb,
      version: action.version,
      payloadHash: action.payloadHash,
      reason,
    })
  }
  const refresh = (): void => {
    setNotice(null)
    void query.refetch()
    refreshLists()
  }
  return {
    action,
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    notice,
    deciding: mutation.isPending,
    refreshing: query.isFetching && !query.isLoading,
    decide,
    refresh,
  }
}
