'use client'

import 'react-day-picker/style.css'

import { endOfDay, format, isAfter, isWithinInterval, startOfDay, subDays } from 'date-fns'
import { type CSSProperties, type RefObject, useEffect, useRef, useState } from 'react'
import { DayPicker, getDefaultClassNames, type DateRange } from 'react-day-picker'

import { CONTROL_CHIP, CONTROL_RING } from '@/features/catalyst/components/control-styles'
import { CalendarDays, Check, ChevronDown } from '@/lib/icons'

/** How the prompt list is filtered by check date. */
export type DateFilter =
  | { mode: 'all' }
  | { mode: 'since'; days: number }
  | { mode: 'range'; from: Date; to: Date }

export const ALL_DATES: DateFilter = { mode: 'all' }

/**
 * Rolling windows answer essentially every real question here ("what changed
 * this week?"). They previously sat behind a mode switcher plus a full calendar,
 * which made the common case three interactions and the panel wider than the
 * table it filtered. Presets are one click; the calendar is opt-in.
 */
const PRESETS: readonly number[] = [7, 30, 90]

// react-day-picker theming → brand red accent, compact sizing, no default blue.
const CALENDAR_STYLE = {
  '--rdp-accent-color': '#e04a3d',
  '--rdp-accent-background-color': 'rgba(224,74,61,0.12)',
  '--rdp-today-color': '#e04a3d',
  '--rdp-range_middle-background-color': 'rgba(224,74,61,0.12)',
  '--rdp-range_start-color': '#fff',
  '--rdp-range_end-color': '#fff',
  // Was 2.15rem — oversized next to every other control on the page.
  '--rdp-day-width': '1.85rem',
  '--rdp-day-height': '1.85rem',
  '--rdp-day_button-width': '1.85rem',
  '--rdp-day_button-height': '1.85rem',
  '--rdp-day_button-border-radius': '6px',
  '--rdp-weekday-opacity': '1',
} as CSSProperties

// Merge house-style Tailwind over the library defaults so layout stays intact.
const defaults = getDefaultClassNames()
const CALENDAR_CLASSNAMES = {
  month_caption: `${defaults.month_caption} h-7`,
  caption_label: `${defaults.caption_label} text-[12px] font-semibold text-[var(--cat-ink)]`,
  button_previous: `${defaults.button_previous} inline-grid h-6 w-6 place-items-center rounded-md text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]`,
  button_next: `${defaults.button_next} inline-grid h-6 w-6 place-items-center rounded-md text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]`,
  chevron: `${defaults.chevron} !fill-[var(--cat-ink-2)]`,
  weekday: `${defaults.weekday} text-[10px] font-medium text-[var(--cat-ink-3)]`,
  day: `${defaults.day} text-[11px] text-[var(--cat-ink-2)]`,
  outside: `${defaults.outside} text-[var(--cat-ink-3)] opacity-50`,
}

// Matches the dropdown convention in OverviewActions rather than introducing a
// second popover style.
const PANEL = `absolute right-0 z-50 mt-1.5 rounded-md bg-[var(--cat-card)] p-1 shadow-lg ${CONTROL_RING}`
const ROW =
  'flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-[13px] text-[var(--cat-ink)] transition-colors hover:bg-[var(--cat-hover)]'

export function dateFilterLabel(filter: DateFilter): string {
  if (filter.mode === 'since') return `Last ${filter.days} days`
  if (filter.mode === 'range') {
    return `${format(filter.from, 'MMM d')} – ${format(filter.to, 'MMM d')}`
  }
  return 'All time'
}

/** Whether a check timestamp (ms) passes the filter. Callers decide how to treat
 *  not-yet-checked prompts (ts = 0). */
export function matchesDateFilter(ts: number, filter: DateFilter): boolean {
  if (filter.mode === 'all') return true
  const d = new Date(ts)
  if (filter.mode === 'since') return isAfter(d, startOfDay(subDays(new Date(), filter.days)))
  return isWithinInterval(d, { start: startOfDay(filter.from), end: endOfDay(filter.to) })
}

