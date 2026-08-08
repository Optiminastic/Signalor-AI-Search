'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { ResponseText } from '@/features/catalyst/components/prompt-tracker/ResponseText'
import type { PromptEngineResult } from '@/features/catalyst/prompt-tracker-data'
import { formatTaskDate } from '@/features/catalyst/tasks-data'
import { useBrandTerms } from '@/hooks/useBrandTerms'
import { getPromptResult } from '@/lib/api/prompts'
import { Loader2, X } from '@/lib/icons'
import { queryKeys } from '@/lib/query-keys'

interface ResponseDialogProps {
  result: PromptEngineResult
  /** Slug + track id needed to fetch the FULL (uncapped) response on open. */
  slug: string
  trackId: number
  onClose: () => void
}

/** Explains the two highlight tints so the colours are not a guessing game. */
function HighlightLegend(): JSX.Element {
  return (
    <div className="flex items-center gap-3 text-[10px] text-[var(--cat-ink-3)]">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-[2px] bg-[rgba(47,190,126,0.45)]" />
        Site cited
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-[2px] bg-[rgba(224,74,61,0.3)]" />
        Brand mentioned
      </span>
    </div>
  )
}

function DialogHeader({
  result,
  onClose,
}: Pick<ResponseDialogProps, 'result' | 'onClose'>): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--cat-border)] p-4">
      <div className="flex items-center gap-2">
        <EngineLogo name={result.engineLabel} size={20} />
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--cat-ink)]">{result.engineLabel}</h2>
          {result.checkedAt && (
            <p className="text-[11px] text-[var(--cat-ink-3)]">
              Checked {formatTaskDate(result.checkedAt)}
            </p>
          )}
        </div>
      </div>
      <div className="ml-auto hidden sm:block">
        <HighlightLegend />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <X size={15} />
      </button>
    </div>
  )
}

/**
 * Full engine answer in a modal — matches the dashboard's existing modal shell.
 *
 * Rendered through a portal on purpose: the prompt row's `cat-rise` animation
 * applies a `transform`, which makes that ancestor the containing block for
 * `position: fixed` children. Without the portal the overlay anchors to the row
 * and gets clipped by its `overflow-hidden` instead of covering the viewport.
 */
function DialogBody({ result, slug, trackId }: Omit<ResponseDialogProps, 'onClose'>): JSX.Element {
  // The list payload caps response_text at 500 chars; fetch the full answer here.
  // Fall back to the capped snippet while it loads (and if the fetch fails).
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.catalyst.promptResult(slug, trackId, result.id),
    enabled: Boolean(slug),
    queryFn: () => getPromptResult(slug, trackId, result.id),
    staleTime: 5 * 60_000,
  })
  const terms = useBrandTerms(result.citations)
  const fullText = data?.response_text ?? result.snippet

  if (!fullText) {
    return (
      <p className="text-[12px] text-[var(--cat-ink-3)]">No answer text captured for this run.</p>
    )
  }
  return (
    <>
      <ResponseText text={fullText} terms={terms} />
      {isLoading && !data && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--cat-ink-3)]">
          <Loader2 size={12} className="animate-spin" />
          Loading full response…
        </p>
      )}
    </>
  )
}

function DialogPanel({ result, slug, trackId, onClose }: ResponseDialogProps): JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${result.engineLabel} full response`}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <DialogHeader result={result} onClose={onClose} />
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <DialogBody result={result} slug={slug} trackId={trackId} />
        </div>
      </div>
    </div>
  )
}

export function ResponseDialog({
  result,
  slug,
  trackId,
  onClose,
}: ResponseDialogProps): JSX.Element | null {
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

  return createPortal(
    <DialogPanel result={result} slug={slug} trackId={trackId} onClose={onClose} />,
    document.body,
  )
}
