'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { ensureProgram } from '@/lib/api/agent-mode'
import { getChat, sendChat, type AgentChatMessage } from '@/lib/api/agent-mode-chat'
import { queryKeys } from '@/lib/query-keys'

const POLL_INTERVAL_MS = 2000

interface AgentModeChat {
  messages: AgentChatMessage[]
  thinking: boolean
  error: string | null
  send: (message: string) => void
}

function pendingIds(messages: AgentChatMessage[] | undefined): Set<number> {
  return new Set((messages ?? []).filter(m => m.status === 'pending').map(m => m.id))
}

async function sendEnsuringProgram(orgSlug: string, message: string): Promise<AgentChatMessage[]> {
  // The chat lives on the brand's program; the first message starts it if needed.
  await ensureProgram(orgSlug)
  return sendChat(orgSlug, message)
}

/**
 * The SignalorAI Agent conversation for the brand in the URL. Polls while a reply
 * is being written and refreshes the Agent mode cards when a reply changed the plan.
 */
export function useAgentModeChat(orgSlug: string | undefined): AgentModeChat {
  const slug = orgSlug ?? ''
  const queryClient = useQueryClient()
  const waitingOn = useRef<Set<number>>(new Set())

  const refreshIfPlanChanged = (messages: AgentChatMessage[]): void => {
    const finished = messages.filter(m => waitingOn.current.has(m.id) && m.status !== 'pending')
    if (finished.some(m => m.changedPlan)) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.all(slug) })
    }
    waitingOn.current = pendingIds(messages)
  }

  const query = useQuery({
    queryKey: queryKeys.agentMode.chat(slug),
    queryFn: async () => {
      const messages = await getChat(slug).catch(() => [])
      refreshIfPlanChanged(messages)
      return messages
    },
    enabled: Boolean(orgSlug),
    refetchInterval: q => (pendingIds(q.state.data).size > 0 ? POLL_INTERVAL_MS : false),
  })
  const send = useMutation({
    mutationFn: (message: string) => sendEnsuringProgram(slug, message),
    onSuccess: messages => {
      waitingOn.current = pendingIds(messages)
      queryClient.setQueryData(queryKeys.agentMode.chat(slug), messages)
    },
  })
  const messages = query.data ?? []
  return {
    messages,
    thinking: send.isPending || pendingIds(messages).size > 0,
    error: send.error ? send.error.message : null,
    send: message => send.mutate(message),
  }
}