const OPTIONS: DateFilter[] = [
  ALL_DATES,
  ...PRESETS.map(days => ({ mode: 'since', days }) as const),
]

function isActive(filter: DateFilter, option: DateFilter): boolean {
  if (filter.mode !== option.mode) return false
  if (filter.mode === 'since' && option.mode === 'since') return filter.days === option.days
  return true
}

/** Close on an outside click, but only while the panel is open. */
function useClickAway<T extends HTMLElement>(
  active: boolean,
  onAway: () => void,
): RefObject<T | null> {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!active) return
    function onDown(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) onAway()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  })
  return ref
}

interface MenuProps {
  filter: DateFilter
  onPick: (filter: DateFilter) => void
  onCustom: () => void
}

/** The default panel: rolling windows, plus a way into the calendar. */
function PresetMenu({ filter, onPick, onCustom }: MenuProps): JSX.Element {
  return (
    <div className="min-w-[172px]">
      {OPTIONS.map(option => (
        <button
          key={dateFilterLabel(option)}
          type="button"
          onClick={() => onPick(option)}
          className={ROW}
        >
          <span className="flex-1">{dateFilterLabel(option)}</span>
          {isActive(filter, option) && <Check size={14} className="text-[#e04a3d]" />}
        </button>
      ))}
      <div className="my-1 h-px bg-[var(--cat-border)]" />
      <button type="button" onClick={onCustom} className={ROW}>
        <span className="flex-1">Custom range…</span>
        {filter.mode === 'range' && <Check size={14} className="text-[#e04a3d]" />}
      </button>
    </div>
  )
}

interface RangeProps {
  filter: DateFilter
  onPick: (filter: DateFilter) => void
  onBack: () => void
}

function RangePanel({ filter, onPick, onBack }: RangeProps): JSX.Element {
  // Held locally because a range takes two clicks: the first yields
  // {from, to: undefined}, which is not a committable filter but must still
  // render as selected. Committing only on a complete range meant the first
  // click looked like nothing happened.
  const [draft, setDraft] = useState<DateRange | undefined>(
    filter.mode === 'range' ? { from: filter.from, to: filter.to } : undefined,
  )

  function handleSelect(next: DateRange | undefined): void {
    setDraft(next)
    if (next?.from && next.to) onPick({ mode: 'range', from: next.from, to: next.to })
  }

  return (
    <div className="p-1.5" style={CALENDAR_STYLE}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] font-medium text-[var(--cat-ink-3)] transition-colors hover:text-[var(--cat-ink)]"
        >
          ← Presets
        </button>
        <span className="text-[11px] text-[var(--cat-ink-3)]">
          {draft?.from && !draft.to ? 'Pick an end date' : 'Pick a start date'}
        </span>
      </div>
      <DayPicker
        mode="range"
        selected={draft}
        defaultMonth={draft?.from}
        onSelect={handleSelect}
        classNames={CALENDAR_CLASSNAMES}
      />
    </div>
  )
}

/** Date filter for the prompt list: a rolling window, or a custom range. */
export function PromptDateFilter({
  filter,
  onChange,
}: {
  filter: DateFilter
  onChange: (filter: DateFilter) => void
}): JSX.Element {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const ref = useClickAway<HTMLDivElement>(open, () => setOpen(false))

  function handlePick(next: DateFilter): void {
    onChange(next)
    setOpen(false)
    setCustom(false)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="Filter by date"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`${CONTROL_CHIP} gap-1.5`}
      >
        <CalendarDays size={13} className="text-[var(--cat-ink-3)]" />
        {dateFilterLabel(filter)}
        <ChevronDown size={14} className="text-[var(--cat-ink-3)]" />
      </button>
      {open && (
        <div className={PANEL}>
          {custom ? (
            <RangePanel filter={filter} onPick={handlePick} onBack={() => setCustom(false)} />
          ) : (
            <PresetMenu filter={filter} onPick={handlePick} onCustom={() => setCustom(true)} />
          )}
        </div>
      )}
    </div>
  )
}
