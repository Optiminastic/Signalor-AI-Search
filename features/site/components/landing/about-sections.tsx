import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'

// Same figures the homepage stats band claims - keep the two in sync.
const ABOUT_STATS = [
  { value: '6', lead: 'AI engines tracked', rest: 'from ChatGPT to Google AI Overviews.' },
  { value: '6', lead: 'Scoring pillars', rest: 'behind every 0-100 GEO score.' },
  { value: '5k+', lead: 'Websites optimizing', rest: 'their AI citations with SignalorAI.' },
  { value: '24h', lead: 'To first movement', rest: 'after your first shipped fix.' },
] as const

const ABOUT_PRINCIPLES = [
  {
    title: 'Outcomes over dashboards',
    description:
      'Every audit ends in a ranked fix list, not a chart to admire. If a check cannot produce an action, we do not ship the check.',
  },
  {
    title: 'Transparent scoring',
    description:
      'All six pillars break down into named sub-checks with the exact evidence behind each one - no black-box grades.',
  },
  {
    title: 'Meet teams where they ship',
    description:
      'Shopify, WordPress, an API, and an MCP server - fixes belong in the tools your team already uses, not another tab.',
  },
  {
    title: 'Verifiable answers',
    description:
      'Every citation claim links to the prompt, engine, and date it came from, so you can reproduce what we report.',
  },
] as const

function AboutStats(): JSX.Element {
  return (
    <div className="border-border relative border-b">
      <div className="border-border mx-auto max-w-6xl border-x">
        <div className="relative">
          <GridCornerHandles bottom />
          <GridHandle className="-bottom-[3.5px] left-1/2 -ml-[3.5px] hidden lg:block" />
          <div className="lg:divide-border grid lg:grid-cols-2 lg:divide-x">
            <div className="max-lg:border-border flex flex-col justify-center px-6 py-14 max-lg:border-b sm:px-10 lg:py-20">
              <p className="text-primary-ink text-[12px] font-semibold tracking-[0.18em] uppercase">
                The platform
              </p>
              <h2 className="text-foreground mt-3 max-w-md text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Built to make GEO measurable
              </h2>
              <p className="text-muted-foreground mt-4 max-w-sm text-base leading-relaxed text-pretty">
                SignalorAI turns how AI talks about a brand into{' '}
                <strong className="text-foreground font-semibold">numbers a team can move</strong> -
                scored, tracked, and tied to shipped fixes.
              </p>
            </div>
            <dl className="grid gap-x-10 gap-y-10 px-6 py-14 sm:grid-cols-2 sm:px-10 lg:py-20">
              {ABOUT_STATS.map(stat => (
                <div
                  key={stat.lead}
                  className="border-foreground/15 hover:border-primary border-l-2 pl-4 transition-colors duration-200"
                >
                  <dd className="text-foreground text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                    {stat.value}
                  </dd>
                  <dt className="text-muted-foreground mt-2 max-w-[16rem] text-sm leading-relaxed text-pretty">
                    <strong className="text-foreground font-semibold">{stat.lead}</strong>{' '}
                    {stat.rest}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function AboutPrinciples(): JSX.Element {
  return (
    <div className="border-border mx-auto max-w-6xl border-x">
      <div className="px-6 py-14 sm:px-10 lg:py-20">
        <p className="text-primary-ink text-[12px] font-semibold tracking-[0.18em] uppercase">
          How we work
        </p>
        <h2 className="text-foreground mt-3 max-w-lg text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Four principles behind every release
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {ABOUT_PRINCIPLES.map((principle, index) => (
            <div key={principle.title} className="border-border border-t pt-5">
              <span className="text-muted-foreground font-mono text-[12px] tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-foreground mt-2 text-[15px] font-semibold tracking-tight">
                {principle.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AboutSections(): JSX.Element {
  return (
    <>
      <AboutStats />
      <AboutPrinciples />
    </>
  )
}
