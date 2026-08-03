'use client'

import { useState } from 'react'

import { GithubIntegrationCard } from '@/features/catalyst/components/integrations/GithubIntegrationCard'
import { IntegrationCard } from '@/features/catalyst/components/integrations/IntegrationCard'
import { IntegrationsSummary } from '@/features/catalyst/components/integrations/IntegrationsSummary'
import { ShopifyConnectModal } from '@/features/catalyst/components/integrations/ShopifyConnectModal'
import { SlackIntegrationCard } from '@/features/catalyst/components/integrations/SlackIntegrationCard'
import { INTEGRATION_GROUPS, INTEGRATIONS } from '@/features/catalyst/integrations-data'
import type { IntegrationGroup, IntegrationWithStatus } from '@/features/catalyst/integrations-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { isConnectable, useIntegrationConnect } from '@/hooks/useIntegrationConnect'
import { useIntegrations } from '@/hooks/useIntegrations'
import { useOrgGithubConnection, type OrgGithubConnection } from '@/hooks/useOrgGithubConnection'
import { useSlackConnection, type SlackConnection } from '@/hooks/useSlackConnection'
import { useSession } from '@/lib/auth-client'

// Where a connected integration's manage gear links. GA opens property selection
// so a user can switch which GA4 property feeds the brand without reconnecting.
const MANAGE_HREF: Record<string, string> = {
  'google-analytics': '/settings/integrations/google-analytics/property',
  'search-console': '/settings/integrations/google-search-console/property',
}

interface GroupSectionProps {
  group: IntegrationGroup
  items: IntegrationWithStatus[]
  busySlug: string
  onToggle: (slug: string, next: boolean) => void
}

function GroupSection({ group, items, busySlug, onToggle }: GroupSectionProps): JSX.Element {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        {group}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter(i => i.group === group)
          .map(item => (
            <IntegrationCard
              key={item.slug}
              item={item}
              onToggle={
                isConnectable(item.slug) ? (next: boolean) => onToggle(item.slug, next) : undefined
              }
              busy={busySlug === item.slug}
              manageHref={MANAGE_HREF[item.slug]}
            />
          ))}
      </div>
    </section>
  )
}

function IntegrationsHeader({
  connected,
  total,
}: {
  connected: number
  total: number
}): JSX.Element {
  return (
    <header className="cat-rise mb-4">
      <h1 className="text-[20px] font-semibold tracking-tight text-[var(--cat-ink)]">
        Integrations
      </h1>
      <p className="mt-0.5 text-[13px] text-[var(--cat-ink-3)]">
        Connect your stack to power GEO analysis and auto-fixes ·{' '}
        <span className="font-medium text-[var(--cat-ink-2)]">
          {connected} of {total} connected
        </span>
      </p>
    </header>
  )
}

/** GitHub is one org-level connection (not a per-framework toggle), so it lives in
 *  its own "Code" section above the catalog-driven groups. */
function GithubSection({ gh }: { gh: OrgGithubConnection }): JSX.Element {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Code
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GithubIntegrationCard gh={gh} />
      </div>
    </section>
  )
}

/** Where finished analyses get delivered. Slack today; more channels later. */
function NotificationsSection({ slack }: { slack: SlackConnection }): JSX.Element {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Notifications
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SlackIntegrationCard s={slack} />
      </div>
    </section>
  )
}

interface CountableItem {
  connected: boolean
}

/** GitHub and Slack are first-class connectors, counted alongside the catalog. */
function connectorTally(
  items: CountableItem[],
  githubConnected: boolean,
  slackConnected: boolean,
): { connectedCount: number; total: number } {
  const extras = [githubConnected, slackConnected]
  return {
    connectedCount: items.filter(i => i.connected).length + extras.filter(Boolean).length,
    total: items.length + extras.length,
  }
}

interface ConnectorSectionsProps {
  github: OrgGithubConnection
  slack: SlackConnection
  items: IntegrationWithStatus[]
  busySlug: string
  onToggle: (slug: string, next: boolean) => void
}

/** Every section, in order: the first-class connectors, then the catalog. */
function ConnectorSections({
  github,
  slack,
  items,
  busySlug,
  onToggle,
}: ConnectorSectionsProps): JSX.Element {
  return (
    <div className="space-y-5">
      <GithubSection gh={github} />
      <NotificationsSection slack={slack} />
      {INTEGRATION_GROUPS.map(group => (
        <GroupSection
          key={group}
          group={group}
          items={items}
          busySlug={busySlug}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

export function IntegrationsView(): JSX.Element {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const { activeOrg } = useActiveProject()
  const { connected } = useIntegrations()
  const { toggle, busySlug, error } = useIntegrationConnect()
  // Scope GitHub to the brand on screen — an account can own several brands,
  // each connecting a different repo.
  const github = useOrgGithubConnection({ email, orgId: activeOrg?.id })
  const slack = useSlackConnection()
  const [shopifyOpen, setShopifyOpen] = useState(false)
  const items = INTEGRATIONS.map(i => ({ ...i, connected: connected.has(i.slug) }))
  const { connectedCount, total } = connectorTally(items, github.connected, slack.connected)

  // Shopify connect opens the custom-app token modal (works without OAuth env);
  // disconnect and every other provider go through the normal toggle.
  const handleToggle = (slug: string, next: boolean): void => {
    if (slug === 'shopify' && next) return setShopifyOpen(true)
    void toggle(slug, next)
  }

  return (
    <div className="w-full">
      {shopifyOpen && <ShopifyConnectModal onClose={() => setShopifyOpen(false)} />}
      <IntegrationsHeader connected={connectedCount} total={total} />

      {error && (
        <p className="mb-3 rounded-md bg-[#E5484D]/8 px-3 py-2 text-[12.5px] text-[#E5484D]">
          {error}
        </p>
      )}

      <IntegrationsSummary connected={connectedCount} total={total} />

      <ConnectorSections
        github={github}
        slack={slack}
        items={items}
        busySlug={busySlug}
        onToggle={handleToggle}
      />
    </div>
  )
}
