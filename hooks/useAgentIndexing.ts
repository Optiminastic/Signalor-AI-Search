'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  checkIndexingNow,
  getIndexing,
  markIndexingRequested,
  type IndexingReport,
} from '@/lib/api/agent-mode-indexing'
import { queryKeys } from '@/lib/query-keys'

/** While a check runs (it reads every page, ~8s each), look again this often. */
const CHECKING_REFRESH_MS = 30_000

export interface AgentIndexing {
  report: IndexingReport | null
  isLoading: boolean
  loadError: string | null
  checkNow: () => void
  checking: boolean
  checkError: string | null
  /** Record that the owner opened a page's "Request indexing" link. */
  markRequested: (url: string) => void
}

export function useAgentIndexing(orgSlug: string): AgentIndexing {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.indexing(orgSlug)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getIndexing(orgSlug),
    enabled: Boolean(orgSlug),
    refetchInterval: q => (q.state.data?.status === 'checking' ? CHECKING_REFRESH_MS : false),
  })
  const check = useMutation({
    mutationFn: () => checkIndexingNow(orgSlug),
    retry: false,
    onSuccess: report => {
      queryClient.setQueryData(key, report)
      void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.activity(orgSlug) })
    },
  })
  const requested = useMutation({
    mutationFn: (url: string) => markIndexingRequested(orgSlug, url),
    retry: false,
    onSuccess: report => queryClient.setQueryData(key, report),
  })
  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    checkNow: () => check.mutate(),
    checking: check.isPending,
    checkError: check.error ? loadErrorMessage(check.error) : null,
    markRequested: url => requested.mutate(url),
  }
}
