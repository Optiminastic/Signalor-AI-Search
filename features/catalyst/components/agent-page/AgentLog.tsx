'use client'

import { useMemo, useState } from 'react'

import { HIDDEN_ACTIONS } from '@/features/catalyst/agent-activity-findings'
import { buildTimeline } from '@/features/catalyst/agent-activity-timeline'
import { ActivityDayGroup } from '@/features/catalyst/components/agent-page/activity/ActivityDayGroup'
import {
  ActivityFilter,
  CATEGORY_LABELS,
} from '@/features/catalyst/components/agent-page/activity/ActivityFilter'
import { ActivitySkeleton } from '@/features/catalyst/components/agent-page/activity/ActivitySkeleton'
import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { useAgentActivity } from '@/hooks/useAgentActivity'
import type { ActivityCategory } from '@/lib/api/agent-mode-activity'

interface AgentLogProps {
  orgSlug: string
}

const NOTE = 'mt-4 max-w-[60ch] text-[12.5px] text-[var(--cat-ink-2)]'

function emptyText(category: ActivityCategory): string {
  if (category === 'all') {
    return 'Nothing yet. Each time the agent plans, drafts, sends or checks something, it shows up here.'
  }
  return `Nothing in ${CATEGORY_LABELS[category]} yet. Pick All to see everything the agent has done.`
}

/**
 * The agent's running log, grouped by day: every article, guest post, keyword
 * finding, social post and outreach email, and anything that changed on the
 * brand's site.
 */
export function AgentLog({ orgSlug }: AgentLogProps): JSX.Element {
  const [category, setCategory] = useState<ActivityCategory>('all')
  const log = useAgentActivity(orgSlug, category)
  const days = useMemo(
    () => buildTimeline(log.entries.filter(entry => !HIDDEN_ACTIONS.has(entry.action))),
    [log.entries],
  )
  const ready = !log.isLoading && !log.error
  return (
    <section aria-label="Agent log" className="not-first:mt-5">
      <ActivityFilter value={category} onChange={setCategory} />
      {log.isLoading && <ActivitySkeleton />}
      {log.error && (
        <p role="alert" className={NOTE}>
          {log.error}
        </p>
      )}
      {ready && days.length === 0 && <p className={NOTE}>{emptyText(category)}</p>}
      <div className="mt-3 flex flex-col gap-4">
        {days.map(day => (
          <ActivityDayGroup key={day.key} day={day} />
        ))}
      </div>
      {log.hasMore && (
        <button
          type="button"
          disabled={log.loadingMore}
          onClick={log.loadMore}
          className={`mt-4 ${SECONDARY_BUTTON}`}
        >
          {log.loadingMore ? 'Loading…' : 'Show older activity'}
        </button>
      )}
    </section>
  )
}
