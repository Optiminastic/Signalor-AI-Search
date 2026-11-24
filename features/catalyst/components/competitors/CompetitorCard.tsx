'use client'

import { TransitionLink } from '@/components/TransitionLink'
import type { Competitor, Relation } from '@/features/catalyst/competitors-data'
import { BrandFavicon } from '@/features/catalyst/components/competitors/BrandFavicon'
import { RelationPill } from '@/features/catalyst/components/competitors/RelationPill'
import { GaugeRing } from '@/features/catalyst/components/visibility/GaugeRing'
import { BRAND_SOFT } from '@/features/catalyst/constants'
import { scoreColor, scoreStatus } from '@/features/catalyst/visibility-data'
import { useBrandPath } from '@/hooks/useBrandPath'
import { Plus } from '@/lib/icons'

function Identity({ competitor }: { competitor: Competitor }): JSX.Element {
  const { id, name, initial, color, domain, relation } = competitor
  const brandPath = useBrandPath()
  const href = relation === 'mine' ? brandPath('pillars') : brandPath(`competitors/${id}`)
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <BrandFavicon domain={domain} name={initial} color={color} size={34} />
      <div className="min-w-0">
        <TransitionLink
          href={href}
          className="block truncate py-0.5 text-[14px] font-semibold text-[var(--cat-ink)] decoration-[var(--cat-ink-3)] underline-offset-2 group-hover:underline after:absolute after:inset-0"
        >
          {name}
        </TransitionLink>
        <a
          href={`https://${domain}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-primary-ink relative block truncate py-1 text-[12px] text-[var(--cat-ink-3)] transition-colors"
        >
          {domain}
        </a>
      </div>
    </div>
  )
}

/** The AI-visibility score as a compact radial gauge with a coloured status. */
function ScoreGauge({ score }: { score: number }): JSX.Element {
  const sc = scoreColor(score)
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <GaugeRing value={score} size={56} stroke={6} color={sc}>
        <span className="text-[15px] font-bold" style={{ color: sc }}>
          {score}
        </span>
      </GaugeRing>
      <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: sc }}>
        {scoreStatus(score)}
      </span>
    </div>
  )
}

function Footer({ relation }: { relation: Relation }): JSX.Element {
  return (
    <div className="relative mt-3.5 flex items-center justify-between gap-2 border-t border-[var(--cat-border-soft)] pt-3">
      <RelationPill relation={relation} />
      <button className="inline-flex items-center gap-1 rounded-md border border-dashed border-[var(--cat-border)] px-2.5 py-1 text-[12px] text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]">
        <Plus size={12} /> Add tags
      </button>
    </div>
  )
}

/** One benchmarked brand. The whole card opens its detailed analysis. */
export function CompetitorCard({ competitor }: { competitor: Competitor }): JSX.Element {
  const { score, relation, positioning } = competitor
  const mine = relation === 'mine'
  const surface = mine
    ? { background: BRAND_SOFT, borderColor: 'rgba(224,74,61,.25)' }
    : { background: 'var(--cat-card)', borderColor: 'var(--cat-border)' }

  return (
    <div
      className="group relative flex flex-col rounded-lg border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(16,24,40,0.09)]"
      style={surface}
    >
      <div className="flex items-start justify-between gap-3">
        <Identity competitor={competitor} />
        <ScoreGauge score={score} />
      </div>
      <p className="mt-3 line-clamp-2 min-h-[34px] text-[12px] leading-relaxed text-[var(--cat-ink-3)]">
        {positioning || 'No positioning summary yet.'}
      </p>
      <Footer relation={relation} />
    </div>
  )
}
