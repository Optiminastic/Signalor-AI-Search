'use client'

import { useQuery } from '@tanstack/react-query'

import { BLUE, BRAND, GREEN, PURPLE, YELLOW } from '@/features/catalyst/constants'
import { engineLabel } from '@/features/catalyst/engine-logos'
import type { StatCard } from '@/features/catalyst/tasks-data'
import { getCitations, getTopSources, type Citations, type TopSources } from '@/lib/api/analyzer'
import { getCitationTrend, type CitationTrendPoint } from '@/lib/api/insights'
import { Bot, Globe2, Link2, Quote, TrendingUp } from '@/lib/icons'

/**
 * One colour per engine the backend can report (PromptResult.Engine has nine).
 *
 * This was six colours capped at five series, so a brand measured across seven
 * engines had two dropped from the plot with no note - directly contradicting
 * the "Engines Tracked" stat card sitting beside the same chart. Which two
 * vanished was arbitrary too: the sort is by peak value, so engines tied on 0%
 * fell back to whatever order the API happened to return.
 */
const SERIES_COLORS = [
  BRAND,
  BLUE,
  PURPLE,
  YELLOW,
  GREEN,
  '#0EA5A4',
  '#EC4899',
  '#F97316',
  '#64748B',
]

export interface TrendSeries {
  key: string
  label: string
  color: string
  points: number[]
}

export interface InsightsData {
  stats: StatCard[]
  weeks: string[]
  series: TrendSeries[]
  engines: TopSources['sources']
  domains: Citations['domains']
}

function shortWeek(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Align the raw weekly points into one series per engine, strongest first. */
function buildSeries(points: CitationTrendPoint[]): { weeks: string[]; series: TrendSeries[] } {
  const weeks = [...new Set(points.map(p => p.week_start).filter((w): w is string => Boolean(w)))]
  weeks.sort()
  const engines = [...new Set(points.map(p => p.engine))]
  const series = engines.map(engine => ({
    key: engine,
    label: engineLabel(engine),
    color: '',
    points: weeks.map(
      w => points.find(p => p.engine === engine && p.week_start === w)?.rate_pct ?? 0,
    ),
  }))
  series.sort((a, b) => Math.max(0, ...b.points) - Math.max(0, ...a.points))
  // Bounded by the palette, not by an arbitrary cap, so every engine the run
  // actually measured is plotted and keeps a distinct colour.
  const top = series
    .slice(0, SERIES_COLORS.length)
    .map((s, i) => ({ ...s, color: SERIES_COLORS[i] }))
  return { weeks: weeks.map(shortWeek), series: top }
}

function buildStats(citations: Citations, sources: TopSources, series: TrendSeries[]): StatCard[] {
  const latest = series.map(s => s.points[s.points.length - 1] ?? 0)
  const avgRate = latest.length ? Math.round(latest.reduce((a, v) => a + v, 0) / latest.length) : 0
  return [
    { icon: Quote, color: BRAND, label: 'AI Citations', value: String(citations.total_citations) },
    {
      icon: TrendingUp,
      color: GREEN,
      label: 'Brand Citations',
      value: String(citations.brand_citations),
    },
    { icon: Link2, color: BLUE, label: 'Cited Domains', value: String(citations.domains.length) },
    { icon: Bot, color: YELLOW, label: 'Engines Tracked', value: String(sources.sources.length) },
    { icon: Globe2, color: GREEN, label: 'Avg Mention Rate', value: `${avgRate}%` },
  ]
}

interface UseInsightsResult {
  data: InsightsData | undefined
  isLoading: boolean
  isError: boolean
}

/** The 360-insights rollup: citations, per-engine trend and top sources. */
export function useInsights(slug: string | undefined): UseInsightsResult {
  const query = useQuery({
    queryKey: ['catalyst', 'insights', slug ?? ''],
    enabled: Boolean(slug),
    queryFn: async (): Promise<InsightsData> => {
      const [citations, sources, trend] = await Promise.all([
        getCitations(slug as string),
        getTopSources(slug as string),
        getCitationTrend(slug as string),
      ])
      const { weeks, series } = buildSeries(trend)
      return {
        stats: buildStats(citations, sources, series),
        weeks,
        series,
        engines: sources.sources,
        domains: citations.domains.slice(0, 8),
      }
    },
  })
  return { data: query.data, isLoading: query.isLoading, isError: query.isError }
}
