'use client'

import { useState } from 'react'

import { DataState } from '@/features/catalyst/components/DataState'
import { GeoEngineCard } from '@/features/catalyst/components/geo/GeoEngineCard'
import { GeoTrendCard } from '@/features/catalyst/components/geo/GeoTrendCard'
import { RangeTabs, type Range } from '@/features/catalyst/components/RangeTabs'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useGeoDetail } from '@/hooks/useGeoScore'

/**
 * GEO Score details page — the dashboard card's "Details" destination. Score
 * trend over the selected range plus every engine's share of voice.
 */
export function GeoDetailView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const [range, setRange] = useState<Range>('1W')
  const { data, isLoading, isError } = useGeoDetail(slug, range)

  return (
    <>
      <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--cat-border)] pb-4">
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">GEO Score</h1>
          <p className="text-[13px] text-[var(--cat-ink-2)]">
            How your brand&apos;s AI visibility trends across engines
          </p>
        </div>
        <div className="ml-auto">
          <RangeTabs value={range} onChange={setRange} />
        </div>
      </div>
      <div className="-mx-3 mt-3 min-h-0 flex-1 overflow-y-auto px-3">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!slug || !data}
          emptyTitle="No GEO data yet"
          emptyHint="Run an analysis for this brand to see its GEO score and per-engine share of voice."
        >
          {data && (
            <div className="cat-stagger grid grid-cols-1 gap-2 xl:grid-cols-3">
              <GeoTrendCard data={data} />
              <GeoEngineCard data={data} />
            </div>
          )}
        </DataState>
      </div>
    </>
  )
}
