'use client'

import { useMemo } from 'react'

import { CompetitorsGrid } from '@/features/catalyst/components/competitors/CompetitorsGrid'
import { CompetitorsToolbar } from '@/features/catalyst/components/competitors/CompetitorsToolbar'
import { DataState } from '@/features/catalyst/components/DataState'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useCompetitors, type MineBrand } from '@/hooks/useCompetitors'

export function CompetitorsView(): JSX.Element {
  const { slug, activeOrg, run, isLoading: projectLoading } = useActiveProject()

  const mine = useMemo<MineBrand | undefined>(() => {
    if (!activeOrg) return undefined
    return { name: activeOrg.name, url: activeOrg.url, score: run?.composite_score ?? 0 }
  }, [activeOrg, run?.composite_score])

  const { data, isLoading, isError } = useCompetitors({ slug, mine })

  return (
    <>
      <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--cat-border)] pb-4">
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
            Competitors
          </h1>
          <p className="text-[13px] text-[var(--cat-ink-2)]">
            Benchmark rival brands across AI surfaces.
          </p>
        </div>
        <CompetitorsToolbar />
      </div>
      <div className="-mx-3 mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!slug || !data || data.length === 0}
          emptyTitle="No competitors yet"
          emptyHint="Run an analysis for this project to discover and benchmark rival brands."
        >
          {data && <CompetitorsGrid competitors={data} />}
        </DataState>
      </div>
    </>
  )
}
