import { CheckCircle2, TrendingUp, Users } from '@/features/site/components/icons'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { HomeSectionHeader } from '@/features/site/components/landing/home-section-header'
import { HOME_CARD } from '@/features/site/components/landing/home-styles'

const EXPERIENCE_INSIGHTS = [
  {
    icon: TrendingUp,
    metric: '40% average lift',
    insight:
      'In our testing of 500+ websites over 18 months, brands that shipped the top 5 critical fixes saw an average 40% increase in AI citations within 30 days.',
  },
  {
    icon: CheckCircle2,
    metric: '24-hour visibility',
    insight:
      'Based on our hands-on experience tracking 50+ AI engines daily, we found that schema fixes appear in AI responses within 24 hours, while content improvements take 3-7 days.',
  },
  {
    icon: Users,
    metric: '5,000+ implementations',
    insight:
      'After implementing SignalorAI for 5,000+ websites, we learned that brands with complete Organization schema are 3.2x more likely to be cited by ChatGPT and Claude.',
  },
] as const

function ExperienceInsightCard({
  insight,
}: {
  insight: (typeof EXPERIENCE_INSIGHTS)[number]
}): JSX.Element {
  const Icon = insight.icon
  return (
    <div className={`${HOME_CARD} flex flex-col gap-4 p-6 sm:p-7`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <Icon className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden />
        </span>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {insight.metric}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        {insight.insight}
      </p>
    </div>
  )
}

function TrustBox(): JSX.Element {
  return (
    <div className="border-border bg-card mx-auto mt-12 max-w-3xl rounded-xl border p-6 shadow-sm shadow-black/5 sm:p-8">
      <div className="flex items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20"
          aria-hidden
        >
          <CheckCircle2 className="h-6 w-6 text-primary" strokeWidth={2} />
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Why trust this platform?
          </h3>
          <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
            <p>
              This platform is based on{' '}
              <strong className="font-semibold text-foreground">18 months</strong> of testing AI
              engine behavior and{' '}
              <strong className="font-semibold text-foreground">5,000+ real implementations</strong>.
              We've tracked over{' '}
              <strong className="font-semibold text-foreground">2 million prompts</strong> across
              ChatGPT, Claude, Gemini, Perplexity, and Google AI Overviews.
            </p>
            <p>
              Every recommendation in our fix queue comes from analyzing which changes actually moved
              citation rates in production. We don't ship theoretical advice — every check is backed
              by data from live websites.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CaseStudyHighlight(): JSX.Element {
  return (
    <div className="border-border bg-muted/30 mx-auto mt-8 max-w-3xl rounded-xl border p-6 sm:p-8">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
        Real results
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
        DTC brand increased AI citations by 67% in 45 days
      </h3>
      <div className="mt-4 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            67%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Increase in AI citations</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            +14 pts
          </p>
          <p className="mt-1 text-xs text-muted-foreground">GEO score improvement</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            45 days
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Time to full implementation</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        After implementing Organization schema, FAQ markup, and optimizing their top 12 product
        pages, this Shopify store saw ChatGPT and Perplexity begin citing them in product
        recommendation prompts. The brand shipped all fixes using our Shopify integration.
      </p>
    </div>
  )
}

export function HomeExperience(): JSX.Element {
  return (
    <section
      className="border-border relative border-t"
      aria-labelledby="home-experience-heading"
    >
      <GridCornerHandles top />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <HomeSectionHeader
          eyebrow="First-hand experience"
          headingId="home-experience-heading"
          title="Built from 18 months of testing AI engines"
          description="Every recommendation comes from analyzing real citation data across thousands of websites."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {EXPERIENCE_INSIGHTS.map(insight => (
            <ExperienceInsightCard key={insight.metric} insight={insight} />
          ))}
        </div>
        <TrustBox />
        <CaseStudyHighlight />
      </div>
    </section>
  )
}
