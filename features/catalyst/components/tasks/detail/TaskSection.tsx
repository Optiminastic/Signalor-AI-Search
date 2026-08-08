'use client'

import { useState, type ReactNode } from 'react'

import { ChevronDown } from '@/lib/icons'

interface TaskSectionProps {
  title: string
  /** Optional right-aligned header content (a count, chip, or small action). */
  meta?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

/** A collapsible card section (Sentry-issue style): hairline card, a header that
 *  toggles a chevron, and content that expands below a divider. */
export function TaskSection({
  title,
  meta,
  defaultOpen = true,
  children,
}: TaskSectionProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="cat-card-edge flex flex-col rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--cat-hover)]"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--cat-ink)]">
          <ChevronDown
            size={15}
            className={`text-[var(--cat-ink-3)] transition-transform ${open ? '' : '-rotate-90'}`}
          />
          {title}
        </span>
        {meta && <span className="shrink-0">{meta}</span>}
      </button>
      {open && <div className="border-t border-[var(--cat-border)] px-3 py-3">{children}</div>}
    </div>
  )
}
