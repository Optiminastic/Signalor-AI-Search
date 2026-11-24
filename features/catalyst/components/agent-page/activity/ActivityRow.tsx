'use client'

import type { LucideIcon } from 'lucide-react'

import type { ActivityLine } from '@/features/catalyst/agent-activity-log'
import {
  TARGET_LABELS,
  timeLabel,
  type TimelineRow,
} from '@/features/catalyst/agent-activity-timeline'
import { formatWhen } from '@/features/catalyst/agent-approvals'
import { useAgentUi } from '@/features/catalyst/components/agent-page/AgentUiContext'
import { NEG, YELLOW } from '@/features/catalyst/constants'
import {
  Bot,
  ChevronRight,
  FileText,
  Globe,
  Mail,
  MessageSquareText,
  PenLine,
  Search,
} from '@/lib/icons'

interface ActivityRowProps {
  row: TimelineRow
}

/** One icon per log category (matches ranking-be `services/activity.py`). */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  articles: FileText,
  guest: PenLine,
  keywords: Search,
  social: MessageSquareText,
  site: Globe,
  outreach: Mail,
}

/** Status hue only for lines that need the owner; everything else stays neutral. */
const TONE_HUE: Partial<Record<ActivityLine['tone'], string>> = { attention: YELLOW, danger: NEG }

const TONE_LABEL: Partial<Record<ActivityLine['tone'], string>> = {
  attention: 'Needs your attention: ',
  danger: 'Problem: ',
}

function RowIcon({ row }: ActivityRowProps): JSX.Element {
  const Icon = CATEGORY_ICONS[row.entry.category] ?? Bot
  const hue = TONE_HUE[row.line.tone]
  return (
    <span
      className="relative z-[1] grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--cat-hover)] text-[var(--cat-ink-2)]"
      style={
        hue
          ? { background: `color-mix(in srgb, ${hue} 18%, var(--cat-card))`, color: hue }
          : undefined
      }
      aria-hidden="true"
    >
      <Icon size={14} strokeWidth={2} />
    </span>
  )
}

function RowTime({ row }: ActivityRowProps): JSX.Element {
  const at = row.entry.createdAt
  const span = row.count > 1 ? `${formatWhen(row.firstAt)} to ${formatWhen(at)}` : formatWhen(at)
  return (
    <time
      dateTime={at}
      title={span}
      className="shrink-0 pt-px text-[11.5px] text-[var(--cat-ink-3)] tabular-nums"
    >
      {timeLabel(at)}
    </time>
  )
}

function OpenTab({ row }: ActivityRowProps): JSX.Element | null {
  const { setTab } = useAgentUi()
  if (!row.target) return null
  const target = row.target
  return (
    <button
      type="button"
      onClick={() => setTab(target)}
      className="text-primary-ink mt-1 inline-flex items-center gap-0.5 rounded-sm text-[12px] font-medium hover:underline focus-visible:ring-2 focus-visible:ring-[#e04a3d] focus-visible:outline-none"
    >
      Open {TARGET_LABELS[target]}
      <ChevronRight size={13} strokeWidth={2.2} aria-hidden="true" />
    </button>
  )
}

/** A log line on the day's rail: what happened, when, and where to follow it up. */
export function ActivityRow({ row }: ActivityRowProps): JSX.Element {
  const { line } = row
  return (
    <li className="flex gap-3 py-2">
      <RowIcon row={row} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-[13px] leading-5 font-medium text-[var(--cat-ink)]">
            {TONE_LABEL[line.tone] && <span className="sr-only">{TONE_LABEL[line.tone]}</span>}
            {line.title}
            {row.count > 1 && (
              <span
                className="ml-1.5 rounded-sm border border-[var(--cat-border)] px-1 align-[1px] text-[10.5px] font-semibold text-[var(--cat-ink-3)] tabular-nums"
                aria-label={`${row.count} times`}
              >
                ×{row.count}
              </span>
            )}
          </p>
          <RowTime row={row} />
        </div>
        {line.detail && (
          <p className="mt-0.5 max-w-[68ch] text-[12.5px] leading-[18px] break-words text-[var(--cat-ink-2)]">
            {line.detail}
          </p>
        )}
        <OpenTab row={row} />
      </div>
    </li>
  )
}
