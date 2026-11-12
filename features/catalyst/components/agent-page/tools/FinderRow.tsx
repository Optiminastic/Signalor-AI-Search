'use client'

import { useId, useState, type KeyboardEvent } from 'react'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { ContactFinder } from '@/lib/api/agent-mode-finders'
import { Check } from '@/lib/icons'

interface FinderRowProps {
  finder: ContactFinder
  busy: boolean
  error: string | null
  onConnect: (apiKey: string) => void
  onDisconnect: () => void
}

const WHERE_TO_FIND: Record<string, string> = {
  hunter: 'hunter.io → API',
  apollo: 'Apollo → Settings → API keys',
}
const NOTE = 'text-[11.5px] text-[var(--cat-ink-3)]'
const INPUT =
  'h-[34px] min-w-0 flex-1 rounded-md border border-[var(--cat-border)] bg-transparent px-2.5 text-[12.5px] text-[var(--cat-ink)] outline-none focus:ring-2 focus:ring-[#e04a3d]/40'

function sourceNote(finder: ContactFinder): string {
  if (finder.source === 'signalor') return "Using Signalor's shared key until you connect yours."
  return `Paste your API key (${WHERE_TO_FIND[finder.provider] ?? 'provider settings'}).`
}

function Connected({ finder, busy, onDisconnect }: FinderRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-[12px] text-[var(--cat-ink-2)]">
        <Check size={14} strokeWidth={2.4} className="text-emerald-600" />
        Connected · key ••••{finder.keyHint}
      </span>
      <button type="button" disabled={busy} onClick={onDisconnect} className={SECONDARY_BUTTON}>
        {busy ? 'Disconnecting…' : 'Disconnect'}
      </button>
    </div>
  )
}

function KeyForm({ finder, busy, onConnect }: FinderRowProps): JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const fieldId = useId()
  function submit(): void {
    if (apiKey.trim()) onConnect(apiKey.trim())
  }
  // Not a <form>: this sits inside the chat composer's form, and Enter here
  // must connect the key, not send a chat message.
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') return
    event.preventDefault()
    submit()
  }
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className={NOTE}>
        {sourceNote(finder)}
      </label>
      <div className="flex gap-2">
        <input
          id={fieldId}
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`${finder.label} API key`}
          className={INPUT}
        />
        <button
          type="button"
          disabled={busy || !apiKey.trim()}
          onClick={submit}
          className={SECONDARY_BUTTON}
        >
          {busy ? 'Checking…' : 'Connect'}
        </button>
      </div>
    </div>
  )
}

/** One contact finder: its key form, or "Connected" with the key's last four. */
export function FinderRow(props: FinderRowProps): JSX.Element {
  return (
    <li className="flex flex-col gap-1.5 rounded-md border border-[var(--cat-border)] px-3 py-2.5">
      <span className="text-[13px] font-medium text-[var(--cat-ink)]">{props.finder.label}</span>
      {props.finder.connected ? <Connected {...props} /> : <KeyForm {...props} />}
      {props.error && (
        <p role="alert" className="text-[11.5px] text-[#e04a3d]">
          {props.error}
        </p>
      )}
    </li>
  )
}
