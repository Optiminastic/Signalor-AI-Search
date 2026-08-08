'use client'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import {
  Panel,
  RateBar,
  StatTile,
} from '@/features/catalyst/components/prompt-tracker/detail/DetailBits'
import { Radar } from '@/features/catalyst/components/Radar'
import { BRAND, GREEN } from '@/features/catalyst/constants'
import type { EngineStats, PromptTotals } from '@/features/catalyst/prompt-detail-analytics'
import type { TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'
import { scoreColor } from '@/features/catalyst/visibility-data'

const FACTOR_AXES = ['Authority', 'Content', 'Structure', 'Semantic', '3rd party']

/** Headline score with its tick meter. */
function ScoreBlock({ item }: { item: TrackedPrompt }): JSX.Element {
  return (
    <div className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3.5">
      <div className="flex items-baseline gap-2">
        <span
          className="text-[26px] font-bold tracking-tight tabular-nums"
          style={{ color: scoreColor(item.score) }}
        >
          {item.score}
        </span>
        <span className="text-[12px] text-[var(--cat-ink-3)]">/100 prompt score</span>
      </div>
      <div className="mt-2.5">
        <TickBar value={item.score} ticks={32} showValue={false} />
      </div>
    </div>
  )
}

/**
 * The five weighted inputs behind the score. The backend recomputes these per
 * request; the radar takes 0-1 fractions, so each is divided by 100.
 */
function FactorRadar({ item }: { item: TrackedPrompt }): JSX.Element {
  const { factors } = item
  const vals = [
    factors.authority,
    factors.contentQuality,
    factors.structural,
    factors.semantic,
    factors.thirdParty,
  ]
  if (vals.every(v => v === 0)) {
    return (
      <p className="text-[12px] text-[var(--cat-ink-3)]">
        Factor breakdown appears after the first scored run.
      </p>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <Radar axes={FACTOR_AXES} series={[{ vals: vals.map(v => v / 100), color: BRAND }]} />
      <ul className="w-full space-y-2">
        {FACTOR_AXES.map((axis, index) => (
          <li key={axis}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-[var(--cat-ink-3)]">{axis}</span>
              <span className="text-[11px] font-semibold text-[var(--cat-ink)] tabular-nums">
                {vals[index]}
              </span>
            </div>
            <RateBar value={vals[index]} color={BRAND} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Compact per-engine status strip — the current standing at a glance. */
function EngineStrip({ engines }: { engines: EngineStats[] }): JSX.Element {
  return (
    <ul className="space-y-2.5">
      {engines.map(stats => (
        <li key={stats.engine} className="flex items-center gap-2.5">
          <EngineLogo name={stats.engineLabel} size={18} />
          <span className="w-20 shrink-0 truncate text-[12px] text-[var(--cat-ink-2)]">
            {stats.engineLabel}
          </span>
          <span className="flex-1">
            <RateBar value={stats.citationRate} color={stats.citationRate > 0 ? GREEN : BRAND} />
          </span>
          <span className="w-16 shrink-0 text-right text-[11px] text-[var(--cat-ink-3)] tabular-nums">
            {stats.citationRate}% cited
          </span>
        </li>
      ))}
    </ul>
  )
}

interface PromptOverviewTabProps {
  item: TrackedPrompt
  totals: PromptTotals
  engines: EngineStats[]
}

export function PromptOverviewTab({ item, totals, engines }: PromptOverviewTabProps): JSX.Element {
  return (
    <div className="space-y-4">
      <ScoreBlock item={item} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Visibility" value={`${totals.visibility}%`} hint="of engine answers" />
        <StatTile label="Runs" value={String(totals.runs)} />
        <StatTile label="Mentions" value={String(totals.mentions)} />
        <StatTile
          label="Avg position"
          value={totals.avgPosition === null ? '—' : `#${totals.avgPosition}`}
        />
      </div>
      <Panel title="Score factors">
        <FactorRadar item={item} />
      </Panel>
      {engines.length > 0 && (
        <Panel
          title="Engine standing"
          aside={
            <span className="text-[11px] text-[var(--cat-ink-3)] tabular-nums">
              {totals.citedRuns}/{totals.runs} runs cited you
            </span>
          }
        >
          <EngineStrip engines={engines} />
        </Panel>
      )}
    </div>
  )
}
