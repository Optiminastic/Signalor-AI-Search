import type { TimelineDay } from '@/features/catalyst/agent-activity-timeline'
import { ActivityRow } from '@/features/catalyst/components/agent-page/activity/ActivityRow'

interface ActivityDayGroupProps {
  day: TimelineDay
}

/** One day of the log: a heading, then its lines on a rail that joins their icons. */
export function ActivityDayGroup({ day }: ActivityDayGroupProps): JSX.Element {
  const headingId = `agent-log-day-${day.key}`
  return (
    <section aria-labelledby={headingId}>
      <h4 id={headingId} className="text-[12px] font-semibold text-[var(--cat-ink-2)]">
        {day.label}
      </h4>
      <ol className="relative mt-1">
        {day.rows.length > 1 && (
          <span
            className="absolute top-5 bottom-5 left-[13.5px] w-px bg-[var(--cat-border)]"
            aria-hidden="true"
          />
        )}
        {day.rows.map(row => (
          <ActivityRow key={row.key} row={row} />
        ))}
      </ol>
    </section>
  )
}
