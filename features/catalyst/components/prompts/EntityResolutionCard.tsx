'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { GREEN, NEG } from '@/features/catalyst/constants'
import { useEntityResolution } from '@/hooks/useEntityResolution'
import type { EntityResolution } from '@/lib/api/prompts'
import { Eye, Loader2 } from '@/lib/icons'

function Verdict({ report }: { report: EntityResolution }): JSX.Element {
  const pct = Math.round(report.confusion_rate * 100)
  const alt = report.top_alternatives[0]?.name

  if (!report.is_blocking) {
    return (
      <p className="mt-2 text-[13px] text-[var(--cat-ink)]">
        <span className="font-semibold" style={{ color: GREEN }}>
          {report.responses - report.confused} of {report.responses} engines
        </span>{' '}
        resolve “{report.brand}” to your business. Name recognition is not holding you back.
      </p>
    )
  }
  return (
    <p className="mt-2 text-[13px] text-[var(--cat-ink)]">
      <span className="font-semibold" style={{ color: NEG }}>
        {pct}% of engines cannot resolve “{report.brand}”
      </span>
      {alt && <> — most often reading it as “{alt}”.</>} Fix the entity before more content work; an
      engine that cannot resolve the name has nothing to cite.
    </p>
  )
}

function Signals({ report }: { report: EntityResolution }): JSX.Element | null {
  if (report.signals.length === 0) return null
  return (
    <ul className="mt-2">
      {report.signals.slice(0, 4).map(signal => (
        <li
          key={`${signal.engine}-${signal.excerpt.slice(0, 24)}`}
          className="border-b border-[var(--cat-border)] py-2 last:border-0"
        >
          <span className="text-[11px] font-semibold text-[var(--cat-ink-2)]">
            {signal.engine}
            {signal.suggested && ` → read as “${signal.suggested}”`}
          </span>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--cat-ink-3)]">
            {signal.excerpt}
          </p>
        </li>
      ))}
    </ul>
  )
}

/**
 * Can engines resolve the brand name at all?
 *
 * When a prompt reads "not mentioned", that is either an engine that knows the
 * brand and omitted it, or one that cannot resolve the name. Citation metrics
 * cannot tell those apart, and they need opposite fixes — no amount of on-page
 * work solves the second.
 *
 * Probed on click: it asks every engine live and costs one call each.
 */
export function EntityResolutionCard({ slug }: { slug: string | undefined }): JSX.Element {
  const { report, probe, isProbing, isError } = useEntityResolution(slug)

  return (
    <Card>
      <CardHead title="Name recognition" />
      <p className="text-[12px] leading-relaxed text-[var(--cat-ink-2)]">
        Ask every engine who your brand is, and see which ones mistake the name for something else.
      </p>

      <div className="mt-2">
        <PrimaryButton
          icon={isProbing ? Loader2 : Eye}
          disabled={isProbing || !slug}
          onClick={probe}
        >
          {isProbing ? 'Checking engines…' : 'Check name recognition'}
        </PrimaryButton>
      </div>

      {isError && (
        <p className="mt-2 text-[12px] text-[var(--cat-ink-2)]">
          Could not reach the engines just now. Try again in a moment.
        </p>
      )}

      {report && report.responses > 0 && (
        <>
          <Verdict report={report} />
          <Signals report={report} />
        </>
      )}
    </Card>
  )
}
