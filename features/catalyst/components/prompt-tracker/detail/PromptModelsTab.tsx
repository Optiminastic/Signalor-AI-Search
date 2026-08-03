'use client'

import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { EmptyNote, RateBar } from '@/features/catalyst/components/prompt-tracker/detail/DetailBits'
import { BRAND, GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import type { EngineStats } from '@/features/catalyst/prompt-detail-analytics'
import { formatTaskDate } from '@/features/catalyst/tasks-data'

/** Sentiment split as one segmented bar — positive / neutral / negative. */
function SentimentBar({ stats }: { stats: EngineStats }): JSX.Element {
  const segments = [
    { key: 'positive', value: stats.sentiment.positive, color: GREEN },
    { key: 'neutral', value: stats.sentiment.neutral, color: 'var(--cat-ink-3)' },
    { key: 'negative', value: stats.sentiment.negative, color: NEG },
  ].filter(segment => segment.value > 0)

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-sm bg-[var(--cat-track)]">
      {segments.map(segment => (
        <span
          key={segment.key}
          title={`${segment.key}: ${segment.value}`}
          style={{ flex: segment.value, background: segment.color }}
        />
      ))}
    </div>
  )
}

function MetricRow({
  label,
  value,
  rate,
  color,
}: {
  label: string
  value: string
  rate: number
  color: string
}): JSX.Element {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-[var(--cat-ink-3)]">{label}</span>
        <span className="text-[12px] font-semibold text-[var(--cat-ink)] tabular-nums">
          {value}
        </span>
      </div>
      <RateBar value={rate} color={color} />
    </div>
  )
}

function CardHead({ stats }: { stats: EngineStats }): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <EngineLogo name={stats.engineLabel} size={20} />
      <span className="text-[13px] font-semibold text-[var(--cat-ink)]">{stats.engineLabel}</span>
      <span className="ml-auto text-[11px] text-[var(--cat-ink-3)] tabular-nums">
        {stats.runs} {stats.runs === 1 ? 'run' : 'runs'}
      </span>
    </div>
  )
}

function CardFoot({ stats }: { stats: EngineStats }): JSX.Element {
  return (
    <div className="mt-3 border-t border-[var(--cat-border)] pt-3">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-[var(--cat-ink-3)]">Sentiment</span>
        <span className="text-[11px] text-[var(--cat-ink-2)] tabular-nums">
          {stats.avgPosition === null ? 'unranked' : `avg #${stats.avgPosition}`}
        </span>
      </div>
      <SentimentBar stats={stats} />
      {stats.lastCheckedAt && (
        <p className="mt-2.5 text-[10px] text-[var(--cat-ink-3)]">
          Last checked {formatTaskDate(stats.lastCheckedAt)}
        </p>
      )}
    </div>
  )
}

function EngineCard({ stats }: { stats: EngineStats }): JSX.Element {
  return (
    <div className="rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3.5">
      <CardHead stats={stats} />
      <div className="mt-3 space-y-2.5">
        <MetricRow
          label="Mention rate"
          value={`${stats.mentionRate}%`}
          rate={stats.mentionRate}
          color={BRAND}
        />
        <MetricRow
          label="Citation rate"
          value={`${stats.citationRate}%`}
          rate={stats.citationRate}
          color={GREEN}
        />
      </div>
      <CardFoot stats={stats} />
    </div>
  )
}

/** Side-by-side leaderboard of every engine that has answered this prompt. */
export function PromptModelsTab({ engines }: { engines: EngineStats[] }): JSX.Element {
  if (engines.length === 0) {
    return <EmptyNote>No engine answers in this date range.</EmptyNote>
  }
  const best = engines[0]
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[var(--cat-border)] bg-[var(--cat-content)] p-3">
        <p className="text-[11px] text-[var(--cat-ink-3)]">Strongest engine</p>
        <p className="mt-1 flex items-center gap-2 text-[13px] font-semibold text-[var(--cat-ink)]">
          <EngineLogo name={best.engineLabel} size={18} />
          {best.engineLabel}
          <span className="font-normal text-[var(--cat-ink-2)]" style={{ color: YELLOW }}>
            {best.citationRate}% cited
          </span>
        </p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {engines.map(stats => (
          <EngineCard key={stats.engine} stats={stats} />
        ))}
      </div>
    </div>
  )
}
