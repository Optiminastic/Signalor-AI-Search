'use client'

import { formatStatus, isTaskDone } from '@/features/catalyst/tasks-data'
import { useAgentMutations } from '@/hooks/useAgentPlan'
import type { AgentAction } from '@/lib/api/agent'
import { ArrowRight, Check, Loader2, PenLine, Zap } from '@/lib/icons'
import type { LucideIcon } from '@/lib/icons'

const KIND_CTA: Record<AgentAction['kind'], { label: string; icon: LucideIcon }> = {
  auto: { label: 'Start', icon: Zap },
  draft: { label: 'Start', icon: PenLine },
  open: { label: 'Review', icon: ArrowRight },
}

/** A state, not a control — what replaces the CTA once there is nothing to do. */
function StatusPill({ label, done = false }: { label: string; done?: boolean }): JSX.Element {
  return (
    <span
      className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-[12px] font-medium ${
        done ? 'text-[#1e8a5c]' : 'text-[#2FBE7E]'
      }`}
    >
      <Check size={14} />
      {label}
    </span>
  )
}

interface ActionCtaButtonProps {
  action: AgentAction
  /** Outlined neutral style for calm surfaces (e.g. AI Assistant cards). */
  quiet?: boolean
  /** Force the filled brand style regardless of kind. The action detail page
   *  is the one surface where this button IS the page's primary action, so it
   *  must not render at the same weight as Verify / Mark complete beside it. */
  primary?: boolean
}

/**
 * Per-task CTA. The task already exists server-side (it's a UserAction), so this
 * is a status transition (pending → in_progress), not a create — which is why it
 * shows up on the Tasks page too. Replaces the old localStorage-only button.
 */
export function ActionCtaButton({
  action,
  quiet = false,
  primary = false,
}: ActionCtaButtonProps): JSX.Element {
  const { setStatus, busyActionId } = useAgentMutations()
  const cta = KIND_CTA[action.kind]
  const inProgress = action.status === 'in_progress'
  const busy = busyActionId === action.action_id
  const brand = primary || (!quiet && action.kind !== 'open')

  // Finished work offers no CTA. This checked only `in_progress`, so a
  // completed or verified action still rendered a live "Start" button.
  if (isTaskDone(action.status)) return <StatusPill label={formatStatus(action.status)} done />
  if (inProgress) return <StatusPill label="In progress" />

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => setStatus(action.action_id, 'in_progress')}
      className={
        brand
          ? 'shadow-nav-selected inline-flex h-8 items-center gap-1.5 rounded-md bg-linear-to-b from-[#e04a3d] to-[#c53f34] px-3 text-[12px] font-medium text-white disabled:opacity-60'
          : 'inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--cat-border)] px-3 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)] disabled:opacity-60'
      }
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : <cta.icon size={13} />}
      {cta.label}
    </button>
  )
}
