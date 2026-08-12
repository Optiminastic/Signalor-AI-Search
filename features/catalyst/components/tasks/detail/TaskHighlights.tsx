'use client'

import { sourceOf } from '@/features/catalyst/task-source'
import { humanizeTerm } from '@/features/catalyst/tasks-data'
import type { TaskDetail } from '@/hooks/useTaskDetail'

interface Fact {
  key: string
  value: string
  /** Render as a link to the live page. */
  href?: string
  /** Monospace — identifiers and URLs, never prose. */
  mono?: boolean
}

/**
 * One fact. Label quiet and in the page's own typeface; value in ink.
 *
 * The label used to be monospace, which made every row read like a config file
 * even after the text itself was humanised — monospace is for values you might
 * copy verbatim, not for the word "Pillar".
 */
function FactRow({ fact }: { fact: Fact }): JSX.Element {
  const valueClass = `min-w-0 truncate ${fact.mono ? 'font-mono text-[12px]' : 'text-[12.5px]'} font-medium text-[var(--cat-ink)]`
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-baseline gap-3 px-3 py-[7px] odd:bg-[var(--cat-hover)]">
      <span className="text-[12px] text-[var(--cat-ink-3)]">{fact.key}</span>
      {fact.href ? (
        <a
          href={fact.href}
          target="_blank"
          rel="noreferrer"
          className={`${valueClass} underline decoration-[var(--cat-border)] underline-offset-2 hover:decoration-current`}
        >
          {fact.value}
        </a>
      ) : (
        <span className={valueClass}>{fact.value}</span>
      )}
    </div>
  )
}

/** Measured values worth quoting verbatim, e.g. GSC impressions or brand mentions. */
function evidenceFacts(task: TaskDetail): Fact[] {
  const out: Fact[] = []
  for (const [key, raw] of Object.entries(task.evidence)) {
    if (raw === null || raw === undefined || typeof raw === 'object') continue
    const value = String(raw).trim()
    if (!value) continue
    // Keys arrive as backend field names ("brand_mentions"). Numbers keep the
    // monospace face so digits line up; prose does not.
    out.push({ key: humanizeTerm(key), value, mono: typeof raw !== 'string' })
    if (out.length >= 4) break
  }
  return out
}

/** Every fact worth showing, in reading order: identity, then provenance. */
function factsFor(task: TaskDetail): Fact[] {
  const source = sourceOf(task.source, task.findingCode)
  const page = task.affectedPages[0]

  return [
    // The finding code stays verbatim and monospace: it is an identifier the
    // user may quote back to support, not prose to be prettified.
    { key: 'Finding', value: task.findingCode, mono: true },
    { key: 'Pillar', value: humanizeTerm(task.pillar) },
    // The backend mirrors pillar into category for most findings; printing the
    // same value under two labels made the table look padded.
    ...(task.category && task.category !== task.pillar
      ? [{ key: 'Category', value: humanizeTerm(task.category) }]
      : []),
    { key: 'Execution', value: task.canAutoFix ? 'Auto-fixable' : 'Manual' },
    ...(source ? [{ key: 'Source', value: source.label }] : []),
    ...(page
      ? [{ key: 'Page', value: page.replace(/^https?:\/\//, ''), href: page, mono: true }]
      : []),
    ...evidenceFacts(task),
    // Absent facts are dropped rather than rendered as a dash. A column of
    // placeholders reads as broken data, not as "we didn't measure this".
  ].filter(fact => fact.value)
}

/**
 * The action's facts, as a key/value grid.
 *
 * Two columns of striped rows rather than a bulleted list, because these are
 * looked up rather than read: the eye goes to one label and stops. One
 * container with a centre divider, filled evenly — the previous fixed
 * left/right split left one column a row short whenever a task had no page,
 * and the empty corner read as a rendering bug.
 */
export function TaskHighlights({ task }: { task: TaskDetail }): JSX.Element {
  const facts = factsFor(task)
  const mid = Math.ceil(facts.length / 2)
  const columns = [facts.slice(0, mid), facts.slice(mid)]

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-[var(--cat-border)] lg:grid-cols-2">
      {columns.map((column, index) => (
        <div
          key={index}
          className={
            index === 1
              ? 'border-t border-[var(--cat-border)] lg:border-t-0 lg:border-l'
              : undefined
          }
        >
          {column.map(fact => (
            <FactRow key={fact.key} fact={fact} />
          ))}
        </div>
      ))}
    </div>
  )
}
