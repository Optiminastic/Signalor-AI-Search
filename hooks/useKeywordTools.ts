'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  connectKeywordTool,
  disconnectKeywordTool,
  getKeywordTools,
  type KeywordTool,
} from '@/lib/api/agent-mode-keyword-tools'
import { queryKeys } from '@/lib/query-keys'

export interface KeywordTools {
  tools: KeywordTool[]
  isLoading: boolean
  loadError: string | null
  connect: (provider: string, apiKey: string) => void
  disconnect: (provider: string) => void
  busyProvider: string | null
  actionError: { provider: string; message: string } | null
}

interface ToolChange {
  provider: string
  /** Absent to disconnect. */
  apiKey?: string
}

/** Keyword tools for the + panel: built-in data, Search Console, Semrush and Ahrefs keys. */
export function useKeywordTools(orgSlug: string): KeywordTools {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.keywordTools(orgSlug)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getKeywordTools(orgSlug),
    enabled: Boolean(orgSlug),
  })
  const change = useMutation({
    mutationFn: ({ provider, apiKey }: ToolChange) =>
      apiKey === undefined
        ? disconnectKeywordTool(orgSlug, provider)
        : connectKeywordTool(orgSlug, provider, apiKey),
    retry: false,
    onSuccess: tools => {
      queryClient.setQueryData(key, tools)
      void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.keywords(orgSlug) })
    },
  })
  const failed = change.error && change.variables
  return {
    tools: query.data ?? [],
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    connect: (provider, apiKey) => change.mutate({ provider, apiKey }),
    disconnect: provider => change.mutate({ provider }),
    busyProvider: change.isPending ? (change.variables?.provider ?? null) : null,
    actionError: failed
      ? { provider: change.variables.provider, message: loadErrorMessage(change.error) }
      : null,
  }
}
