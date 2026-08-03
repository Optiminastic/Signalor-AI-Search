import type { TrendSeries } from '@/hooks/useInsights'

// Shared shaping for the weekly citation trend, so the compact card above the
// prompt table and the full Trends view can never drift apart.

export type TrendState = 'loading' | 'error' | 'empty' | 'ready'

export const TREND_NOTES: Record<Exclude<TrendState, 'ready'>, string> = {
  loading: 'Loading citation trend…',
  error: "Couldn't load the citation trend.",
  empty: 'No citation data yet — track prompts to start the trend.',
}

export function trendState(
  flags: { isLoading: boolean; isError: boolean },
  seriesCount: number,
  weekCount: number,
): TrendState {
  if (flags.isLoading) return 'loading'
  if (flags.isError) return 'error'
  // A week with zero mentions is real data: the chart draws it flat on the 0
  // baseline rather than hiding behind a "needs more data" note.
  if (seriesCount === 0 || weekCount === 0) return 'empty'
  return 'ready'
}

export interface TrendWindow {
  series: TrendSeries[]
  weeks: string[]
}

/** A lone data point can't form a polyline — mirror it so the line still draws. */
export function padForLine({ series, weeks }: TrendWindow): TrendWindow {
  if (weeks.length !== 1) return { series, weeks }
  return {
    weeks: [weeks[0], ''],
    series: series.map(s => ({ ...s, points: [s.points[0] ?? 0, s.points[0] ?? 0] })),
  }
}

/**
 * Keep only the most recent `count` weeks. The trend endpoint takes no range
 * params, so the window is applied client-side over the full history.
 */
export function sliceRecent({ series, weeks }: TrendWindow, count: number): TrendWindow {
  if (count <= 0 || weeks.length <= count) return { series, weeks }
  return {
    weeks: weeks.slice(-count),
    series: series.map(s => ({ ...s, points: s.points.slice(-count) })),
  }
}

/** Latest value for a series, 0 when it has no points. */
export function latestOf(series: TrendSeries): number {
  return series.points[series.points.length - 1] ?? 0
}
