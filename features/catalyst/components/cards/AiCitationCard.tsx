'use client'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { GaugeRing } from '@/features/catalyst/components/visibility/GaugeRing'
import { BRAND, LOGO_SIZE } from '@/features/catalyst/constants'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useCitations } from '@/hooks/useCitations'
import { useOverview, type OverviewEngine, type OverviewStats } from '@/hooks/useOverview'

interface SourceRow {
  label: string
  count: number
  pct: number
}

/** Split total citations into brand / competitor / other, as share-of-citations. */
function buildSources(brand: number, competitor: number, other: number): SourceRow[] {
  const total = brand + competitor + other
  const pct = (n: number): number => (total > 0 ? Math.round((n / total) * 100) : 0)
  return [
    { label: 'Your brand', count: brand, pct: pct(brand) },
    { label: 'Competitors', count: competitor, pct: pct(competitor) },
    { label: 'Other', count: other, pct: pct(other) },
  ]
}

function SourceMeterRow({ row }: { row: SourceRow }): JSX.Element {
  return (
    <div className="flex items-center gap-2.5 py-[5px]">
      <span className="w-[86px] shrink-0 truncate text-[12px] font-medium text-[var(--cat-ink)]">
        {row.label}
      </span>
      <span className="min-w-0 flex-1">
        <TickBar value={row.pct} ticks={14} showValue={false} />
      </span>
      <span className="w-12 shrink-0 text-right text-[12px] text-[var(--cat-ink-2)] tabular-nums">
        {row.count.toLocaleString('en-US')}
      </span>
    </div>
  )
}

interface CoverageProps {
  pct: number
  cited: number
  total: number
  engines: OverviewEngine[]
}

function CoverageSummary({ pct, cited, total, engines }: CoverageProps): JSX.Element {
  return (
    <div className="mt-2 flex items-center gap-4">
      <GaugeRing value={pct} size={96} stroke={9} color={BRAND}>
        <span className="text-[20px] font-bold tracking-tight text-[var(--cat-ink)]">{pct}%</span>
      </GaugeRing>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-[var(--cat-ink)]">
          Cited in <span className="tabular-nums">{cited.toLocaleString('en-US')}</span> of{' '}
          <span className="tabular-nums">{total.toLocaleString('en-US')}</span>
        </p>
        <p className="text-[13px] text-[var(--cat-ink-3)]">answers</p>
        {engines.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            {engines.map(e => (
              <EngineLogo key={e.key} name={e.name} size={LOGO_SIZE.base} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function deriveCoverage(overview: OverviewStats | undefined): CoverageProps {
  return {
    pct: overview?.citationPct ?? 0,
    cited: overview?.cited ?? 0,
    total: overview?.total ?? 0,
    engines: (overview?.engines ?? []).slice(0, 3),
  }
}

export function AiCitationCard(): JSX.Element {
  const { slug } = useActiveProject()
  const brandPath = useBrandPath()
  const overview = useOverview(slug).data
  const citations = useCitations(slug).data

  const coverage = deriveCoverage(overview)
  const sources = citations
    ? buildSources(citations.brand, citations.competitor, citations.other)
    : []

  return (
    <Card>
      <div className="mb-1">
        <CardHead title="Citation Coverage" action="Report" href={brandPath('visibility')} />
      </div>

      <CoverageSummary {...coverage} />

      {sources.length > 0 && (
        <div className="mt-3 border-t border-[var(--cat-border)] pt-2">
          {sources.map(row => (
            <SourceMeterRow key={row.label} row={row} />
          ))}
        </div>
      )}
    </Card>
  )
}
