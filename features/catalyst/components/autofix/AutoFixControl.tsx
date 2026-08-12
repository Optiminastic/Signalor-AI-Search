import { GithubPrLink } from '@/features/catalyst/components/autofix/GithubPrLink'
import { BRAND_SOFT, BRAND_STRONG } from '@/features/catalyst/constants'
import type { FixOutcome, FixState } from '@/hooks/useAutoFix'
import { Check, Loader2, Zap } from '@/lib/icons'

export interface AutoFixControlProps {
  state: FixState
  onFix: () => void
}

const OUTLINE_BTN =
  'inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--cat-border)] px-3 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]'

function RunningState({ message }: { message: string }): JSX.Element {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 px-3 text-[12px] font-medium text-[var(--cat-ink-2)]">
      <Loader2 size={13} className="animate-spin" />
      {message || 'Working…'}
    </span>
  )
}

/** GitHub PR outcome: a real link to the PR once it exists, else "opening…". */
function PrState({ state }: { state: FixState }): JSX.Element {
  if (!state.prUrl) {
    return <span className="text-[12px] font-medium text-[#F6B93B]">PR opening…</span>
  }
  return (
    <GithubPrLink href={state.prUrl} title={state.message}>
      View PR{state.prNumber ? ` #${state.prNumber}` : ''}
    </GithubPrLink>
  )
}

function actionLabel(outcome: FixOutcome): string {
  if (outcome === 'connect') return 'Connect'
  if (outcome === 'failed') return 'Retry'
  return 'Manual steps'
}

/** manual / connect / failed — a button that re-runs (or points to) the fix. */
function ActionButton({ state, onFix }: AutoFixControlProps): JSX.Element {
  return (
    <button type="button" onClick={onFix} title={state.message} className={OUTLINE_BTN}>
      {actionLabel(state.outcome)}
    </button>
  )
}

/**
 * Brand-soft chip, not a solid fill: this repeats on every row, and the solid
 * brand button is reserved for the page's single primary CTA (Create Task).
 * Same treatment as the active nav item — recognisably brand, quiet in bulk.
 */
function FixButton({ onFix }: { onFix: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onFix}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-3 text-[12px] font-semibold transition-colors hover:border-[rgba(224,74,61,.25)]"
      style={{ background: BRAND_SOFT, color: BRAND_STRONG }}
    >
      <Zap size={13} />
      Auto fix
    </button>
  )
}

/**
 * Brand-red Auto-fix button that reflects the per-recommendation fix state.
 * Shared by the Recommendations list and the Tasks table so both render the
 * same running / applied / PR / manual / connect / retry affordances.
 */
export function AutoFixControl({ state, onFix }: AutoFixControlProps): JSX.Element {
  const { outcome } = state
  if (outcome === 'running') return <RunningState message={state.message} />
  if (outcome === 'applied') {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2FBE7E]">
        <Check size={14} />
        Applied
      </span>
    )
  }
  if (outcome === 'pr') return <PrState state={state} />
  if (outcome === 'manual' || outcome === 'connect' || outcome === 'failed') {
    return <ActionButton state={state} onFix={onFix} />
  }
  return <FixButton onFix={onFix} />
}
