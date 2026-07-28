import type { TaskStep } from '@/hooks/useTaskDetail'

/** "How to fix it" content when the task carries a structured, numbered guide -
 *  a detailed step list. Used for manual / off-site tasks (and any finding that
 *  ships step-by-step instructions) so the user gets real, actionable steps. */
export function TaskStepsBody({ steps }: { steps: TaskStep[] }): JSX.Element {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <li key={step.n || i + 1} className="flex gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--cat-hover)] text-[11px] font-semibold text-[var(--cat-ink-2)] tabular-nums">
            {step.n || i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[var(--cat-ink)]">{step.title}</p>
            {step.detail && (
              <p className="mt-0.5 text-[13px] leading-relaxed whitespace-pre-line text-[var(--cat-ink-2)]">
                {step.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
