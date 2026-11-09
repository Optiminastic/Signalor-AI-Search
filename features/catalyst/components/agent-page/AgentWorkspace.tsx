'use client'

import { AgentComposer } from '@/features/catalyst/components/agent-page/AgentComposer'
import { AgentHome } from '@/features/catalyst/components/agent-page/AgentHome'
import { AgentSidebar } from '@/features/catalyst/components/agent-page/AgentSidebar'
import { AgentThread } from '@/features/catalyst/components/agent-page/AgentThread'
import { useAgentModeChat } from '@/hooks/useAgentModeChat'
import { useAgentModeProgram } from '@/hooks/useAgentModeProgram'
import { useSession } from '@/lib/auth-client'

interface AgentWorkspaceProps {
  orgSlug: string
  brandName: string
  onReplayIntro: () => void
}

interface AgentMainProps {
  orgSlug: string
  brandName: string
  firstName: string
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
function AgentMain({ orgSlug, brandName, firstName }: AgentMainProps): JSX.Element {
  const program = useAgentModeProgram(orgSlug)
  const chat = useAgentModeChat(orgSlug)
  if (program.error) return <ProgramNotice message={program.error} />
  if (chat.messages.length === 0) {
    return (
      <AgentHome
        firstName={firstName}
        brandName={brandName}
        onSend={chat.send}
        busy={chat.thinking}
      />
    )
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

/** The full-page agent: sidebar (brand, recents, account) + the main chat area. */
export function AgentWorkspace({
  orgSlug,
  brandName,
  onReplayIntro,
}: AgentWorkspaceProps): JSX.Element {
  const { data: session } = useSession()
  const chat = useAgentModeChat(orgSlug)
  const user = { name: session?.user?.name ?? '', email: session?.user?.email ?? '' }
  const recentQuestions = chat.messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .reverse()

  return (
    <div className="flex h-dvh bg-[var(--cat-canvas)]">
      <AgentSidebar
        brandName={brandName}
        dashboardHref={`/dashboard/${orgSlug}`}
        recentQuestions={recentQuestions}
        user={user}
        onReplayIntro={onReplayIntro}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <AgentMain
          orgSlug={orgSlug}
          brandName={brandName}
          firstName={user.name.split(' ')[0] ?? ''}
        />
      </main>
    </div>
  )
}
