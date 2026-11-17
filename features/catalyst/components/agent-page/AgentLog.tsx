'use client'

import { useState } from 'react'

import { HIDDEN_ACTIONS } from '@/features/catalyst/agent-activity-findings'
import { describeActivity, type ActivityLine } from '@/features/catalyst/agent-activity-log'
import { formatWhen } from '@/features/catalyst/agent-approvals'
import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import { useAgentActivity } from '@/hooks/useAgentActivity'
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
  type ActivityEntry,
} from '@/lib/api/agent-mode-activity'

interface AgentLogProps {
  orgSlug: string
}

const DOT: Record<ActivityLine['tone'], string> = {
  neutral: 'var(--cat-ink-3)',
  success: GREEN,
  attention: YELLOW,
  danger: NEG,
}

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  all: 'All',
  articles: 'Articles',
  guest: 'Guest posts',
  keywords: 'Keywords',
  social: 'Social',
  site: 'Your site',
  outreach: 'Outreach',
}

const CHIP = 'rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors'
const CHIP_ON = `${CHIP} border-[#e04a3d] bg-[#e04a3d]/10 text-[#e04a3d]`
const CHIP_OFF = `${CHIP} border-[var(--cat-border)] text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]`
const MUTED = 'mt-2 text-[12.5px] text-[var(--cat-ink-2)]'

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
      {line.detail && (
        <span className="block break-words text-[var(--cat-ink-2)]">{line.detail}</span>
      )}
      <span className="block text-[11px] text-[var(--cat-ink-3)]">
        {formatWhen(entry.createdAt)}
      </span>
    </li>
  )
}

interface FilterProps {
  value: ActivityCategory
  onChange: (category: ActivityCategory) => void
}

function CategoryFilter({ value, onChange }: FilterProps): JSX.Element {
  return (
    <div role="group" aria-label="Show activity for" className="mt-2 flex flex-wrap gap-1.5">
      {ACTIVITY_CATEGORIES.map(category => (
        <button
          key={category}
          type="button"
          aria-pressed={category === value}
          onClick={() => onChange(category)}
          className={category === value ? CHIP_ON : CHIP_OFF}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  )
}

/**
 * The agent's running log: every article, guest post, keyword finding, social
 * post and outreach email, and anything that changed on the brand's site.
 */
export function AgentLog({ orgSlug }: AgentLogProps): JSX.Element {
  const [category, setCategory] = useState<ActivityCategory>('all')
  const log = useAgentActivity(orgSlug, category)
  const entries = log.entries.filter(entry => !HIDDEN_ACTIONS.has(entry.action))
  return (
    <section aria-label="Agent log" className="mt-6">
      <h3 className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Agent log
      </h3>
      <CategoryFilter value={category} onChange={setCategory} />
      {log.isLoading && <p className={MUTED}>Loading…</p>}
      {log.error && <p className={MUTED}>{log.error}</p>}
      {!log.isLoading && !log.error && entries.length === 0 && (
        <p className={MUTED}>Nothing yet.</p>
      )}
      <ol className="mt-3 flex flex-col gap-2.5 border-l border-[var(--cat-border)] pl-3">
        {entries.map(entry => (
          <Line key={entry.id} entry={entry} />
        ))}
      </ol>
      {log.hasMore && (
        <button
          type="button"
          disabled={log.loadingMore}
          onClick={log.loadMore}
          className={`mt-3 ${SECONDARY_BUTTON}`}
        >
          {log.loadingMore ? 'Loading…' : 'Show more'}
        </button>
      )}
    </section>
  )
}
