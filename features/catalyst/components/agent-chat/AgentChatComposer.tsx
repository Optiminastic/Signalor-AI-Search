'use client'

import { useState } from 'react'

import { AgentComposerActions } from '@/features/catalyst/components/agent-chat/AgentComposerActions'

/** The message input. UI only - typing works, sending is a no-op for now. */
export function AgentChatComposer(): JSX.Element {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0

  return (
    <div className="shrink-0 px-3 pt-2 pb-3">
      <div className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] px-3 pt-2.5 pb-2 focus-within:ring-2 focus-within:ring-[#e04a3d]/40">
        <textarea
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Ask anything..."
          className="max-h-32 w-full resize-none bg-transparent text-[13px] text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)]"
        />
        <AgentComposerActions canSend={canSend} />
      </div>
      <p className="mt-2 text-center text-[11px] text-[var(--cat-ink-3)]">
        SignalorAI Agent can make mistakes. Verify important changes.
      </p>
    </div>
  )
}
