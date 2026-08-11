'use client'

import { useState, type ReactNode } from 'react'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { TaskAutoFixPanel } from '@/features/catalyst/components/tasks/detail/TaskAutoFixPanel'
import { formatTaskDate } from '@/features/catalyst/tasks-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { GEO_PILLARS, usePillars } from '@/hooks/usePillars'
import type { TaskAutoFix } from '@/hooks/useTaskAutoFix'
import type { TaskDetail } from '@/hooks/useTaskDetail'
import { BadgeCheck, ChevronDown, ExternalLink } from '@/lib/icons'

/** A sidebar block: chevron + label, content in a bordered inset card below —
 *  the issue-page idiom, where the heading floats and the body is boxed. The
 *  timeline above stays flat on purpose; it is a pair of facts, not a section. */
function Block({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}): JSX.Element {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="border-t border-[var(--cat-border)] pt-3">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 text-left"
      >
        <ChevronDown
          size={15}
          className={`text-[var(--cat-ink-3)] transition-transform ${open ? '' : '-rotate-90'}`}
        />
        <span className="text-[14px] font-semibold text-[var(--cat-ink)]">{title}</span>
      </button>
      {open && (
        <div className="cat-card-edge mt-2.5 rounded-xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3">
          {children}
        </div>
      )}
    </section>
  )
}

/** When it was found and when it was last proven fixed. */
function Timeline({ task }: { task: TaskDetail }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5 text-[13px]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[var(--cat-ink-2)]">Identified</span>
        <span className="font-medium text-[var(--cat-ink)]">
          {task.createdAt ? formatTaskDate(task.createdAt) : '—'}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[var(--cat-ink-2)]">Verified</span>
        <span className="flex items-center gap-1.5 font-medium text-[var(--cat-ink)]">
          {task.verifiedAt ? (
            <>
              <BadgeCheck size={13} className="text-[#1e8a5c]" />
              {formatTaskDate(task.verifiedAt)}
            </>
          ) : (
            <span className="text-[var(--cat-ink-3)]">Not yet</span>
          )}
        </span>
      </div>
    </div>
  )
}

/** The pillar this action moves, and where it stands today. Renders its own
 *  Block so a task with no scored pillar drops the section entirely instead of
 *  leaving an empty card in the rail. */
function ScoreImpactBlock({ pillar }: { pillar: string }): JSX.Element | null {
  const { slug } = useActiveProject()
  const { data } = usePillars(slug)
  const label = GEO_PILLARS.find(p => String(p.key) === `${pillar}_score`)?.label
  const score = data?.pillars.find(p => p.label === label)?.score
  if (!label || score === undefined) return null
  return (
    <Block title="Score impact">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-[var(--cat-ink-2)]">{label}</span>
        <span className="font-medium text-[var(--cat-ink)] tabular-nums">{score}/100</span>
      </div>
      <div className="mt-2">
        <TickBar value={score} ticks={20} showValue={false} />
      </div>
    </Block>
  )
}

/** Where this action points on the live web. */
function Links({ task }: { task: TaskDetail }): JSX.Element {
  if (task.affectedPages.length === 0) {
    return (
      <p className="text-[12.5px] text-[var(--cat-ink-3)]">No page recorded for this finding.</p>
    )
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {task.affectedPages.slice(0, 5).map(url => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full min-w-0 items-center gap-1.5 text-[12.5px] text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]"
          >
            <ExternalLink size={12} className="shrink-0 text-[var(--cat-ink-3)]" />
            <span className="truncate underline decoration-[var(--cat-border)] underline-offset-2">
              {url.replace(/^https?:\/\//, '')}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/**
 * The right rail: state, the agent, links, and history.
 *
 * Ordered by how often it is needed rather than by how much of it there is —
 * the auto-fix agent sits high because it is the thing that acts, and the
 * verification history sits last because it is only read after the fact.
 */
export function TaskSidebar({ task, fix }: { task: TaskDetail; fix: TaskAutoFix }): JSX.Element {
  return (
    <aside className="flex flex-col gap-3">
      <Timeline task={task} />
      {/* Gated here, not just inside the panel: a null panel would still leave
          the block's empty bordered card in the rail. */}
      {fix.visible && (
        <Block title="Auto-fix">
          <TaskAutoFixPanel fix={fix} />
        </Block>
      )}
      <Block title="Affected pages">
        <Links task={task} />
      </Block>
      <ScoreImpactBlock pillar={task.pillar} />
      {task.verificationMessage && (
        <Block title="Activity" defaultOpen={false}>
          <p className="text-[12.5px] leading-relaxed text-[var(--cat-ink-2)]">
            {task.verificationMessage}
          </p>
        </Block>
      )}
    </aside>
  )
}
