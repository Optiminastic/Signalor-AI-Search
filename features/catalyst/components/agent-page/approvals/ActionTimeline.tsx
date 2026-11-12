import {
  decisionLabel,
  formatWhen,
  sendStepLabel,
  timelineTone,
  type TimelineTone,
} from '@/features/catalyst/agent-approvals'
import {
  MUTED_TEXT,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import type { ActionDecision, TimelineEntry } from '@/lib/api/agent-mode-approvals'

interface ActionTimelineProps {
  kind: string
  timeline: TimelineEntry[]
  /** Used when the backend sends no timeline (older versions). */
  decisions: ActionDecision[]
}

const DOT: Record<TimelineTone, string> = {
  neutral: 'var(--cat-ink-3)',
  progress: 'var(--cat-ink-2)',
  success: GREEN,
  danger: NEG,
  unknown: YELLOW,
}

function who(role: string): string {
  if (role === 'owner') return 'the brand owner'
  if (role === 'system') return 'Signalor, automatically'
  return role
}

interface StepText {
  title: string
  meta: string
}

function describe(entry: TimelineEntry, kind: string): StepText {
  if (entry.type === 'drafted') return { title: 'Drafted by the agent', meta: 'version 1' }
  if (entry.type === 'edited') return { title: 'Edited by you', meta: `version ${entry.version}` }
  if (entry.type === 'decision') {
    return {
      title: decisionLabel(entry.decision),
      meta: `version ${entry.version} by ${who(entry.actorRole)}`,
    }
  }
  const attempt = entry.attempt ? `attempt ${entry.attempt}` : ''
  return { title: sendStepLabel(entry.event, entry.outcome, kind), meta: attempt }
}

function fromDecisions(decisions: ActionDecision[]): TimelineEntry[] {
  return decisions.map(d => ({
    at: d.createdAt,
    type: 'decision',
    version: d.version,
    decision: d.decision,
    actorRole: d.actorRole,
    reason: d.reason,
    event: '',
    outcome: '',
    attempt: null,
  }))
}

function Step({ entry, kind }: { entry: TimelineEntry; kind: string }): JSX.Element {
  const text = describe(entry, kind)
  return (
    <li className="relative pl-4 text-[12.5px]">
      <span
        className="absolute top-[6px] left-0 h-1.5 w-1.5 rounded-full"
        style={{ background: DOT[timelineTone(entry.event, entry.outcome)] }}
        aria-hidden="true"
      />
      <span className="font-semibold text-[var(--cat-ink)]">{text.title}</span>
      {text.meta && <span className="text-[var(--cat-ink-2)]"> · {text.meta}</span>}
      <span className="block text-[11.5px] text-[var(--cat-ink-3)]">{formatWhen(entry.at)}</span>
      {entry.reason && (
        <span className="mt-0.5 block text-[var(--cat-ink-2)]">Reason: {entry.reason}</span>
      )}
    </li>
  )
}

/**
 * "What happened": every step of the action in order, from the draft through
 * each decision to each send attempt, so the owner can see exactly where it
 * stands and why.
 */
export function ActionTimeline({ kind, timeline, decisions }: ActionTimelineProps): JSX.Element {
  const entries = timeline.length > 0 ? timeline : fromDecisions(decisions)
  return (
    <section aria-label="What happened">
      <h3 className={SECTION_TITLE}>What happened</h3>
      {entries.length === 0 ? (
        <p className={`mt-2 ${MUTED_TEXT}`}>No decision has been recorded yet.</p>
      ) : (
        <ol className="mt-2 flex flex-col gap-2.5 border-l border-[var(--cat-border)] pl-3">
          {entries.map((entry, index) => (
            <Step key={`${entry.at}-${index}`} entry={entry} kind={kind} />
          ))}
        </ol>
      )}
    </section>
  )
}
