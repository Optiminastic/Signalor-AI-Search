'use client'

import { useQuery } from '@tanstack/react-query'

import { BLUE, BRAND, BRAND_STRONG, GREEN, PURPLE, YELLOW } from '@/features/catalyst/constants'
import { engineLabel } from '@/features/catalyst/engine-logos'
import type { PromptEngineResult, TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'
import type { StatCard } from '@/features/catalyst/tasks-data'
import { getPrompts, type PromptResult, type PromptTrack } from '@/lib/api/prompts'
import { Crosshair, Eye, Gauge, MessageSquareText, Quote, Zap } from '@/lib/icons'
import { queryKeys } from '@/lib/query-keys'

const PENDING_REFETCH_MS = 15000

function toEngineResult(result: PromptResult): PromptEngineResult {
  const citations = (result.citations ?? []).map(c => ({
    url: c.url,
    domain: c.domain,
    isBrand: c.is_brand,
    isCompetitor: c.is_competitor,
    title: c.title ?? '',
    snippet: c.snippet ?? '',
    position: c.position ?? 0,
  }))
  return {
    id: result.id,
    engine: result.engine,
    engineLabel: engineLabel(result.engine),
    mentioned: result.brand_mentioned ?? false,
    sentiment: result.sentiment ?? '',
    position: result.rank_position ?? null,
    snippet: result.response_text ?? '',
    checkedAt: result.checked_at ?? '',
    confidence: result.confidence ?? null,
    citations,
    brandCited: citations.some(c => c.isBrand),
  }
}

function toTracked(prompt: PromptTrack): TrackedPrompt {
  const results = prompt.results.map(toEngineResult)
  return {
    id: prompt.id,
    prompt: prompt.prompt_text,
    isCustom: prompt.is_custom,
    intent: prompt.intent ?? '',
    promptType: prompt.prompt_type ?? '',
    score: Math.round(prompt.score ?? 0),
    visibility: Math.round(prompt.visibility_pct ?? 0),
    avgPosition: prompt.avg_position ?? null,
    // "Cited" = the brand's own domain was cited as a source by some engine — the
    // real citation signal. NOT `mentions > 0` (any name-drop), which flagged
    // nearly every prompt as cited.
    cited: results.some(r => r.brandCited),
    mentions: prompt.mentions ?? 0,
    runs: prompt.total_runs ?? 0,
    sentiment: prompt.sentiment_label ?? '',
    createdAt: prompt.created_at ?? '',
    factors: {
      authority: Math.round(prompt.factor_authority ?? 0),
      contentQuality: Math.round(prompt.factor_content_quality ?? 0),
      structural: Math.round(prompt.factor_structural ?? 0),
      semantic: Math.round(prompt.factor_semantic ?? 0),
      thirdParty: Math.round(prompt.factor_third_party ?? 0),
    },
    results,
  }
}

/**
 * Header stat cards for a set of tracked prompts. Pure over its input so it can
 * be recomputed client-side against a date-filtered subset.
 */
export function buildPromptStats(prompts: TrackedPrompt[]): StatCard[] {
  const count = prompts.length || 1
  const avgScore = Math.round(prompts.reduce((a, p) => a + p.score, 0) / count)
  const avgVis = Math.round(prompts.reduce((a, p) => a + p.visibility, 0) / count)
  const strong = prompts.filter(p => p.score >= 70).length
  const cited = prompts.filter(p => p.cited).length
  const totalRuns = prompts.reduce((a, p) => a + p.runs, 0)
  const positioned = prompts.filter(p => p.avgPosition !== null)
  const avgPos = positioned.length
    ? (positioned.reduce((a, p) => a + (p.avgPosition ?? 0), 0) / positioned.length).toFixed(1)
    : '—'
  return [
    { icon: Gauge, color: BRAND, label: 'Avg Score', value: String(avgScore) },
    { icon: Eye, color: BLUE, label: 'Visibility', value: `${avgVis}%` },
    { icon: Zap, color: GREEN, label: 'Strong Prompts', value: `${strong} / ${prompts.length}` },
    { icon: Quote, color: PURPLE, label: 'Cited', value: `${cited} / ${prompts.length}` },
    { icon: Crosshair, color: YELLOW, label: 'Avg Position', value: avgPos },
    { icon: MessageSquareText, color: BRAND_STRONG, label: 'Total Runs', value: String(totalRuns) },
  ]
}

export interface PromptTrackerData {
  prompts: TrackedPrompt[]
  stats: StatCard[]
  /** True while any prompt is still waiting for its first engine answers. */
  hasPending: boolean
  /** True once the user has tracked a prompt of their own (onboarding). */
  hasCustomPrompt: boolean
}

interface UsePromptsResult {
  data: PromptTrackerData | undefined
  isLoading: boolean
  isError: boolean
}

/**
 * Tracked prompts for a run slug, plus the header stat cards. While any prompt
 * has no engine answers yet (just added or rechecking), the list re-polls every
 * 15s so results stream in without a manual refresh.
 */
export function usePrompts(slug: string | undefined): UsePromptsResult {
  const query = useQuery({
    queryKey: queryKeys.catalyst.prompts(slug ?? ''),
    enabled: Boolean(slug),
    queryFn: async (): Promise<PromptTrackerData> => {
      const prompts = (await getPrompts(slug as string)).map(toTracked)
      return {
        prompts,
        stats: buildPromptStats(prompts),
        hasPending: prompts.some(p => p.results.length === 0),
        hasCustomPrompt: prompts.some(p => p.isCustom),
      }
    },
    refetchInterval: q =>
      (q.state.data as PromptTrackerData | undefined)?.hasPending ? PENDING_REFETCH_MS : false,
  })
  return { data: query.data, isLoading: query.isLoading, isError: query.isError }
}
