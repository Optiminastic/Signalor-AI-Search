'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import { checkSocialNow, getSocial, type SocialReport } from '@/lib/api/agent-mode-social'
import { queryKeys } from '@/lib/query-keys'

/** While a check runs, look again this often. */
const CHECKING_REFRESH_MS = 15_000

export interface AgentSocial {
  report: SocialReport | null
  loadError: string | null
  checkNow: () => void
  checking: boolean
  checkError: string | null
}

export function useAgentSocial(orgSlug: string): AgentSocial {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.social(orgSlug)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getSocial(orgSlug),
    enabled: Boolean(orgSlug),
    refetchInterval: q => (q.state.data?.status === 'checking' ? CHECKING_REFRESH_MS : false),
  })
  const check = useMutation({
    mutationFn: () => checkSocialNow(orgSlug),
    retry: false,
    onSuccess: report => queryClient.setQueryData(key, report),
  })
  return {
    report: query.data ?? null,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    checkNow: () => check.mutate(),
    checking: check.isPending,
    checkError: check.error ? loadErrorMessage(check.error) : null,
  }
}
