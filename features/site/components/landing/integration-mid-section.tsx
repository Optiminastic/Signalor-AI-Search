import { Plug, RefreshCw, Shield } from '@/features/site/components/icons'

import { INTEGRATION_HUB_STATS } from '@/features/site/lib/landing-integration-content'

const VALUE_ROWS = [
  {
    icon: Plug,
    title: 'Native connectors',
    body: 'Shopify and WordPress are first-class paths into the same GEO engine you use from the URL analyzer.',
  },
  {
    icon: RefreshCw,
    title: 'Schedules that match shipping cadence',
    body: 'Product drops, blog pushes, and theme tweaks stop drifting from what models are asked about your brand.',
  },
  {
    icon: Shield,
    title: 'Least-privilege posture',
    body: 'Marketing overview pages stay read-oriented; deeper OAuth flows live in your authenticated workspace.',
  },
] as const

export function IntegrationMidSection() {
  return (
    <>
      <section className="border-border/60 bg-background/80 border-t px-6 py-14 backdrop-blur-sm lg:px-12">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {INTEGRATION_HUB_STATS.map(s => (
            <div
              key={s.label}
              className="rounded-none border border-black/8 bg-white/80 px-5 py-6 text-center shadow-sm"
            >
              <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                {s.label}
              </p>
              <p className="text-foreground mt-2 text-3xl font-bold tracking-tight">{s.value}</p>
              <p className="text-muted-foreground mt-2 text-sm leading-snug font-light">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 border-t px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground font-sans text-3xl font-bold tracking-tighter sm:text-4xl">
            Why teams wire integrations first
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed font-light">
            GEO scoring is only as honest as the content and commerce layer it reads. Connectors
            keep SignalorAI aligned with the systems you already trust to publish and sell.
          </p>
        </div>
        <ul className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {VALUE_ROWS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="border-border bg-card flex flex-col rounded-none border p-6 text-left shadow-sm"
            >
              <span className="border-border bg-muted flex h-11 w-11 items-center justify-center rounded-none border">
                <Icon className="text-primary-ink h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="text-foreground mt-4 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed font-light">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
