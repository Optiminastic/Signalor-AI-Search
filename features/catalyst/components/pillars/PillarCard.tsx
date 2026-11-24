import { Card } from '@/features/catalyst/components/Card'
import { Delta } from '@/features/catalyst/components/Delta'
import { BarMeter } from '@/features/catalyst/components/visibility/BarMeter'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import type { PillarDetailItem } from '@/hooks/usePillarBreakdown'

/** Shared score bands: ≥70 healthy, ≥40 watch, else at risk. */
function scoreColor(score: number): string {
  if (score >= 70) return GREEN
  if (score >= 40) return YELLOW
  return NEG
}

function scoreWord(score: number): string {
  if (score >= 70) return 'Strong'
  if (score >= 40) return 'Fair'
  return 'Weak'
}

function RecList({ pillar }: { pillar: PillarDetailItem }): JSX.Element {
  if (pillar.recCount === 0) {
    return <p className="text-[11px] text-[var(--cat-ink-3)]">No open recommendations</p>
  }
  return (
    <div className="flex flex-col gap-1">
      {pillar.topRecs.map(rec => (
        <p key={rec.id} className="truncate text-[11px] text-[var(--cat-ink-3)]">
          <span className="text-primary-ink mr-1.5">•</span>
          {rec.title}
        </p>
      ))}
      <p className="text-[11px] font-medium text-[var(--cat-ink-2)]">
        {pillar.recCount} open {pillar.recCount === 1 ? 'recommendation' : 'recommendations'}
      </p>
    </div>
  )
}

/** One pillar's deep-dive tile: score, band, delta vs site avg and open work. */
export function PillarCard({ pillar }: { pillar: PillarDetailItem }): JSX.Element {
  const color = scoreColor(pillar.score)
  const diff = pillar.score - pillar.siteAvg
  return (
    <Card className="gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[var(--cat-ink-2)]">{pillar.label}</span>
        <span className="text-[11px] font-semibold" style={{ color }}>
          {scoreWord(pillar.score)}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-bold tracking-tight text-[var(--cat-ink)]">
          {pillar.score}
        </span>
        <span className="text-[12px] text-[var(--cat-ink-3)]">/100</span>
        <span className="ml-auto">
          {diff === 0 ? (
            <span className="text-[11px] text-[var(--cat-ink-3)]">at site avg</span>
          ) : (
            <Delta positive={diff > 0}>{`${Math.abs(diff)} vs avg`}</Delta>
          )}
        </span>
      </div>
      <BarMeter value={pillar.score} color={color} />
      <div className="mt-1 border-t border-[var(--cat-border-soft)] pt-2">
        <RecList pillar={pillar} />
      </div>
    </Card>
  )
}
