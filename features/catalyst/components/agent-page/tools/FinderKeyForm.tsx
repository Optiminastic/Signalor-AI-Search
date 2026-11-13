'use client'

import { useId, useState, type KeyboardEvent } from 'react'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { ContactFinder } from '@/lib/api/agent-mode-finders'

interface FinderKeyFormProps {
  finder: ContactFinder
  busy: boolean
  onConnect: (apiKey: string) => void
}

const WHERE_TO_FIND: Record<string, string> = {
  hunter: 'hunter.io → API',
  apollo: 'Apollo → Settings → API keys',
}
const NOTE = 'text-[11.5px] text-[var(--cat-ink-3)]'
const INPUT =
  'h-[34px] min-w-0 flex-1 rounded-md border border-[var(--cat-border)] bg-transparent px-2.5 text-[12.5px] text-[var(--cat-ink)] outline-none focus:ring-2 focus:ring-[#e04a3d]/40'

/** Fallback to signing in: paste an API key (checked by ranking-be, stored encrypted). */
export function FinderKeyForm({ finder, busy, onConnect }: FinderKeyFormProps): JSX.Element {
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
        Paste your API key ({WHERE_TO_FIND[finder.provider] ?? 'provider settings'}).
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
