'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  checkPromptPresenceNow,
  getPromptPresence,
  type PromptPresenceReport,
} from '@/lib/api/agent-mode-prompt-presence'
import { queryKeys } from '@/lib/query-keys'

/** While a check runs, look again this often. */
const CHECKING_REFRESH_MS = 15_000

export interface PromptPresenceState {
  report: PromptPresenceReport | null
  isLoading: boolean
  loadError: string | null
  checkNow: () => void
  checking: boolean
  checkError: string | null
}

export function usePromptPresence(orgSlug: string): PromptPresenceState {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.promptPresence(orgSlug)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getPromptPresence(orgSlug),
    enabled: Boolean(orgSlug),
    refetchInterval: q => (q.state.data?.checking ? CHECKING_REFRESH_MS : false),
  })
  const check = useMutation({
    mutationFn: () => checkPromptPresenceNow(orgSlug),
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
  }
}
