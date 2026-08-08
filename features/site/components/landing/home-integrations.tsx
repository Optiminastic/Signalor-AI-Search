import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight } from '@/features/site/components/icons'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'

type Integration = {
  name: string
  logo: string
  detail: string
  live?: boolean
}

const INTEGRATIONS: Integration[] = [
  { name: 'Shopify', logo: '/logos/shopify.svg', detail: 'Auto-fix schema', live: true },
  { name: 'WordPress', logo: '/logos/wordpress.svg', detail: 'One-click fixes', live: true },
  { name: 'Google Analytics', logo: '/logos/google-analytics.svg', detail: 'AI-referred traffic' },
  { name: 'Search Console', logo: '/logos/search-console.svg', detail: 'Search data' },
  { name: 'Slack', logo: '/logos/slack.svg', detail: 'Citation alerts' },
  { name: 'Zapier', logo: '/logos/zapier.svg', detail: 'Custom workflows' },
]

/** One integration cell: logo, name, what it does, and a Live pill if shipped. */
function IntegrationCell({ integration }: { integration: Integration }): JSX.Element {
  return (
    <div className="group bg-card hover:bg-muted/40 relative flex flex-col items-start gap-4 px-6 py-8 transition-colors duration-200">
      {integration.live ? (
        <span className="bg-success/10 text-success absolute top-4 right-4 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase">
          Live
        </span>
      ) : null}
      <Image
        src={integration.logo}
        alt=""
        width={30}
        height={30}
        className="size-7.5 object-contain transition-transform duration-200 motion-safe:group-hover:scale-110"
      />
      <div>
        <p className="text-foreground text-sm font-semibold">{integration.name}</p>
        <p className="text-muted-foreground mt-0.5 text-[13px]">{integration.detail}</p>
      </div>
    </div>
  )
}

/** Asymmetric header: headline left, copy + link bottom-right. */
function IntegrationsHeader(): JSX.Element {
  return (
    <div className="grid gap-6 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-2 lg:gap-14">
      <div>
        <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
          Integrations
        </p>
        <h2
          id="home-integrations-heading"
          className="text-foreground mt-3 max-w-md text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          What integrations does Signalor support?
        </h2>
      </div>
      <div className="max-w-md lg:self-end lg:justify-self-end">
        <p className="text-muted-foreground text-base leading-relaxed text-pretty">
          Auto-fix schema and meta on{' '}
          <strong className="text-foreground font-semibold">Shopify and WordPress</strong>, pull
          search data from Google, and pipe alerts into Slack. More on the way.
        </p>
        <Link
          href="/integration"
          className="text-primary hover:text-primary/80 mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
        >
          Browse integrations
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  )
}

export function HomeIntegrations(): JSX.Element {
  return (
    <section id="integrations" className="scroll-mt-20" aria-labelledby="home-integrations-heading">
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <IntegrationsHeader />
        <div className="border-border relative border-t">
          <GridCornerHandles top />
          <div className="bg-border grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
            {INTEGRATIONS.map(integration => (
              <IntegrationCell key={integration.name} integration={integration} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
