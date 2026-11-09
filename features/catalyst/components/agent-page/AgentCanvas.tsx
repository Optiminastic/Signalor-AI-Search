import { AgentActivityFeed } from '@/features/catalyst/components/agent-page/AgentActivityFeed'
import { AgentProgramCard } from '@/features/catalyst/components/agent-page/AgentProgramCard'
import type { AgentProgram } from '@/lib/api/agent-mode'
import { Sparkles } from '@/lib/icons'

interface AgentCanvasProps {
  program: AgentProgram | null
  thinking: boolean
  lastTools: string[]
}

/** The whiter board beside the chat: a live view of what the agent is doing. */
export function AgentCanvas({ program, thinking, lastTools }: AgentCanvasProps): JSX.Element {
  return (
    <section
      aria-label="Agent board"
      className="cat-agent-canvas hidden min-h-0 flex-1 flex-col overflow-y-auto rounded-[22px] border border-white/80 bg-[var(--cat-content)]/90 px-8 py-6 shadow-[0_10px_40px_rgba(120,60,30,.08)] backdrop-blur-xl lg:flex dark:border-white/10"
    >
      <p className="flex items-center gap-1.5 text-[11px] text-[var(--cat-ink-3)]">
        <Sparkles size={12} /> Updated automatically
      </p>
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-[var(--cat-ink)]">
          {thinking ? 'Working on it' : 'What the agent did'}
        </h2>
        {thinking && <span className="cat-agent-scan h-1 w-24 rounded-full" aria-hidden="true" />}
      </div>
      <div className="mt-4">
        <AgentActivityFeed thinking={thinking} lastTools={lastTools} />
      </div>
      {program && (
        <div className="mt-8">
          <AgentProgramCard program={program} />
        </div>
      )}
    </section>
  )
}
