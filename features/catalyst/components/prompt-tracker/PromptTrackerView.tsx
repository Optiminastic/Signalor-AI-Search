'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { DataState } from '@/features/catalyst/components/DataState'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { FaqBuilderCard } from '@/features/catalyst/components/prompt-tracker/FaqBuilderCard'
import { NewPromptForm } from '@/features/catalyst/components/prompt-tracker/NewPromptForm'
import {
  ALL_DATES,
  matchesDateFilter,
  PromptDateFilter,
  type DateFilter,
} from '@/features/catalyst/components/prompt-tracker/PromptDateFilter'
import { PromptDetailSheet } from '@/features/catalyst/components/prompt-tracker/PromptDetailSheet'
import { PromptTable } from '@/features/catalyst/components/prompt-tracker/PromptTable'
import {
  matchesTagFilter,
  NO_TAGS,
  PromptTagFilter,
  type TagFilter,
} from '@/features/catalyst/components/prompt-tracker/PromptTagFilter'
import { PromptTaxonomyBars } from '@/features/catalyst/components/prompt-tracker/PromptTaxonomyBars'
import { PromptToolbar } from '@/features/catalyst/components/prompt-tracker/PromptToolbar'
import { PROMPT_PARAM } from '@/features/catalyst/constants'
import type { TrackedPrompt } from '@/features/catalyst/prompt-tracker-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { usePromptMutations } from '@/hooks/usePromptMutations'
import { usePrompts } from '@/hooks/usePrompts'
import { Loader2, Plus } from '@/lib/icons'

/** Most recent engine-check timestamp across a prompt's results (0 if none yet). */
function latestCheck(prompt: TrackedPrompt): number {
  return prompt.results.reduce((max, r) => {
    const t = r.checkedAt ? new Date(r.checkedAt).getTime() : 0
    return t > max ? t : max
  }, 0)
}

/** Keep prompts whose latest check passes the date filter (plus not-yet-checked ones). */
function filterByDate(prompts: TrackedPrompt[], filter: DateFilter): TrackedPrompt[] {
  return prompts.filter(p => {
    const latest = latestCheck(p)
    return latest === 0 || matchesDateFilter(latest, filter)
  })
}

interface HeaderProps {
  onNewPrompt: () => void
  filter: DateFilter
  onFilterChange: (filter: DateFilter) => void
}

function TrackerHeader({ onNewPrompt, filter, onFilterChange }: HeaderProps): JSX.Element {
  return (
    // relative z-40 keeps the date filter's popover above the stat cards below,
    // which sit in their own transformed (cat-stagger) stacking context.
    <div className="cat-rise relative z-40 mb-4 flex flex-wrap items-center gap-3">
      <div className="min-w-0">
        <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
          Prompt Tracker
        </h1>
        <p className="text-[13px] text-[var(--cat-ink-2)]">
          Watch how AI engines answer the prompts that matter to your category
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <PromptDateFilter filter={filter} onChange={onFilterChange} />
        <PrimaryButton icon={Plus} onClick={onNewPrompt}>
          New prompt
        </PrimaryButton>
      </div>
    </div>
  )
}

interface ListProps {
  prompts: TrackedPrompt[]
  slug: string
  busyId: number | null
  onRecheck: (trackId: number) => void
  onRemove: (trackId: number) => void
}

/**
 * Open the prompt named by `?prompt=<id>`, once its row has loaded.
 *
 * Prompts arrive asynchronously, so this cannot run only on mount — the list is
 * empty then. It fires when the id first resolves to a real prompt and then
 * stays out of the way, so closing the sheet doesn't immediately reopen it.
 */
function useDeepLinkedPrompt(
  prompts: TrackedPrompt[],
  onOpen: (prompt: TrackedPrompt) => void,
): void {
  const params = useSearchParams()
  const wanted = Number(params.get(PROMPT_PARAM) ?? '')
  const openedRef = useRef<number | null>(null)

  useEffect(() => {
    if (!wanted || openedRef.current === wanted) return
    const match = prompts.find(p => p.id === wanted)
    if (!match) return
    openedRef.current = wanted
    onOpen(match)
  }, [wanted, prompts, onOpen])
}

