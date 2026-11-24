import { Check, Loader2, Zap } from 'lucide-react'

import type { FixState } from '@/hooks/useAutoFix'

export interface AutoFixControlProps {
  state: FixState
  onFix: () => void
}

interface ManualFixButtonProps {
  outcome: 'manual' | 'connect' | 'failed'
  message?: string
  onFix: () => void
}

/** Bordered secondary button for the manual / connect / retry outcomes. */
function ManualFixButton({ outcome, message, onFix }: ManualFixButtonProps): JSX.Element {
  const label = { connect: 'Connect', failed: 'Retry', manual: 'Manual steps' }[outcome]
  return (
    <button
      type="button"
      onClick={onFix}
      title={message}
      className="inline-flex h-8 items-center rounded-md border border-[var(--cat-border)] px-3 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]"
    >
      {label}
    </button>
  )
}

/**
 * Brand-red Auto-fix button that reflects the per-recommendation fix state.
 * Shared by the Recommendations list and the Tasks table so both render the
 * same running / applied / PR / manual / connect / retry affordances.
 */
export function AutoFixControl({ state, onFix }: AutoFixControlProps): JSX.Element {
  const { outcome, message } = state
  if (outcome === 'running') {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 px-3 text-[12px] font-medium text-[var(--cat-ink-2)]">
        <Loader2 size={13} className="animate-spin" />
        {message || 'Working…'}
      </span>
    )
  }
  if (outcome === 'applied') {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2FBE7E]">
        <Check size={14} strokeWidth={2.5} />
        Done
      </span>
    )
  }
  if (outcome === 'pr') {
    return <span className="text-[12px] font-medium text-[#F6B93B]">PR opening…</span>
  }
  if (outcome === 'manual' || outcome === 'connect' || outcome === 'failed') {
    return <ManualFixButton outcome={outcome} message={message} onFix={onFix} />
  }
  return (
    <button
      type="button"
      onClick={onFix}
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-white"
      style={{ background: '#e04a3d' }}
    >
      <Zap size={13} />
      Auto fix
    </button>
  )
}
