'use client'

import type { SlackConnection } from '@/hooks/useSlackConnection'
import { Check, Loader2, Unlink2 } from '@/lib/icons'

const CARD_BASE =
  'group relative flex flex-col rounded-md border p-3.5 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(16,24,40,.07)]'

/** Slack's mark, inlined so the card needs no network request for its icon. */
function SlackMark({ size = 18 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 122.8 122.8" aria-hidden>
      <path
        d="M25.8 77.6a12.9 12.9 0 1 1-12.9-12.9h12.9zm6.5 0a12.9 12.9 0 0 1 25.8 0v32.3a12.9 12.9 0 0 1-25.8 0z"
        fill="#E01E5A"
      />
      <path
        d="M45.2 25.8a12.9 12.9 0 1 1 12.9-12.9v12.9zm0 6.5a12.9 12.9 0 0 1 0 25.8H12.9a12.9 12.9 0 0 1 0-25.8z"
        fill="#36C5F0"
      />
      <path
        d="M97 45.2a12.9 12.9 0 1 1 12.9 12.9H97zm-6.5 0a12.9 12.9 0 0 1-25.8 0V12.9a12.9 12.9 0 0 1 25.8 0z"
        fill="#2EB67D"
      />
      <path
        d="M77.6 97a12.9 12.9 0 1 1-12.9 12.9V97zm0-6.5a12.9 12.9 0 0 1 0-25.8h32.3a12.9 12.9 0 0 1 0 25.8z"
        fill="#ECB22E"
      />
    </svg>
  )
}

function description(s: SlackConnection): string {
  // Connected is not the finish line: with no channel chosen nothing is sent,
  // so say so rather than showing a reassuring "Connected" and going quiet.
  if (s.needsChannel) return 'Choose a channel so reports have somewhere to land.'
  if (s.connected) return `Analysis reports post to #${s.channelName} when a run finishes.`
  if (s.connecting) return 'Approve the workspace in the Slack window.'
  return 'Post a GEO summary to Slack whenever an analysis finishes.'
}

function TopAction({ s }: { s: SlackConnection }): JSX.Element | null {
  if (s.loading || s.connecting)
    return <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
  if (s.connected && !s.needsChannel) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(47,190,126,0.12)] px-2 py-0.5 text-[11px] font-semibold text-[#1e8a5c]">
        <Check size={12} strokeWidth={3} />
        Connected
      </span>
    )
  }
  if (s.connected) return null
  return (
    <button
      type="button"
      onClick={s.connect}
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#4A154B] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#611f69]"
    >
      <SlackMark size={13} />
      Connect
    </button>
  )
}

/** Channel picker. Red edge while unset, because an unset channel means silence. */
function ChannelPicker({ s }: { s: SlackConnection }): JSX.Element {
  const edge = s.needsChannel ? 'border-[#e04a3d]' : 'border-[var(--cat-border)]'
  return (
    <label className="flex min-w-0 flex-1 items-center gap-1.5">
      <span className="shrink-0 text-[11px] text-[var(--cat-ink-3)]">Channel</span>
      <select
        value={s.channels.find(c => c.name === s.channelName)?.id ?? ''}
        disabled={s.selectingChannel || s.channelsLoading}
        onChange={e => {
          const channel = s.channels.find(c => c.id === e.target.value)
          if (channel) s.selectChannel(channel)
        }}
        aria-label="Channel for analysis reports"
        className={`min-w-0 flex-1 truncate rounded-md border ${edge} bg-[var(--cat-card)] px-1.5 py-1 text-[11px] text-[var(--cat-ink-2)] outline-none disabled:opacity-60`}
      >
        <option value="" disabled>
          {s.channelsLoading ? 'Loading channels…' : 'Select a channel…'}
        </option>
        {s.channels.map(c => (
          <option key={c.id} value={c.id}>
            #{c.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function Footer({ s }: { s: SlackConnection }): JSX.Element | null {
  if (s.connecting) {
    return (
      <button
        type="button"
        onClick={s.cancel}
        className="mt-2.5 self-start text-[11.5px] font-medium text-neutral-500 transition-colors hover:text-[var(--cat-ink)]"
      >
        Cancel
      </button>
    )
  }
  if (!s.connected) return null
  return (
    <div className="mt-2.5 flex items-center justify-between gap-2">
      <ChannelPicker s={s} />
      <button
        type="button"
        onClick={s.disconnect}
        disabled={s.disconnecting}
        className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-neutral-500 transition-colors hover:text-[var(--cat-ink)] disabled:opacity-60"
      >
        {s.disconnecting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Unlink2 className="h-3 w-3" />
        )}
        Disconnect
      </button>
    </div>
  )
}

// Connected-but-silent gets the warning edge, not the green one: a workspace
// with no channel selected delivers nothing.
const BORDER = {
  needsChannel: 'border-[rgba(224,74,61,0.4)] bg-[rgba(224,74,61,0.03)]',
  connected: 'border-[rgba(47,190,126,0.4)] bg-[rgba(47,190,126,0.035)]',
  idle: 'border-[var(--cat-border)] bg-[var(--cat-card)]',
} as const

function borderFor(s: SlackConnection): string {
  if (s.needsChannel) return BORDER.needsChannel
  return s.connected ? BORDER.connected : BORDER.idle
}

/** Slack report delivery — one workspace connection per brand. */
export function SlackIntegrationCard({ s }: { s: SlackConnection }): JSX.Element {
  const border = borderFor(s)
  return (
    <div className={`${CARD_BASE} ${border}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#4A154B]">
          <SlackMark size={18} />
        </span>
        <TopAction s={s} />
      </div>
      <p className="text-foreground mt-2.5 text-[13px] font-semibold">Slack</p>
      <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--cat-ink-3)]">
        {description(s)}
      </p>
      {s.error && (
        <p className="mt-2 text-[11px] font-medium text-[#E5484D]">
          Couldn&apos;t start the Slack connection. Try again in a moment.
        </p>
      )}
      <Footer s={s} />
    </div>
  )
}
