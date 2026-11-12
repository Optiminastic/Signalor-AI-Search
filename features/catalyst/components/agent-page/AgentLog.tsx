'use client'

import { describeActivity, type ActivityLine } from '@/features/catalyst/agent-activity-log'
import { formatWhen } from '@/features/catalyst/agent-approvals'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import { useAgentActivity } from '@/hooks/useAgentActivity'
import type { ActivityEntry } from '@/lib/api/agent-mode-activity'

interface AgentLogProps {
  orgSlug: string
}

const DOT: Record<ActivityLine['tone'], string> = {
  neutral: 'var(--cat-ink-3)',
  success: GREEN,
  attention: YELLOW,
  danger: NEG,
}

const SHOWN = 30

function Line({ entry }: { entry: ActivityEntry }): JSX.Element {
  const line = describeActivity(entry)
  return (
    <li className="relative pl-4 text-[12.5px]">
      <span
        className="absolute top-[6px] left-0 h-1.5 w-1.5 rounded-full"
        style={{ background: DOT[line.tone] }}
        aria-hidden="true"
      />
      <span className="font-medium text-[var(--cat-ink)]">{line.title}</span>
      {line.detail && <span className="block text-[var(--cat-ink-2)]">{line.detail}</span>}
      <span className="block text-[11px] text-[var(--cat-ink-3)]">
        {formatWhen(entry.createdAt)}
      </span>
    </li>
  )
}

/** The agent's running log: every site it looked at, draft it wrote, and decision made. */
export function AgentLog({ orgSlug }: AgentLogProps): JSX.Element {
  const { entries, isLoading, error } = useAgentActivity(orgSlug)
  return (
    <section aria-label="Agent log" className="mt-6">
      <h3 className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Agent log
      </h3>
      {isLoading && <p className="mt-2 text-[12.5px] text-[var(--cat-ink-3)]">Loading…</p>}
      {error && <p className="mt-2 text-[12.5px] text-[var(--cat-ink-2)]">{error}</p>}
      {!isLoading && !error && entries.length === 0 && (
        <p className="mt-2 text-[12.5px] text-[var(--cat-ink-2)]">Nothing yet.</p>
      )}
      <ol className="mt-2 flex flex-col gap-2.5 border-l border-[var(--cat-border)] pl-3">
        {entries.slice(0, SHOWN).map(entry => (
          <Line key={entry.id} entry={entry} />
        ))}
      </ol>
    </section>
  )
}
