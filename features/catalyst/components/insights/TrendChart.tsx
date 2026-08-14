'use client'

import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { MultiLineChart } from '@/features/catalyst/components/insights/MultiLineChart'
import {
  latestOf,
  TREND_NOTES,
  type TrendState,
} from '@/features/catalyst/components/insights/trend-series'
import type { TrendSeries } from '@/hooks/useInsights'

/** Per-model legend with each engine's most recent mention rate. */
export function TrendLegend({ series }: { series: TrendSeries[] }): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {series.map(s => (
        <span
          key={s.key}
          className="inline-flex items-center gap-1 text-[12px] text-[var(--cat-ink-2)]"
        >
          <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.color }} />
          <EngineLogo name={s.label} size={16} />
          <span>{s.label}</span>
          <span className="font-semibold text-[var(--cat-ink)] tabular-nums">{latestOf(s)}%</span>
        </span>
      ))}
    </div>
  )
}

export interface TrendChartProps {
  state: TrendState
  series: TrendSeries[]
  weeks: string[]
  height?: number
}

/** The weekly trend plot, or the note explaining why there is nothing to plot. */
export function TrendChart({ state, series, weeks, height }: TrendChartProps): JSX.Element {
  if (state !== 'ready') {
    return (
      <p className="py-10 text-center text-[12px] text-[var(--cat-ink-3)]">{TREND_NOTES[state]}</p>
    )
  }
  return <MultiLineChart series={series} xLabels={weeks} height={height} />
}
