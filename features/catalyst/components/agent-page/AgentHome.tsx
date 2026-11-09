import { AgentComposer } from '@/features/catalyst/components/agent-page/AgentComposer'
import { AgentQuickStart } from '@/features/catalyst/components/agent-page/AgentQuickStart'
import {
  AgentRecentChats,
  type RecentChatsProps,
} from '@/features/catalyst/components/agent-page/AgentRecentChats'

interface AgentHomeProps {
  brandName: string
  onSend: (message: string) => void
  busy: boolean
  recent: RecentChatsProps
}

/** Empty-thread view: the agent's promise, composer and quick starts, centred like a fresh chat. */
export function AgentHome({ brandName, onSend, busy, recent }: AgentHomeProps): JSX.Element {
  return (
    <div className="cat-rise mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <span className="rounded-full border border-[#e04a3d]/25 bg-[#e04a3d]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#e04a3d]">
        Autonomous agent · {brandName}
      </span>
      <h1 className="text-center text-[32px] leading-tight font-semibold tracking-tight text-[var(--cat-ink)] sm:text-[40px]">
        Let&apos;s make AI recommend <span className="text-[#e04a3d]">{brandName}</span>.
      </h1>
      <AgentComposer onSend={onSend} disabled={busy} />
      <AgentQuickStart onPick={onSend} disabled={busy} />
      <AgentRecentChats chats={recent.chats} href={recent.href} />
    </div>
  )
}
