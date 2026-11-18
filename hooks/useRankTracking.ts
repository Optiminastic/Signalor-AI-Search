'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  addTrackedKeyword,
  checkRanksNow,
  getRankTracking,
  removeTrackedKeyword,
  type RankTracking,
} from '@/lib/api/agent-mode-rank-tracking'
import { queryKeys } from '@/lib/query-keys'

/** While a check runs, look again this often. */
const CHECKING_POLL_MS = 20_000

export interface RankTrackingState {
  report: RankTracking | null
  isLoading: boolean
  loadError: string | null
  checkNow: () => void
  checking: boolean
  addKeyword: (keyword: string) => void
  removeKeyword: (id: number) => void
  busy: boolean
  actionError: string | null
}

/** Weekly SEO / GEO / Brand tracking for the brand and its competitors. */
export function useRankTracking(orgSlug: string): RankTrackingState {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.rankTracking(orgSlug)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getRankTracking(orgSlug),
    enabled: Boolean(orgSlug),
    refetchInterval: q => (q.state.data?.checking ? CHECKING_POLL_MS : false),
  })
  const onSuccess = (report: RankTracking): void => {
    queryClient.setQueryData(key, report)
  }
  const check = useMutation({ mutationFn: () => checkRanksNow(orgSlug), retry: false, onSuccess })
  const add = useMutation({
    mutationFn: (keyword: string) => addTrackedKeyword(orgSlug, keyword),
    retry: false,
    onSuccess,
  })
  const remove = useMutation({
    mutationFn: (id: number) => removeTrackedKeyword(orgSlug, id),
    retry: false,
    onSuccess,
  })
  const failed = check.error ?? add.error ?? remove.error
  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    checkNow: () => check.mutate(),
    checking: check.isPending || Boolean(query.data?.checking),
    addKeyword: keyword => add.mutate(keyword),
    removeKeyword: id => remove.mutate(id),
    busy: add.isPending || remove.isPending,
    actionError: failed ? loadErrorMessage(failed) : null,
  }
}