function PromptList({ prompts, slug, busyId, onRecheck, onRemove }: ListProps): JSX.Element {
  const [open, setOpen] = useState<TrackedPrompt | null>(null)
  useDeepLinkedPrompt(prompts, setOpen)

  if (prompts.length === 0) {
    return (
      <p className="cat-rise rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-4 py-6 text-center text-[13px] text-[var(--cat-ink-2)]">
        No prompts match the current filters. Clear a tag or widen the date range to see more.
      </p>
    )
  }
  return (
    <>
      <PromptTable
        prompts={prompts}
        busyId={busyId}
        onRecheck={onRecheck}
        onRemove={onRemove}
        onOpen={setOpen}
      />
      {open && <PromptDetailSheet item={open} slug={slug} onClose={() => setOpen(null)} />}
    </>
  )
}

interface BodyProps extends ListProps {
  allCount: number
  tags: TagFilter
  onTagsChange: (next: TagFilter) => void
}

function PromptBody({
  prompts,
  allCount,
  tags,
  onTagsChange,
  slug,
  busyId,
  onRecheck,
  onRemove,
}: BodyProps): JSX.Element {
  const hasPending = prompts.some(p => p.results.length === 0)
  return (
    <>
      <PromptTaxonomyBars prompts={prompts} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <PromptToolbar shown={prompts.length} total={allCount} />
        <PromptTagFilter value={tags} onChange={onTagsChange} />
      </div>
      {/* <PromptInsights prompts={prompts} /> */}
      {hasPending && (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] text-[var(--cat-ink-3)]">
          <Loader2 size={12} className="animate-spin" />
          Some prompts are still being answered. This list refreshes automatically.
        </p>
      )}
      <PromptList
        prompts={prompts}
        slug={slug}
        busyId={busyId}
        onRecheck={onRecheck}
        onRemove={onRemove}
      />
      {slug && allCount > 0 && <FaqBuilderCard slug={slug} />}
    </>
  )
}

interface PromptFilters {
  date: DateFilter
  setDate: (next: DateFilter) => void
  tags: TagFilter
  setTags: (next: TagFilter) => void
  filtered: TrackedPrompt[]
}

/** Date range + taxonomy tags, the two axes the list can be narrowed by. */
function usePromptFilters(prompts: TrackedPrompt[] | undefined): PromptFilters {
  const [date, setDate] = useState<DateFilter>(ALL_DATES)
  const [tags, setTags] = useState<TagFilter>(NO_TAGS)
  const filtered = useMemo(
    () => filterByDate(prompts ?? [], date).filter(p => matchesTagFilter(p, tags)),
    [prompts, date, tags],
  )
  return { date, setDate, tags, setTags, filtered }
}

export function PromptTrackerView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = usePrompts(slug)
  const { add, recheck, remove, isAdding, busyId } = usePromptMutations(slug)
  const [composing, setComposing] = useState(false)
  const { date, setDate, tags, setTags, filtered } = usePromptFilters(data?.prompts)

  return (
    <div className="w-full">
      <TrackerHeader
        onNewPrompt={() => setComposing(c => !c)}
        filter={date}
        onFilterChange={setDate}
      />
      {composing && (
        <NewPromptForm isAdding={isAdding} onSubmit={add} onClose={() => setComposing(false)} />
      )}
      <DataState
        isLoading={projectLoading || isLoading}
        isError={isError}
        isEmpty={!slug || !data || data.prompts.length === 0}
        emptyTitle="No prompts tracked yet"
        emptyHint="Track a prompt to see how ChatGPT, Gemini, Perplexity and the rest answer it."
      >
        {data && (
          <PromptBody
            prompts={filtered}
            allCount={data.prompts.length}
            tags={tags}
            onTagsChange={setTags}
            slug={slug ?? ''}
            busyId={busyId}
            onRecheck={recheck}
            onRemove={remove}
          />
        )}
      </DataState>
    </div>
  )
}
