'use client'

import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { BarMeter } from '@/features/catalyst/components/visibility/BarMeter'
import { BLUE, BRAND } from '@/features/catalyst/constants'
import type { TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'

interface EngineCoverage {
  engine: string
  label: string
  pct: number
}

/** Brand-mention rate per engine across the given prompts (0–100), highest first. */
function engineCoverage(prompts: TrackedPrompt[]): EngineCoverage[] {
  const map = new Map<string, { label: string; hit: number; total: number }>()
  for (const p of prompts) {
    for (const r of p.results) {
      const e = map.get(r.engine) ?? { label: r.engineLabel, hit: 0, total: 0 }
      e.total += 1
      if (r.mentioned) e.hit += 1
      map.set(r.engine, e)
    }
  }
  return [...map.entries()]
    .map(([engine, v]) => ({
      engine,
      label: v.label,
      pct: v.total ? Math.round((v.hit / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-4">
      <h3 className="mb-3 text-[13px] font-semibold text-[var(--cat-ink)]">{title}</h3>
      {children}
    </div>
  )
}

function ChartValue({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <span className="w-9 shrink-0 text-right text-[12px] font-semibold text-[var(--cat-ink)] tabular-nums">
      {children}
    </span>
  )
}

function EmptyRow(): JSX.Element {
  return <p className="py-4 text-center text-[12px] text-[var(--cat-ink-3)]">No data in range.</p>
}

function EngineCoverageChart({ prompts }: { prompts: TrackedPrompt[] }): JSX.Element {
  const rows = engineCoverage(prompts)
  return (
    <ChartCard title="Visibility by engine">
      {rows.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="space-y-2.5">
          {rows.map(r => (
            <div key={r.engine} className="flex items-center gap-3">
              <span className="flex w-28 shrink-0 items-center gap-2 text-[12px] text-[var(--cat-ink-2)]">
                <EngineLogo name={r.label} size={16} />
                <span className="truncate">{r.label}</span>
              </span>
              <div className="min-w-0 flex-1">
                <BarMeter value={r.pct} color={BLUE} />
              </div>
              <ChartValue>{r.pct}%</ChartValue>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  )
}

function TopPromptsChart({ prompts }: { prompts: TrackedPrompt[] }): JSX.Element {
  const rows = [...prompts].sort((a, b) => b.visibility - a.visibility).slice(0, 5)
  return (
    <ChartCard title="Top prompts by visibility">
      {rows.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="space-y-2.5">
          {rows.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <span
                className="w-40 shrink-0 truncate text-[12px] text-[var(--cat-ink-2)]"
                title={p.prompt}
              >
                {p.prompt}
              </span>
              <div className="min-w-0 flex-1">
                <BarMeter value={p.visibility} color={BRAND} />
              </div>
              <ChartValue>{p.visibility}%</ChartValue>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  )
}

/** Two at-a-glance charts for the filtered prompt set. */
export function PromptInsights({ prompts }: { prompts: TrackedPrompt[] }): JSX.Element {
  return (
    <div className="cat-rise mb-3 grid gap-2 md:grid-cols-2">
      <EngineCoverageChart prompts={prompts} />
      <TopPromptsChart prompts={prompts} />
    </div>
  )
}
