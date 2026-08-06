'use client'

import Link from 'next/link'

import {
  ConnectButton,
  ConnectedBadge,
  ConnectorCard,
  ConnectorFooterRow,
  ConnectorSpinner,
  DisconnectButton,
} from '@/features/catalyst/components/integrations/ConnectorCard'
import type { IntegrationWithStatus } from '@/features/catalyst/integrations-data'
import { Settings2 } from '@/lib/icons'

/**
 * A catalog integration, rendered with the same shell as the first-class
 * connectors (GitHub, Slack).
 *
 * These cards used to signal "connected" with a red toggle switch while the
 * connectors used a green "Connected" badge, so one page showed two different
 * connected states — and a red control next to green cards reads as an error.
 * Everything now shares `ConnectorCard`: a badge for state, an explicit Connect
 * button to start, and a disconnect control in the footer.
 */

interface IntegrationCardProps {
  item: IntegrationWithStatus
  /** Omitted for providers with no self-serve flow — no Connect button is shown. */
  onToggle?: (next: boolean) => void
  busy?: boolean
  /** When connected, where the manage link points (e.g. GA property selection). */
  manageHref?: string
}

function Action({ item, onToggle, busy }: IntegrationCardProps): JSX.Element | null {
  if (busy) return <ConnectorSpinner />
  if (item.connected) return <ConnectedBadge />
  // No self-serve flow (WordPress plugin, Framer plugin, an SDK snippet): the
  // description already explains the setup, so show no button rather than a dead
  // control — the old inert switch just looked broken.
  if (!onToggle) return null
  return <ConnectButton onClick={() => onToggle(true)} style={{ background: item.accent }} />
}

function Footer({ item, onToggle, busy, manageHref }: IntegrationCardProps): JSX.Element | null {
  if (!item.connected) return null
  return (
    <ConnectorFooterRow>
      {manageHref ? (
        <Link
          href={manageHref}
          className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-[11.5px] font-medium text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)]"
        >
          <Settings2 size={13} strokeWidth={2} />
          Manage
        </Link>
      ) : (
        <span className="min-w-0 flex-1" />
      )}
      {onToggle && (
        <DisconnectButton onClick={() => onToggle(false)} busy={busy} name={item.name} />
      )}
    </ConnectorFooterRow>
  )
}

export function IntegrationCard(props: IntegrationCardProps): JSX.Element {
  const { item } = props
  return (
    <ConnectorCard
      name={item.name}
      description={item.description}
      // eslint-disable-next-line @next/next/no-img-element
      mark={<img src={item.logo} alt="" className="h-5 w-5 object-contain" />}
      markStyle={{ background: `${item.accent}14` }}
      tone={item.connected ? 'connected' : 'idle'}
      action={<Action {...props} />}
      footer={<Footer {...props} />}
    />
  )
}
