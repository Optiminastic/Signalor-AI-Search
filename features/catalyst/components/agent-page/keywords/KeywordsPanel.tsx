'use client'

import {
  SECONDARY_BUTTON,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import {
  BrandList,
  GapList,
  QueryList,
} from '@/features/catalyst/components/agent-page/keywords/KeywordTables'
import { useKeywords, type Keywords } from '@/hooks/useKeywords'

interface KeywordsPanelProps {
  orgSlug: string
}

interface PartProps {
  keywords: Keywords
}

const NOTE = 'text-[12.5px] text-[var(--cat-ink-2)]'
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'

const SOURCES: Record<string, string> = {
  semrush: 'your Semrush account',
  ahrefs: 'your Ahrefs account',
}

function lastReadText(keywords: Keywords): string {
  const at = keywords.report?.fetchedAt
  if (!at) return 'The agent reads keywords every week.'
  const from = SOURCES[keywords.report?.source ?? '']
  const via = from ? ` from ${from}` : ''
  return `Last read ${new Date(at).toLocaleDateString()}${via}. Refreshed every week.`
}

function SearchConsole({ keywords }: PartProps): JSX.Element | null {
  const queries = keywords.report?.searchConsole ?? []
  if (!queries.length) return null
  return (
    <section className="flex flex-col gap-2">
      <h3 className={SECTION_TITLE}>Your top Google searches (Search Console)</h3>
      <QueryList queries={queries} />
    </section>
  )
}

function RefreshBar({ keywords }: PartProps): JSX.Element {
  const busy = keywords.refreshing
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={MUTED}>
        {busy ? 'Reading keywords… this takes about a minute.' : lastReadText(keywords)}
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={keywords.refreshNow}
        className={SECONDARY_BUTTON}
      >
        Refresh now
      </button>
    </div>
  )
}

function competitorsText(keywords: Keywords): string {
  const names = keywords.report?.competitors.map(c => c.name || c.domain) ?? []
  return names.length ? ` Compared with ${names.join(', ')}.` : ''
}

function Gaps({ keywords }: PartProps): JSX.Element {
  const gaps = keywords.report?.gaps ?? []
  return (
    <section className="flex flex-col gap-2">
      <h3 className={SECTION_TITLE}>Keywords your competitors win</h3>
      <p className={NOTE}>
        Searches where a competitor is on Google’s first page and you don’t rank.
        {competitorsText(keywords)}
      </p>
      {gaps.length ? <GapList gaps={gaps} /> : <p className={MUTED}>No gaps found yet.</p>}
    </section>
  )
}

function Ranking({ keywords }: PartProps): JSX.Element {
  const rows = keywords.report?.keywords ?? []
  return (
    <section className="flex flex-col gap-2">
      <h3 className={SECTION_TITLE}>Keywords you rank for</h3>
      {rows.length ? (
        <BrandList keywords={rows} />
      ) : (
        <p className={MUTED}>No ranking keywords found yet.</p>
      )}
    </section>
  )
}

/**
 * Real Google search data for the brand: what it ranks for, and what its top
 * competitors win instead. Monthly searches are Google's estimates.
 */
export function KeywordsPanel({ orgSlug }: KeywordsPanelProps): JSX.Element {
  const keywords = useKeywords(orgSlug)
  if (keywords.isLoading) return <p className={NOTE}>Loading…</p>
  if (keywords.loadError) return <p className={NOTE}>{keywords.loadError}</p>
  return (
    <div className="flex flex-col gap-5">
      <RefreshBar keywords={keywords} />
      {keywords.actionError && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {keywords.actionError}
        </p>
      )}
      {keywords.report?.notes.map(note => (
        <p key={note} className={NOTE}>
          {note}
        </p>
      ))}
      <Gaps keywords={keywords} />
      <Ranking keywords={keywords} />
      <SearchConsole keywords={keywords} />
    </div>
  )
}
