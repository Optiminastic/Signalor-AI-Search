'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { DataState } from '@/features/catalyst/components/DataState'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import { usePromptCoverage, type PromptCoverageData } from '@/hooks/usePromptCoverage'
import type { CoverageStatus, PromptCoverageRow } from '@/lib/api/prompts'

const STATUS: Record<CoverageStatus, { label: string; color: string }> = {
  uncovered: { label: 'No page', color: NEG },
  weak: { label: 'Weak', color: YELLOW },
  covered: { label: 'Covered', color: GREEN },
  unknown: { label: 'Not measured', color: 'var(--cat-ink-3)' },
}

function shortUrl(url: string): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    return u.pathname === '/' ? u.hostname : u.pathname
  } catch {
    return url
  }
}

function CoverageRow({ row }: { row: PromptCoverageRow }): JSX.Element {
  const style = STATUS[row.status]
  return (
    <li className="border-b border-[var(--cat-border)] py-2 last:border-0">
      <div className="flex items-start gap-2">
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: style.color }}
          aria-hidden
        />
        <span className="min-w-0 flex-1 text-[13px] leading-snug text-[var(--cat-ink)]">
          {row.prompt_text}
        </span>
        <span className="shrink-0 text-[11px] font-semibold" style={{ color: style.color }}>
          {style.label}
        </span>
      </div>
      {row.best_url && (
        <p className="mt-0.5 pl-4 text-[11px] text-[var(--cat-ink-3)]">
          answered by {shortUrl(row.best_url)}
        </p>
      )}
    </li>
  )
}

/** One-line verdict, so the card answers the question before the list is read. */
function Headline({ data }: { data: PromptCoverageData }): JSX.Element {
  const { summary } = data.raw
  if (data.unmeasured) {
    return (
      <p className="text-[13px] text-[var(--cat-ink-2)]">
        Your pages are not indexed yet, so coverage cannot be measured. Run an analysis to build the
        index.
      </p>
    )
  }
  return (
    <p className="text-[13px] text-[var(--cat-ink)]">
      <span className="font-semibold">
        {summary.covered} of {summary.measurable} prompts
      </span>{' '}
      are answered by a page on your site.
      {summary.uncovered > 0 && (
        <>
          {' '}
          <span className="font-semibold" style={{ color: NEG }}>
            {summary.uncovered} need a page written.
          </span>
        </>
      )}
    </p>
  )
}

/** Many prompts on one page is the "one page per intent" problem. */
function Concentration({ data }: { data: PromptCoverageData }): JSX.Element | null {
  const worst = data.concentration[0]
  if (!worst) return null
  return (
    <p className="mt-1 text-[11px] leading-relaxed text-[var(--cat-ink-3)]">
      {worst.prompts} prompts all resolve to {shortUrl(worst.url)}. Engines retrieve one passage per
      question, so separate pages per intent usually outperform one page carrying them all.
    </p>
  )
}

/**
 * Which tracked prompts the site actually answers.
 *
 * The question that comes before every on-page and off-page task: a prompt with
 * no answering content cannot be fixed by improving a page that does not exist,
 * it needs a page written.
 *
 * "Not measured" is deliberately distinct from "no page" — an unindexed site
 * cannot be said to lack answers, only to be unreadable to us.
 */
export function PromptCoverageCard({ slug }: { slug: string | undefined }): JSX.Element {
  const { data, isLoading, isError } = usePromptCoverage(slug)
  const summary = data?.raw.summary

  return (
    <Card>
      <CardHead title="Prompt coverage" />
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data || data.rows.length === 0}
        emptyTitle="No tracked prompts yet"
        emptyHint="Add prompts to see whether your site answers them."
      >
        {data && summary && (
          <>
            <Headline data={data} />
            <Concentration data={data} />
            <ul className="mt-2">
              {data.rows.map(row => (
                <CoverageRow key={row.prompt_id} row={row} />
              ))}
            </ul>
          </>
        )}
      </DataState>
    </Card>
  )
}
