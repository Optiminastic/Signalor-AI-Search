import { AgentActivityFeed } from '@/features/catalyst/components/agent-page/AgentActivityFeed'
import { AgentProgramCard } from '@/features/catalyst/components/agent-page/AgentProgramCard'
import type { AgentProgram } from '@/lib/api/agent-mode'

interface AgentCanvasProps {
  program: AgentProgram | null
  thinking: boolean
  lastTools: string[]
}

const PANEL =
  'cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-content)]/85 p-5 backdrop-blur-sm'

/** Right side of the docked layout: a live view of what the agent is doing. */
export function AgentCanvas({ program, thinking, lastTools }: AgentCanvasProps): JSX.Element {
  return (
    <section
      aria-label="Agent activity"
      className="cat-agent-canvas hidden min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 pl-0 lg:flex"
    >
      <div className={PANEL}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-[var(--cat-ink)]">
            {thinking ? 'Working on it' : 'What the agent did'}
          </p>
          {thinking && <span className="cat-agent-scan h-1 w-24 rounded-full" aria-hidden="true" />}
        </div>
        <AgentActivityFeed thinking={thinking} lastTools={lastTools} />
      </div>
      {program && (
        <div className={PANEL}>
          <AgentProgramCard program={program} />
        </div>
      )}
    </section>
  )
}
