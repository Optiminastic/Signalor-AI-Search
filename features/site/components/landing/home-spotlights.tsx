import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight } from '@/features/site/components/icons'
import { HomeAsciiField } from '@/features/site/components/landing/home-ascii-field'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { cn } from '@/features/site/lib/utils'

// Editorial spotlight blocks: a big statement headline beside plain-spoken
// copy, each backed by a product screenshot sitting on the brand-red painterly
// panel from the hero. Block one stacks copy over a full-width panel; block
// two splits copy and panel side by side.

const ENGINE_LOGOS = [
  { name: 'ChatGPT', logo: '/logos/chatgpt.svg' },
  { name: 'Claude', logo: '/logos/claude.svg' },
  { name: 'Gemini', logo: '/logos/gemini.svg' },
  { name: 'Perplexity', logo: '/logos/perplexity.svg' },
  { name: 'Copilot', logo: '/logos/copilot.svg' },
  { name: 'Grok', logo: '/logos/grok.svg' },
  { name: 'DeepSeek', logo: '/logos/deepseek.svg' },
  { name: 'Google', logo: '/logos/google.svg' },
] as const

function LearnMoreLink({ href }: { href: string }): JSX.Element {
  return (
    <Link
      href={href}
      className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
    >
      Learn more
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  )
}

interface SpotlightPanelProps {
  src: string
  alt: string
  className?: string
  imageClassName?: string
  /** Intrinsic size, so Next builds the right srcset. Defaults suit /carousel1.png. */
  width?: number
  height?: number
}

/** Screenshot card on the brand painterly panel — same recipe as the hero. */
function SpotlightPanel({
  src,
  alt,
  className,
  imageClassName,
  width = 1877,
  height = 892,
}: SpotlightPanelProps): JSX.Element {
  return (
    <div className={cn('bg-primary relative overflow-hidden rounded-sm p-2 sm:p-2.5', className)}>
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/hero-texture.svg')] bg-cover opacity-60 mix-blend-overlay"
      />
      <HomeAsciiField />
      <div className="relative overflow-hidden rounded-sm shadow-md shadow-black/15">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 1152px) 100vw, 1104px"
          className={cn('w-full select-none', imageClassName)}
        />
      </div>
    </div>
  )
}

/** Block one: statement headline + copy row, full-width panel underneath. */
function SentimentSpotlight(): JSX.Element {
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-14">
        <h2
          id="home-spotlights-heading"
          className="text-foreground text-3xl font-semibold tracking-tight text-pretty sm:text-4xl"
        >
          What does AI say about your brand?
        </h2>
        <div className="max-w-md">
          <p className="text-muted-foreground text-base leading-relaxed">
            SignalorAI reads the answers buyers get from AI, and shows where you are mentioned,
            cited, or missing. Catch a wrong or stale answer before your customers see it.
          </p>
          <div className="mt-5">
            <LearnMoreLink href="/ai-visibility" />
          </div>
        </div>
      </div>
      <SpotlightPanel
        src="/PromptSheet.png"
        alt="Each AI engine's answer for a tracked prompt, showing where the brand is mentioned and cited"
        width={2940}
        height={1360}
        // Centred, constrained-width showcase so it doesn't bleed full-width.
        className="mx-auto mt-10 w-full max-w-6xl"
      />
    </div>
  )
}

/** Block two: copy + engine logos on the left, panel on the right. */
function TrackingSpotlight(): JSX.Element {
  return (
    <div className="mt-16 grid items-center gap-10 lg:mt-24 lg:grid-cols-2 lg:gap-14">
      <div>
        <h2 className="text-foreground text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
          How does Signalor track AI search visibility?
        </h2>
        <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
          Your tracked prompts run every day. Share of voice, citations, and competitor benchmarks
          across every major AI engine, in one place.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {ENGINE_LOGOS.map(engine => (
            <li
              key={engine.name}
              className="ring-border bg-card flex size-11 items-center justify-center rounded-sm shadow-sm ring-1 shadow-black/5"
            >
              <Image src={engine.logo} alt={engine.name} width={22} height={22} />
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <LearnMoreLink href="/prompt-tracking" />
        </div>
      </div>
      <SpotlightPanel
        src="/PromptTracker.png"
        alt="SignalorAI prompt tracker showing share of voice across AI engines"
        width={2936}
        height={1338}
      />
    </div>
  )
}

export function HomeSpotlights(): JSX.Element {
  return (
    <section aria-labelledby="home-spotlights-heading">
      <div className="border-border relative border-t px-6 py-14 sm:px-10 lg:py-20">
        <GridCornerHandles top />
        {/* <SentimentSpotlight /> */}
        <TrackingSpotlight />
      </div>
    </section>
  )
}
