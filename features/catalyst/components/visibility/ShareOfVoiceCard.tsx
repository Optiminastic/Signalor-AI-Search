import { Card } from '@/features/catalyst/components/Card'
import { MetricDelta } from '@/features/catalyst/components/visibility/MetricDelta'
import { MiniBars } from '@/features/catalyst/components/visibility/MiniBars'
import { VisCardHead } from '@/features/catalyst/components/visibility/VisCardHead'
import { BRAND } from '@/features/catalyst/constants'
import type { SovBar, SovMeta } from '@/hooks/useVisibility'
import { TrendingUp } from '@/lib/icons'

export function ShareOfVoiceCard({ sov, meta }: { sov: SovBar[]; meta: SovMeta }): JSX.Element {
  return (
    <Card className="gap-3">
      <VisCardHead icon={TrendingUp} title="Share of Voice" iconColor={BRAND} />
      <div className="flex items-end gap-2.5">
        <span className="text-[32px] leading-none font-bold tracking-tight text-[var(--cat-ink)]">
          {meta.avg}
          <span className="ml-1 text-[14px] font-medium text-[var(--cat-ink-3)]">avg SOV</span>
        </span>
        <span className="mb-0.5">
          <MetricDelta value={meta.delta} positive={meta.positive} />
        </span>
      </div>
      <MiniBars bars={sov} color={BRAND} />
      <div className="mt-auto text-[12px] text-[var(--cat-ink-3)]">{meta.prompts} tracked</div>
    </Card>
  )
}
