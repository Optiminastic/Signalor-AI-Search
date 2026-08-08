'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { GeoTrendLine } from '@/features/catalyst/components/cards/GeoTrendLine'
import { Metric } from '@/features/catalyst/components/Metric'
import { useOverviewFilters } from '@/features/catalyst/components/overview/OverviewFilters'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useGeoScore } from '@/hooks/useGeoScore'

/** "Visibility Score Trend" — the brand's visibility score over the selected range. */
export function VisibilityTrendCard(): JSX.Element {
  const { slug } = useActiveProject()
  const { range, rangeLabel } = useOverviewFilters()
  const { data } = useGeoScore(slug, range)

  const points = data?.points ?? []

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <CardHead title="Visibility Score Trend" />
        </div>
        <span className="rounded-md bg-[var(--cat-track)] px-2.5 py-1 text-[12px] font-medium text-[var(--cat-ink-2)]">
          {rangeLabel}
        </span>
      </div>

      {data && (
        <div className="mt-2">
          <Metric
            value={`${data.score}%`}
            positive={data.positive}
            badge={`${data.delta} vs prev.`}
          />
        </div>
      )}

      {points.length === 0 ? (
        <div className="grid h-[96px] flex-1 place-items-center text-center text-[13px] text-[var(--cat-ink-3)]">
          No trend data yet.
        </div>
      ) : (
        <GeoTrendLine data={points} />
      )}
    </Card>
  )
}
