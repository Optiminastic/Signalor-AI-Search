'use client'

import Image from 'next/image'

import { useAgentSocial } from '@/hooks/useAgentSocial'
import { useBufferConnection, type BufferConnection } from '@/hooks/useBufferConnection'
import type { BufferStatus } from '@/lib/api/agent-mode-social'
import { Check } from '@/lib/icons'

interface BufferRowProps {
  orgSlug: string
}

interface StateProps {
  buffer: BufferStatus
  connection: BufferConnection
}

const SERVICE_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  twitter: 'X',
  x: 'X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
}
const ROW =
  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--cat-hover)] disabled:cursor-wait'
const MUTED = 'text-[12px] text-[var(--cat-ink-3)]'
const NAME = 'min-w-0 flex-1 truncate text-[13.5px] font-medium text-[var(--cat-ink)]'
const NOT_CONNECTED: BufferStatus = { connected: false, channels: [] }

function Logo(): JSX.Element {
  return (
    <Image
      src="/logos/buffer.png"
      alt=""
      width={28}
      height={28}
      className="h-7 w-7 shrink-0 rounded-md"
    />
  )
}

export function channelsText(buffer: BufferStatus): string {
  const names = [...new Set(buffer.channels.map(c => SERVICE_LABELS[c.service] ?? c.service))]
  return names.join(', ')
}

function ConnectedState({ buffer, connection }: StateProps): JSX.Element {
  const channels = channelsText(buffer)
  return (
    <div className="flex items-center gap-3 px-2.5 py-2">
      <Logo />
      <span className={NAME}>Buffer</span>
      <span className="flex items-center gap-1 text-[12px] text-emerald-700">
        <Check size={13} strokeWidth={2.4} />
        {channels ? `Connected · ${channels}` : 'Connected'}
      </span>
      <button
        type="button"
        disabled={connection.busy}
        onClick={connection.disconnect}
        className={`${MUTED} underline hover:text-[var(--cat-ink)]`}
      >
        Disconnect
      </button>
    </div>
  )
}

function SignInState({ connection }: StateProps): JSX.Element {
  return (
    <button
      type="button"
      disabled={connection.busy}
      onClick={connection.signIn}
      aria-label="Sign in with Buffer"
      className={ROW}
    >
      <Logo />
      <span className={NAME}>Buffer</span>
      {connection.busy && <span className={MUTED}>Opening…</span>}
    </button>
  )
}

/**
 * Buffer in the Connect tools panel, like Hunter and Apollo: click to sign in on
 * Buffer's own page; once connected, approved social posts go to its queue.
 */
export function BufferRow({ orgSlug }: BufferRowProps): JSX.Element {
  const buffer = useAgentSocial(orgSlug).report?.buffer ?? NOT_CONNECTED
  const connection = useBufferConnection(orgSlug)
  const State = buffer.connected ? ConnectedState : SignInState
  return (
    <li className="flex flex-col gap-1">
      <State buffer={buffer} connection={connection} />
      {connection.error && (
        <p role="alert" className="px-2.5 text-[11.5px] text-[#e04a3d]">
          {connection.error}
        </p>
      )}
    </li>
  )
}
