import { SignalorMark } from '@/components/SignalorMark'
import { AgentComposer } from '@/features/catalyst/components/agent-page/AgentComposer'
import { AgentThread } from '@/features/catalyst/components/agent-page/AgentThread'
import type { AgentChatMessage } from '@/lib/api/agent-mode-chat'

interface AgentChatPanelProps {
  brandName: string
  chat: {
    messages: AgentChatMessage[]
    thinking: boolean
    error: string | null
    send: (message: string) => void
  }
}

/** Translucent glass panel holding the conversation, docked on the left. */
export function AgentChatPanel({ brandName, chat }: AgentChatPanelProps): JSX.Element {
  return (
    <section
      aria-label="Conversation"
      className="cat-agent-dock flex min-h-0 w-full flex-col rounded-[22px] border border-white/70 bg-[var(--cat-content)]/45 shadow-[0_10px_40px_rgba(120,60,30,.08)] backdrop-blur-xl lg:w-[420px] lg:shrink-0 dark:border-white/10"
    >
      <header className="flex items-center gap-2.5 px-5 pt-4 pb-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e04a3d]/10">
          <SignalorMark className="h-4 w-4 text-[#e04a3d]" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--cat-ink)]">SignalorAI Agent</p>
          <p className="truncate text-[11px] text-[var(--cat-ink-3)]">Growing {brandName}</p>
        </div>
      </header>
      <AgentThread messages={chat.messages} error={chat.error} />
      <div className="px-4 pb-4">
        <AgentComposer onSend={chat.send} disabled={chat.thinking} />
      </div>
    </section>
  )
}
