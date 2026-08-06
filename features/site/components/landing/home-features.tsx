import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { cn } from '@/features/site/lib/utils'
import { FeatureScene } from '@/features/site/components/landing/home-feature-scene'
import { HomeAutofixCard } from '@/features/site/components/landing/home-autofix-card'
import { HomeCompetitorCard } from '@/features/site/components/landing/home-competitor-card'
import { HomeMeasureCard } from '@/features/site/components/landing/home-measure-card'
import { HomePromptCard } from '@/features/site/components/landing/home-prompt-card'
import { HomeSectionHeader } from '@/features/site/components/landing/home-section-header'
import { HomeTaskCard } from '@/features/site/components/landing/home-task-card'
import { HomeVisibilityCard } from '@/features/site/components/landing/home-visibility-card'

type Feature = {
  number: string
  title: string
  description: string
  illo: JSX.Element
}

// One step per row, read top to bottom like a closed loop: score -> watch ->
// compare -> prioritise -> ship -> measure. The loop is the story, so each row
// is an active verb, not a feature name.
const FEATURES: Feature[] = [
  {
    number: '01',
    title: 'Audit',
    description: 'Paste any URL and get a 0-100 GEO score across six pillars in about 60 seconds.',
    illo: <HomeVisibilityCard />,
  },
  {
    number: '02',
    title: 'Monitor',
    description:
      'Watch how ChatGPT, Claude, Gemini and Perplexity answer the questions your buyers actually ask.',
    illo: <HomePromptCard />,
  },
  {
    number: '03',
    title: 'Compete',
    description:
      'Compare your share of AI citations with the brands engines name instead. Close gaps before they widen.',
    illo: <HomeCompetitorCard />,
  },
  {
    number: '04',
    title: 'Prioritise',
    description:
      'A ranked fix queue, each one tied to the prompt or signal completing it improves.',
    illo: <HomeTaskCard />,
  },
  {
    number: '05',
    title: 'Ship',
    description:
      'Push schema and meta changes straight to your site in one click, or hand the diff to your team as a pull request.',
    illo: <HomeAutofixCard />,
  },
  {
    number: '06',
    title: 'Measure',
    description:
      'See citations and AI referral traffic climb after your fixes ship, then loop back and do it again.',
    illo: <HomeMeasureCard />,
  },
]

/** One spec-sheet row: number + title + one line on the left, illo right. */
/**
 * One feature per row. Rows alternate which side the card sits on, so the eye
 * zig-zags down the section instead of tracking one static column.
 */
function FeatureRow({ feature, flipped }: { feature: Feature; flipped: boolean }): JSX.Element {
  return (
    <div className="group border-border relative border-t">
      {/* The hairline above spans the full rail; the content sits on the
          narrower max-w-6xl measure the sibling sections use. Without it the
          row stretches the whole 1440px rail, stranding the copy on the far
          left and the card on the far right with a dead gap between them. */}
      <div
        className={cn(
          'mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 sm:px-10 lg:items-center lg:gap-20 lg:py-20',
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
        <div className="flex shrink-0 lg:justify-center">
          <FeatureScene>{feature.illo}</FeatureScene>
        </div>
      </div>
    </div>
  )
}

function FeaturesHeader(): JSX.Element {
  return (
    <div className="border-border relative border-t py-20 sm:py-24">
      <GridCornerHandles top />
      {/* Same measure and padding as FeatureRow, so the heading starts on the
          same left edge as the numbered steps below it. */}
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <HomeSectionHeader
          eyebrow="Platform"
          headingId="home-features-heading"
          title="Everything you need to win in AI search"
          description="Track prompts, score your GEO readiness, and ship fixes — all from one dashboard."
          align="left"
          size="lg"
          highlight="win in AI search"
        />
      </div>
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
