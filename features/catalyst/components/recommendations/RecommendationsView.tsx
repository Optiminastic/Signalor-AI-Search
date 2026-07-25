'use client'

import { AutoFixControl } from '@/features/catalyst/components/autofix/AutoFixControl'
import { DashHeader, DashStatRow } from '@/features/catalyst/components/dash/DashStat'
import { DataState } from '@/features/catalyst/components/DataState'
import { PRIORITY_STYLE, type Recommendation } from '@/features/catalyst/recommendations-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAutoFix, type FixState } from '@/hooks/useAutoFix'
import { useRecommendations } from '@/hooks/useRecommendations'
import { Check } from '@/lib/icons'

interface RecActionProps {
  item: Recommendation
  state: FixState
  onFix: () => void
}

function RecAction({ item, state, onFix }: RecActionProps): JSX.Element {
  if (item.status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2FBE7E]">
        <Check size={14} />
        Done
      </span>
    )
  }
  if (item.auto) {
    return <AutoFixControl state={state} onFix={onFix} />
  }
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center rounded-md border border-[var(--cat-border)] px-3 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]"
    >
      View steps
    </button>
  )
}

function RecRow({ item, state, onFix }: RecActionProps): JSX.Element {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <span
        className={`w-16 shrink-0 rounded-md px-2 py-0.5 text-center text-[11px] font-semibold ${PRIORITY_STYLE[item.priority]}`}
      >
        {item.priority}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[13px] font-medium text-[var(--cat-ink)] ${item.status === 'done' ? 'line-through opacity-60' : ''}`}
        >
          {item.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--cat-ink-3)]">
          <span className="rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 font-medium text-[var(--cat-ink-2)]">
            {item.pillar}
          </span>
          <span>· {item.effort}</span>
        </div>
      </div>
      <div className="shrink-0">
        <RecAction item={item} state={state} onFix={onFix} />
      </div>
    </div>
  )
}

export function RecommendationsView(): JSX.Element {
  const { slug, email, activeOrg, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useRecommendations(slug)
  const autofix = useAutoFix({ slug, email, orgId: activeOrg?.id })

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <DashHeader
        title="Recommendations"
        subtitle="Prioritised fixes ranked by expected GEO lift — start at the top."
      />
      <DataState
        isLoading={projectLoading || isLoading}
        isError={isError}
        isEmpty={!slug || !data || data.recommendations.length === 0}
        emptyTitle="No recommendations yet"
        emptyHint="Run an analysis for this project to generate prioritised GEO fixes."
      >
        {data && (
          <>
            <div className="mb-5">
              <DashStatRow stats={data.stats} />
            </div>
            <div className="divide-y divide-[var(--cat-border)] overflow-hidden rounded-lg border border-[var(--cat-border)] bg-[var(--cat-card)]">
              {data.recommendations.map(r => (
                <RecRow
                  key={r.id}
                  item={r}
                  state={autofix.stateFor(r.id, r.findingCode)}
                  onFix={() => {
                    void autofix.runFix({ id: r.id, findingCode: r.findingCode })
                  }}
                />
              ))}
            </div>
          </>
        )}
      </DataState>
    </div>
  )
}
