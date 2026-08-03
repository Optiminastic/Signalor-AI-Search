'use client'

import { useState } from 'react'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { DataState } from '@/features/catalyst/components/DataState'
import { GaSnapshotCard } from '@/features/catalyst/components/insights/GaSnapshotCard'
import { TopDomainsCard } from '@/features/catalyst/components/insights/TopDomainsCard'
import { TopEnginesCard } from '@/features/catalyst/components/insights/TopEnginesCard'
import { sliceRecent, trendState } from '@/features/catalyst/components/insights/trend-series'
import { TrendChart, TrendLegend } from '@/features/catalyst/components/insights/TrendChart'
import {
  TrendRangeTabs,
  type TrendRange,
} from '@/features/catalyst/components/insights/TrendRangeTabs'
import { TaskStatCard } from '@/features/catalyst/components/tasks/TaskStatCard'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useInsights, type InsightsData } from '@/hooks/useInsights'

/**
 * Weekly mention rate per engine, over a selectable window.
 *
 * Shares its shaping with the compact card above the prompt table — including
 * the single-week padding, without which one week of data plotted a lone dot
 * and no line.
 */
function TrendCard({ data }: { data: InsightsData }): JSX.Element {
  const [range, setRange] = useState<TrendRange>(0)
  const windowed = sliceRecent({ series: data.series, weeks: data.weeks }, range)
  const state = trendState(
    { isLoading: false, isError: false },
    windowed.series.length,
    windowed.weeks.length,
  )

  return (
    <Card>
      {/* The series is `brand_mentioned` per week, not citations — the two are
          deliberately different signals in this product, so the title says so. */}
      <CardHead title="Brand mentions by model" />
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <TrendLegend series={windowed.series} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-[var(--cat-ink-3)]">
            Weekly brand mention rate per engine
          </span>
          <TrendRangeTabs value={range} onChange={setRange} available={data.weeks.length} />
        </div>
      </div>
      <TrendChart state={state} series={windowed.series} weeks={windowed.weeks} />
    </Card>
  )
}

function Body({ data }: { data: InsightsData }): JSX.Element {
  return (
    <div className="cat-stagger flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
        {data.stats.map(stat => (
          <TaskStatCard key={stat.label} stat={stat} />
        ))}
      </div>
      <TrendCard data={data} />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        <TopEnginesCard sources={data.engines} />
        <TopDomainsCard domains={data.domains} />
        <GaSnapshotCard />
      </div>
    </div>
  )
}

/** 360 Insights — how AI engines cite, mention and send traffic to the brand. */
export function InsightsView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useInsights(slug)

  return (
    <>
      <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--cat-border)] pb-4">
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
            360 Insights
          </h1>
          <p className="text-[13px] text-[var(--cat-ink-2)]">
            How AI engines cite your brand, where the citations point, and the traffic behind them
          </p>
        </div>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!slug || !data}
          emptyTitle="No insight data yet"
          emptyHint="Run an analysis and track prompts to populate citation insights."
        >
          {data && <Body data={data} />}
        </DataState>
      </div>
    </>
  )
}
