import type { ReactNode } from 'react'

/**
 * One line in the live-visitors popover: mark, label, optional sublabel, count.
 *
 * Shared by all three sections so a country, an AI referral and a crawler hit
 * all sit on the same grid — the sections differ in what they mean, not in how
 * they are read.
 */
interface LiveRowProps {
  /** Flag, engine logo, or a plain dot. */
  mark: ReactNode
  label: string
  /** Path or channel — the "why", shown muted under nothing, inline after the label. */
  sublabel?: string
  value: string | number
  /** Right-aligned muted text instead of a count (e.g. "2m ago"). */
  meta?: string
}

export function LiveRow({ mark, label, sublabel, value, meta }: LiveRowProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded-sm">
        {mark}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--cat-ink)]">
        {label}
        {sublabel && <span className="ml-1.5 text-[11px] text-[var(--cat-ink-3)]">{sublabel}</span>}
      </span>
      {meta && <span className="shrink-0 text-[10.5px] text-[var(--cat-ink-3)]">{meta}</span>}
      <span className="w-8 shrink-0 text-right text-[12.5px] font-semibold text-[var(--cat-ink)]">
        {value}
      </span>
    </div>
  )
}
