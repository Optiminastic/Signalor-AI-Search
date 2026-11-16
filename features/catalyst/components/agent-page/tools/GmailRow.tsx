'use client'

import Image from 'next/image'

import { useGmailConnection, type GmailConnection } from '@/hooks/useGmailConnection'
import { Check } from '@/lib/icons'

interface GmailRowProps {
  orgSlug: string
}

interface StateProps {
  gmail: GmailConnection
}

const ROW =
  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--cat-hover)] disabled:cursor-wait'
const MUTED = 'text-[12px] text-[var(--cat-ink-3)]'
const NAME = 'min-w-0 flex-1 truncate text-[13.5px] font-medium text-[var(--cat-ink)]'

function Logo(): JSX.Element {
  return (
    <Image
      src="/logos/gmail.svg"
      alt=""
      width={28}
      height={28}
      className="h-7 w-7 shrink-0 object-contain p-0.5"
    />
  )
}

function ConnectedState({ gmail }: StateProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2">
      <Logo />
      <span className={NAME}>Gmail</span>
      <span className="flex min-w-0 items-center gap-1 truncate text-[12px] text-emerald-700">
        <Check size={13} strokeWidth={2.4} />
        {gmail.status.mailbox || 'Connected'}
      </span>
      <button
        type="button"
        disabled={gmail.busy}
        onClick={gmail.disconnect}
        className={`${MUTED} underline hover:text-[var(--cat-ink)]`}
      >
        Disconnect
      </button>
    </div>
  )
}

function SignInState({ gmail }: StateProps): JSX.Element {
  return (
    <button
      type="button"
      disabled={gmail.busy}
      onClick={gmail.signIn}
      aria-label="Sign in with Gmail"
      className={ROW}
    >
      <Logo />
      <span className={NAME}>Gmail</span>
      {gmail.busy && <span className={MUTED}>Opening…</span>}
    </button>
  )
}

/** Gmail in the Connect tools panel: outreach emails and pitches go out from the brand's own mailbox. */
export function GmailRow({ orgSlug }: GmailRowProps): JSX.Element {
  const gmail = useGmailConnection(orgSlug)
  const State = gmail.status.connected ? ConnectedState : SignInState
  return (
    <li className="flex flex-col gap-1">
      <State gmail={gmail} />
      {gmail.error && (
        <p role="alert" className="px-2.5 text-[11.5px] text-[#e04a3d]">
          {gmail.error}
        </p>
      )}
    </li>
  )
}
