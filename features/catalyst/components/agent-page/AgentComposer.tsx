'use client'

import { useState, type FormEvent, type KeyboardEvent } from 'react'

import { ConnectToolsButton } from '@/features/catalyst/components/agent-page/tools/ConnectToolsButton'
import { ArrowUp } from '@/lib/icons'

interface AgentComposerProps {
  orgSlug: string
  onSend: (message: string) => void
  /** True while a reply is being written. */
  disabled: boolean
}

const SEND_READY = 'auth-cta-btn grid h-8 w-8 place-items-center rounded-md text-white'
const SEND_IDLE =
  'grid h-8 w-8 place-items-center rounded-md bg-[var(--cat-track)] text-[var(--cat-ink-3)]'

interface SendRowProps {
  orgSlug: string
  canSend: boolean
}

function SendRow({ orgSlug, canSend }: SendRowProps): JSX.Element {
  return (
    <div className="mt-1 flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2">
        <ConnectToolsButton orgSlug={orgSlug} />
        <span className="truncate text-[11px] text-[var(--cat-ink-3)]">
          Answers come from this brand&apos;s real data.
        </span>
      </span>
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className={canSend ? SEND_READY : SEND_IDLE}
      >
        <ArrowUp size={16} strokeWidth={2.2} />
      </button>
    </div>
  )
}

/** The message box. Enter sends, Shift+Enter adds a new line. */
export function AgentComposer({ orgSlug, onSend, disabled }: AgentComposerProps): JSX.Element {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0 && !disabled

  function submit(event?: FormEvent): void {
    event?.preventDefault()
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={submit}
      className="cat-card-edge w-full rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-content)]/85 px-4 pt-3 pb-2.5 shadow-[0_1px_2px_rgba(16,24,40,.05)] backdrop-blur-sm focus-within:ring-2 focus-within:ring-[#e04a3d]/40"
    >
      <textarea
        rows={2}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask about your AI visibility, or tell the agent what to change..."
        aria-label="Message the SignalorAI Agent"
        className="max-h-40 w-full resize-none bg-transparent text-[14px] text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)]"
      />
      <SendRow orgSlug={orgSlug} canSend={canSend} />
    </form>
  )
}
