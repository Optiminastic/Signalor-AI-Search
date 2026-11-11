'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { AgentRichText } from '@/features/catalyst/components/agent-page/AgentRichText'
import { useTypewriter } from '@/hooks/useTypewriter'
import type { AgentChatMessage } from '@/lib/api/agent-mode-chat'

const USER_BUBBLE =
  'max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-[var(--cat-ink)]/[0.06] px-3.5 py-2 text-[13px] text-[var(--cat-ink)] dark:bg-white/10'
const AGENT_BUBBLE = 'max-w-[95%] text-[13px] leading-relaxed text-[var(--cat-ink)]'
const AGENT_META = 'mb-1 text-[11px] text-[var(--cat-ink-3)]'

interface AgentThreadProps {
  messages: AgentChatMessage[]
  error: string | null
}

const BOLD_MARK = '**'

/** While typing, close a half-typed **bold** so the raw markers never flash on screen. */
function closeOpenBold(text: string): string {
  const marks = text.split(BOLD_MARK).length - 1
  return marks % 2 === 1 ? `${text}${BOLD_MARK}` : text
}

interface AgentReplyProps {
  message: AgentChatMessage
  onGrow: () => void
}

function AgentReply({ message, onGrow }: AgentReplyProps): JSX.Element {
  // A reply that mounts while pending is being written during this visit, so it
  // types out when it lands; replies loaded from history render at once.
  const [animate] = useState(message.status === 'pending')
  const { visible, typing } = useTypewriter(message.content, animate)
  useEffect(() => {
    if (typing) onGrow()
  }, [visible, typing, onGrow])

  if (message.status === 'pending') {
    return (
      <p role="status" className="cat-agent-shimmer text-[13px] font-medium">
        Thinking…
      </p>
    )
  }
  return (
    <div className={AGENT_BUBBLE}>
      {message.tools.length > 0 && <p className={AGENT_META}>Checked your data</p>}
      <AgentRichText text={typing ? closeOpenBold(visible) : visible} />
      {!typing && message.changedPlan && (
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

  // Block bodies on purpose: newer browsers return a Promise from
  // scrollIntoView, and an effect that returns it makes React call the Promise
  // as a cleanup function on unmount ("destroy is not a function"), which
  // crashed the whole page.
  const scrollToEnd = useCallback((): void => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [])

  useEffect(() => {
    scrollToEnd()
  }, [lastId, lastStatus, scrollToEnd])

  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4"
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
            <AgentReply message={message} onGrow={scrollToEnd} />
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
