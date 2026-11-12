'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  answerContact,
  listActivity,
  type ActivityEntry,
  type ContactChoice,
} from '@/lib/api/agent-mode-activity'
import { queryKeys } from '@/lib/query-keys'

/** How often the log refreshes on its own, so the owner sees the agent working. */
const ACTIVITY_REFRESH_MS = 15_000

interface AgentActivityLog {
  entries: ActivityEntry[]
  isLoading: boolean
  error: string | null
}

export function useAgentActivity(orgSlug: string): AgentActivityLog {
  const query = useQuery({
    queryKey: queryKeys.agentMode.activity(orgSlug),
    queryFn: () => listActivity(orgSlug),
    enabled: Boolean(orgSlug),
    refetchInterval: ACTIVITY_REFRESH_MS,
  })
  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? loadErrorMessage(query.error) : null,
  }
}

export interface TaskContactAnswer {
  answer: (taskId: number, choice: ContactChoice) => void
  pendingTaskId: number | null
  error: string | null
}

/** Answer "no contact found": an email for the agent to write to, or skip. */
export function useTaskContact(orgSlug: string): TaskContactAnswer {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (input: { taskId: number; choice: ContactChoice }) =>
      answerContact({ orgSlug, ...input }),
    retry: false,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.all(orgSlug) })
    },
  })
  return {
    answer: (taskId, choice) => mutation.mutate({ taskId, choice }),
    pendingTaskId: mutation.isPending ? (mutation.variables?.taskId ?? null) : null,
    error: mutation.error ? loadErrorMessage(mutation.error) : null,
  }
}
