'use client'

import { useMemo, useState } from 'react'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import {
  PromptTag,
  sentimentColor,
} from '@/features/catalyst/components/prompt-tracker/PromptChips'
import type { TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'
import { scoreColor } from '@/features/catalyst/visibility-data'
import { formatCompactNumber, formatShortDate } from '@/lib/format'
import { ChevronDown, ChevronRight, ChevronUp, Loader2, RefreshCw, Trash2 } from '@/lib/icons'

const TH =
  'px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--cat-ink-3)] whitespace-nowrap'
const TD = 'px-3 py-2.5 align-middle'

export type SortKey = 'visibility' | 'prompt' | 'volume' | 'mentions' | 'createdAt'

interface Column {
  key: SortKey | null
  label: string
  className?: string
}

const COLUMNS: readonly Column[] = [
  { key: 'visibility', label: 'Avg. vis.' },
  { key: 'prompt', label: 'Prompt', className: 'w-full' },
  { key: null, label: 'Type' },
  { key: 'volume', label: 'Volume', className: 'w-px' },
  { key: null, label: 'Sentiment' },
  { key: 'mentions', label: 'Brand mentions' },
  { key: 'createdAt', label: 'Created', className: 'w-px' },
  { key: null, label: '' },
]

function compare(a: TrackedPrompt, b: TrackedPrompt, key: SortKey): number {
  if (key === 'prompt') return a.prompt.localeCompare(b.prompt)
  if (key === 'createdAt') return a.createdAt.localeCompare(b.createdAt)
  // Unmeasured volume sorts as lower than any real figure, so "no data" never
  // outranks a genuine zero at the top of a descending sort.
  if (key === 'volume') return (a.volume ?? -1) - (b.volume ?? -1)
  return a[key] - b[key]
}

/** Sort prompts by a column, descending first for numbers, ascending for text. */
export function sortPrompts(prompts: TrackedPrompt[], key: SortKey, asc: boolean): TrackedPrompt[] {
  return [...prompts].sort((a, b) => (asc ? compare(a, b, key) : compare(b, a, key)))
}

function SentimentCell({ value }: { value: string }): JSX.Element {
  const key = value.toLowerCase()
  const color = sentimentColor(key)
  if (!color) return <span className="text-[var(--cat-ink-3)]">-</span>
  return (
    <span className="text-[12px] font-medium capitalize" style={{ color }}>
      {key}
    </span>
  )
}

/**
 * Search demand, as a meter scaled against the busiest prompt in the table.
 *
 * Relative rather than absolute because the question this column answers is
 * "which of these is worth winning first", and raw monthly figures span orders
 * of magnitude — a shared scale makes the row comparison readable at a glance.
 * The exact figure stays available on hover.
 */
function VolumeCell({ value, max }: { value: number | null; max: number }): JSX.Element {
  if (value === null) return <span className="text-[13px] text-[var(--cat-ink-3)]">-</span>
  return (
    <span
      className="flex items-center gap-2"
      title={`${value.toLocaleString('en-US')} searches / month`}
    >
      <TickBar value={max > 0 ? (value / max) * 100 : 0} ticks={5} showValue={false} />
      <span className="text-[12px] text-[var(--cat-ink-2)] tabular-nums">
        {formatCompactNumber(value)}
      </span>
    </span>
  )
}

type RowOpen = (item: TrackedPrompt) => void

interface RowActionsProps {
  item: TrackedPrompt
  busy: boolean
  onRecheck: (id: number) => void
  onRemove: (id: number) => void
  onOpen: RowOpen
}

function RowActions({ item, busy, onRecheck, onRemove, onOpen }: RowActionsProps): JSX.Element {
  const btn =
    'grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)] disabled:opacity-40'
  return (
    <span className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        onClick={() => onRecheck(item.id)}
        disabled={busy}
        className={btn}
        aria-label="Re-check prompt"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
      </button>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        disabled={busy}
        className={btn}
        aria-label="Remove prompt"
      >
        <Trash2 size={14} />
      </button>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={btn}
        aria-label="Open prompt details"
      >
        <ChevronRight size={14} />
      </button>
    </span>
  )
}

interface HeaderProps {
  sort: SortKey
  asc: boolean
  onSort: (key: SortKey) => void
}

function TableHead({ sort, asc, onSort }: HeaderProps): JSX.Element {
  return (
    <thead className="bg-[var(--cat-bg)]">
      <tr>
        {COLUMNS.map(col => (
          <th key={col.label} scope="col" className={`${TH} ${col.className ?? ''}`}>
            {col.key ? (
              <button
                type="button"
                onClick={() => onSort(col.key as SortKey)}
                className="inline-flex items-center gap-1 transition-colors hover:text-[var(--cat-ink)]"
              >
                {col.label}
                {sort === col.key && (asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
              </button>
            ) : (
              col.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function VisibilityCell({ value }: { value: number }): JSX.Element {
  return (
    <span className="text-[13px] font-semibold tabular-nums" style={{ color: scoreColor(value) }}>
      {value}%
    </span>
  )
}

function PromptCell({ item, onOpen }: { item: TrackedPrompt; onOpen: RowOpen }): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="block max-w-[520px] truncate text-left text-[13px] text-[var(--cat-ink)] hover:underline"
      title={item.prompt}
    >
      {item.prompt}
    </button>
  )
}

/** Prompt category and intent, side by side. */
function TypeCell({ item }: { item: TrackedPrompt }): JSX.Element {
  return (
    <span className="flex items-center gap-1">
      <PromptTag value={item.promptType} />
      <PromptTag value={item.intent} />
    </span>
  )
}

interface RowProps extends RowActionsProps {
  /** Largest volume in the table, for the meter's shared scale. */
  volumeMax: number
}

function PromptTableRow({ item, volumeMax, ...actions }: RowProps): JSX.Element {
  return (
    <tr className="border-t border-[var(--cat-border)] transition-colors hover:bg-[var(--cat-hover)]">
      <td className={TD}>
        <VisibilityCell value={item.visibility} />
      </td>
      <td className={TD}>
        <PromptCell item={item} onOpen={actions.onOpen} />
      </td>
      <td className={TD}>
        <TypeCell item={item} />
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        <VolumeCell value={item.volume} max={volumeMax} />
      </td>
      <td className={TD}>
        <SentimentCell value={item.sentiment} />
      </td>
      <td className={`${TD} text-[13px] text-[var(--cat-ink-2)] tabular-nums`}>{item.mentions}</td>
      <td className={`${TD} text-[12px] whitespace-nowrap text-[var(--cat-ink-3)]`}>
        {formatShortDate(item.createdAt)}
      </td>
      <td className={TD}>
        <RowActions item={item} {...actions} />
      </td>
    </tr>
  )
}

/** Which column the table is sorted by. Text sorts A-Z first, numbers high-first. */
function useSortState(): { sort: SortKey; asc: boolean; onSort: (key: SortKey) => void } {
  const [sort, setSort] = useState<SortKey>('visibility')
  const [asc, setAsc] = useState(false)

  const onSort = (key: SortKey): void => {
    if (key === sort) {
      setAsc(v => !v)
      return
    }
    setSort(key)
    setAsc(key === 'prompt')
  }

  return { sort, asc, onSort }
}

export interface PromptTableProps {
  prompts: TrackedPrompt[]
  busyId: number | null
  onRecheck: (id: number) => void
  onRemove: (id: number) => void
  onOpen: (item: TrackedPrompt) => void
}

/** Tabular view of tracked prompts — one scannable row each, sortable by column. */
export function PromptTable({
  prompts,
  busyId,
  onRecheck,
  onRemove,
  onOpen,
}: PromptTableProps): JSX.Element {
  const { sort, asc, onSort } = useSortState()
  const rows = useMemo(() => sortPrompts(prompts, sort, asc), [prompts, sort, asc])
  const volumeMax = useMemo(
    () => prompts.reduce((max, p) => Math.max(max, p.volume ?? 0), 0),
    [prompts],
  )

  return (
    <div className="cat-rise cat-card-edge overflow-x-auto rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
      <table className="w-full min-w-[980px] border-collapse">
        <TableHead sort={sort} asc={asc} onSort={onSort} />
        <tbody>
          {rows.map(item => (
            <PromptTableRow
              key={item.id}
              item={item}
              busy={busyId === item.id}
              volumeMax={volumeMax}
              onRecheck={onRecheck}
              onRemove={onRemove}
              onOpen={onOpen}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
