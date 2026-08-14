'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { GithubIntegrationCard } from '@/features/catalyst/components/integrations/GithubIntegrationCard'
import { IntegrationCard } from '@/features/catalyst/components/integrations/IntegrationCard'
import { IntegrationsSummary } from '@/features/catalyst/components/integrations/IntegrationsSummary'
import {
  PropertyPickerModal,
  type PickerProvider,
} from '@/features/catalyst/components/integrations/PropertyPickerModal'
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

/** Providers whose "Manage" opens a property picker rather than navigating away. */
const PICKER_PROVIDERS = new Set<string>(['google-analytics', 'search-console'])

function pickerFor(slug: string): PickerProvider | undefined {
  return PICKER_PROVIDERS.has(slug) ? (slug as PickerProvider) : undefined
}

interface GroupSectionProps {
  group: IntegrationGroup
  items: IntegrationWithStatus[]
  busySlug: string
  onToggle: (slug: string, next: boolean) => void
  onManage: (slug: PickerProvider) => void
}

function GroupSection({
  group,
  items,
  busySlug,
  onToggle,
  onManage,
}: GroupSectionProps): JSX.Element {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        {group}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter(i => i.group === group)
          .map(item => {
            const picker = pickerFor(item.slug)
            return (
              <IntegrationCard
                key={item.slug}
                item={item}
                onToggle={
                  isConnectable(item.slug)
                    ? (next: boolean) => onToggle(item.slug, next)
                    : undefined
                }
                busy={busySlug === item.slug}
                onManage={picker ? () => onManage(picker) : undefined}
              />
            )
          })}
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
  onManage: (slug: PickerProvider) => void
}

/** Every section, in order: the first-class connectors, then the catalog. */
function ConnectorSections({
  github,
  slack,
  items,
  busySlug,
  onToggle,
  onManage,
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
          onManage={onManage}
        />
      ))}
    </div>
  )
}

/** Which picker a URL is asking for, if any. */
function requestedPicker(gsc: string | null, picker: string | null): PickerProvider | null {
  // GSC's server-side callback appends `?gsc=connected` and cannot be changed
  // from here; `?picker=` is the explicit form other pages link with.
  if (gsc === 'connected') return 'search-console'
  return picker === 'google-analytics' || picker === 'search-console' ? picker : null
}

/**
 * Open the picker when the URL asks for it.
 *
 * Two callers: the GSC OAuth round-trip lands back here with `?gsc=connected`,
 * and the analytics cards deep-link with `?picker=<provider>` when a property
 * needs choosing. Tokens alone are not a working connection — sync fails with
 * "No GA4 property selected" until a property is bound — so this step used to be
 * its own page and now opens over the card it configures.
 *
 * The query is stripped once handled, so a refresh doesn't reopen the modal.
 */
function useRequestedPicker(open: (p: PickerProvider) => void): void {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const gsc = params.get('gsc')
  const picker = params.get('picker')

  useEffect(() => {
    const provider = requestedPicker(gsc, picker)
    if (!provider) return
    open(provider)
    router.replace(pathname, { scroll: false })
    // `open` is a setState setter and stable; listing it would reopen the modal
    // on every render once the query is stripped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gsc, picker, pathname, router])
}

interface OverlaysProps {
  shopifyOpen: boolean
  closeShopify: () => void
  picker: PickerProvider | null
  email: string
  closePicker: () => void
}

/** Everything that renders over the grid. The picker needs an email to query
 *  with, so it stays closed until the session resolves rather than mounting a
 *  picker that would fetch nothing. */
function Overlays({
  shopifyOpen,
  closeShopify,
  picker,
  email,
  closePicker,
}: OverlaysProps): JSX.Element {
  return (
    <>
      {shopifyOpen && <ShopifyConnectModal onClose={closeShopify} />}
      {picker && email && (
        <PropertyPickerModal provider={picker} email={email} onClose={closePicker} />
      )}
    </>
  )
}

interface IntegrationsPageState {
  email: string
  github: OrgGithubConnection
  slack: SlackConnection
  items: IntegrationWithStatus[]
  busySlug: string
  error: string
  shopifyOpen: boolean
  setShopifyOpen: (open: boolean) => void
  picker: PickerProvider | null
  setPicker: (p: PickerProvider | null) => void
  handleToggle: (slug: string, next: boolean) => void
  connectedCount: number
  total: number
}

/** Everything the page reads and tracks, so the component below is just markup. */
function useIntegrationsPage(): IntegrationsPageState {
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
  const [picker, setPicker] = useState<PickerProvider | null>(null)
  const items = INTEGRATIONS.map(i => ({ ...i, connected: connected.has(i.slug) }))
  const tally = connectorTally(items, github.connected, slack.connected)

  useRequestedPicker(setPicker)

  // Shopify connect opens the custom-app token modal (works without OAuth env);
  // disconnect and every other provider go through the normal toggle.
  const handleToggle = (slug: string, next: boolean): void => {
    if (slug === 'shopify' && next) return setShopifyOpen(true)
    void toggle(slug, next)
  }

  return {
    email,
    github,
    slack,
    items,
    busySlug,
    error,
    shopifyOpen,
    setShopifyOpen,
    picker,
    setPicker,
    handleToggle,
    ...tally,
  }
}

function IntegrationsBody(): JSX.Element {
  const p = useIntegrationsPage()

  return (
    <div className="w-full">
      <Overlays
        shopifyOpen={p.shopifyOpen}
        closeShopify={() => p.setShopifyOpen(false)}
        picker={p.picker}
        email={p.email}
        closePicker={() => p.setPicker(null)}
      />
      <IntegrationsHeader connected={p.connectedCount} total={p.total} />

      {p.error && (
        <p className="mb-3 rounded-md bg-[#E5484D]/8 px-3 py-2 text-[12.5px] text-[#E5484D]">
          {p.error}
        </p>
      )}

      <IntegrationsSummary connected={p.connectedCount} total={p.total} />

      <ConnectorSections
        github={p.github}
        slack={p.slack}
        items={p.items}
        busySlug={p.busySlug}
        onToggle={p.handleToggle}
        onManage={p.setPicker}
      />
    </div>
  )
}

/** Suspense boundary: `useOAuthReturn` reads search params, which Next requires
 *  to sit under one so the route can still be statically prerendered. */
export function IntegrationsView(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <IntegrationsBody />
    </Suspense>
  )
}
