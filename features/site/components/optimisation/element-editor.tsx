'use client'

import { useEffect, useState } from 'react'
import { Loader2, Sparkles, X, Check } from '@/features/site/components/icons'
import type { PreviewElement } from '@/features/site/lib/api/content-optimisation'

type Props = {
  element: PreviewElement
  applyDisabled: boolean
  applyDisabledHint?: string
  /** Label for the apply button — e.g. "Apply to live site" (CMS) or "Open PR" (GitHub). */
  applyLabel?: string
  isRewriting: boolean
  isApplying: boolean
  onClose: () => void
  onRewrite: (instruction: string) => Promise<string>
  onApply: (newText: string) => Promise<void>
}

export function ElementEditor({
  element,
  applyDisabled,
  applyDisabledHint,
  applyLabel = 'Apply to live site',
  isRewriting,
  isApplying,
  onClose,
  onRewrite,
  onApply,
}: Props) {
  // Reset draft when a new element is selected.
  const [draft, setDraft] = useState(element.text)
  const [instruction, setInstruction] = useState('')

  useEffect(() => {
    setDraft(element.text)
    setInstruction('')
  }, [element.id])

  async function handleAiRewrite() {
    const next = await onRewrite(instruction)
    if (next) setDraft(next)
  }

  const dirty = draft !== element.text

  return (
    <div className="border-border bg-background flex h-full flex-col border-l">
      <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="bg-primary/10 text-primary-ink rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            {element.tag}
          </span>
          <span className="text-foreground truncate text-xs font-semibold">Edit element</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 items-center justify-center rounded transition"
          aria-label="Close editor"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
            Text
          </label>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={Math.min(12, Math.max(4, Math.ceil(draft.length / 60)))}
            className="border-border bg-muted/15 text-foreground focus:border-primary/60 focus:bg-background w-full resize-y rounded-md border px-2.5 py-2 text-xs leading-relaxed outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
            Instruction (optional)
          </label>
          <input
            type="text"
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            placeholder="e.g. shorter, more specific, add brand name"
            className="border-border bg-muted/15 text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-background w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleAiRewrite}
          disabled={isRewriting || !element.text.trim()}
          className="border-border bg-muted/40 text-foreground hover:bg-muted flex h-8 items-center justify-center gap-1.5 rounded-md border text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRewriting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="text-primary-ink size-3.5" />
          )}
          Rewrite with AI
        </button>

        {element.text !== draft ? (
          <div className="border-border bg-muted/15 rounded-md border p-2">
            <p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-wide uppercase">
              Original
            </p>
            <p className="text-muted-foreground line-clamp-6 text-[11px] leading-relaxed whitespace-pre-wrap">
              {element.text}
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-border border-t p-3">
        {applyDisabled && applyDisabledHint ? (
          <p className="text-muted-foreground mb-2 text-[10px] leading-snug">{applyDisabledHint}</p>
        ) : null}
        <button
          type="button"
          onClick={() => onApply(draft)}
          disabled={!dirty || isApplying || applyDisabled}
          className="bg-primary-strong text-primary-foreground hover:bg-primary-strong/90 flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApplying ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          {applyLabel}
        </button>
      </div>
    </div>
  )
}
