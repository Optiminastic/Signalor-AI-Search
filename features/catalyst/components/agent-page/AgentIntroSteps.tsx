interface IntroStep {
  title: string
  body: string
}

const STEPS: IntroStep[] = [
  {
    title: 'Position',
    body: 'Finds where AI answers leave you out, and who they recommend instead.',
  },
  { title: 'Plan', body: 'Turns every gap into a ranked, week-by-week off-page plan.' },
  { title: 'Execute', body: 'Publishes pages and pitches the sites AI cites, with safety checks.' },
  { title: 'Track', body: 'Re-asks every AI engine weekly and measures the lift.' },
]

/** Literal so Tailwind generates them; keep in step with CHIME_TIMES_S in lib/agent-intro-sound.ts. */
const STEP_DELAYS = [
  '[animation-delay:3.4s]',
  '[animation-delay:4.3s]',
  '[animation-delay:5.2s]',
  '[animation-delay:6.1s]',
]

/** The four steps of the agent, each revealed on its chime. */
export function AgentIntroSteps(): JSX.Element {
  return (
    <div className="relative mt-10 w-full max-w-3xl">
      <div
        className="absolute top-[13px] right-6 left-6 h-px bg-[var(--cat-border)]"
        aria-hidden="true"
      />
      <div
        className="cat-agent-line absolute top-[13px] right-6 left-6 h-px bg-[#e04a3d] [animation-delay:3.3s]"
        aria-hidden="true"
      />
      <ol className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className={`cat-agent-word flex flex-col items-center text-center ${STEP_DELAYS[i]}`}
          >
            <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-[#e04a3d] text-[12px] font-semibold text-white ring-4 ring-[var(--cat-canvas)]">
              {i + 1}
            </span>
            <p className="mt-3 text-[14px] font-semibold text-[var(--cat-ink)]">{step.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--cat-ink-2)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
