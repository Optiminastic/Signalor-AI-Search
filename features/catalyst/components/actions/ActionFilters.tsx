'use client'

import { TransitionLink } from '@/components/TransitionLink'
import { BRAND, BRAND_SOFT, BRAND_STRONG } from '@/features/catalyst/constants'

export type ActionFilter = 'today' | 'backlog' | 'done' | 'all'

export interface ActionFilterCount {
  key: ActionFilter
  label: string
  count: number | null
}

/** One filter chip. Extracted so ActionFilters stays inside the 40-line cap. */
function FilterChip({
  item,
  on,
  href,
}: {
  item: ActionFilterCount
  on: boolean
  href: string
}): JSX.Element {
  return (
    <TransitionLink
      href={href}
      aria-current={on ? 'page' : undefined}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors"
      style={on ? { background: BRAND_SOFT, color: BRAND_STRONG } : { color: 'var(--cat-ink-2)' }}
    >
      {item.label}
      {item.count !== null && (
        <span
          className="grid h-[18px] min-w-[18px] place-items-center rounded-sm px-1 text-[10px] font-semibold tabular-nums"
          style={
            on
              ? { background: BRAND, color: '#fff' }
              : { background: 'var(--cat-track)', color: 'var(--cat-ink-2)' }
          }
        >
          {item.count}
        </span>
      )}
    </TransitionLink>
  )
}

/**
 * The single navigation control for Actions.
 *
 * Replaces the old "Today's Plan" / "All actions" tab pair. Those were never two
 * places — they were one list under two filters, which is why the plan tab had
 * to print "Backlog 13" for a backlog that lived on the other tab. Counts are
 * the navigation now: the number you read is the thing you click.
 *
 * Rendered as links, not buttons, so a filtered view stays shareable and the
 * back button behaves.
 */
export function ActionFilters({
  current,
  counts,
  basePath,
}: {
  current: ActionFilter
  counts: ActionFilterCount[]
  basePath: string
}): JSX.Element {
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--cat-border)] pb-2">
      {counts.map(item => (
        <FilterChip
          key={item.key}
          item={item}
          on={item.key === current}
          href={`${basePath}?view=${item.key}`}
        />
      ))}
    </div>
  )
}
