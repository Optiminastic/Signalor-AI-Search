'use client'

import { useState, type FormEvent, type KeyboardEvent } from 'react'

import { ArrowUp } from '@/lib/icons'

interface AgentComposerProps {
  onSend: (message: string) => void
  /** True while a reply is being written. */
  disabled: boolean
}

const SEND_READY = 'auth-cta-btn grid h-8 w-8 place-items-center rounded-md text-white'
const SEND_IDLE =
  'grid h-8 w-8 place-items-center rounded-md bg-[var(--cat-track)] text-[var(--cat-ink-3)]'

function SendRow({ canSend }: { canSend: boolean }): JSX.Element {
  return (
    <div className="mt-1 flex items-center justify-between">
      <span className="text-[11px] text-[var(--cat-ink-3)]">
        Answers come from this brand&apos;s real data.
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
export function AgentComposer({ onSend, disabled }: AgentComposerProps): JSX.Element {
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
      className="cat-card-edge w-full rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] px-4 pt-3 pb-2.5 shadow-[0_1px_2px_rgba(16,24,40,.05)] focus-within:ring-2 focus-within:ring-[#e04a3d]/40"
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
      <SendRow canSend={canSend} />
    </form>
  )
}
