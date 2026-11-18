'use client'

import { useQuery } from '@tanstack/react-query'

import { listChats, type AgentChatSummary } from '@/lib/api/agent-mode-chat'
import { queryKeys } from '@/lib/query-keys'

const CHATS_STALE_MS = 30_000

/** The brand's saved Agent mode chats, most recent first (empty on error). */
export function useAgentChats(orgSlug: string | undefined): AgentChatSummary[] {
  const query = useQuery({
    queryKey: queryKeys.agentMode.chats(orgSlug ?? ''),
    queryFn: () => listChats(orgSlug ?? ''),
    enabled: Boolean(orgSlug),
    staleTime: CHATS_STALE_MS,
  })
  return query.data ?? []
}
