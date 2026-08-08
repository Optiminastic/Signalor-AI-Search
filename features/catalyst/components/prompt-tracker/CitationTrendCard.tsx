'use client'

import { trendState } from '@/features/catalyst/components/insights/trend-series'
import { TrendChart, TrendLegend } from '@/features/catalyst/components/insights/TrendChart'
import { useInsights } from '@/hooks/useInsights'

/** Compact strip above the table — trimmed so the flat, low-value lines don't
 *  sit under a tall band of empty chart. */
const CHART_HEIGHT = 72

/**
 * Full-width weekly citation trend, one line per AI model. Backed by the
 * `citation-trend` endpoint (weekly brand mention rate per engine).
 */
export function CitationTrendCard({ slug }: { slug: string | undefined }): JSX.Element {
  const { data, isLoading, isError } = useInsights(slug)
  const series = data?.series ?? []
  const weeks = data?.weeks ?? []
  const state = trendState({ isLoading, isError }, series.length, weeks.length)

  return (
    <div className="cat-rise cat-card-edge mb-3 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3.5">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--cat-ink)]">Mentions by model</h3>
          <p className="text-[11px] text-[var(--cat-ink-3)]">
            Weekly share of tracked prompts where each model mentioned your brand
          </p>
        </div>
        {series.length > 0 && <TrendLegend series={series} />}
      </div>
      <TrendChart state={state} series={series} weeks={weeks} height={CHART_HEIGHT} />
    </div>
  )
}
