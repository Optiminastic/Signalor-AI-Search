'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  connectFinder,
  disconnectFinder,
  listFinders,
  type ContactFinder,
} from '@/lib/api/agent-mode-finders'
import { queryKeys } from '@/lib/query-keys'

export interface ContactFinders {
  finders: ContactFinder[]
  isLoading: boolean
  loadError: string | null
  connect: (provider: string, apiKey: string) => void
  disconnect: (provider: string) => void
  /** The provider a connect or disconnect is running for, if any. */
  busyProvider: string | null
  actionError: { provider: string; message: string } | null
}

type FinderChange = { provider: string; apiKey?: string }

/** The brand's Hunter / Apollo accounts, and connecting or disconnecting one. */
export function useContactFinders(orgSlug: string): ContactFinders {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.finders(orgSlug)
  const query = useQuery({ queryKey: key, queryFn: () => listFinders(orgSlug) })
  const change = useMutation({
    mutationFn: ({ provider, apiKey }: FinderChange) =>
      apiKey === undefined
        ? disconnectFinder(orgSlug, provider)
        : connectFinder({ orgSlug, provider, apiKey }),
    retry: false,
    onSuccess: finders => {
      queryClient.setQueryData(key, finders)
      void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.activity(orgSlug) })
    },
  })
  const failedFor = change.error ? change.variables?.provider : undefined
  return {
    finders: query.data ?? [],
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    connect: (provider, apiKey) => change.mutate({ provider, apiKey }),
    disconnect: provider => change.mutate({ provider }),
    busyProvider: change.isPending ? (change.variables?.provider ?? null) : null,
    actionError: failedFor
      ? { provider: failedFor, message: loadErrorMessage(change.error) }
      : null,
  }
}
