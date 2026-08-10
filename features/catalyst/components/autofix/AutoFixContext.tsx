'use client'

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'

import type { Recommendation } from '@/features/catalyst/recommendations-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAutoFix, type FixState } from '@/hooks/useAutoFix'
import { useRecommendations } from '@/hooks/useRecommendations'

export interface TaskFix {
  state: FixState
  onFix: () => void
}

/** A task resolved to the current run's recommendation. */
interface ResolvedFix {
  id: number
  findingCode: string
  auto: boolean
}

interface AutoFixContextValue {
  forTask: (recommendationId: number | undefined, findingCode: string | undefined) => TaskFix | null
}

const AutoFixContext = createContext<AutoFixContextValue | null>(null)

type ResolveFix = (
  recommendationId: number | undefined,
  findingCode: string | undefined,
) => ResolvedFix | undefined

/**
 * Resolves a task to a recommendation in the CURRENT run: by id when the task
 * came from this run, else by finding code.
 *
 * The finding-code path is what keeps older tasks fixable. Recommendation rows
 * are created per analysis run, but tasks outlive the run that raised them, so a
 * task from an earlier run carries an id this run has no row for; it used to
 * fall through to "Manual" even for findings the agent fixes routinely. Finding
 * codes are stable across runs. Resolving forward rather than accepting the
 * stale id also keeps the fix generating against current evidence, and matches
 * the backend, which only ever accepts a recommendation belonging to the run in
 * the URL. No row for the finding in this run means it is already gone.
 */
function useResolveFix(recommendations: Recommendation[] | undefined): ResolveFix {
  const byId = useMemo(() => {
    const map = new Map<number, { findingCode: string; auto: boolean }>()
    recommendations?.forEach(r => map.set(r.id, { findingCode: r.findingCode, auto: r.auto }))
    return map
  }, [recommendations])

  const byFindingCode = useMemo(() => {
    const map = new Map<string, { id: number; auto: boolean }>()
    recommendations?.forEach(r => {
      if (r.findingCode && !map.has(r.findingCode)) {
        map.set(r.findingCode, { id: r.id, auto: r.auto })
      }
    })
    return map
  }, [recommendations])

  return useCallback(
    (recommendationId, findingCode) => {
      const current = recommendationId ? byId.get(recommendationId) : undefined
      if (current && recommendationId) {
        return { id: recommendationId, findingCode: current.findingCode, auto: current.auto }
      }
      const older = findingCode ? byFindingCode.get(findingCode) : undefined
      if (older && findingCode) return { id: older.id, findingCode, auto: older.auto }
      return undefined
    },
    [byId, byFindingCode],
  )
}

/**
 * Provides per-task Auto-fix affordances to a deep component tree (the Tasks
 * table) without prop-drilling. It resolves the run's fix platform once and
 * cross-references the run's recommendations so a task can be fixed by its
 * linked recommendation id (only auto-fixable ones get a control).
 */
export function AutoFixProvider({ children }: { children: ReactNode }): JSX.Element {
  const { slug, email, activeOrg } = useActiveProject()
  const autofix = useAutoFix({ slug, email, orgId: activeOrg?.id })
  const { data } = useRecommendations(slug)
  const resolve = useResolveFix(data?.recommendations)

  const value = useMemo<AutoFixContextValue>(
    () => ({
      forTask: (recommendationId, findingCode) => {
        const resolved = resolve(recommendationId, findingCode)
        if (!resolved || !resolved.auto) return null
        return {
          state: autofix.stateFor(resolved.id, resolved.findingCode),
          onFix: () => {
            void autofix.runFix({ id: resolved.id, findingCode: resolved.findingCode })
          },
        }
      },
    }),
    [resolve, autofix],
  )

  return <AutoFixContext.Provider value={value}>{children}</AutoFixContext.Provider>
}

/** Fix affordance for a task's linked recommendation, or null when not fixable.
 *  ``findingCode`` is what keeps tasks from earlier runs fixable; see the
 *  byFindingCode map above. */
export function useTaskFix(
  recommendationId: number | undefined,
  findingCode?: string,
): TaskFix | null {
  const ctx = useContext(AutoFixContext)
  return ctx ? ctx.forTask(recommendationId, findingCode) : null
}
