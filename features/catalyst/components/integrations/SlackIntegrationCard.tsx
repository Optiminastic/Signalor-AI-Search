'use client'

import {
  CancelButton,
  ConnectButton,
  ConnectedBadge,
  ConnectorCard,
  ConnectorFooter,
  ConnectorSelect,
  ConnectorSpinner,
  type ConnectorTone,
} from '@/features/catalyst/components/integrations/ConnectorCard'
import type { SlackConnection } from '@/hooks/useSlackConnection'

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

function tone(s: SlackConnection): ConnectorTone {
  if (s.needsChannel) return 'attention'
  return s.connected ? 'connected' : 'idle'
}

function Action({ s }: { s: SlackConnection }): JSX.Element | null {
  if (s.loading || s.connecting) return <ConnectorSpinner />
  if (s.connected) return s.needsChannel ? null : <ConnectedBadge />
  return (
    <ConnectButton
      onClick={s.connect}
      mark={<SlackMark size={13} />}
      className="bg-[#4A154B] hover:bg-[#611f69]"
    />
  )
}

function Footer({ s }: { s: SlackConnection }): JSX.Element | null {
  if (s.connecting) return <CancelButton onClick={s.cancel} />
  if (!s.connected) return null
  return (
    <ConnectorFooter
      name="Slack"
      label="Channel"
      onDisconnect={s.disconnect}
      disconnecting={s.disconnecting}
      control={
        <ConnectorSelect
          value={s.channels.find(c => c.name === s.channelName)?.id ?? ''}
          options={s.channels.map(c => ({ value: c.id, label: `#${c.name}` }))}
          onChange={id => {
            const channel = s.channels.find(c => c.id === id)
            if (channel) s.selectChannel(channel)
          }}
          disabled={s.selectingChannel || s.channelsLoading}
          needsChoice={s.needsChannel}
          placeholder={s.channelsLoading ? 'Loading channels…' : 'Select a channel…'}
          ariaLabel="Channel for analysis reports"
        />
      }
    />
  )
}

/** Slack report delivery — one workspace connection per brand. */
export function SlackIntegrationCard({ s }: { s: SlackConnection }): JSX.Element {
  return (
    <ConnectorCard
      name="Slack"
      description={description(s)}
      mark={<SlackMark size={18} />}
      markClassName="bg-[#4A154B]"
      tone={tone(s)}
      action={<Action s={s} />}
      footer={<Footer s={s} />}
      error={s.error}
    />
  )
}
