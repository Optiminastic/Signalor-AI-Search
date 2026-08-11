'use client'

import { useState, type ReactNode } from 'react'

import { ChevronDown } from '@/lib/icons'

interface TaskSectionProps {
  title: string
  /** Anchor target for the "Jump to" nav. */
  id?: string
  /** Optional right-aligned header content (a count, chip, or small action). */
  meta?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * A collapsible block, in the issue-page idiom: a chevron and a title sitting
 * directly on the page, content below a hairline.
 *
 * Flat rather than a bordered card on purpose — the page stacks five of these,
 * and five nested card borders inside a card inside a panel is what made
 * everything read at one visual weight. The rule and the heading carry the
 * structure instead.
 */
export function TaskSection({
  title,
  id,
  meta,
  defaultOpen = true,
  children,
}: TaskSectionProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section
      id={id}
      className="border-t border-[var(--cat-border)] pt-3 first:border-t-0 first:pt-0"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="group flex items-center gap-1.5 text-left"
        >
          <ChevronDown
            size={16}
            className={`text-[var(--cat-ink-3)] transition-transform ${open ? '' : '-rotate-90'}`}
          />
          <span className="text-[15px] font-semibold text-[var(--cat-ink)] group-hover:text-[var(--cat-ink-2)]">
            {title}
          </span>
        </button>
        {meta && <span className="shrink-0">{meta}</span>}
      </div>
      {open && <div className="mt-2.5 pl-[22px]">{children}</div>}
    </section>
  )
}
