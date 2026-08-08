import Link from 'next/link'

import { ArrowRight } from '@/features/site/components/icons'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { STEP_ILLOS } from '@/features/site/components/landing/home-how-it-works-illos'
import {
  HOW_IT_WORKS_STEPS,
  type HowItWorksStep,
} from '@/features/site/lib/landing-how-it-works-content'

const STEP_LABELS: Record<HowItWorksStep['illo'], string> = {
  connect: 'Connect',
  audit: 'Audit',
  track: 'Track',
  ship: 'Ship',
}

const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.028) 1px, transparent 1px)',
  backgroundSize: '26px 26px',
}

/**
 * One step, open on the shared canvas (no enclosing box): editorial label,
 * title and description up top, then the large product-UI card floating on a
 * soft glow below. The product visual is the dominant element.
 */
function StepColumn({ step, last }: { step: HowItWorksStep; last: boolean }): JSX.Element {
  const Illo = STEP_ILLOS[step.illo]
  return (
    <article className="group relative flex flex-col px-6 py-10 sm:px-8 lg:py-12">
      <p className="text-muted-foreground flex items-center justify-between font-mono text-[12px] tracking-[0.14em]">
        <span>
          {String(step.n).padStart(2, '0')}. {STEP_LABELS[step.illo]}
        </span>
        {!last && (
          <span
            aria-hidden
            className="text-muted-foreground/30 hidden shrink-0 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 lg:block"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </p>
      <h3 className="text-foreground mt-3 text-lg leading-snug font-semibold tracking-tight text-balance">
        {step.title}
      </h3>
      <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed text-pretty lg:min-h-[84px]">
        {step.body}
      </p>

      <div className="relative mt-8 flex flex-1 items-center justify-center">
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(224,74,61,0.06),transparent_70%)] blur-2xl"
        />
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-2xl"
        />
        <div className="relative w-full">
          <Illo />
        </div>
      </div>
    </article>
  )
}

export function HomeHowItWorks(): JSX.Element {
  return (
    <section id="how-it-works" className="scroll-mt-20" aria-labelledby="home-how-it-works-heading">
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <div className="px-6 py-16 sm:px-10 sm:py-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
                How it works
              </p>
              <h2
                id="home-how-it-works-heading"
                className="text-foreground mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              >
                How does Signalor work?
              </h2>
            </div>
            <Link
              href="/sign-up"
              className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors"
            >
              Start step one
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="from-muted/70 to-muted/30 ring-border relative mt-12 overflow-hidden rounded-md bg-gradient-to-br via-transparent shadow-sm ring-1 shadow-black/5 lg:mt-16">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(224,74,61,0.06),transparent_60%)]" />
              <span className="absolute inset-0" style={GRID_STYLE} />
            </div>
            <div className="lg:divide-border relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:divide-x">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <StepColumn
                  key={step.n}
                  step={step}
                  last={index === HOW_IT_WORKS_STEPS.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
