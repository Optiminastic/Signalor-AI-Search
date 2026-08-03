'use client'

import { useMemo, useState } from 'react'

import { PromptCitationsTab } from '@/features/catalyst/components/prompt-tracker/detail/PromptCitationsTab'
import {
  PromptDetailTabs,
  type PromptDetailTab,
} from '@/features/catalyst/components/prompt-tracker/detail/PromptDetailTabs'
import { PromptHistoryTab } from '@/features/catalyst/components/prompt-tracker/detail/PromptHistoryTab'
import { PromptModelsTab } from '@/features/catalyst/components/prompt-tracker/detail/PromptModelsTab'
import { PromptOverviewTab } from '@/features/catalyst/components/prompt-tracker/detail/PromptOverviewTab'
import { CitedChip, PromptTag } from '@/features/catalyst/components/prompt-tracker/PromptChips'
import {
  ALL_DATES,
  matchesDateFilter,
  PromptDateFilter,
  type DateFilter,
} from '@/features/catalyst/components/prompt-tracker/PromptDateFilter'
import { PromptResultsPanel } from '@/features/catalyst/components/prompt-tracker/PromptResultsPanel'
import { AnswerBlockPanel } from '@/features/catalyst/components/prompts/AnswerBlockPanel'
import { SideSheet } from '@/features/catalyst/components/SideSheet'
import {
  buildCitationGroups,
  buildEngineStats,
  buildRuns,
  buildTotals,
  filterResults,
  type CitationGroup,
  type EngineStats,
  type PromptRun,
  type PromptTotals,
} from '@/features/catalyst/prompt-detail-analytics'
import type { PromptEngineResult, TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'

export interface PromptDetailSheetProps {
  item: TrackedPrompt
  slug: string
  onClose: () => void
}

/** Prompt text + its taxonomy chips — the pinned header of the sheet. */
function SheetHeader({ item }: { item: TrackedPrompt }): JSX.Element {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Tracked prompt
      </p>
      <h2 className="mt-1.5 text-[15px] leading-snug font-semibold text-[var(--cat-ink)]">
        {item.prompt}
      </h2>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <CitedChip cited={item.cited} />
        {item.intent && <PromptTag value={item.intent} />}
        {item.promptType && <PromptTag value={item.promptType} />}
        {item.isCustom && <PromptTag value="custom" />}
      </div>
    </div>
  )
}

interface DetailAnalytics {
  results: PromptEngineResult[]
  runs: PromptRun[]
  engines: EngineStats[]
  citations: CitationGroup[]
  totals: PromptTotals
}

/**
 * Everything the sheet charts, derived from the prompt's append-only `results[]`
 * and recomputed whenever the date filter changes.
 */
function useDetailAnalytics(item: TrackedPrompt, filter: DateFilter): DetailAnalytics {
  return useMemo(() => {
    const results = filterResults(item, ts => matchesDateFilter(ts, filter))
    const runs = buildRuns(results)
    return {
      results,
      runs,
      engines: buildEngineStats(results),
      citations: buildCitationGroups(results),
      totals: buildTotals(runs, results),
    }
  }, [item, filter])
}

/** The latest answers plus the drafting tool — the original expanded view. */
function AnswersTab({ item, slug }: { item: TrackedPrompt; slug: string }): JSX.Element {
  return (
    <div className="space-y-4">
      {/* The panel pads itself for the row layout; cancel that here. */}
      <div className="-mx-4 -mb-3.5">
        <PromptResultsPanel results={item.results} slug={slug} trackId={item.id} />
      </div>
      {/* Drafting is a billed call, so it only runs when the user asks. */}
      <AnswerBlockPanel slug={slug} trackId={item.id} promptText={item.prompt} />
    </div>
  )
}

export function PromptDetailSheet({ item, slug, onClose }: PromptDetailSheetProps): JSX.Element {
  const [tab, setTab] = useState<PromptDetailTab>('overview')
  const [filter, setFilter] = useState<DateFilter>(ALL_DATES)
  const { results, runs, engines, citations, totals } = useDetailAnalytics(item, filter)
  const citationCount = citations.reduce((sum, group) => sum + group.entries.length, 0)

  return (
    <SideSheet label="Prompt details" header={<SheetHeader item={item} />} onClose={onClose}>
      <PromptDetailTabs
        active={tab}
        counts={{ models: engines.length, history: runs.length, citations: citationCount }}
        onChange={setTab}
      />
      {/* The API has no per-prompt date params, so filtering is client-side over
          the results already on the wire. */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--cat-border)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--cat-ink-3)] tabular-nums">
          {results.length} engine {results.length === 1 ? 'answer' : 'answers'} · {runs.length}{' '}
          {runs.length === 1 ? 'run' : 'runs'}
        </span>
        <PromptDateFilter filter={filter} onChange={setFilter} />
      </div>
      <div className="p-4">
        {tab === 'overview' && <PromptOverviewTab item={item} totals={totals} engines={engines} />}
        {tab === 'models' && <PromptModelsTab engines={engines} />}
        {tab === 'history' && <PromptHistoryTab runs={runs} />}
        {tab === 'citations' && <PromptCitationsTab groups={citations} />}
        {tab === 'answers' && <AnswersTab item={item} slug={slug} />}
      </div>
    </SideSheet>
  )
}
