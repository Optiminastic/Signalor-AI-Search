'use client'

import { useState, type KeyboardEvent } from 'react'

import type { TrackedKeyword } from '@/lib/api/agent-mode-rank-tracking'
import { X } from '@/lib/icons'

interface TrackedKeywordsProps {
  keywords: TrackedKeyword[]
  busy: boolean
  onAdd: (keyword: string) => void
  onRemove: (id: number) => void
}

const MAX_KEYWORDS = 15
const CHIP =
  'inline-flex items-center gap-1 rounded-full border border-[var(--cat-border)] px-2 py-0.5 text-[11.5px] text-[var(--cat-ink-2)]'
const INPUT =
  'h-[30px] min-w-0 flex-1 rounded-md border border-[var(--cat-border)] bg-transparent px-2 text-[12px] text-[var(--cat-ink)] outline-none focus:ring-2 focus:ring-[#e04a3d]/40'
const ADD_BUTTON =
  'rounded-md border border-[var(--cat-border)] px-2.5 text-[12px] text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)] disabled:opacity-50'

function KeywordChips({
  keywords,
  busy,
  onRemove,
}: Omit<TrackedKeywordsProps, 'onAdd'>): JSX.Element {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map(keyword => (
        <span key={keyword.id} className={CHIP}>
          {keyword.keyword}
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(keyword.id)}
            aria-label={`Stop tracking ${keyword.keyword}`}
            className="text-[var(--cat-ink-3)] hover:text-[var(--cat-ink)]"
          >
            <X size={11} strokeWidth={2.4} />
          </button>
        </span>
      ))}
    </div>
  )
}

interface AddKeywordProps {
  full: boolean
  busy: boolean
  onAdd: (keyword: string) => void
}

/** Not a <form>: this can sit inside the page's other forms, and Enter must only add the keyword. */
function AddKeyword({ full, busy, onAdd }: AddKeywordProps): JSX.Element {
  const [value, setValue] = useState('')
  function add(): void {
    if (!value.trim() || full) return
    onAdd(value.trim())
    setValue('')
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') return
    event.preventDefault()
    add()
  }
  return (
    <div className="flex gap-1.5">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={full}
        maxLength={120}
        placeholder={full ? 'Remove one to add another' : 'Add a keyword'}
        aria-label="Add a keyword to track"
        className={INPUT}
      />
      <button
        type="button"
        disabled={busy || full || !value.trim()}
        onClick={add}
        className={ADD_BUTTON}
      >
        Add
      </button>
    </div>
  )
}

/** The keywords checked every week. The agent picks them; the owner can add or remove. */
export function TrackedKeywords({
  keywords,
  busy,
  onAdd,
  onRemove,
}: TrackedKeywordsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Tracked keywords ({keywords.length}/{MAX_KEYWORDS})
      </p>
      <KeywordChips keywords={keywords} busy={busy} onRemove={onRemove} />
      <AddKeyword full={keywords.length >= MAX_KEYWORDS} busy={busy} onAdd={onAdd} />
    </div>
  )
}
