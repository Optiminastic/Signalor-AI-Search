'use client'

import { useMemo } from 'react'

import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { MentionIndicator } from '@/features/catalyst/components/prompt-tracker/PromptChips'
import { SiteFavicon } from '@/features/catalyst/components/SiteFavicon'
import { LOGO_SIZE } from '@/features/catalyst/constants'
import {
  brandsInAnswer,
  citationSplit,
  type MentionedSite,
} from '@/features/catalyst/prompt-detail-analytics'
import type { PromptEngineResult } from '@/features/catalyst/prompt-tracker-data'
import { formatShortDate } from '@/lib/format'
import { Link2 } from '@/lib/icons'

const TH =
  'px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--cat-ink-3)] whitespace-nowrap'
const TD = 'px-3 py-2.5 align-middle'

const MAX_BRAND_LOGOS = 4

/** The sites this answer sourced, brand first, capped so the column stays put. */
function BrandMentionsCell({ sites }: { sites: MentionedSite[] }): JSX.Element {
  if (sites.length === 0) {
    return <span className="text-[12.5px] text-[var(--cat-ink-3)]">-</span>
  }
  const shown = sites.slice(0, MAX_BRAND_LOGOS)
  const extra = sites.length - shown.length
  return (
    <span className="flex items-center gap-1">
      {shown.map(site => (
        <SiteFavicon
          key={site.domain}
          domain={site.domain}
          size={LOGO_SIZE.chip}
          title={`${site.domain}${site.isBrand ? ' (you)' : ''}`}
        />
      ))}
      {extra > 0 && <span className="text-[11px] text-[var(--cat-ink-3)]">+{extra}</span>}
    </span>
  )
}

/** Brand-owned sources over total sources, e.g. 2/10. */
function CitationsCell({ brand, total }: { brand: number; total: number }): JSX.Element {
  if (total === 0) {
    return (
      <span className="flex items-center gap-1.5 text-[var(--cat-ink-3)]" title="No sources cited">
        <Link2 size={13} className="opacity-40" />
        <span className="text-[11.5px] tabular-nums">0</span>
      </span>
    )
  }
  const cited = brand > 0
  return (
    <span
      className="flex items-center gap-1.5"
      title={`${brand} of ${total} sources are your pages`}
    >
      <Link2 size={13} className={cited ? 'text-[#1e8a5c]' : 'text-[var(--cat-ink-3)]'} />
      <span className="rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--cat-ink-2)] tabular-nums">
        {brand}/{total}
      </span>
    </span>
  )
}

interface ResponseTableProps {
  results: PromptEngineResult[]
  onOpen: (result: PromptEngineResult) => void
}

const COLUMNS = ['Visibility', 'Response', 'Model', 'Brand mentions', 'Citations', 'Date']

function TableHead(): JSX.Element {
  return (
    <thead>
      <tr>
        {COLUMNS.map(label => (
          <th key={label} scope="col" className={`${TH} ${label === 'Response' ? 'w-full' : ''}`}>
            {label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

/** The answer preview. A button as well as a row click, so it is keyboard-reachable. */
function SnippetCell({
  result,
  onOpen,
}: {
  result: PromptEngineResult
  onOpen: (result: PromptEngineResult) => void
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={event => {
        event.stopPropagation()
        onOpen(result)
      }}
      className="block max-w-[420px] truncate text-left text-[13px] text-[var(--cat-ink)] hover:underline"
      title={result.snippet}
    >
      {result.snippet || 'No answer text captured for this run.'}
    </button>
  )
}

/** One row's data, derived once rather than on every render. */
interface RowModel {
  result: PromptEngineResult
  sites: MentionedSite[]
  brandCitations: number
  totalCitations: number
}

function ResponseRow({
  row,
  onOpen,
}: {
  row: RowModel
  onOpen: (result: PromptEngineResult) => void
}): JSX.Element {
  const { result } = row
  return (
    <tr
      onClick={() => onOpen(result)}
      className="cursor-pointer border-t border-[var(--cat-border)] transition-colors hover:bg-[var(--cat-hover)]"
    >
      <td className={TD}>
        <MentionIndicator mentioned={result.mentioned} position={result.position} />
      </td>
      <td className={TD}>
        <SnippetCell result={result} onOpen={onOpen} />
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--cat-ink-2)]">
          <EngineLogo name={result.engineLabel} size={LOGO_SIZE.chip} />
          {result.engineLabel}
        </span>
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        <BrandMentionsCell sites={row.sites} />
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        <CitationsCell brand={row.brandCitations} total={row.totalCitations} />
      </td>
      <td className={`${TD} text-[12px] whitespace-nowrap text-[var(--cat-ink-3)]`}>
        {result.checkedAt ? formatShortDate(result.checkedAt) : '-'}
      </td>
    </tr>
  )
}

/**
 * Every answer this prompt has collected, one row each.
 *
 * A table rather than the old stack of cards because these are compared, not
 * read: the question is which engine answered well and which sources it leaned
 * on, and that only reads at a glance when the values line up in columns. The
 * full answer moves into the response detail view behind a click.
 */
export function ResponseTable({ results, onOpen }: ResponseTableProps): JSX.Element {
  // Each row walks its own citation list twice, so derive once per data change
  // rather than on every render of a sheet that re-renders on tab and filter.
  // Newest first: the current answer is what a user checks, older runs are
  // history they scroll back through.
  const rows = useMemo(
    (): RowModel[] =>
      [...results]
        .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
        .map(result => {
          const { brand, total } = citationSplit(result)
          return {
            result,
            sites: brandsInAnswer(result),
            brandCitations: brand,
            totalCitations: total,
          }
        }),
    [results],
  )

  if (rows.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-[12.5px] text-[var(--cat-ink-3)]">
        No answers recorded for this prompt yet.
      </p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <TableHead />
        <tbody>
          {rows.map(row => (
            <ResponseRow key={row.result.id} row={row} onOpen={onOpen} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
