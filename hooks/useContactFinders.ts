'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  connectFinder,
  disconnectFinder,
  listFinders,
  startFinderSignIn,
  type ContactFinder,
} from '@/lib/api/agent-mode-finders'
import { queryKeys } from '@/lib/query-keys'

export interface ContactFinders {
  finders: ContactFinder[]
  isLoading: boolean
  loadError: string | null
  /** Open the provider's own login page (like Claude and ChatGPT connectors). */
  signIn: (provider: string) => void
  connect: (provider: string, apiKey: string) => void
  disconnect: (provider: string) => void
  /** The provider a sign-in, connect or disconnect is running for, if any. */
  busyProvider: string | null
  actionError: { provider: string; message: string } | null
}

type FinderChange = { provider: string; apiKey?: string }

/** This page without its query string: where the provider sends the browser back. */
function currentPage(): string {
  return `${window.location.origin}${window.location.pathname}`
}

function failure(
  error: unknown,
  provider: string | undefined,
): { provider: string; message: string } | null {
  return error && provider ? { provider, message: loadErrorMessage(error) } : null
}

/** The brand's Hunter / Apollo accounts: sign in, connect a key, or disconnect. */
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
  const signIn = useMutation({
    mutationFn: (provider: string) =>
      startFinderSignIn({ orgSlug, provider, returnUrl: currentPage() }),
    retry: false,
    onSuccess: url => window.location.assign(url),
  })
  const pending = change.isPending
    ? change.variables?.provider
    : signIn.isPending
      ? signIn.variables
      : null
  return {
    finders: query.data ?? [],
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    signIn: provider => signIn.mutate(provider),
    connect: (provider, apiKey) => change.mutate({ provider, apiKey }),
    disconnect: provider => change.mutate({ provider }),
    busyProvider: pending ?? null,
    actionError:
      failure(signIn.error, signIn.variables) ?? failure(change.error, change.variables?.provider),
  }
}
