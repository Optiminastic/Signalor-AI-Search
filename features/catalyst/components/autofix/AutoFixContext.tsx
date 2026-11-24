'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

import type { Recommendation } from '@/features/catalyst/recommendations-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAutoFix, type FixPlatform, type FixState } from '@/hooks/useAutoFix'
import { useRecommendations } from '@/hooks/useRecommendations'

/** Auto-fixable → live fix state + trigger; not auto-fixable → manual (no trigger). */
export type TaskFix = { auto: true; state: FixState; onFix: () => void } | { auto: false }

/**
 * Whether this task can actually be auto-fixed on the *connected* platform. On a
 * store (Webflow/WordPress/Shopify) only the backend's platform-aware
 * `canAutoFix` counts — so a Webflow site shows "Manual" up front for anything
 * Webflow's API can't change, instead of offering "Auto fix" that only degrades
 * to manual after a click. On a Next.js site the GitHub agent's `codeFixable`
 * applies. Before any platform resolves, keep the affordance if either can.
 */
function isAutoFixable(rec: Recommendation, platform: FixPlatform): boolean {
  if (platform === 'nextjs') return rec.codeFixable
  if (platform === 'none') return rec.auto
  return rec.canAutoFix
}

interface AutoFixContextValue {
  forTask: (recommendationId: number | undefined) => TaskFix | null
  recForTask: (recommendationId: number | undefined) => Recommendation | null
}

const AutoFixContext = createContext<AutoFixContextValue | null>(null)

/**
 * Provides per-task Auto-fix affordances to a deep component tree (the Tasks
 * table) without prop-drilling. Resolves the run's fix platform once and
 * cross-references its recommendations, so a task can surface either a live
 * "Auto fix" trigger (auto-fixable) or a "Manual fix" affordance (not), plus
 * the full recommendation for the detail modal.
 */
export function AutoFixProvider({ children }: { children: ReactNode }): JSX.Element {
  const { slug, email, activeOrg } = useActiveProject()
  const autofix = useAutoFix({ slug, email, orgId: activeOrg?.id })
  const { data } = useRecommendations(slug)

  const recMap = useMemo(() => {
    const map = new Map<number, Recommendation>()
    data?.recommendations.forEach(r => map.set(r.id, r))
    return map
  }, [data])

  const value = useMemo<AutoFixContextValue>(
    () => ({
      forTask: recommendationId => {
        if (!recommendationId) return null
        const rec = recMap.get(recommendationId)
        if (!rec) return null
        if (!isAutoFixable(rec, autofix.platform)) return { auto: false }
        return {
          auto: true,
          state: autofix.stateFor(recommendationId),
          onFix: () => {
            void autofix.runFix({ id: recommendationId, findingCode: rec.findingCode })
          },
        }
      },
      recForTask: recommendationId =>
        recommendationId ? (recMap.get(recommendationId) ?? null) : null,
    }),
    [recMap, autofix],
  )

  return <AutoFixContext.Provider value={value}>{children}</AutoFixContext.Provider>
}

/** Fix affordance (auto | manual) for a task's linked recommendation, or null. */
export function useTaskFix(recommendationId: number | undefined): TaskFix | null {
  const ctx = useContext(AutoFixContext)
  return ctx ? ctx.forTask(recommendationId) : null
}

/** The full recommendation behind a task (for the detail modal), or null. */
export function useTaskRec(recommendationId: number | undefined): Recommendation | null {
  const ctx = useContext(AutoFixContext)
  return ctx ? ctx.recForTask(recommendationId) : null
}
