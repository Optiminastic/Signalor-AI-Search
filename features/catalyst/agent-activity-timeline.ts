import { describeActivity, type ActivityLine } from '@/features/catalyst/agent-activity-log'
import { HIDDEN_TABS, type BoardTab } from '@/features/catalyst/components/agent-page/BoardTabs'
import type { ActivityEntry } from '@/lib/api/agent-mode-activity'

/**
 * Shapes the agent's flat log into what the Activity tab shows: one group per
 * day, back-to-back repeats folded into one row, and a board tab to open when
 * the line is about something that lives on another tab.
 */

export interface TimelineRow {
  key: string
  entry: ActivityEntry
  line: ActivityLine
  /** How many identical entries in a row this one stands for (1 = no repeats). */
  count: number
  /** When the oldest of the folded repeats happened. */
  firstAt: string
  target: BoardTab | null
}

export interface TimelineDay {
  key: string
  label: string
  rows: TimelineRow[]
}

/** Where to go for the thing a log line is about. */
const TARGETS: Record<string, BoardTab> = {
  prepared: 'approvals',
  drafted_with_concerns: 'approvals',
  contact_not_found: 'approvals',
  outcome_unknown: 'approvals',
  satellite_topics_planned: 'approvals',
  guest_sites_found: 'guest',
  keywords_refreshed: 'keywords',
  golden_keywords_found: 'keywords',
  keyword_rank_changes: 'keywords',
  social_checked: 'social',
  indexing_checked: 'indexing',
  bing_submitted: 'indexing',
  bing_send_blocked: 'indexing',
  rank_check_done: 'tracking',
}

/** The tab to open for a line, or null when there's none or it's off the board (HIDDEN_TABS). */
export function targetFor(action: string): BoardTab | null {
  const target = TARGETS[action]
  return target && !HIDDEN_TABS.has(target) ? target : null
}

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

/** "Today", "Yesterday", or a short date (with the year only when it isn't this year). */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Earlier'
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (localDayKey(date) === localDayKey(now)) return 'Today'
  if (localDayKey(date) === localDayKey(yesterday)) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(date)
}

/** Time of day only; the day is the group heading. */
export function timeLabel(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date)
}

function sameLine(a: TimelineRow, entry: ActivityEntry, line: ActivityLine): boolean {
  return (
    a.entry.action === entry.action &&
    a.line.title === line.title &&
    a.line.detail === line.detail &&
    a.line.tone === line.tone
  )
}

function appendRow(day: TimelineDay, entry: ActivityEntry): void {
  const line = describeActivity(entry)
  const last = day.rows[day.rows.length - 1]
  if (last && sameLine(last, entry, line)) {
    last.count += 1
    last.firstAt = entry.createdAt
    return
  }
  day.rows.push({
    key: String(entry.id),
    entry,
    line,
    count: 1,
    firstAt: entry.createdAt,
    target: targetFor(entry.action),
  })
}

/** Newest-first entries into day groups, folding back-to-back repeats within a day. */
export function buildTimeline(entries: ActivityEntry[], now: Date = new Date()): TimelineDay[] {
  const days: TimelineDay[] = []
  for (const entry of entries) {
    const date = new Date(entry.createdAt)
    const key = Number.isNaN(date.getTime()) ? 'unknown' : localDayKey(date)
    let day = days[days.length - 1]
    if (!day || day.key !== key) {
      day = { key, label: dayLabel(entry.createdAt, now), rows: [] }
      days.push(day)
    }
    appendRow(day, entry)
  }
  return days
}
