'use client'

import { useQuery } from '@tanstack/react-query'

import type { DashStatData } from '@/features/catalyst/components/dash/DashStat'
import type { Priority, Recommendation } from '@/features/catalyst/recommendations-data'
import { getRunDetail, type Recommendation as ApiRecommendation } from '@/lib/api/analyzer'
import { queryKeys } from '@/lib/query-keys'

const PILLAR_LABELS: Record<string, string> = {
  content: 'Content',
  schema: 'Schema',
  eeat: 'E-E-A-T',
  technical: 'Technical',
  entity: 'Entity',
  ai_visibility: 'AI Visibility',
}

function pillarLabel(pillar: string): string {
  return PILLAR_LABELS[pillar] ?? (pillar ? pillar.charAt(0).toUpperCase() + pillar.slice(1) : '—')
}

function priorityLabel(priority: string): Priority {
  const p = priority.toLowerCase()
  if (p === 'high' || p === 'critical') return 'High'
  if (p === 'low') return 'Low'
  return 'Medium'
}

function effortOf(rec: ApiRecommendation): string {
  if (rec.estimated_minutes && rec.estimated_minutes > 0) {
    const m = rec.estimated_minutes
    return m >= 60 ? `${Math.round(m / 60)} h` : `${m} min`
  }
  return rec.difficulty ? rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1) : '—'
}

function toRec(rec: ApiRecommendation): Recommendation {
  return {
    id: rec.id,
    title: rec.title,
    pillar: pillarLabel(rec.pillar),
    priority: priorityLabel(rec.priority),
    effort: effortOf(rec),
    // Per-run completion tracking isn't modelled yet — everything starts open.
    status: 'open',
    auto: rec.can_auto_fix || rec.code_fixable,
    findingCode: rec.finding_code,
  }
}

function buildStats(recs: Recommendation[]): DashStatData[] {
  const open = recs.filter(r => r.status !== 'done').length
  const highPriority = recs.filter(r => r.priority === 'High').length
  const auto = recs.filter(r => r.auto).length
  const done = recs.filter(r => r.status === 'done').length
  return [
    { label: 'Open fixes', value: String(open) },
    { label: 'High priority', value: String(highPriority) },
    { label: 'Auto-fixable', value: String(auto) },
    { label: 'Completed', value: `${done} / ${recs.length}` },
  ]
}

export interface RecommendationsData {
  recommendations: Recommendation[]
  stats: DashStatData[]
}

interface UseRecommendationsResult {
  data: RecommendationsData | undefined
  isLoading: boolean
  isError: boolean
}

/** Fetches a run's recommendations and derives the header stat row. */
export function useRecommendations(slug: string | undefined): UseRecommendationsResult {
  const query = useQuery({
    queryKey: queryKeys.catalyst.recommendations(slug ?? ''),
    enabled: Boolean(slug),
    queryFn: async (): Promise<RecommendationsData> => {
      const detail = await getRunDetail(slug as string)
      const recommendations = detail.recommendations.map(toRec)
      return { recommendations, stats: buildStats(recommendations) }
    },
  })
  return { data: query.data, isLoading: query.isLoading, isError: query.isError }
}
