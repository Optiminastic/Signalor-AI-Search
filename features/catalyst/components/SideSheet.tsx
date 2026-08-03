'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { X } from '@/lib/icons'

export interface SideSheetProps {
  /** Accessible name for the dialog. */
  label: string
  /** Rendered in the pinned header, left of the close button. */
  header: ReactNode
  children: ReactNode
  onClose: () => void
}

function SheetPanel({ label, header, children, onClose }: SideSheetProps): JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="cat-scrim fixed inset-0 z-50 bg-black/40"
      onClick={onClose}
    >
      <aside
        className="cat-sheet absolute inset-y-0 right-0 flex w-[min(1280px,94vw)] flex-col border-l border-[var(--cat-border)] bg-[var(--cat-content)] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--cat-border)] bg-[var(--cat-card)] p-4">
          <div className="min-w-0 flex-1">{header}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
          >
            <X size={15} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  )
}

/**
 * Detail panel that slides in from the right edge, over a scrim.
 *
 * Rendered through a portal on purpose: `cat-rise` / `cat-stagger` apply a
 * `transform`, which makes those ancestors the containing block for
 * `position: fixed` children — without the portal the sheet would anchor to the
 * row that opened it and get clipped instead of covering the viewport.
 */
export function SideSheet(props: SideSheetProps): JSX.Element | null {
  const { onClose } = props

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  // Only ever rendered from a click handler, so this is a pure SSR guard.
  if (typeof document === 'undefined') return null

  return createPortal(<SheetPanel {...props} />, document.body)
}
