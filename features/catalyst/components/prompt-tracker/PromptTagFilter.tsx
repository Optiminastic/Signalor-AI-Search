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

/**
 * OR within an axis, AND across the two.
 *
 * A prompt has exactly one intent and one type, so requiring *every* selected
 * tag to match made any two same-axis selections (e.g. informational +
 * transactional) unsatisfiable: the list silently emptied with nothing to
 * explain it. Selecting two intents now reads as "either of these".
 */
export function matchesTagFilter(prompt: TrackedPrompt, filter: TagFilter): boolean {
  if (filter.length === 0) return true
  const intent = (prompt.intent || '').toLowerCase()
  const type = (prompt.promptType || '').toLowerCase()
  const wantedIntents = filter.filter(tag => INTENTS.includes(tag))
  const wantedTypes = filter.filter(tag => TYPES.includes(tag))
  if (wantedIntents.length > 0 && !wantedIntents.includes(intent)) return false
  if (wantedTypes.length > 0 && !wantedTypes.includes(type)) return false
  return true
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
