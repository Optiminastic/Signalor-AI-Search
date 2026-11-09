'use client'

import { AgentBackdrop } from '@/features/catalyst/components/agent-page/AgentBackdrop'
import { AgentComposer } from '@/features/catalyst/components/agent-page/AgentComposer'
import { AgentHome } from '@/features/catalyst/components/agent-page/AgentHome'
import { AgentThread } from '@/features/catalyst/components/agent-page/AgentThread'
import { AgentTopBar } from '@/features/catalyst/components/agent-page/AgentTopBar'
import { useAgentModeChat } from '@/hooks/useAgentModeChat'
import { useAgentModeProgram } from '@/hooks/useAgentModeProgram'

interface AgentWorkspaceProps {
  orgSlug: string
  brandName: string
  onReplayIntro: () => void
}

interface AgentMainProps {
  orgSlug: string
  brandName: string
}

function ProgramNotice({ message }: { message: string }): JSX.Element {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-[15px] font-semibold text-[var(--cat-ink)]">
        The agent isn&apos;t available yet
      </p>
      <p className="mt-2 text-[13px] text-[var(--cat-ink-2)]">{message}</p>
    </div>
  )
}

/** Greeting home before the first question, then the live conversation. */
function AgentMain({ orgSlug, brandName }: AgentMainProps): JSX.Element {
  const program = useAgentModeProgram(orgSlug)
  const chat = useAgentModeChat(orgSlug)
  if (program.error) return <ProgramNotice message={program.error} />
  if (chat.messages.length === 0) {
    return <AgentHome brandName={brandName} onSend={chat.send} busy={chat.thinking} />
  }
  return (
    <>
      <AgentThread messages={chat.messages} error={chat.error} />
      <div className="mx-auto w-full max-w-3xl px-4 pb-5">
        <AgentComposer onSend={chat.send} disabled={chat.thinking} />
      </div>
    </>
  )
}

/** The full-page agent: a slim top bar over the chat, no sidebar. */
export function AgentWorkspace({
  orgSlug,
  brandName,
  onReplayIntro,
}: AgentWorkspaceProps): JSX.Element {
  return (
    <main className="relative flex h-dvh flex-col bg-[var(--cat-canvas)]">
      <AgentBackdrop />
      <AgentTopBar dashboardHref={`/dashboard/${orgSlug}`} onReplayIntro={onReplayIntro} />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <AgentMain orgSlug={orgSlug} brandName={brandName} />
      </div>
    </main>
  )
}
