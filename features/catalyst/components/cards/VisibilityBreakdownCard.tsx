'use client'

import { TransitionLink } from '@/components/TransitionLink'
import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { BLUE, BRAND, GREEN, PURPLE, YELLOW } from '@/features/catalyst/constants'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { usePillars, type Pillar } from '@/hooks/usePillars'
import { ArrowRight } from '@/lib/icons'

const PILLAR_COLORS = [BRAND, BLUE, GREEN, YELLOW, PURPLE, '#EC4899']
const SIZE = 128
const STROKE = 14
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

interface Segment {
  color: string
  dash: number
  offset: number
}

/** Precompute each pillar's arc as proportional length + running offset (no
 * mutation during render). */
function buildSegments(pillars: Pillar[]): Segment[] {
  const total = pillars.reduce((sum, p) => sum + p.score, 0) || 1
  let offset = 0
  return pillars.map((p, i) => {
    const dash = CIRC * (p.score / total)
    const seg: Segment = { color: PILLAR_COLORS[i % PILLAR_COLORS.length], dash, offset }
    offset += dash
    return seg
  })
}

function DonutCenter({ composite }: { composite: number }): JSX.Element {
  return (
    <div className="absolute inset-0 grid place-items-center text-center leading-none">
      <div>
        <div className="text-[24px] font-bold tracking-tight text-[var(--cat-ink)]">
          {composite}%
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--cat-ink-3)]">Total Score</div>
      </div>
    </div>
  )
}

function DonutArcs({ segments }: { segments: Segment[] }): JSX.Element {
  const base = { cx: SIZE / 2, cy: SIZE / 2, r: R, fill: 'none', strokeWidth: STROKE } as const
  return (
    <svg width={SIZE} height={SIZE} className="-rotate-90">
      <circle {...base} stroke="var(--cat-grid)" />
      {segments.map((s, i) => (
        <circle
          key={i}
          {...base}
          stroke={s.color}
          strokeDasharray={`${Math.max(s.dash - 2, 0)} ${CIRC}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  )
}

function BreakdownDonut({
  pillars,
  composite,
}: {
  pillars: Pillar[]
  composite: number
}): JSX.Element {
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <DonutArcs segments={buildSegments(pillars)} />
      <DonutCenter composite={composite} />
    </div>
  )
}

function BreakdownLegend({ pillars }: { pillars: Pillar[] }): JSX.Element {
  return (
    <ul className="flex-1 space-y-1.5">
      {pillars.map((p, i) => (
        <li key={p.label} className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[12px] text-[var(--cat-ink-2)]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: PILLAR_COLORS[i % PILLAR_COLORS.length] }}
            />
            {p.label}
          </span>
          <span className="text-[12px] font-semibold text-[var(--cat-ink)] tabular-nums">
            {p.score}%
          </span>
        </li>
      ))}
    </ul>
  )
}

/** "Visibility Score Breakdown" — how the GEO composite is composed by pillar. */
export function VisibilityBreakdownCard(): JSX.Element {
  const { slug } = useActiveProject()
  const brandPath = useBrandPath()
  const { data } = usePillars(slug)

  const pillars = data?.pillars ?? []
  const composite = data?.composite ?? 0

  return (
    <Card>
      <div className="mb-1">
        <CardHead title="Visibility Score Breakdown" />
      </div>

      {pillars.length === 0 ? (
        <div className="grid flex-1 place-items-center py-8 text-center text-[13px] text-[var(--cat-ink-3)]">
          No pillar data yet.
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-4">
          <BreakdownDonut pillars={pillars} composite={composite} />
          <BreakdownLegend pillars={pillars} />
        </div>
      )}

      <TransitionLink
        href={brandPath('pillars')}
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-md border border-[var(--cat-border)] py-1.5 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        View score details <ArrowRight size={13} />
      </TransitionLink>
    </Card>
  )
}
