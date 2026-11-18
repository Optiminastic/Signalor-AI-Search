'use client'

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { ensureProgram } from '@/lib/api/agent-mode'
import { getChat, sendChat, startChat, type AgentChatMessage } from '@/lib/api/agent-mode-chat'
import { queryKeys } from '@/lib/query-keys'

const POLL_INTERVAL_MS = 2000

interface AgentModeChatOptions {
  orgSlug: string | undefined
  /** The open chat, or undefined for a new one. */
  chatId: string | undefined
  /** Called once a new chat exists, so the page can move to its URL. */
  onStarted: (chatId: string) => void
}

interface AgentModeChat {
  messages: AgentChatMessage[]
  thinking: boolean
  error: string | null
  send: (message: string) => void
}

function pendingIds(messages: AgentChatMessage[] | undefined): Set<number> {
  return new Set((messages ?? []).filter(m => m.status === 'pending').map(m => m.id))
}

interface SendTarget {
  slug: string
  chatId: string | undefined
  queryClient: QueryClient
}

/** Posts into the open chat, or starts one (the program is created first if needed). */
async function postMessage(
  target: SendTarget,
  message: string,
): Promise<{ chatId: string; messages: AgentChatMessage[] }> {
  const { slug, chatId, queryClient } = target
  if (chatId) return { chatId, messages: await sendChat({ orgSlug: slug, chatId, message }) }
  await ensureProgram(slug)
  const started = await startChat(slug, message)
  void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.chats(slug) })
  return { chatId: started.chat.id, messages: started.messages }
}

/**
 * One SignalorAI Agent chat for the brand in the URL. Polls while a reply is
 * being written and refreshes the Agent mode data when a reply changed the plan.
 */
export function useAgentModeChat({
  orgSlug,
  chatId,
  onStarted,
}: AgentModeChatOptions): AgentModeChat {
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
    queryKey: queryKeys.agentMode.chat(slug, chatId ?? ''),
    queryFn: async () => {
      const messages = await getChat(slug, chatId ?? '')
      refreshIfPlanChanged(messages)
      return messages
    },
    enabled: Boolean(orgSlug && chatId),
    refetchInterval: q => (pendingIds(q.state.data).size > 0 ? POLL_INTERVAL_MS : false),
  })
  const send = useMutation({
    mutationFn: (message: string) => postMessage({ slug, chatId, queryClient }, message),
    onSuccess: result => {
      waitingOn.current = pendingIds(result.messages)
      queryClient.setQueryData(queryKeys.agentMode.chat(slug, result.chatId), result.messages)
      if (result.chatId !== chatId) onStarted(result.chatId)
    },
  })
  const messages = chatId ? (query.data ?? []) : []
  return {
    messages,
    thinking: send.isPending || pendingIds(messages).size > 0,
    error: send.error?.message ?? (query.error ? 'This chat could not be loaded.' : null),
    send: message => send.mutate(message),
  }
}
