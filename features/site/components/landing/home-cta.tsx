import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight } from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import {
  GridCornerHandles,
  GridHandle,
  MeasureBox,
} from '@/features/site/components/landing/home-grid'

/**
 * Pre-footer CTA, shared across all marketing pages: pitch + actions on the
 * left, the compass illustration drifting in a measured frame on the right.
 * Self-contained rails so it can sit outside a page's railed column.
 */
export function HomeCta(): JSX.Element {
  return (
    <section className="border-border border-t" aria-labelledby="home-cta-heading">
      <div className="border-border relative mx-auto max-w-6xl border-x">
        <GridCornerHandles top />
        <GridHandle className="-top-[3.5px] left-[53.5%] -ml-[3.5px] hidden lg:block" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_110%_at_18%_-10%,rgba(224,74,61,0.08),transparent_58%)]"
        />
        <div className="lg:divide-border relative grid lg:grid-cols-[1.15fr_1fr] lg:divide-x">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:py-24">
            <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
              Get started
            </p>
            <h2
              id="home-cta-heading"
              className="text-foreground mt-3 max-w-lg text-3xl font-semibold tracking-tight text-balance sm:text-4xl xl:text-[2.75rem] xl:leading-[1.1]"
            >
              Turn AI search into your highest-intent pipeline
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed text-pretty sm:text-lg">
              Run a free GEO audit, track citations across models, and ship fixes that change how{' '}
              <strong className="text-foreground font-semibold">
                ChatGPT, Perplexity, and Gemini
              </strong>{' '}
              talk about you.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link href="/sign-up" className={`${LANDING_PRIMARY_CTA_CLASS} w-full sm:w-auto`}>
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/tools/url-analyzer"
                className="bg-card text-foreground ring-border hover:bg-muted/60 inline-flex h-9 w-full items-center justify-center rounded-md px-5 text-sm font-semibold shadow-sm ring-1 shadow-black/5 transition-colors sm:w-auto"
              >
                Run a free audit
              </Link>
            </div>
            <p className="text-muted-foreground/80 mt-4 text-[13px] font-medium">
              No credit card required · 50 free prompts · Cancel anytime
            </p>
          </div>

          <div className="bg-card relative hidden items-center justify-center overflow-hidden px-8 py-12 lg:flex">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(224,74,61,0.08),transparent_70%)]"
            />
            <MeasureBox className="p-3">
              <Image
                src="/hero-compass.png"
                alt="Illustration of a hand holding a compass — SignalorAI guiding your AI search strategy"
                width={667}
                height={572}
                sizes="(max-width: 1024px) 0px, 420px"
                className="motion-safe:animate-float h-auto w-full max-w-[380px] select-none"
                style={{ animationDuration: '7s' }}
              />
            </MeasureBox>
          </div>
        </div>
      </div>
    </section>
  )
}
