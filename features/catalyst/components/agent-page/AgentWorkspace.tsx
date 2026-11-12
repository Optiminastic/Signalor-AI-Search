'use client'

import { usePathname } from 'next/navigation'

import { AgentBackdrop } from '@/features/catalyst/components/agent-page/AgentBackdrop'
import { AgentCanvas } from '@/features/catalyst/components/agent-page/AgentCanvas'
import { AgentChatPanel } from '@/features/catalyst/components/agent-page/AgentChatPanel'
import { AgentHome } from '@/features/catalyst/components/agent-page/AgentHome'
import { AgentTopBar } from '@/features/catalyst/components/agent-page/AgentTopBar'
import { useAgentChats } from '@/hooks/useAgentChats'
import { useAgentModeChat } from '@/hooks/useAgentModeChat'
import { useAgentModeProgram } from '@/hooks/useAgentModeProgram'
import type { AgentChatMessage, AgentChatSummary } from '@/lib/api/agent-mode-chat'

interface AgentWorkspaceProps {
  orgSlug: string
  brandName: string
  onReplayIntro: () => void
}

interface AgentMainProps {
  orgSlug: string
  brandName: string
  chatId: string | undefined
  agentHref: string
  chats: AgentChatSummary[]
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

function lastReplyTools(messages: AgentChatMessage[]): string[] {
  const reply = [...messages].reverse().find(m => m.role === 'assistant' && m.status !== 'pending')
  return reply?.tools ?? []
}

/** URL of the brand's Agent mode, e.g. /dashboard/<slug>/agent-mode. */
function agentModeHref(orgSlug: string): string {
  return `/dashboard/${orgSlug}/agent-mode`
}

/**
 * The open chat id from the URL (/agent-mode/<chatId>). Read from the pathname,
 * not useParams: usePathname follows window.history.pushState, useParams does not.
 */
function chatIdFromPath(pathname: string, agentHref: string): string | undefined {
  const prefix = `${agentHref}/`
  if (!pathname.startsWith(prefix)) return undefined
  return pathname.slice(prefix.length).split('/')[0] || undefined
}

/**
 * Centred home for a new chat. Once a chat starts (or a saved one is opened), the
 * conversation docks into a left column and the live activity board animates in.
 * A new chat moves to its own URL without remounting, so the dock animation plays once.
 */
function AgentMain({ orgSlug, brandName, chatId, agentHref, chats }: AgentMainProps): JSX.Element {
  const program = useAgentModeProgram(orgSlug)
  const chat = useAgentModeChat({
    orgSlug,
    chatId,
    onStarted: id => window.history.pushState(null, '', `${agentHref}/${id}`),
  })
  if (program.error) return <ProgramNotice message={program.error} />
  if (!chatId && !chat.thinking && chat.messages.length === 0) {
    return (
      <AgentHome
        orgSlug={orgSlug}
        brandName={brandName}
        onSend={chat.send}
        busy={chat.thinking}
        recent={{ chats, href: id => `${agentHref}/${id}` }}
      />
    )
  }
  return (
    <div className="flex min-h-0 flex-1 gap-3 px-4 pb-4">
      <AgentChatPanel orgSlug={orgSlug} brandName={brandName} chat={chat} />
      <AgentCanvas
        orgSlug={orgSlug}
        thinking={chat.thinking}
        lastTools={lastReplyTools(chat.messages)}
      />
    </div>
  )
}

/** The full-page agent: a slim top bar (history, new chat) over the chat. */
export function AgentWorkspace({
  orgSlug,
  brandName,
  onReplayIntro,
}: AgentWorkspaceProps): JSX.Element {
  const agentHref = agentModeHref(orgSlug)
  const chatId = chatIdFromPath(usePathname(), agentHref)
  const chats = useAgentChats(orgSlug)
  return (
    <main className="relative flex h-dvh flex-col bg-[var(--cat-canvas)]">
      <AgentBackdrop />
      <AgentTopBar
        dashboardHref={`/dashboard/${orgSlug}`}
        agentHref={agentHref}
        chats={chats}
        activeChatId={chatId}
        onReplayIntro={onReplayIntro}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <AgentMain {...{ orgSlug, brandName, chatId, agentHref, chats }} />
      </div>
    </main>
  )
}
