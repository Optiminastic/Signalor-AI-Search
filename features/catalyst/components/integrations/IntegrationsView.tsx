'use client'

import { useState } from 'react'

import { GithubIntegrationCard } from '@/features/catalyst/components/integrations/GithubIntegrationCard'
import { IntegrationCard } from '@/features/catalyst/components/integrations/IntegrationCard'
import { IntegrationsSummary } from '@/features/catalyst/components/integrations/IntegrationsSummary'
import { ShopifyConnectModal } from '@/features/catalyst/components/integrations/ShopifyConnectModal'
import { INTEGRATION_GROUPS, INTEGRATIONS } from '@/features/catalyst/integrations-data'
import type { IntegrationGroup, IntegrationWithStatus } from '@/features/catalyst/integrations-data'
import { isConnectable, useIntegrationConnect } from '@/hooks/useIntegrationConnect'
import { useIntegrations } from '@/hooks/useIntegrations'
import { useOrgGithubConnection, type OrgGithubConnection } from '@/hooks/useOrgGithubConnection'
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

export function IntegrationsView(): JSX.Element {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const { connected } = useIntegrations()
  const { toggle, busySlug, error } = useIntegrationConnect()
  const github = useOrgGithubConnection({ email })
  const [shopifyOpen, setShopifyOpen] = useState(false)
  const items = INTEGRATIONS.map(i => ({ ...i, connected: connected.has(i.slug) }))

  // GitHub is a first-class connector counted alongside the catalog integrations.
  const connectedCount = items.filter(i => i.connected).length + (github.connected ? 1 : 0)
  const total = items.length + 1

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

      <div className="space-y-5">
        <GithubSection gh={github} />
        {INTEGRATION_GROUPS.map(group => (
          <GroupSection
            key={group}
            group={group}
            items={items}
            busySlug={busySlug}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  )
}
