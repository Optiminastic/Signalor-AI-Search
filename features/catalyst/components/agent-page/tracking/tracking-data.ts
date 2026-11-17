import { BLUE, BRAND, PURPLE, YELLOW } from '@/features/catalyst/constants'
import type { TrendSeries } from '@/hooks/useInsights'
import type { RankTracking, TrackingPlayer } from '@/lib/api/agent-mode-rank-tracking'

/** The three views in the tracking panel. */
export type TrackingTab = 'seo' | 'geo' | 'brand'

/** Brand in brand red; competitors in the dashboard's other series colours. */
const RIVAL_COLORS = [BLUE, YELLOW, PURPLE]

export function colorOf(player: TrackingPlayer, index: number): string {
  if (player.isBrand) return BRAND
  return RIVAL_COLORS[(index - 1) % RIVAL_COLORS.length] ?? BLUE
}

export function weekLabel(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}

/** One line per player, 0-100: share of keywords in Google's top 10 (SEO), share of AI answers (GEO), share of all mentions on the internet (Brand). */
export function seriesFor(tab: TrackingTab, report: RankTracking): TrendSeries[] {
  return report.players.map((player, index) => ({
    key: player.domain,
    label: player.name,
    color: colorOf(player, index),
    points: pointsFor(tab, report, player),
  }))
}

function pointsFor(tab: TrackingTab, report: RankTracking, player: TrackingPlayer): number[] {
  if (tab === 'geo') {
    return report.geo.map(week =>
      Math.round(player.isBrand ? week.brand : (week.rivals[player.name] ?? 0)),
    )
  }
  if (tab === 'seo') {
    return report.seo.weeks.map(week =>
      percent(week.domains[player.domain]?.top10 ?? 0, week.keywords),
    )
  }
  return report.brand.weeks.map(week =>
    percent(week.domains[player.domain]?.mentions ?? 0, week.total),
  )
}

export function weeksFor(tab: TrackingTab, report: RankTracking): string[] {
  const weeks = tab === 'geo' ? report.geo.map(w => w.week) : report[tab].weeks.map(w => w.week)
  return weeks.map(weekLabel)
}

/** Latest and previous value per player for the summary row under the chart. */
export function latestFor(
  tab: TrackingTab,
  report: RankTracking,
): { player: TrackingPlayer; now: number; change: number | null }[] {
  return seriesFor(tab, report).map((series, index) => {
    const points = series.points
    const now = points[points.length - 1] ?? 0
    const before = points.length > 1 ? points[points.length - 2] : undefined
    return {
      player: report.players[index],
      now,
      change: before === undefined ? null : now - before,
    }
  })
}

/** "Better" for a Google position means a smaller number; "100+" when not in the top 100. */
export function positionText(position: number | null): string {
  return position ? `#${position}` : '100+'
}

export function positionMove(
  now: number | null,
  before: number | null,
): 'up' | 'down' | 'same' | null {
  if (before === null || before === undefined) return null
  const a = now ?? 101
  const b = before ?? 101
  if (a === b) return 'same'
  return a < b ? 'up' : 'down'
}
