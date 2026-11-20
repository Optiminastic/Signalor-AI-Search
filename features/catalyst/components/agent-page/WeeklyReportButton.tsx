'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { AgentRichText } from '@/features/catalyst/components/agent-page/AgentRichText'
import { useWeeklyReports } from '@/hooks/useWeeklyReports'
import type { WeeklyReports } from '@/lib/api/agent-mode-weekly-reports'
import { CalendarDays } from '@/lib/icons'

const CHIP =
  'flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--cat-card-border)] bg-[var(--cat-content)]/85 px-3 text-[13px] text-[var(--cat-ink-2)] backdrop-blur-sm hover:text-[var(--cat-ink)]'
const PANEL =
  'absolute right-0 z-50 mt-2 max-h-[75vh] w-[min(560px,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-[var(--cat-card-border)] bg-[var(--cat-content)] p-5 shadow-lg'
const CURRENT = 'current'

interface WeeklyReportButtonProps {
  orgSlug: string
}

interface ReportEntry {
  key: string
  label: string
  content: string
}

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(
    new Date(iso),
  )
}

/** "This week so far" first, then the saved weekly reports (latest first). */
function toEntries(data: WeeklyReports): ReportEntry[] {
  return [
    { key: CURRENT, label: 'This week so far', content: data.current.content },
    ...data.reports.map(r => ({
      key: r.weekOf,
      label: `Week of ${formatDay(r.weekOf)}`,
      content: r.content,
    })),
  ]
}

interface WeekPickerProps {
  entries: ReportEntry[]
  selected: string
  onSelect: (key: string) => void
}

function WeekPicker({ entries, selected, onSelect }: WeekPickerProps): JSX.Element {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {entries.map(entry => (
        <button
          key={entry.key}
          type="button"
          onClick={() => onSelect(entry.key)}
          className={`rounded-md px-2.5 py-1 text-[12px] ${entry.key === selected ? 'bg-[var(--cat-hover)] font-medium text-[var(--cat-ink)]' : 'text-[var(--cat-ink-3)] hover:text-[var(--cat-ink)]'}`}
        >
          {entry.label}
        </button>
      ))}
    </div>
  )
}

interface ReportPanelProps {
  orgSlug: string
  initialKey: string
}

function ReportPanel({ orgSlug, initialKey }: ReportPanelProps): JSX.Element {
  const { data, isLoading, loadError } = useWeeklyReports(orgSlug, true)
  const [picked, setPicked] = useState<string | null>(null)
  if (isLoading)
    return <p className="text-[13px] text-[var(--cat-ink-3)]">Loading your weekly report…</p>
  if (loadError || !data) return <p className="text-[13px] text-[var(--cat-ink-3)]">{loadError}</p>
  const entries = toEntries(data)
  const wanted = picked ?? initialKey
  const shown = entries.find(e => e.key === wanted) ?? entries[1] ?? entries[0]
  return (
    <>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[var(--cat-ink)]">Weekly report</h2>
        <span className="text-[11px] text-[var(--cat-ink-3)]">
          Next report {formatDay(data.nextReportOn)} · also emailed to you
        </span>
      </div>
      <WeekPicker entries={entries} selected={shown.key} onSelect={setPicked} />
      <AgentRichText text={shown.content} />
    </>
  )
}

/** Top-bar icon that opens the brand's weekly report. `?report=<week>` (the email link) opens it directly. */
export function WeeklyReportButton({ orgSlug }: WeeklyReportButtonProps): JSX.Element {
  const linked = useSearchParams().get('report')
  const [open, setOpen] = useState(Boolean(linked))
  return (
    <div className="relative">
      <button type="button" className={CHIP} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <CalendarDays size={15} /> Weekly report
      </button>
      {open && (
        <>
          <button
            aria-label="Close weekly report"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className={PANEL} role="dialog" aria-label="Weekly report">
            <ReportPanel
              orgSlug={orgSlug}
              initialKey={linked && linked !== 'latest' ? linked : ''}
            />
          </div>
        </>
      )}
    </div>
  )
}
