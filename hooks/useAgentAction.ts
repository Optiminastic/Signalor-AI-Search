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
  resolveAction,
  type AgentActionDetail,
  type DecisionVerb,
  type Resolution,
} from '@/lib/api/agent-mode-approvals'
import { queryKeys } from '@/lib/query-keys'

/** What the owner asked for: a decision on a draft, or closing an unknown outcome. */
export type ActionChange =
  | { type: 'decide'; verb: DecisionVerb }
  | { type: 'resolve'; resolution: Resolution }

interface ChangeRequest {
  orgSlug: string
  actionId: string
  version: number
  payloadHash: string
  change: ActionChange
  reason?: string
}

function submitChange(request: ChangeRequest): Promise<AgentActionDetail> {
  const { change, ...reviewed } = request
  return change.type === 'decide'
    ? decideAction({ ...reviewed, verb: change.verb })
    : resolveAction({ ...reviewed, resolution: change.resolution })
}

export interface AgentActionReview {
  action: AgentActionDetail | null
  isLoading: boolean
  loadError: string | null
  /** Set when a change failed. Everything stays blocked until `refresh`. */
  notice: DecisionNotice | null
  deciding: boolean
  /** A refresh is loading; changes wait for it. */
  refreshing: boolean
  submit: (change: ActionChange, reason?: string) => void
  refresh: () => void
}

/**
 * One action under review. Every change carries the version and hash of the
 * action currently on screen. The action is not refetched in the background
 * (no refetch on focus), so it only changes when the owner presses Refresh,
 * never under them while they read it. Nothing is ever retried.
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
    mutationFn: submitChange,
    retry: false,
    onSuccess: detail => queryClient.setQueryData(key, detail),
    onError: error => setNotice(noticeFor(error)),
    onSettled: refreshLists,
  })

  const action = query.data ?? null
  // Until a refresh lands, the action on screen may be the outdated one.
  const blocked = Boolean(notice) || mutation.isPending || query.isFetching
  const submit = (change: ActionChange, reason?: string): void => {
    if (!action || action.version === null || blocked) return
    const reviewed = { version: action.version, payloadHash: action.payloadHash }
    mutation.mutate({ orgSlug, actionId, ...reviewed, change, reason })
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
    submit,
    refresh,
  }
}
