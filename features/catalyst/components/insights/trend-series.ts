import type { TrendSeries } from '@/hooks/useInsights'

// Shared shaping for the weekly citation trend, so the compact card above the
// prompt table and the full Trends view can never drift apart.

export type TrendState = 'loading' | 'error' | 'empty' | 'single' | 'ready'

export const TREND_NOTES: Record<Exclude<TrendState, 'ready'>, string> = {
  loading: 'Loading citation trend…',
  error: "Couldn't load the citation trend.",
  empty: 'No citation data yet - track prompts to start the trend.',
  single: 'Only one week measured so far. Re-run the analysis in a later week to start the line.',
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
  // One reading is a reading, not a trend. Two points are the fewest a line can
  // honestly join, so a single week states its value in the legend and says why
  // there is no line yet. PromptHistoryTab already draws this same distinction
  // for per-prompt runs ("Only one run so far").
  if (weekCount === 1) return 'single'
  return 'ready'
}

export interface TrendWindow {
  series: TrendSeries[]
  weeks: string[]
}

// `padForLine` used to live here: with one week on record it duplicated the
// single reading into a second, unlabelled point so a polyline would still
// draw. That invented the one thing the chart exists to report - a line held
// flat across a span nothing was measured over. A lone week now renders as the
// `single` note above instead.

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
