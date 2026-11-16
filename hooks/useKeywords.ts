'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import { getKeywords, refreshKeywordsNow, type KeywordsReport } from '@/lib/api/agent-mode-keywords'
import { queryKeys } from '@/lib/query-keys'

/** While a read runs, look again this often. */
const REFRESHING_POLL_MS = 15_000

export interface Keywords {
  report: KeywordsReport | null
  isLoading: boolean
  loadError: string | null
  refreshNow: () => void
  refreshing: boolean
  actionError: string | null
}

/** The brand's keywords and competitor gaps (weekly), and a "read again now" action. */
export function useKeywords(orgSlug: string): Keywords {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.keywords(orgSlug)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getKeywords(orgSlug),
    enabled: Boolean(orgSlug),
    refetchInterval: q => (q.state.data?.refreshing ? REFRESHING_POLL_MS : false),
  })
  const refresh = useMutation({
    mutationFn: () => refreshKeywordsNow(orgSlug),
    retry: false,
    onSuccess: report => queryClient.setQueryData(key, report),
  })
  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    refreshNow: () => refresh.mutate(),
    refreshing: refresh.isPending || Boolean(query.data?.refreshing),
    actionError: refresh.error ? loadErrorMessage(refresh.error) : null,
  }
}
