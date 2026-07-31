import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight } from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import {
  FloatingEngineChips,
  type EngineChip,
} from '@/features/site/components/landing/floating-engine-chips'
import {
  GridCornerHandles,
  GridHandle,
  MeasureBox,
} from '@/features/site/components/landing/home-grid'

// Floating engine-mention chips filling the hero's side gutters. Positions
// stay inside the max-w-3xl copy column's margins, so they only render at xl+.
const HERO_ENGINE_CHIPS: EngineChip[] = [
  {
    engine: 'ChatGPT',
    logo: '/logos/chatgpt.svg',
    cited: true,
    left: '4%',
    top: '24%',
    delay: '0s',
    duration: '5s',
  },
  {
    engine: 'Perplexity',
    logo: '/logos/perplexity.svg',
    cited: true,
    left: '6%',
    top: '58%',
    delay: '1.2s',
    duration: '5.5s',
  },
  {
    engine: 'Gemini',
    logo: '/logos/gemini.svg',
    cited: false,
    left: '78%',
    top: '22%',
    delay: '0.6s',
    duration: '4.8s',
  },
  {
    engine: 'Claude',
    logo: '/logos/claude.svg',
    cited: true,
    left: '80%',
    top: '56%',
    delay: '1.7s',
    duration: '5.8s',
  },
]

const HERO_FLOATING_SLOTS = [
  { left: '13%', top: '42%' },
  { left: '86%', top: '40%' },
] as const

/**
 * Announcement pill inside the corner-dot measurement box — the annotated,
 * drafting-table look of the hairline-grid system.
 */
function HeroAnnouncement(): JSX.Element {
  return (
    <MeasureBox className="mx-auto w-fit">
      <div className="bg-card ring-border relative flex h-fit items-center gap-2 rounded-full px-3 py-1 shadow-sm ring-1 shadow-black/5">
        <span className="text-foreground text-sm">Track your first 50 prompts free</span>
        <span aria-hidden className="bg-foreground/10 block h-3 w-px" />
        <Link
          href="/sign-up"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          Claim
        </Link>
      </div>
    </MeasureBox>
  )
}

/**
 * Primary conversion path: paste a URL, land on the free analyzer with it
 * prefilled (the analyzer reads `?url=`). Plain GET form — zero JS.
 */
function HeroAuditForm(): JSX.Element {
  return (
    <div className="mx-auto mt-8 w-full max-w-md">
      <form action="/tools/url-analyzer" method="GET" className="flex gap-2">
        <label htmlFor="hero-audit-url" className="sr-only">
          Website URL
        </label>
        <input
          id="hero-audit-url"
          type="text"
          name="url"
          required
          inputMode="url"
          autoComplete="url"
          placeholder="yourdomain.com"
          className="bg-card text-foreground ring-border placeholder:text-muted-foreground/70 focus:ring-primary/50 h-9 min-w-0 flex-1 rounded-md px-3 text-sm shadow-sm ring-1 shadow-black/5 focus:ring-2 focus:outline-none"
        />
        <button type="submit" className={`${LANDING_PRIMARY_CTA_CLASS} h-9 shrink-0`}>
          Get free GEO score
        </button>
      </form>
      <p className="text-muted-foreground/80 mt-3 text-[13px] font-medium">
        Free score in ~60 seconds · No sign-up needed ·{' '}
        <Link
          href="/sign-up"
          className="text-foreground/70 decoration-border hover:text-foreground inline-flex items-center gap-0.5 underline underline-offset-2 transition-colors"
        >
          or start a free account
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </p>
    </div>
  )
}

/**
 * Full-bleed screenshot band: the dashboard sits in its own bordered box
 * whose vertical edges cross the section rules, marked with grid handles.
 */
function HeroScreenshot(): JSX.Element {
  return (
    <div className="border-border border-b">
      <div className="border-border relative mx-auto max-w-6xl border-x px-4 sm:px-6 md:px-12">
        <GridCornerHandles top bottom />
        <GridHandle className="-top-[3.5px] left-[12.5px] sm:left-[20.5px] md:left-[44.5px]" />
        <GridHandle className="-top-[3.5px] right-[12.5px] sm:right-[20.5px] md:right-[44.5px]" />
        <GridHandle className="-bottom-[3.5px] left-[12.5px] sm:left-[20.5px] md:left-[44.5px]" />
        <GridHandle className="right-[12.5px] -bottom-[3.5px] sm:right-[20.5px] md:right-[44.5px]" />
        <div className="border-border bg-card overflow-hidden border-x">
          <Image
            src="/carousel1.png"
            alt="SignalorAI dashboard demo showing sample GEO score, tracked prompts, and AI citation analytics for illustration"
            width={2000}
            height={2000}
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="h-auto max-h-[560px] w-full object-cover object-top select-none"
            style={{
              maskImage: 'linear-gradient(to bottom, black 72%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 72%, transparent 100%)',
            }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute top-8 left-10 z-10 hidden sm:block md:left-20"
        >
          <span
            className="bg-card ring-border motion-safe:animate-float flex flex-col gap-0.5 rounded-xl px-3 py-2 shadow-md ring-1 shadow-black/5"
            style={{ animationDuration: '7s' }}
          >
            <span className="text-muted-foreground/60 text-[9px] font-medium uppercase tracking-wider">Demo data</span>
            <span className="flex items-baseline gap-2">
              <span className="text-muted-foreground text-xs font-medium">GEO score</span>
              <span className="text-foreground text-sm font-semibold tabular-nums">82</span>
              <span className="text-success text-[11px] font-semibold tabular-nums">+6</span>
            </span>
          </span>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute top-8 right-10 z-10 hidden sm:block md:right-20"
        >
          <span
            className="bg-card ring-border motion-safe:animate-float flex flex-col gap-0.5 rounded-xl px-3 py-2 shadow-md ring-1 shadow-black/5"
            style={{ animationDelay: '1.4s', animationDuration: '6s' }}
          >
            <span className="text-muted-foreground/60 text-[9px] font-medium uppercase tracking-wider">Demo data</span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="bg-success size-2 rounded-full" />
              <span className="text-foreground text-xs font-semibold">Cited by ChatGPT</span>
              <span className="text-muted-foreground text-[11px] font-medium tabular-nums">
                just now
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function HomeHero(): JSX.Element {
  return (
    <section aria-labelledby="home-hero-heading">
      <div className="border-border relative mx-auto max-w-6xl border-x border-b px-6 pt-14 pb-12 md:pt-20 md:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_65%_at_50%_0%,rgba(224,74,61,0.05),transparent_70%)]"
        />
        <FloatingEngineChips
          chips={HERO_ENGINE_CHIPS}
          slots={HERO_FLOATING_SLOTS}
          className="lg:hidden xl:block"
        />
        <div className="relative">
          <HeroAnnouncement />
          <div className="mx-auto mt-8 max-w-3xl text-center md:mt-10">
            <h1
              id="home-hero-heading"
              className="text-foreground text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              SignalorAI gets your brand{' '}
              <span className="decoration-primary/60 underline decoration-dashed decoration-2 underline-offset-4">
                cited
              </span>{' '}
              in AI answers
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg leading-relaxed text-balance">
              SignalorAI scores your site, tracks prompts across ChatGPT, Claude, Gemini, and
              Perplexity, and hands you the exact fixes that win citations.
            </p>
            <HeroAuditForm />
          </div>
        </div>
      </div>
      <HeroScreenshot />
    </section>
  )
}
