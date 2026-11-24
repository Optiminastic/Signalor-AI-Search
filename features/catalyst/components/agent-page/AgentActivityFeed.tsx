import {
  THINKING_STEPS,
  stepsForTools,
  type ActivityStep,
} from '@/features/catalyst/components/agent-page/agent-activity'
import { GREEN } from '@/features/catalyst/constants'
import { Check, Loader2 } from '@/lib/icons'

interface AgentActivityFeedProps {
  thinking: boolean
  /** Tools the latest finished reply used. */
  lastTools: string[]
}

interface StepRowProps {
  step: ActivityStep
  index: number
}

/** A step of the reply being written, revealed one after another. */
function LiveStep({ step, index }: StepRowProps): JSX.Element {
  const Icon = step.icon
  return (
    <li
      className="cat-agent-step-live flex items-center gap-3"
      style={{ animationDelay: `${index * 1.1}s` }}
    >
      <span className="text-primary-ink grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#e04a3d]/10">
        <Icon size={15} strokeWidth={2.2} />
      </span>
      <span className="flex-1 text-[13px] text-[var(--cat-ink)]">{step.label}</span>
      <Loader2 size={14} className="cat-agent-spin text-[var(--cat-ink-3)]" />
    </li>
  )
}

/** What the last chat reply looked up, as one quiet strip above the log. */
function LastReplySteps({ steps }: { steps: ActivityStep[] }): JSX.Element {
  return (
    <div className="rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 py-2.5">
      <p className="text-[11.5px] text-[var(--cat-ink-3)]">From your last message</p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {steps.map(step => (
          <li
            key={step.label}
            className="flex items-center gap-1.5 text-[12.5px] text-[var(--cat-ink)]"
          >
            <Check size={13} strokeWidth={2.4} style={{ color: GREEN }} aria-hidden="true" />
            {step.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * What the agent is doing for the chat right now (animated), or what the last
 * reply looked up. Renders nothing when the last reply used no tools.
 */
export function AgentActivityFeed({
  thinking,
  lastTools,
}: AgentActivityFeedProps): JSX.Element | null {
  if (thinking) {
    return (
      <ol aria-live="polite" className="space-y-3">
        {THINKING_STEPS.map((step, i) => (
          <LiveStep key={step.label} step={step} index={i} />
        ))}
      </ol>
    )
  }
  const steps = stepsForTools(lastTools)
  return steps.length > 0 ? <LastReplySteps steps={steps} /> : null
}
