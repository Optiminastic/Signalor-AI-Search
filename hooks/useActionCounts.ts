'use client'

import { useQuery } from '@tanstack/react-query'

import { useActiveProject } from '@/hooks/useActiveProject'
import { useAgentPlan } from '@/hooks/useAgentPlan'
import { getActions } from '@/lib/api/analyzer'

const DONE = new Set(['completed', 'verified'])

export interface ActionCounts {
  /** Actions in today's ranked plan; null until the plan resolves. */
  today: number | null
  /** Open actions beyond today's plan. */
  backlog: number | null
  done: number | null
  all: number | null
}

/**
 * The numbers on the Actions filter chips.
 *
 * These counts ARE the navigation now, so each one has to agree with what its
 * filter actually renders — a chip reading "Backlog 13" that opens an empty
 * board is worse than showing no chip at all. Today is counted from the plan
 * (the ranked view it opens); the rest are counted from the actions list the
 * board renders, so every number comes from the same source as its view.
 *
 * Null means "not known yet", and the chip renders bare rather than showing a
 * 0 the user hasn't earned.
 */
export function useActionCounts(): ActionCounts {
  const { email } = useActiveProject()
  const { plan } = useAgentPlan()

  const { data } = useQuery({
    // Own key: this is a summary, not the board's row data, and it must stay
    // readable on filters that render no rows.
    queryKey: ['catalyst', 'action-counts', email ?? ''],
    enabled: Boolean(email),
    queryFn: async (): Promise<{ open: number; done: number; total: number }> => {
      const actions = await getActions(email as string)
      const done = actions.filter(a => DONE.has(a.status)).length
      return { open: actions.length - done, done, total: actions.length }
    },
  })

  const today = plan ? plan.groups.reduce((n, g) => n + g.actions.length, 0) : null
  if (!data) return { today, backlog: null, done: null, all: null }

  return {
    today,
    // Today's plan is drawn from the open set, so the remainder is the backlog.
    backlog: today === null ? null : Math.max(0, data.open - today),
    done: data.done,
    all: data.total,
  }
}
