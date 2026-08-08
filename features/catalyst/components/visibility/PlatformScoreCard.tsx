import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { BarMeter } from '@/features/catalyst/components/visibility/BarMeter'
import { MetricDelta } from '@/features/catalyst/components/visibility/MetricDelta'
import { scoreColor } from '@/features/catalyst/visibility-data'
import type { PlatformVis, SubStat } from '@/hooks/useVisibility'
import { MoreHorizontal } from '@/lib/icons'

function Head({ platform }: { platform: PlatformVis }): JSX.Element {
  const { name, badge } = platform
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <EngineLogo name={name} size={28} />
        <span className="text-[14px] font-semibold text-[var(--cat-ink)]">{name}</span>
        {badge && (
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
            style={{ color: '#17A673', borderColor: 'rgba(23,166,115,.35)' }}
          >
            AI Analysis
          </span>
        )}
      </span>
      <MoreHorizontal size={16} className="text-[var(--cat-ink-3)]" />
    </div>
  )
}

function SubStats({ stats }: { stats: SubStat[] }): JSX.Element {
  return (
    <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--cat-border-soft)] pt-3">
      {stats.map(stat => (
        <div key={stat.label}>
          <div className="text-[15px] font-bold text-[var(--cat-ink)]">{stat.value}</div>
          <div className="text-[11px] text-[var(--cat-ink-3)]">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export function PlatformScoreCard({ platform }: { platform: PlatformVis }): JSX.Element {
  return (
    <div className="cat-card-edge flex flex-col gap-3 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-4">
      <Head platform={platform} />
      <div className="flex items-end gap-2.5">
        <span className="text-[32px] leading-none font-bold tracking-tight text-[var(--cat-ink)]">
          {platform.score}
          <span className="ml-1 text-[15px] font-semibold text-[var(--cat-ink-3)]">/100</span>
        </span>
        <span className="mb-0.5">
          <MetricDelta value={platform.delta} positive={platform.positive} />
        </span>
      </div>
      <BarMeter value={platform.score} color={scoreColor(platform.score)} />
      <SubStats stats={platform.substats} />
    </div>
  )
}
