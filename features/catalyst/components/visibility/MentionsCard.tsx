import { MetricDelta } from '@/features/catalyst/components/visibility/MetricDelta'
import { Sparkline } from '@/features/catalyst/components/visibility/Sparkline'
import { VisCardHead } from '@/features/catalyst/components/visibility/VisCardHead'
import { BRAND } from '@/features/catalyst/constants'
import type { MentionsVis } from '@/hooks/useVisibility'
import { MessageSquare } from '@/lib/icons'

export function MentionsCard({ data }: { data: MentionsVis }): JSX.Element {
  return (
    <div className="cat-card-edge flex flex-col gap-3 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-4">
      <VisCardHead icon={MessageSquare} title="Mentions" iconColor={BRAND} />
      <div className="flex items-end gap-2.5">
        <span className="text-[32px] leading-none font-bold tracking-tight text-[var(--cat-ink)]">
          {data.count}
          <span className="ml-1 text-[14px] font-medium text-[var(--cat-ink-3)]">mentions</span>
        </span>
        <span className="mb-0.5">
          <MetricDelta value={data.delta} positive={data.positive} />
        </span>
      </div>
      <Sparkline points={data.trend} color={BRAND} className="h-11" />
      <div className="mt-auto text-[12px] text-[var(--cat-ink-3)]">
        Surfaced across {data.platforms} platforms this week
      </div>
    </div>
  )
}
