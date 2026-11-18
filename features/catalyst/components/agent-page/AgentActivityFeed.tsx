import {
  THINKING_STEPS,
  stepsForTools,
  type ActivityStep,
} from '@/features/catalyst/components/agent-page/agent-activity'
import { Check, Loader2 } from '@/lib/icons'

interface AgentActivityFeedProps {
  thinking: boolean
  /** Tools the latest finished reply used. */
  lastTools: string[]
}

interface StepRowProps {
  step: ActivityStep
  index: number
  live: boolean
}

function StepRow({ step, index, live }: StepRowProps): JSX.Element {
  const Icon = step.icon
  return (
    <li
      className={
        live
          ? 'cat-agent-step-live flex items-center gap-3'
          : 'cat-agent-step flex items-center gap-3'
      }
      style={{ animationDelay: `${index * (live ? 1.1 : 0.12)}s` }}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e04a3d]/10 text-[#e04a3d]">
        <Icon size={15} strokeWidth={2.2} />
      </span>
      <span className="flex-1 text-[13px] text-[var(--cat-ink)]">{step.label}</span>
      {live ? (
        <Loader2 size={14} className="cat-agent-spin text-[var(--cat-ink-3)]" />
      ) : (
        <Check size={14} strokeWidth={2.4} className="text-emerald-500" />
      )}
    </li>
  )
}

/** What the agent is doing now (animated) or what it just did (its real tool trace). */
export function AgentActivityFeed({ thinking, lastTools }: AgentActivityFeedProps): JSX.Element {
  const steps = thinking ? THINKING_STEPS : stepsForTools(lastTools)
  if (steps.length === 0) {
    return (
      <p className="text-[13px] text-[var(--cat-ink-3)]">
        Answered from what it already knew. Ask about your plan or visibility to see it work.
      </p>
    )
  }
  return (
    <ol key={thinking ? 'live' : lastTools.join()} className="space-y-3">
      {steps.map((step, i) => (
        <StepRow key={step.label} step={step} index={i} live={thinking} />
      ))}
    </ol>
  )
}
