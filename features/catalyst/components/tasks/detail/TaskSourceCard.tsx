'use client'

import { BrandFavicon } from '@/features/catalyst/components/competitors/BrandFavicon'
import {
  extractMetrics,
  sourceOf,
  type TaskMetric,
  type TaskSource,
} from '@/features/catalyst/task-source'
import type { TaskDetail } from '@/hooks/useTaskDetail'
import { ExternalLink, MessageSquare } from '@/lib/icons'

/** One measured number, e.g. "9,148 impressions" or "position 69.9". */
function MetricTile({ metric }: { metric: TaskMetric }): JSX.Element {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--cat-border)] bg-[var(--cat-hover)] px-2.5 py-1.5">
      <div className="truncate text-[15px] font-bold text-[var(--cat-ink)] tabular-nums">
        {metric.value}
      </div>
      <div className="truncate text-[10.5px] font-medium tracking-wide text-[var(--cat-ink-3)] uppercase">
        {metric.label}
      </div>
    </div>
  )
}

/** The buyer prompt a geo_signal task targets, quoted verbatim. */
function PromptQuote({ prompt }: { prompt: string }): JSX.Element {
  return (
    <blockquote className="flex items-start gap-2 rounded-lg border border-[var(--cat-border)] bg-[var(--cat-hover)] px-3 py-2">
      <MessageSquare size={13} className="mt-0.5 shrink-0 text-[var(--cat-ink-3)]" />
      <span className="text-[12.5px] leading-relaxed text-[var(--cat-ink-2)] italic">
        “{prompt}”
      </span>
    </blockquote>
  )
}

/** Pages the finding was detected on — where the fix actually lands. */
function AffectedPages({ pages }: { pages: string[] }): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      {pages.slice(0, 4).map(url => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex min-w-0 items-center gap-1.5 text-[12.5px] font-medium text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)]"
        >
          <ExternalLink size={12} className="shrink-0 text-[var(--cat-ink-3)]" />
          <span className="truncate underline decoration-[var(--cat-border)] underline-offset-2 group-hover:decoration-current">
            {url.replace(/^https?:\/\//, '')}
          </span>
        </a>
      ))}
      {pages.length > 4 && (
        <span className="text-[11.5px] text-[var(--cat-ink-3)]">
          +{pages.length - 4} more pages
        </span>
      )}
    </div>
  )
}

/**
 * Where this task came from and the measurement behind it.
 *
 * A task that just issues an instruction reads as an opinion; the same task
 * next to "Search Console: 9,148 impressions, 27 clicks, position 69.9" reads
 * as a fact with a fix. Everything here is real data off the source
 * recommendation — the source system, its measured numbers, the exact buyer
 * prompt that was lost, and the pages the finding sits on. Renders nothing
 * when a task genuinely has no provenance rather than inventing any.
 */
function SourceHeader({ source }: { source: TaskSource }): JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <BrandFavicon domain={source.domain} name={source.label} color="#e04a3d" size={20} />
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-[var(--cat-ink)]">{source.label}</div>
        <div className="truncate text-[11.5px] text-[var(--cat-ink-3)]">{source.detail}</div>
      </div>
      <span className="ml-auto shrink-0 rounded-full bg-[var(--cat-hover)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-[var(--cat-ink-2)] uppercase">
        Measured
      </span>
    </div>
  )
}

function EvidenceBody({
  metrics,
  prompt,
  pages,
}: {
  metrics: TaskMetric[]
  prompt: string
  pages: string[]
}): JSX.Element {
  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {metrics.slice(0, 4).map(m => (
            <MetricTile key={m.label} metric={m} />
          ))}
        </div>
      )}
      {prompt && <PromptQuote prompt={prompt} />}
      {pages.length > 0 && <AffectedPages pages={pages} />}
    </div>
  )
}

export function TaskSourceCard({ task }: { task: TaskDetail }): JSX.Element | null {
  const source = sourceOf(task.source)
  const metrics = extractMetrics(task)
  const prompt = typeof task.evidence.prompt === 'string' ? task.evidence.prompt.trim() : ''
  const hasBody = metrics.length > 0 || Boolean(prompt) || task.affectedPages.length > 0
  if (!source && !hasBody) return null

  return (
    <div className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3">
      {source && <SourceHeader source={source} />}
      {hasBody && <EvidenceBody metrics={metrics} prompt={prompt} pages={task.affectedPages} />}
    </div>
  )
}
