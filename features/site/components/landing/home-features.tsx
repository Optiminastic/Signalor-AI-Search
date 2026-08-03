import Image from 'next/image'

import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { cn } from '@/features/site/lib/utils'
import { HomePromptCard } from '@/features/site/components/landing/home-prompt-card'
import { HomeSectionHeader } from '@/features/site/components/landing/home-section-header'
import { HomeTaskCard } from '@/features/site/components/landing/home-task-card'
import { HomeVisibilityCard } from '@/features/site/components/landing/home-visibility-card'

/** Auto-fix toggle: the switch flips on and the badge confirms on hover. */
function AutoFixIllo(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-[260px] rounded-xl p-4 shadow-sm ring-1 shadow-black/5">
      <div className="flex items-center gap-2.5">
        <Image
          src="/logos/shopify.svg"
          alt="Shopify"
          width={22}
          height={22}
          className="h-[22px] w-[22px]"
        />
        <Image
          src="/logos/wordpress.svg"
          alt="WordPress"
          width={22}
          height={22}
          className="h-[22px] w-[22px]"
        />
        <span className="bg-success/10 text-success ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100">
          Applied
        </span>
      </div>
      <div className="bg-muted/60 ring-border/70 mt-3 flex items-center justify-between rounded-lg px-3 py-2.5 ring-1">
        <div>
          <p className="text-foreground text-xs font-semibold">Auto-fix schema</p>
          <p className="text-muted-foreground mt-0.5 font-mono text-[10px]">
            Organization · FAQ · Product
          </p>
        </div>
        <span
          aria-hidden
          className="motion-safe:group-hover:bg-primary relative inline-flex h-5 w-9 shrink-0 rounded-full bg-neutral-300 transition-colors duration-300"
        >
          <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 motion-safe:group-hover:translate-x-4" />
        </span>
      </div>
      <p className="text-muted-foreground mt-2.5 text-[11px] leading-relaxed">
        Fixes ship straight to your theme. No engineer needed.
      </p>
    </div>
  )
}

type Feature = {
  number: string
  title: string
  description: string
  illo: JSX.Element
}

// One feature per row, read top to bottom like a spec sheet.
const FEATURES: Feature[] = [
  {
    number: '01',
    title: 'Prompt tracking',
    description:
      'Watch how ChatGPT, Claude, Gemini and Perplexity answer the questions your buyers actually ask.',
    illo: <HomePromptCard />,
  },
  {
    number: '02',
    title: 'GEO score',
    description:
      'One 0-100 score for how citable your site is, plus where you rank against the brands AI names instead.',
    illo: <HomeVisibilityCard />,
  },
  {
    number: '03',
    title: 'Tasks',
    description:
      'A ranked queue of fixes, each one tied to the prompt or signal completing it improves.',
    illo: <HomeTaskCard />,
  },
  {
    number: '04',
    title: 'Auto-fix',
    description:
      'Push schema and meta changes straight to your site, or hand the diff to your team as a pull request.',
    illo: <AutoFixIllo />,
  },
]

/** One spec-sheet row: number + title + one line on the left, illo right. */
/**
 * One feature per row. Rows alternate which side the card sits on, so the eye
 * zig-zags down the section instead of tracking one static column.
 */
function FeatureRow({ feature, flipped }: { feature: Feature; flipped: boolean }): JSX.Element {
  return (
    <div className="group relative">
      <div
        className={cn(
          'flex flex-col gap-10 px-6 py-14 sm:px-10 lg:items-center lg:gap-20 lg:py-20',
          flipped ? 'lg:flex-row-reverse' : 'lg:flex-row',
        )}
      >
        <div className="lg:flex-1">
          <p className="text-muted-foreground/70 font-mono text-[12px] font-medium tracking-[0.14em] tabular-nums">
            {feature.number}
          </p>
          <h3 className="text-foreground mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {feature.title}
          </h3>
          <p className="text-muted-foreground mt-3 max-w-md text-[15px] leading-relaxed text-pretty">
            {feature.description}
          </p>
        </div>
        <div className="flex shrink-0 lg:justify-center">{feature.illo}</div>
      </div>
    </div>
  )
}

function FeaturesHeader(): JSX.Element {
  return (
    <div className="border-border relative border-t px-6 py-20 sm:px-10 sm:py-24">
      <GridCornerHandles top />
      <HomeSectionHeader
        eyebrow="Platform"
        headingId="home-features-heading"
        title="Everything you need to win in AI search"
        align="left"
        size="lg"
        highlight="win in AI search"
      />
    </div>
  )
}

export function HomeFeatures(): JSX.Element {
  return (
    <section id="features" className="scroll-mt-20" aria-labelledby="home-features-heading">
      <FeaturesHeader />
      {FEATURES.map((feature, index) => (
        <FeatureRow key={feature.title} feature={feature} flipped={index % 2 === 1} />
      ))}
    </section>
  )
}
