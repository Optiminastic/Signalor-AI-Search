'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { Badge } from '@/features/catalyst/components/Badge'
import { Card } from '@/features/catalyst/components/Card'
import { AnimatedScore } from '@/features/catalyst/components/cards/AnimatedScore'
import { GeoRankTable, type RankItem } from '@/features/catalyst/components/cards/GeoRankTable'
import { GeoTrendLine } from '@/features/catalyst/components/cards/GeoTrendLine'
import { useOverviewFilters } from '@/features/catalyst/components/overview/OverviewFilters'
import { GREEN, NEG } from '@/features/catalyst/constants'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useCompetitorMatrix, type MatrixRow } from '@/hooks/useCompetitorMatrix'
import { scoreReason, useGeoScore, type GeoScore } from '@/hooks/useGeoScore'
import { ArrowRight, Info } from '@/lib/icons'

/** Mean visibility across the engines a brand was checked on (0–100). */
function rowVisibility(cells: Record<string, number>): number {
  const values = Object.values(cells)
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

/** Rank every brand by mean visibility, best-first, tagging engines present. */
function buildRanking(rows: MatrixRow[], engines: string[]): RankItem[] {
  return rows
    .map(row => ({
      name: row.name,
      domain: row.domain,
      isBrand: row.isBrand,
      visibility: rowVisibility(row.cells),
      present: engines.filter(engine => (row.cells[engine] ?? 0) > 0),
    }))
    .sort((a, b) => b.visibility - a.visibility)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

/** Colored info dot (green up / red down) revealing the score-change reason. */
function ScoreReasonInfo({ reason, positive }: { reason: string; positive: boolean }): JSX.Element {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="Why the score changed"
        className="inline-flex cursor-help items-center"
      >
        <Info size={15} style={{ color: positive ? GREEN : NEG }} />
      </button>
      <span
        role="tooltip"
        // shadow-md/5 is the documented ceiling (DESIGN.md §0.3 forbids lg/xl/2xl).
        // rounded-lg because a tooltip is a small floating surface, not a card —
        // at rounded-2xl a 64-wide popover reads as a pill.
        className="pointer-events-none absolute top-full left-0 z-50 mt-1.5 w-64 rounded-lg border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-2.5 text-[11.5px] leading-relaxed text-[var(--cat-ink-2)] opacity-0 shadow-md shadow-black/5 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {reason}
      </span>
    </span>
  )
}

function CardHeader({ rank }: { rank: number | null }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-[13.5px] font-semibold text-[var(--cat-ink)]">
          LLM Visibility Score &amp; Ranking
        </h3>
      </div>
      {rank !== null && (
        <div className="shrink-0 text-right">
          <span className="text-[15px] font-bold text-[var(--cat-ink)]">#{rank}</span>
          {/* <p className="text-[10px] tracking-wide text-[var(--cat-ink-3)] uppercase">Your rank</p> */}
        </div>
      )}
    </div>
  )
}

function ScoreRow({ data }: { data: GeoScore | undefined }): JSX.Element {
  return (
    <div className="et-2 flex items-center gap-1.5">
      <AnimatedScore value={data?.score} />
      {data && <span className="text-[18px] font-bold text-[var(--cat-ink-2)]">%</span>}
      <Badge positive={data?.positive ?? true}>{data ? data.delta : '—'}</Badge>
      {data && <ScoreReasonInfo reason={scoreReason(data)} positive={data.positive} />}
    </div>
  )
}

export function GeoScoreCard(): JSX.Element {
  const { slug } = useActiveProject()
  const brandPath = useBrandPath()
  const { range } = useOverviewFilters()
  const { data } = useGeoScore(slug, range)
  const matrix = useCompetitorMatrix(slug)

  const ranking = useMemo(
    () => buildRanking(matrix.data?.rows ?? [], matrix.data?.engines ?? []),
    [matrix.data],
  )
  const yourRank = ranking.find(item => item.isBrand)?.rank ?? null

  return (
    <Card>
      <CardHeader rank={yourRank} />
      <ScoreRow data={data} />
      <GeoTrendLine data={data?.points ?? []} />
      <div className="mt-3">
        <GeoRankTable items={ranking} />
      </div>
      <Link
        href={brandPath('competitors')}
        className="mt-2 inline-flex items-center gap-1 self-start text-[11.5px] font-medium text-[var(--cat-ink-2)] transition hover:text-[var(--cat-ink)]"
      >
        View full rankings
        <ArrowRight size={13} />
      </Link>
    </Card>
  )
}
