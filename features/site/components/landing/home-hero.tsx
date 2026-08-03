import Link from 'next/link'

import {
  LANDING_PRIMARY_CTA_CLASS,
  LANDING_SECONDARY_CTA_CLASS,
} from '@/features/site/components/landing/constants'
import { HeroVideo } from '@/features/site/components/landing/hero-video'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'

/**
 * Full-bleed demo band: the product video sits on a brand-orange painterly
 * panel whose vertical edges cross the section rules, marked with grid handles.
 */
function HeroShowcase(): JSX.Element {
  return (
    <div className="border-border border-b">
      <div className="border-border relative mx-auto max-w-6xl border-x">
        <GridCornerHandles top bottom />
        <div className="bg-primary relative overflow-hidden p-2 sm:p-2.5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[url('/hero-texture.svg')] bg-cover opacity-60 mix-blend-overlay"
          />
          <div className="relative overflow-hidden rounded-sm shadow-md shadow-black/15">
            <HeroVideo
              src="/hero-demo.mp4"
              poster="/hero.png"
              label="Play the SignalorAI product demo"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * The headline, split so each word can stagger in. Kept as data rather than
 * split at runtime so the punctuation stays attached to the right word.
 */
const HEADLINE: ReadonlyArray<{ text: string; underlined?: boolean; after?: string }> = [
  { text: 'Signalor' },
  { text: 'does' },
  { text: 'what' },
  { text: 'Claude' },
  // The period sits outside the underline but inside the same word, so it never
  // wraps onto its own line.
  { text: "can't", underlined: true, after: '.' },
  { text: 'Get' },
  { text: 'your' },
  { text: 'brand' },
  { text: 'into' },
  { text: 'AI' },
  { text: 'answers.' },
]

/** Two-button conversion row: free analyzer as primary, demo as secondary. */
function HeroCtaButtons(): JSX.Element {
  return (
    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
      <Link href="/tools/url-analyzer" className={LANDING_PRIMARY_CTA_CLASS}>
        Get your free GEO score
      </Link>
      <Link href="/contact-sales" className={LANDING_SECONDARY_CTA_CLASS}>
        Get a demo
      </Link>
    </div>
  )
}

export function HomeHero(): JSX.Element {
  return (
    <section aria-labelledby="home-hero-heading">
      <div className="border-border relative mx-auto max-w-6xl border-x border-b px-6 pt-16 pb-14 md:pt-12 md:pb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_65%_at_50%_0%,rgba(224,74,61,0.05),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <h1
            id="home-hero-heading"
            className="text-foreground text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {HEADLINE.map((word, index) => (
              <span
                key={word.text + index}
                // inline-block so the transform applies; the trailing space is a
                // separate node so words still wrap and read normally to a
                // screen reader.
                className="motion-safe:animate-rise-in inline-block"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                {word.underlined ? (
                  <span className="decoration-primary/60 underline decoration-dashed decoration-2 underline-offset-4">
                    {word.text}
                  </span>
                ) : (
                  word.text
                )}
                {word.after}
              </span>
            )).flatMap((node, index) => (index === 0 ? [node] : [' ', node]))}
          </h1>
          <HeroCtaButtons />
          <p className="text-muted-foreground/80 mt-4 text-[13px] font-medium">
            Free score in ~60 seconds · No sign-up needed · Track your first 50 prompts free
          </p>
        </div>
      </div>
      <HeroShowcase />
    </section>
  )
}
