'use client'

import { PromptTag } from '@/features/catalyst/components/prompt-tracker/PromptChips'
import type { TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'

/** Selected tag values. Empty means "show everything". */
export type TagFilter = string[]

export const NO_TAGS: TagFilter = []

// The taxonomy lives on two fields (prompt_tracker.py: intent, prompt_type), but
// they read as one flat set of tags here. The axis is only used for matching.
const INTENTS = ['informational', 'transactional', 'brand']
const TYPES = ['organic', 'branded', 'competitive']
const TAGS = [...INTENTS, ...TYPES]

/** A prompt matches if it carries every selected tag. */
export function matchesTagFilter(prompt: TrackedPrompt, filter: TagFilter): boolean {
  if (filter.length === 0) return true
  const intent = (prompt.intent || '').toLowerCase()
  const type = (prompt.promptType || '').toLowerCase()
  return filter.every(tag => tag === intent || tag === type)
}

interface PromptTagFilterProps {
  value: TagFilter
  onChange: (next: TagFilter) => void
}

/** Filter the prompt list by tag, using the same chips the rows show. */
export function PromptTagFilter({ value, onChange }: PromptTagFilterProps): JSX.Element {
  const toggle = (tag: string): void =>
    onChange(value.includes(tag) ? value.filter(v => v !== tag) : [...value, tag])

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          aria-pressed={value.includes(tag)}
          // Unselected chips dim rather than change colour, so the palette still
          // teaches which tag is which while filtering.
          className={`rounded-full transition-opacity ${
            value.includes(tag) ? 'opacity-100' : 'opacity-40 hover:opacity-75'
          }`}
        >
          <PromptTag value={tag} />
        </button>
      ))}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange(NO_TAGS)}
          className="ml-1 text-[11px] font-medium text-[var(--cat-ink-3)] underline underline-offset-2 transition-colors hover:text-[var(--cat-ink)]"
        >
          Clear
        </button>
      )}
    </div>
  )
}
