'use client'

import 'react-day-picker/style.css'

import { endOfDay, format, isSameDay, isWithinInterval, startOfDay } from 'date-fns'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { DayPicker, getDefaultClassNames, type DateRange } from 'react-day-picker'

import { CONTROL_CHIP } from '@/features/catalyst/components/control-styles'
import { CalendarDays, ChevronDown } from '@/lib/icons'

/** How the prompt list is filtered by check date. */
export type DateFilter =
  | { mode: 'all' }
  | { mode: 'single'; date: Date }
  | { mode: 'range'; from: Date; to: Date }

export const ALL_DATES: DateFilter = { mode: 'all' }

type Mode = DateFilter['mode']

const MODES: { value: Mode; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'single', label: 'Single day' },
  { value: 'range', label: 'Range' },
]

// react-day-picker theming → brand red accent, compact sizing, no default blue.
const CALENDAR_STYLE = {
  '--rdp-accent-color': '#e04a3d',
  '--rdp-accent-background-color': 'rgba(224,74,61,0.12)',
  '--rdp-today-color': '#e04a3d',
  '--rdp-range_middle-background-color': 'rgba(224,74,61,0.12)',
  '--rdp-range_start-color': '#fff',
  '--rdp-range_end-color': '#fff',
  '--rdp-day-width': '2.15rem',
  '--rdp-day-height': '2.15rem',
  '--rdp-day_button-width': '2.15rem',
  '--rdp-day_button-height': '2.15rem',
  '--rdp-day_button-border-radius': '7px',
  '--rdp-weekday-opacity': '1',
} as CSSProperties

// Merge house-style Tailwind over the library defaults so layout stays intact.
const defaults = getDefaultClassNames()
const CALENDAR_CLASSNAMES = {
  month_caption: `${defaults.month_caption} h-8`,
  caption_label: `${defaults.caption_label} text-[13px] font-semibold text-[var(--cat-ink)]`,
  button_previous: `${defaults.button_previous} inline-grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]`,
  button_next: `${defaults.button_next} inline-grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]`,
  chevron: `${defaults.chevron} !fill-[var(--cat-ink-2)]`,
  weekday: `${defaults.weekday} text-[11px] font-medium text-[var(--cat-ink-3)]`,
  day: `${defaults.day} text-[12px] text-[var(--cat-ink-2)]`,
  outside: `${defaults.outside} text-[var(--cat-ink-3)] opacity-50`,
}

export function dateFilterLabel(filter: DateFilter): string {
  if (filter.mode === 'single') return format(filter.date, 'MMM d, yyyy')
  if (filter.mode === 'range') {
    return `${format(filter.from, 'MMM d')} – ${format(filter.to, 'MMM d, yyyy')}`
  }
  return 'All time'
}

/** Whether a check timestamp (ms) passes the filter. Callers decide how to treat
 *  not-yet-checked prompts (ts = 0). */
export function matchesDateFilter(ts: number, filter: DateFilter): boolean {
  if (filter.mode === 'all') return true
  const d = new Date(ts)
  if (filter.mode === 'single') return isSameDay(d, filter.date)
  return isWithinInterval(d, { start: startOfDay(filter.from), end: endOfDay(filter.to) })
}

function ModeTabs({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }): JSX.Element {
  return (
    <div className="mb-2 inline-flex gap-0.5 rounded-md bg-[var(--cat-track)] p-[3px]">
      {MODES.map(m => (
        <button
          key={m.value}
          type="button"
          onClick={() => onMode(m.value)}
          className={`rounded-sm px-2.5 py-[5px] text-[11px] font-medium transition-colors ${
            m.value === mode
              ? 'bg-[var(--cat-card)] font-semibold text-[var(--cat-ink)] shadow-sm'
              : 'text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

interface CalendarProps {
  mode: Mode
  filter: DateFilter
  onPick: (filter: DateFilter) => void
}

function Calendar({ mode, filter, onPick }: CalendarProps): JSX.Element {
  if (mode === 'single') {
    const selected = filter.mode === 'single' ? filter.date : undefined
    return (
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={d => d && onPick({ mode: 'single', date: d })}
        classNames={CALENDAR_CLASSNAMES}
      />
    )
  }
  if (mode === 'range') {
    const selected: DateRange | undefined =
      filter.mode === 'range' ? { from: filter.from, to: filter.to } : undefined
    return (
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={r => r?.from && r?.to && onPick({ mode: 'range', from: r.from, to: r.to })}
        classNames={CALENDAR_CLASSNAMES}
      />
    )
  }
  return (
    <p className="px-1 py-2 text-[12px] text-[var(--cat-ink-3)]">Showing prompts from all dates.</p>
  )
}

interface PopoverProps {
  mode: Mode
  filter: DateFilter
  onMode: (m: Mode) => void
  onPick: (filter: DateFilter) => void
}

function FilterPopover({ mode, filter, onMode, onPick }: PopoverProps): JSX.Element {
  return (
    <div
      className="absolute right-0 z-50 mt-1.5 rounded-lg border border-[var(--cat-border)] bg-[var(--cat-card)] p-2.5 shadow-xl"
      style={CALENDAR_STYLE}
    >
      <ModeTabs mode={mode} onMode={onMode} />
      <Calendar mode={mode} filter={filter} onPick={onPick} />
    </div>
  )
}

function FilterTrigger({
  filter,
  onToggle,
}: {
  filter: DateFilter
  onToggle: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      aria-label="Filter by date"
      onClick={onToggle}
      className={`${CONTROL_CHIP} flex items-center gap-1.5`}
    >
      <CalendarDays size={13} className="text-[var(--cat-ink-3)]" />
      {dateFilterLabel(filter)}
      <ChevronDown size={14} className="text-[var(--cat-ink-3)]" />
    </button>
  )
}

/** Date filter for the prompt list: all time, a single day, or a range. */
export function PromptDateFilter({
  filter,
  onChange,
}: {
  filter: DateFilter
  onChange: (filter: DateFilter) => void
}): JSX.Element {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>(filter.mode)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function handleMode(next: Mode): void {
    setMode(next)
    if (next === 'all') {
      onChange(ALL_DATES)
      setOpen(false)
    }
  }

  function handlePick(next: DateFilter): void {
    onChange(next)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <FilterTrigger filter={filter} onToggle={() => setOpen(o => !o)} />
      {open && (
        <FilterPopover mode={mode} filter={filter} onMode={handleMode} onPick={handlePick} />
      )}
    </div>
  )
}
