'use client'

import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { MultiLineChart } from '@/features/catalyst/components/insights/MultiLineChart'
import { EmptyNote, Panel } from '@/features/catalyst/components/prompt-tracker/detail/DetailBits'
import { BLUE, BRAND, GREEN, PURPLE, YELLOW } from '@/features/catalyst/constants'
import type { PromptRun } from '@/features/catalyst/prompt-detail-analytics'
import type { PromptEngineResult } from '@/features/catalyst/prompt-tracker-data'
import { formatTaskDate } from '@/features/catalyst/tasks-data'
import type { TrendSeries } from '@/hooks/useInsights'

/** Max runs plotted, newest last — keeps the x-axis readable. */
const MAX_POINTS = 12
/** Per-engine line colours; brand red is reserved for the overall line. */
const ENGINE_COLORS = [BLUE, PURPLE, YELLOW, GREEN, '#0EA5A4']

function formatShortDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Overall visibility per run, plus one line per engine's mention rate. */
function buildSeries(runs: PromptRun[]): TrendSeries[] {
  const overall: TrendSeries = {
    key: 'overall',
    label: 'All engines',
    color: BRAND,
    points: runs.map(run => run.visibility),
  }
  const engines = [...new Set(runs.flatMap(run => run.results.map(r => r.engineLabel)))]
  const perEngine = engines.slice(0, ENGINE_COLORS.length).map((label, index) => ({
    key: label,
    label,
    color: ENGINE_COLORS[index],
    points: runs.map(run => {
      const result = run.results.find(r => r.engineLabel === label)
      if (!result) return 0
      return result.mentioned ? 100 : 0
    }),
  }))
  return [overall, ...perEngine]
}

/** How one engine answered in a run: cited > mentioned > absent. */
function EngineOutcome({ result }: { result: PromptEngineResult }): JSX.Element {
  const outcome = outcomeOf(result)
  return (
    <span
      title={`${result.engineLabel}: ${outcome.label}`}
      className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: outcome.background, color: outcome.color, opacity: outcome.opacity }}
    >
      <EngineLogo name={result.engineLabel} size={14} />
      {outcome.label}
    </span>
  )
}

interface Outcome {
  label: string
  background: string
  color: string
  opacity: number
}

function outcomeOf(result: PromptEngineResult): Outcome {
  if (result.brandCited) {
    return { label: 'cited', background: 'rgba(47,190,126,0.12)', color: '#1e8a5c', opacity: 1 }
  }
  if (result.mentioned) {
    return {
      label: 'mentioned',
      background: 'var(--cat-hover)',
      color: 'var(--cat-ink-3)',
      opacity: 1,
    }
  }
  return { label: 'absent', background: 'transparent', color: 'var(--cat-ink-3)', opacity: 0.55 }
}

function RunCard({ run, index }: { run: PromptRun; index: number }): JSX.Element {
  return (
    <li className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold text-[var(--cat-ink)]">Run {index}</span>
        <span className="text-[11px] text-[var(--cat-ink-3)]">{formatTaskDate(run.at)}</span>
        <span
          className="ml-auto text-[12px] font-semibold tabular-nums"
          style={{ color: run.visibility > 0 ? BRAND : 'var(--cat-ink-3)' }}
        >
          {run.visibility}% vis
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {run.results.map(result => (
          <EngineOutcome key={result.id} result={result} />
        ))}
      </div>
    </li>
  )
}

/** The trend chart, or an explainer while there is only one data point. */
function TrendPanel({ runs }: { runs: PromptRun[] }): JSX.Element {
  const plotted = runs.slice(-MAX_POINTS)
  return (
    <Panel
      title="Visibility per run"
      aside={
        <span className="text-[11px] text-[var(--cat-ink-3)]">
          {plotted.length} of {runs.length} runs
        </span>
      }
    >
      {runs.length === 1 ? (
        <p className="text-[12px] text-[var(--cat-ink-3)]">
          Only one run so far. Recheck the prompt to start a trend line.
        </p>
      ) : (
        <MultiLineChart
          series={buildSeries(plotted)}
          xLabels={plotted.map(run => formatShortDate(run.at))}
          height={160}
        />
      )}
    </Panel>
  )
}

/** Visibility across every recheck, derived from the append-only results feed. */
export function PromptHistoryTab({ runs }: { runs: PromptRun[] }): JSX.Element {
  if (runs.length === 0) {
    return <EmptyNote>No runs recorded in this date range.</EmptyNote>
  }
  const newestFirst = [...runs].reverse()
  return (
    <div className="space-y-4">
      <TrendPanel runs={runs} />
      <div>
        <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
          Run history
        </h3>
        <ul className="space-y-2">
          {newestFirst.map((run, index) => (
            <RunCard key={run.at || index} run={run} index={runs.length - index} />
          ))}
        </ul>
      </div>
    </div>
  )
}
