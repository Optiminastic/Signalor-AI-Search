'use client'

import { useState } from 'react'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { FinderKeyForm } from '@/features/catalyst/components/agent-page/tools/FinderKeyForm'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import type { ContactFinder } from '@/lib/api/agent-mode-finders'
import { Check } from '@/lib/icons'

interface FinderRowProps {
  finder: ContactFinder
  busy: boolean
  error: string | null
  onSignIn: () => void
  onConnect: (apiKey: string) => void
  onDisconnect: () => void
}

const NOTE = 'text-[11.5px] text-[var(--cat-ink-3)]'
const LINK =
  'self-start text-[11.5px] text-[var(--cat-ink-3)] underline hover:text-[var(--cat-ink)]'

function connectedLabel(finder: ContactFinder): string {
  return finder.method === 'oauth'
    ? 'Connected · signed in'
    : `Connected · key ••••${finder.keyHint}`
}

function Connected({ finder, busy, onDisconnect }: FinderRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-[12px] text-[var(--cat-ink-2)]">
        <Check size={14} strokeWidth={2.4} className="text-emerald-600" />
        {connectedLabel(finder)}
      </span>
      <button type="button" disabled={busy} onClick={onDisconnect} className={SECONDARY_BUTTON}>
        {busy ? 'Disconnecting…' : 'Disconnect'}
      </button>
    </div>
  )
}

/** Sign in on the provider's own page first; an API key only if the owner asks for it. */
function NotConnected(props: FinderRowProps): JSX.Element {
  const [useKey, setUseKey] = useState(false)
  const { finder, busy, onSignIn } = props
  return (
    <div className="flex flex-col gap-1.5">
      {finder.source === 'signalor' && (
        <p className={NOTE}>Using Signalor&apos;s shared account until you connect yours.</p>
      )}
      <PrimaryButton type="button" disabled={busy} onClick={onSignIn} wrapperClassName="self-start">
        {busy ? 'Opening…' : `Sign in with ${finder.label}`}
      </PrimaryButton>
      {useKey ? (
        <FinderKeyForm finder={finder} busy={busy} onConnect={props.onConnect} />
      ) : (
        <button type="button" onClick={() => setUseKey(true)} className={LINK}>
          Use an API key instead
        </button>
      )}
    </div>
  )
}

/** One contact finder: sign in (or a key), or "Connected" with how. */
export function FinderRow(props: FinderRowProps): JSX.Element {
  return (
    <li className="flex flex-col gap-1.5 rounded-md border border-[var(--cat-border)] px-3 py-2.5">
      <span className="text-[13px] font-medium text-[var(--cat-ink)]">{props.finder.label}</span>
      {props.finder.connected ? <Connected {...props} /> : <NotConnected {...props} />}
      {props.error && (
        <p role="alert" className="text-[11.5px] text-[#e04a3d]">
          {props.error}
        </p>
      )}
    </li>
  )
}
