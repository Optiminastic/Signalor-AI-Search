'use client'

import { sourceOf } from '@/features/catalyst/task-source'
import type { TaskDetail } from '@/hooks/useTaskDetail'

interface Fact {
  key: string
  value: string
  /** Render as a link to the live page. */
  href?: string
  /** Monospace — codes and URLs, not prose. */
  mono?: boolean
}

function FactRow({ fact }: { fact: Fact }): JSX.Element {
  const valueClass = `min-w-0 truncate ${fact.mono ? 'font-mono text-[12px]' : 'text-[12.5px]'} text-[var(--cat-ink)]`
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] items-baseline gap-3 px-3 py-[7px] odd:bg-[var(--cat-hover)]">
      <span className="font-mono text-[11.5px] text-[var(--cat-ink-3)]">{fact.key}</span>
      {fact.href ? (
        <a
          href={fact.href}
          target="_blank"
          rel="noreferrer"
          className={`${valueClass} text-[var(--cat-ink-2)] underline decoration-[var(--cat-border)] underline-offset-2 hover:decoration-current`}
        >
          {fact.value}
        </a>
      ) : (
        <span className={valueClass}>{fact.value}</span>
      )}
    </div>
  )
}

/** Evidence values worth quoting verbatim, e.g. GSC impressions or a lost prompt. */
function evidenceFacts(task: TaskDetail): Fact[] {
  const out: Fact[] = []
  for (const [key, raw] of Object.entries(task.evidence)) {
    if (raw === null || raw === undefined || typeof raw === 'object') continue
    const value = String(raw).trim()
    if (!value) continue
    out.push({ key, value, mono: typeof raw !== 'string' })
    if (out.length >= 4) break
  }
  return out
}

/**
 * The action's facts, as a key/value grid.
 *
 * Two columns of striped rows rather than a bulleted list, because these are
 * looked up rather than read: the eye goes to one key and stops. Keys are
 * monospace so they line up as a column of their own, the way an issue page
 * shows its tags.
 */
export function TaskHighlights({ task }: { task: TaskDetail }): JSX.Element {
  const source = sourceOf(task.source, task.findingCode)
  const page = task.affectedPages[0]

  // One flat list, split evenly below. Identity facts first, then provenance —
  // a fixed left/right assignment left one column a row short whenever a task
  // had no page, and the empty corner read as a rendering bug.
  const facts: Fact[] = [
    { key: 'finding', value: task.findingCode, mono: true },
    { key: 'pillar', value: task.pillar },
    { key: 'category', value: task.category },
    { key: 'execution', value: task.canAutoFix ? 'auto-fixable' : 'manual' },
    ...(source ? [{ key: 'source', value: source.label }] : []),
    ...(page
      ? [{ key: 'page', value: page.replace(/^https?:\/\//, ''), href: page, mono: true }]
      : []),
    ...evidenceFacts(task),
  ].filter(fact => fact.value)

  const mid = Math.ceil(facts.length / 2)
  const columns = [facts.slice(0, mid), facts.slice(mid)]

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-md border border-[var(--cat-border)] lg:grid-cols-2">
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
