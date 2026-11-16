'use client'

import Image from 'next/image'

import { useBufferConnection, type BufferConnection } from '@/hooks/useBufferConnection'
import type { BufferStatus } from '@/lib/api/agent-mode-social'
import { Check } from '@/lib/icons'

interface BufferCardProps {
  orgSlug: string
  buffer: BufferStatus
}

interface RowProps {
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
  'flex w-full items-center gap-3 rounded-lg border border-[var(--cat-border)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--cat-hover)] disabled:cursor-wait'
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
const NAME = 'block text-[13.5px] font-medium text-[var(--cat-ink)]'

function Logo(): JSX.Element {
  return (
    <Image src="/logos/buffer.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md" />
  )
}

function channelsText(buffer: BufferStatus): string {
  const names = [...new Set(buffer.channels.map(c => SERVICE_LABELS[c.service] ?? c.service))]
  return names.length ? names.join(', ') : 'no channels found yet'
}

function ConnectedRow({ buffer, connection }: RowProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--cat-border)] px-3 py-2.5">
      <Logo />
      <span className="min-w-0 flex-1">
        <span className={NAME}>Buffer</span>
        <span className={MUTED}>Channels: {channelsText(buffer)}</span>
      </span>
      <span className="flex items-center gap-1 text-[12px] text-emerald-700">
        <Check size={13} strokeWidth={2.4} />
        Connected
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

function ConnectRow({ connection }: RowProps): JSX.Element {
  return (
    <button type="button" disabled={connection.busy} onClick={connection.signIn} className={ROW}>
      <Logo />
      <span className="min-w-0 flex-1">
        <span className={NAME}>Connect Buffer</span>
        <span className={MUTED}>
          Real follower numbers, and approved posts go straight to your Buffer queue.
        </span>
      </span>
      {connection.busy && <span className={MUTED}>Opening…</span>}
    </button>
  )
}

/** Connect the brand's Buffer: its channels' real numbers, and approved posts go to its queue. */
export function BufferCard({ orgSlug, buffer }: BufferCardProps): JSX.Element {
  const connection = useBufferConnection(orgSlug)
  const Row = buffer.connected ? ConnectedRow : ConnectRow
  return (
    <section className="flex flex-col gap-1.5">
      <Row buffer={buffer} connection={connection} />
      {connection.error && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {connection.error}
        </p>
      )}
    </section>
  )
}
