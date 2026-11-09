import { AgentComposer } from '@/features/catalyst/components/agent-page/AgentComposer'
import { AgentQuickStart } from '@/features/catalyst/components/agent-page/AgentQuickStart'

const MORNING_END_HOUR = 12
const AFTERNOON_END_HOUR = 18

interface AgentHomeProps {
  firstName: string
  brandName: string
  onSend: (message: string) => void
  busy: boolean
}

function greeting(now: Date): string {
  const hour = now.getHours()
  if (hour < MORNING_END_HOUR) return 'Good morning'
  if (hour < AFTERNOON_END_HOUR) return 'Good afternoon'
  return 'Good evening'
}

/** Empty-thread view: greeting, composer and quick starts, centred like a fresh chat. */
export function AgentHome({ firstName, brandName, onSend, busy }: AgentHomeProps): JSX.Element {
  return (
    <div className="cat-rise mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <span className="rounded-full border border-[#e04a3d]/25 bg-[#e04a3d]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#e04a3d]">
        Autonomous agent · {brandName}
      </span>
      {/* Local time differs between server and browser; the browser value wins. */}
      <h1
        suppressHydrationWarning
        className="text-center text-[32px] font-semibold tracking-tight text-[var(--cat-ink)] sm:text-[38px]"
      >
        {greeting(new Date())}
        {firstName ? `, ${firstName}` : ''}
      </h1>
      <AgentComposer onSend={onSend} disabled={busy} />
      <AgentQuickStart onPick={onSend} disabled={busy} />
    </div>
  )
}
