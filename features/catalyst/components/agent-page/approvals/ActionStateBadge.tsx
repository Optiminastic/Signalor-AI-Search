import { stateMeta, type StateTone } from '@/features/catalyst/agent-approvals'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import type { ActionState } from '@/lib/api/agent-mode-approvals'
import { AlertTriangle } from '@/lib/icons'

interface ActionStateBadgeProps {
  state: ActionState
  kind: string
}

const CHIP =
  'inline-flex h-[24px] shrink-0 items-center gap-1.5 rounded-md border px-2 text-[11.5px] font-medium whitespace-nowrap text-[var(--cat-ink)]'

const DOT: Record<Exclude<StateTone, 'unknown'>, string> = {
  waiting: 'var(--cat-ink-3)',
  progress: YELLOW,
  success: GREEN,
  danger: NEG,
  closed: 'var(--cat-ink-3)',
}

/**
 * Where an action stands. "Outcome unknown" wears a warning icon and an amber
 * edge instead of a dot, so it can't be mistaken for pending or failed.
 */
export function ActionStateBadge({ state, kind }: ActionStateBadgeProps): JSX.Element {
  const meta = stateMeta(state, kind)
  if (meta.tone === 'unknown') {
    return (
      <span className={CHIP} style={{ borderColor: YELLOW }} data-state={state}>
        <AlertTriangle size={12} style={{ color: YELLOW }} aria-hidden="true" />
        {meta.label}
      </span>
    )
  }
  return (
    <span className={`${CHIP} border-[var(--cat-border)]`} data-state={state}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: DOT[meta.tone] }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  )
}
