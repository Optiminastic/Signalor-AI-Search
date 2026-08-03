'use client'

import { TAG_COLOR } from '@/features/catalyst/components/prompt-tracker/PromptChips'
import type { TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'

interface Slice {
  value: string
  count: number
}

/** Counts per taxonomy value, ordered biggest first, blanks dropped. */
function tally(prompts: TrackedPrompt[], pick: (p: TrackedPrompt) => string): Slice[] {
  const counts = new Map<string, number>()
  for (const p of prompts) {
    const value = (pick(p) || '').toLowerCase()
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}

function Bar({ title, slices }: { title: string; slices: Slice[] }): JSX.Element {
  const total = slices.reduce((sum, s) => sum + s.count, 0)
  return (
    <div className="flex-1 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[13px] font-semibold text-[var(--cat-ink)]">{title}</span>
        <span className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
          {slices.map(s => (
            <span key={s.value} className="flex items-center gap-1.5 text-[12px]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: TAG_COLOR(s.value) }}
              />
              <span className="font-semibold text-[var(--cat-ink)] tabular-nums">{s.count}</span>
              <span className="text-[var(--cat-ink-3)] capitalize">{s.value}</span>
            </span>
          ))}
        </span>
      </div>
      <div className="mt-2.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
        {slices.map(s => (
          <span
            key={s.value}
            className="h-full"
            style={{ width: `${(s.count / total) * 100}%`, backgroundColor: TAG_COLOR(s.value) }}
          />
        ))}
      </div>
    </div>
  )
}

/** Composition of the tracked set, split by prompt type and by intent. */
export function PromptTaxonomyBars({ prompts }: { prompts: TrackedPrompt[] }): JSX.Element | null {
  const types = tally(prompts, p => p.promptType)
  const intents = tally(prompts, p => p.intent)
  if (types.length === 0 && intents.length === 0) return null
  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row">
      {types.length > 0 && <Bar title="Types" slices={types} />}
      {intents.length > 0 && <Bar title="Intents" slices={intents} />}
    </div>
  )
}
