'use client'

import { useTechnicalChecks } from '@/hooks/useTechnicalChecks'
import type { TechnicalCheck } from '@/lib/api/technical-checks'
import { CheckCircle2 } from '@/lib/icons'

const NOTE = 'text-[12.5px] text-[var(--cat-ink-2)]'
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
// Green-700: 5:1 on white (the brighter brand green is 2.4:1, below the 3:1 icon minimum).
const GREEN = '#15803d'

function when(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

function CheckRow({ check, passed }: { check: TechnicalCheck; passed: boolean }): JSX.Element {
  return (
    <li className="flex items-start gap-3 border-b border-[var(--cat-border)] px-4 py-3 last:border-b-0">
      {passed ? (
        <CheckCircle2
          size={16}
          className="mt-0.5 shrink-0"
          style={{ color: GREEN }}
          aria-label="Passed"
        />
      ) : (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--cat-ink-3)]"
          aria-label="Couldn't check"
        />
      )}
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[var(--cat-ink)]">{check.label}</p>
        <p className={NOTE}>{check.detail}</p>
      </div>
    </li>
  )
}

function CheckList({
  title,
  checks,
  passed,
}: {
  title: string
  checks: TechnicalCheck[]
  passed: boolean
}): JSX.Element | null {
  if (checks.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        {title}
      </h2>
      <ul className="rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)]">
        {checks.map(check => (
          <CheckRow key={check.code} check={check} passed={passed} />
        ))}
      </ul>
    </section>
  )
}

/**
 * Technical checks that passed (and any that couldn't be checked).
 *
 * Kept out of Today and Done on purpose: a healthy check is not work, so it must
 * not clutter the active list or inflate the completion count. This view only
 * shows that the checks ran. Failed checks are On-site actions in Today.
 */
export function PassedChecks(): JSX.Element {
  const { report, isLoading, isError } = useTechnicalChecks()
  if (isLoading) return <p className={NOTE}>Loading checks…</p>
  if (isError) return <p className={NOTE}>Couldn’t load the technical checks.</p>
  if (!report || report.checks.length === 0) {
    return <p className={NOTE}>No technical checks yet. They run with the next analysis.</p>
  }
  const passed = report.checks.filter(c => c.status === 'passed')
  const unknown = report.checks.filter(c => c.status === 'unknown')
  return (
    <div className="flex flex-col gap-4">
      <p className={NOTE}>
        {report.passed} of {report.checks.length} checks passed
        {report.failed > 0
          ? `; ${report.failed} failed and ${report.failed === 1 ? 'is' : 'are'} in On-site actions`
          : ''}
        .
        {report.checkedAt && (
          <span className={`${MUTED} ml-1`}>Checked {when(report.checkedAt)}.</span>
        )}
      </p>
      <CheckList title="Passed" checks={passed} passed />
      <CheckList title="Couldn’t check" checks={unknown} passed={false} />
    </div>
  )
}
