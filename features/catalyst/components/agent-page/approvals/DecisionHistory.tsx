import { decisionLabel, formatWhen } from '@/features/catalyst/agent-approvals'
import {
  MUTED_TEXT,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { ActionDecision } from '@/lib/api/agent-mode-approvals'

interface DecisionHistoryProps {
  decisions: ActionDecision[]
}

function who(role: string): string {
  if (role === 'owner') return 'the brand owner'
  if (role === 'system') return 'Signalor, automatically'
  return role
}

/** Every decision recorded on this action, oldest first, with the version it applied to. */
export function DecisionHistory({ decisions }: DecisionHistoryProps): JSX.Element {
  return (
    <section aria-label="Decision history">
      <h3 className={SECTION_TITLE}>Decision history</h3>
      {decisions.length === 0 ? (
        <p className={`mt-2 ${MUTED_TEXT}`}>No decision has been recorded yet.</p>
      ) : (
        <ol className="mt-2 flex flex-col gap-2">
          {decisions.map(d => (
            <li key={`${d.createdAt}-${d.decision}`} className="text-[12.5px]">
              <span className="font-semibold text-[var(--cat-ink)]">
                {decisionLabel(d.decision)}
              </span>
              <span className="text-[var(--cat-ink-2)]">
                {' '}
                version {d.version} by {who(d.actorRole)}
              </span>
              <span className="block text-[11.5px] text-[var(--cat-ink-3)]">
                {formatWhen(d.createdAt)}
              </span>
              {d.reason && (
                <span className="mt-0.5 block text-[var(--cat-ink-2)]">Reason: {d.reason}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
