'use client'

import { useEffect, useRef } from 'react'

import { AgentRichText } from '@/features/catalyst/components/agent-page/AgentRichText'
import type { AgentChatMessage } from '@/lib/api/agent-mode-chat'

const USER_BUBBLE =
  'max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-sm bg-[var(--cat-ink)] px-3 py-2 text-[13px] text-[var(--cat-content)]'
const AGENT_BUBBLE =
  'cat-card-edge max-w-[92%] rounded-2xl rounded-bl-sm border border-[var(--cat-card-border)] bg-[var(--cat-card)] px-3 py-2 text-[13px] leading-relaxed text-[var(--cat-ink-2)]'

interface AgentThreadProps {
  messages: AgentChatMessage[]
  error: string | null
}

function AgentReply({ message }: { message: AgentChatMessage }): JSX.Element {
  if (message.status === 'pending') {
    return (
      <p role="status" className={`${AGENT_BUBBLE} text-[var(--cat-ink-3)]`}>
        Looking at your data...
      </p>
    )
  }
  return (
    <div className={AGENT_BUBBLE}>
      <AgentRichText text={message.content} />
      {message.changedPlan && (
        <p className="mt-2 text-[11px] font-medium text-[#e04a3d]">Plan updated</p>
      )}
    </div>
  )
}

/** The live conversation with the agent, newest at the bottom (auto-scrolls). */
export function AgentThread({ messages, error }: AgentThreadProps): JSX.Element {
  const end = useRef<HTMLDivElement>(null)
  const lastId = messages[messages.length - 1]?.id
  const lastStatus = messages[messages.length - 1]?.status

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [lastId, lastStatus])

  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
      aria-live="polite"
    >
      {messages.map(message => (
        <div
          key={message.id}
          className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
        >
          {message.role === 'user' ? (
            <p className={USER_BUBBLE}>{message.content}</p>
          ) : (
            <AgentReply message={message} />
          )}
        </div>
      ))}
      {error && (
        <p role="alert" className={`${AGENT_BUBBLE} text-[#e04a3d]`}>
          {error}
        </p>
      )}
      <div ref={end} />
    </div>
  )
}
