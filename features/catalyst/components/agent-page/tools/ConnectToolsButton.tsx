'use client'

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react'

import { ConnectToolsPanel } from '@/features/catalyst/components/agent-page/tools/ConnectToolsPanel'
import { Plus, X } from '@/lib/icons'

interface ConnectToolsButtonProps {
  orgSlug: string
}

const TRIGGER =
  'grid h-8 w-8 place-items-center rounded-md border border-[var(--cat-border)] text-[var(--cat-ink-2)] hover:bg-[var(--cat-hover)]'
const POPOVER =
  'absolute bottom-10 left-0 z-30 w-[min(360px,calc(100vw-48px))] rounded-xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3 shadow-[0_12px_32px_rgba(16,24,40,.14)]'

/** Close on Escape or a click outside the popover. */
function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return
    function onPointer(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) close()
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open, close])
}

/** The "+" next to the message box: connect Hunter or Apollo for this brand. */
export function ConnectToolsButton({ orgSlug }: ConnectToolsButtonProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [])
  useDismiss(wrapper, open, close)
  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-label={open ? 'Close connected tools' : 'Connect tools (Hunter, Apollo)'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
        className={TRIGGER}
      >
        {open ? <X size={15} strokeWidth={2.2} /> : <Plus size={16} strokeWidth={2.2} />}
      </button>
      {open && (
        <div id={panelId} role="dialog" aria-label="Connect tools" className={POPOVER}>
          <p className="mb-2 text-[13px] font-semibold text-[var(--cat-ink)]">Connect tools</p>
          <ConnectToolsPanel orgSlug={orgSlug} />
        </div>
      )}
    </div>
  )
}
