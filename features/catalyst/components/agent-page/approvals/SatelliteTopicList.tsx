import {
  SECONDARY_BUTTON,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { SatelliteTopic } from '@/features/catalyst/satellite-topics'
import type { PlanTaskChoice } from '@/lib/api/agent-mode-approvals'

interface SatelliteTopicListProps {
  topics: SatelliteTopic[]
  busyTaskId: number | null
  onChange: (taskId: number, status: PlanTaskChoice) => void
}

interface TopicRowProps {
  topic: SatelliteTopic
  busy: boolean
  onChange: (taskId: number, status: PlanTaskChoice) => void
}

function day(iso: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(
    new Date(`${iso}T00:00:00`),
  )
}

function SiteBadge({ topic }: { topic: SatelliteTopic }): JSX.Element {
  return (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[12px] font-semibold text-white"
      style={{ background: topic.site?.color ?? 'var(--cat-ink-3)' }}
      aria-hidden="true"
    >
      {topic.site?.initial ?? '•'}
    </span>
  )
}

function TopicRow({ topic, busy, onChange }: TopicRowProps): JSX.Element {
  const next: PlanTaskChoice = topic.skipped ? 'planned' : 'skipped'
  return (
    <li
      className={`flex items-center gap-3 rounded-lg border border-[var(--cat-border)] px-3 py-2 ${topic.skipped ? 'opacity-60' : ''}`}
    >
      <span className="w-12 shrink-0 text-[12px] text-[var(--cat-ink-3)] tabular-nums">
        {day(topic.scheduledFor)}
      </span>
      <SiteBadge topic={topic} />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[12.5px] text-[var(--cat-ink)] ${topic.skipped ? 'line-through' : ''}`}
        >
          {topic.topic}
        </span>
        <span className="block text-[11.5px] text-[var(--cat-ink-3)]">{topic.siteDomain}</span>
      </span>
      {topic.editable && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onChange(topic.taskId, next)}
          className={SECONDARY_BUTTON}
        >
          {topic.skipped ? 'Restore' : 'Skip'}
        </button>
      )}
    </li>
  )
}

/**
 * This month's satellite articles: one every 3 days on signalor.ai's own sites,
 * each on a topic where AI answers leave the client out. Skipping a topic means
 * it is never written; each article that is written still comes here for approval.
 */
export function SatelliteTopicList({
  topics,
  busyTaskId,
  onChange,
}: SatelliteTopicListProps): JSX.Element | null {
  if (topics.length === 0) return null
  const active = topics.filter(t => !t.skipped).length
  return (
    <section className="flex flex-col gap-2">
      <h3 className={SECTION_TITLE}>Articles on signalor.ai sites this month</h3>
      <p className="text-[12px] text-[var(--cat-ink-2)]">
        {active} of {topics.length} planned, one every 3 days. Each one covers a question AI answers
        currently leave you out of, and mentions you with a sponsored link. Skip any topic you
        don&apos;t want; every article still comes here for your approval before it&apos;s
        published.
      </p>
      <ul className="flex flex-col gap-1.5">
        {topics.map(topic => (
          <TopicRow
            key={topic.taskId}
            topic={topic}
            busy={busyTaskId === topic.taskId}
            onChange={onChange}
          />
        ))}
      </ul>
    </section>
  )
}
