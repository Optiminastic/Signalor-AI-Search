'use client'

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react'

import { useToolsPanelOpen } from '@/features/catalyst/components/agent-page/AgentUiContext'
import { useBufferReturn } from '@/features/catalyst/components/agent-page/social/useBufferReturn'
import { ConnectToolsPanel } from '@/features/catalyst/components/agent-page/tools/ConnectToolsPanel'
import {
  readFinderReturn,
  RETURN_PARAMS,
  type FinderReturn,
} from '@/features/catalyst/components/agent-page/tools/finder-return'
import { Plus, X } from '@/lib/icons'

interface ConnectToolsButtonProps {
  orgSlug: string
}

const TRIGGER =
  'grid h-8 w-8 place-items-center rounded-md border border-[var(--cat-border)] text-[var(--cat-ink-2)] hover:bg-[var(--cat-hover)]'
const POPOVER =
  'absolute bottom-10 left-0 z-30 max-h-[calc(100dvh-140px)] w-[min(360px,calc(100vw-48px))] overflow-y-auto rounded-xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3 shadow-[0_12px_32px_rgba(16,24,40,.14)]'

const NOTICE_OK = 'mb-2 rounded-md bg-emerald-600/10 px-2.5 py-1.5 text-[12px] text-emerald-700'
const NOTICE_ERROR = 'mb-2 rounded-md bg-[#e04a3d]/10 px-2.5 py-1.5 text-[12px] text-[#e04a3d]'

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

/**
 * Back from the provider's login page: read the outcome once, then drop it from
 * the URL so a refresh doesn't repeat the message.
 */
function useFinderReturn(onReturn: (outcome: FinderReturn) => void): void {
  useEffect(() => {
    const outcome = readFinderReturn(window.location.search)
    if (!outcome) return
    onReturn(outcome)
    const url = new URL(window.location.href)
    RETURN_PARAMS.forEach(name => url.searchParams.delete(name))
    window.history.replaceState(window.history.state, '', url.toString())
  }, [onReturn])
}

/**
 * Back from a tool's own sign-in page (Hunter, Apollo, Buffer or Google): open the
 * panel and say how it went.
 */
function useSignInNotice(setOpen: (open: boolean) => void): FinderReturn | null {
  const [notice, setNotice] = useState<FinderReturn | null>(null)
  const showReturn = useCallback(
    (outcome: FinderReturn) => {
      setNotice(outcome)
      setOpen(true)
    },
    [setOpen],
  )
  useFinderReturn(showReturn)
  useBufferReturn(showReturn, true)
  return notice
}

/** The "+" next to the message box: connect Gmail, Hunter, Apollo or Buffer for this brand. */
export function ConnectToolsButton({ orgSlug }: ConnectToolsButtonProps): JSX.Element {
  const [open, setOpen] = useToolsPanelOpen()
  const wrapper = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [setOpen])
  const notice = useSignInNotice(setOpen)
  useDismiss(wrapper, open, close)
  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-label={
          open
            ? 'Close connected tools'
            : 'Connect tools (Gmail, Hunter, Apollo, keyword data, Buffer)'
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className={TRIGGER}
      >
        {open ? <X size={15} strokeWidth={2.2} /> : <Plus size={16} strokeWidth={2.2} />}
      </button>
      {open && (
        <div id={panelId} role="dialog" aria-label="Connect tools" className={POPOVER}>
          <p className="mb-2 text-[13px] font-semibold text-[var(--cat-ink)]">Connect tools</p>
          {notice && (
            <p role="status" className={notice.ok ? NOTICE_OK : NOTICE_ERROR}>
              {notice.message}
            </p>
          )}
          <ConnectToolsPanel orgSlug={orgSlug} />
        </div>
      )}
    </div>
  )
}
