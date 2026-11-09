'use client'

import { useQuery } from '@tanstack/react-query'

import { ensureProgram, type AgentProgram } from '@/lib/api/agent-mode'
import { AgentModeError } from '@/lib/api/agent-mode-request'
import { queryKeys } from '@/lib/query-keys'

const PROGRAM_STALE_MS = 60_000

interface AgentModeProgram {
  program: AgentProgram | null
  isLoading: boolean
  /** Backend refusal (e.g. not on Pro/Max, or not configured), shown as-is. */
  error: string | null
}

/**
 * The brand's Agent mode program. Creating it is idempotent, so the first visit
 * starts the program and later visits just read it back.
 */
export function useAgentModeProgram(orgSlug: string | undefined): AgentModeProgram {
  const query = useQuery({
    queryKey: queryKeys.agentMode.program(orgSlug ?? ''),
    queryFn: () => ensureProgram(orgSlug ?? ''),
    enabled: Boolean(orgSlug),
    staleTime: PROGRAM_STALE_MS,
    retry: (count, error) => !(error instanceof AgentModeError) && count < 1,
  })
  return {
    program: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
  }
}
