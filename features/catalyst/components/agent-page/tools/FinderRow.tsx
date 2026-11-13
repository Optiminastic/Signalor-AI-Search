'use client'

import Image from 'next/image'

import { FinderKeyForm } from '@/features/catalyst/components/agent-page/tools/FinderKeyForm'
import type { ContactFinder } from '@/lib/api/agent-mode-finders'
import { Check } from '@/lib/icons'

interface FinderRowProps {
  finder: ContactFinder
  busy: boolean
  error: string | null
  /** Show the API-key fallback under the row (only when not connected). */
  showKeyForm: boolean
  onSignIn: () => void
  onConnect: (apiKey: string) => void
  onDisconnect: () => void
}

const LOGOS: Record<string, string> = { hunter: '/logos/hunter.png', apollo: '/logos/apollo.png' }
const LOGO_SIZE = 28
const ROW =
  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--cat-hover)] disabled:cursor-wait'
const MUTED = 'text-[12px] text-[var(--cat-ink-3)]'

function Logo({ finder }: { finder: ContactFinder }): JSX.Element {
  const src = LOGOS[finder.provider]
  if (!src) return <span className="h-7 w-7 rounded-md bg-[var(--cat-hover)]" />
  return (
    <Image
      src={src}
      alt=""
      width={LOGO_SIZE}
      height={LOGO_SIZE}
      className="h-7 w-7 shrink-0 rounded-md"
    />
  )
}

function Name({ finder }: { finder: ContactFinder }): JSX.Element {
  return (
    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-[var(--cat-ink)]">
      {finder.label}
    </span>
  )
}

function ConnectedRow({ finder, busy, onDisconnect }: FinderRowProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2">
      <Logo finder={finder} />
      <Name finder={finder} />
      <span className="flex items-center gap-1 text-[12px] text-emerald-700">
        <Check size={13} strokeWidth={2.4} />
        Connected
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={onDisconnect}
        aria-label={`Disconnect ${finder.label}`}
        className={`${MUTED} underline hover:text-[var(--cat-ink)]`}
      >
        {busy ? 'Disconnecting…' : 'Disconnect'}
      </button>
    </div>
  )
}

/** The whole row signs in: the provider's own login page, like Claude and ChatGPT. */
function SignInRow({ finder, busy, onSignIn }: FinderRowProps): JSX.Element {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onSignIn}
      aria-label={`Sign in with ${finder.label}`}
      className={ROW}
    >
      <Logo finder={finder} />
      <Name finder={finder} />
      {busy && <span className={MUTED}>Opening…</span>}
    </button>
  )
}

/** One contact finder: its logo and name. Click to sign in; shows when connected. */
export function FinderRow(props: FinderRowProps): JSX.Element {
  const { finder, error } = props
  return (
    <li className="flex flex-col gap-1">
      {finder.connected ? <ConnectedRow {...props} /> : <SignInRow {...props} />}
      {!finder.connected && props.showKeyForm && (
        <div className="px-2.5 pb-1">
          <FinderKeyForm finder={finder} busy={props.busy} onConnect={props.onConnect} />
        </div>
      )}
      {error && (
        <p role="alert" className="px-2.5 text-[11.5px] text-[#e04a3d]">
          {error}
        </p>
      )}
    </li>
  )
}
