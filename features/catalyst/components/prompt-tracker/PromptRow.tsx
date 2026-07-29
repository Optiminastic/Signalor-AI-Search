'use client'

import { useState } from 'react'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { PromptResultsPanel } from '@/features/catalyst/components/prompt-tracker/PromptResultsPanel'
import { AnswerBlockPanel } from '@/features/catalyst/components/prompts/AnswerBlockPanel'
import type { TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'
import { scoreColor } from '@/features/catalyst/visibility-data'
import { ChevronDown, Loader2, RefreshCw, Trash2 } from '@/lib/icons'

export interface PromptRowProps {
  item: TrackedPrompt
  slug: string
  busy: boolean
  onRecheck: (trackId: number) => void
  onRemove: (trackId: number) => void
}

function MetaChip({ children }: { children: string }): JSX.Element {
  return (
    <span className="rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--cat-ink-3)] capitalize">
      {children}
    </span>
  )
}

function CitedChip({ cited }: { cited: boolean }): JSX.Element {
  return cited ? (
    <span className="rounded-sm bg-[rgba(47,190,126,0.12)] px-1.5 py-0.5 text-[10px] font-medium text-[#2FBE7E]">
      Cited
    </span>
  ) : (
    <span className="rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--cat-ink-3)]">
      Not cited
    </span>
  )
}

function EngineLogos({ item }: { item: TrackedPrompt }): JSX.Element {
  const engines = [...new Set(item.results.map(r => r.engine))]
  if (engines.length === 0) {
    return (
      <span className="hidden items-center gap-1.5 text-[11px] text-[var(--cat-ink-3)] sm:flex">
        <Loader2 size={12} className="animate-spin" />
        Answering…
      </span>
    )
  }
  return (
    <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
      {engines.map(engine => (
        <EngineLogo key={engine} name={engine} size={24} />
      ))}
    </div>
  )
}

function RowActions({ item, busy, onRecheck, onRemove }: PromptRowProps): JSX.Element {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="flex shrink-0 items-center gap-1" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        title="Recheck across engines"
        disabled={busy}
        onClick={() => onRecheck(item.id)}
        className="grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)] disabled:opacity-50"
      >
        <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
      </button>
      {confirming ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(item.id)}
          onBlur={() => setConfirming(false)}
          className="h-7 rounded-md bg-[#FDECEC] px-2 text-[11px] font-semibold text-[#E5484D] disabled:opacity-50"
        >
          Remove?
        </button>
      ) : (
        <button
          type="button"
          title="Stop tracking this prompt"
          disabled={busy}
          onClick={() => setConfirming(true)}
          className="grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[#E5484D] disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

function RowMain({ item }: { item: TrackedPrompt }): JSX.Element {
  return (
    <>
      <span
        className="w-8 shrink-0 text-center text-[15px] font-semibold tabular-nums"
        style={{ color: scoreColor(item.score) }}
      >
        {item.score}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[var(--cat-ink)]">{item.prompt}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <TickBar value={item.score} ticks={16} showValue={false} />
          <CitedChip cited={item.cited} />
          {item.intent && <MetaChip>{item.intent}</MetaChip>}
          {item.promptType && <MetaChip>{item.promptType}</MetaChip>}
        </div>
      </div>
    </>
  )
}

function RowNumbers({ item }: { item: TrackedPrompt }): JSX.Element {
  return (
    <>
      <span className="hidden w-14 shrink-0 text-right text-[12px] text-[var(--cat-ink-2)] tabular-nums md:inline">
        {item.visibility}%<span className="block text-[10px] text-[var(--cat-ink-3)]">vis</span>
      </span>
      <span className="hidden w-12 shrink-0 text-right text-[12px] text-[var(--cat-ink-2)] tabular-nums lg:inline">
        {item.runs}
        <span className="block text-[10px] text-[var(--cat-ink-3)]">runs</span>
      </span>
    </>
  )
}

/** One tracked prompt. The header row toggles the per-engine answers panel. */
export function PromptRow(props: PromptRowProps): JSX.Element {
  const { item, slug } = props
  const [open, setOpen] = useState(false)
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o)
        }}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[var(--cat-hover)]"
      >
        <RowMain item={item} />
        <RowNumbers item={item} />
        <EngineLogos item={item} />
        <RowActions {...props} />
        <ChevronDown
          size={15}
          className={`shrink-0 text-[var(--cat-ink-3)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <PromptResultsPanel results={item.results} slug={slug} trackId={item.id} />
          {/* Drafting is a billed call, so it only runs when the row is open
              and the user asks for it. */}
          <div className="px-4 pb-3.5">
            <AnswerBlockPanel slug={slug} trackId={item.id} promptText={item.prompt} />
          </div>
        </div>
      </div>
    </div>
  )
}
