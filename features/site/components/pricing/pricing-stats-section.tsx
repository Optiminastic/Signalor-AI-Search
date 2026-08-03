import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { HomeSectionHeader } from '@/features/site/components/landing/home-section-header'
import { PRICING_STATS } from '@/features/site/lib/pricing-marketing-content'

export function PricingStatsSection(): JSX.Element {
  return (
    <section aria-labelledby="pricing-stats-heading">
      <div className="border-border mx-auto max-w-6xl border-x">
        <div className="border-border relative border-t px-6 py-14 sm:py-16">
          <GridCornerHandles top />
          <HomeSectionHeader
            eyebrow="In numbers"
            headingId="pricing-stats-heading"
            title="What teams ship with SignalorAI"
          />
        </div>
        <div className="border-border relative border-t">
          <GridCornerHandles top />
          <GridHandle className="-top-[3.5px] left-1/3 -ml-[3.5px] hidden sm:block" />
          <GridHandle className="-top-[3.5px] left-2/3 -ml-[3.5px] hidden sm:block" />
          <div className="divide-border grid grid-cols-1 max-sm:divide-y sm:grid-cols-3 sm:divide-x">
            {PRICING_STATS.map(s => (
              <div key={s.label} className="bg-card flex flex-col gap-2 px-6 py-10 sm:px-8">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                  {s.label}
                </p>
                <p className="text-foreground text-3xl font-semibold tracking-tight tabular-nums">
                  {s.value}
                </p>
                <p className="text-muted-foreground text-sm leading-snug">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
