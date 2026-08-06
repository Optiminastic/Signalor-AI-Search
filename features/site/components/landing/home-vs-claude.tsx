import Image from 'next/image'
import Link from 'next/link'

import { Check, Minus } from '@/features/site/components/icons'
import { LANDING_SECONDARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { HomeSectionHeader } from '@/features/site/components/landing/home-section-header'
import { HOME_CARD } from '@/features/site/components/landing/home-styles'

interface VsColumn {
  name: string
  logo: string
  items: readonly string[]
  footnote: string
}

const SIGNALOR_COLUMN: VsColumn = {
  name: 'SignalorAI',
  logo: '/icon.svg',
  items: [
    'Watches your brand across ChatGPT, Claude, Gemini, and Perplexity.',
    'Runs your tracked prompts every day, not just once.',
    'Scores your site on 6 GEO pillars, 0 to 100.',
    'Gives you a fix list, sorted by impact.',
    'Shows which pages AI cites, and which it skips.',
    'Tracks how often competitors get mentioned instead of you.',
    'Applies schema fixes on WordPress and Shopify.',
  ],
  footnote: 'Built to measure and move where you show up in AI answers.',
}

const CLAUDE_COLUMN: VsColumn = {
  name: 'Claude',
  logo: '/logos/claude.svg',
  items: [
    'Answers one question, one time.',
    "Can't see what ChatGPT, Gemini, or Perplexity say about you.",
    "Can't remember what it told you last week.",
    "Can't measure your brand's visibility in AI search.",
    "Can't tell you why you weren't cited.",
    'Leaves you a to-do list to work through yourself.',
  ],
  footnote: 'Built to answer questions. Everything above is on you.',
}

const SIGNALOR_PILLS = ['6 AI engines', 'Checks run daily', 'Free to start'] as const

/** Logo mark + product name, centered atop each column. */
function VsCardHead({ column }: { column: VsColumn }): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-2.5 pb-6">
      <Image src={column.logo} alt="" width={26} height={26} className="size-[26px]" />
      <p className="text-foreground text-xl font-semibold tracking-tight">{column.name}</p>
    </div>
  )
}

interface VsCardProps {
  column: VsColumn
  highlight?: boolean
}

/** Spec-sheet list: one hairline-separated row per capability. */
function VsList({ column, highlight }: Required<VsCardProps>): JSX.Element {
  const ItemIcon = highlight ? Check : Minus
  return (
    <ul className="divide-border/70 border-border flex-1 divide-y border-t">
      {column.items.map(item => (
        <li key={item} className="flex items-start gap-3 py-3.5 text-[15px] leading-snug">
          <ItemIcon
            aria-hidden
            className={
              highlight
                ? 'text-success mt-px size-4 shrink-0'
                : 'text-muted-foreground/40 mt-px size-4 shrink-0'
            }
          />
          <span className={highlight ? 'text-foreground' : 'text-muted-foreground'}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Card interior: head, capability rows, then the closing footnote or pills. */
function VsCardBody({ column, highlight = false }: VsCardProps): JSX.Element {
  return (
    <div className={`${HOME_CARD} flex h-full flex-col p-5 sm:p-7`}>
      <VsCardHead column={column} />
      <VsList column={column} highlight={highlight} />
      <p className="text-muted-foreground/80 border-border mt-5 border-t pt-5 text-[13px] leading-relaxed">
        {column.footnote}
      </p>
      {highlight ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {SIGNALOR_PILLS.map(pill => (
            <span
              key={pill}
              className="ring-border text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1"
            >
              {pill}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * One comparison column. The Signalor side sits on a brand panel that peeks out
 * as a labelled band above the card — the same painterly fill as the hero, so
 * the highlight reads as art direction rather than a stray block of colour.
 */
function VsCard({ column, highlight = false }: VsCardProps): JSX.Element {
  if (!highlight) {
    return <VsCardBody column={column} />
  }
  return (
    <div className="relative h-full">
      <div className="bg-primary absolute -top-9 -right-1.5 -bottom-2 -left-1.5 overflow-hidden rounded-2xl">
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/hero-texture.svg')] bg-cover opacity-50 mix-blend-overlay"
        />
        <p className="absolute inset-x-0 top-[9px] text-center text-[11px] font-semibold tracking-[0.22em] text-white/95 uppercase">
          What you actually get
        </p>
      </div>
      <div className="relative h-full">
        <VsCardBody column={column} highlight />
      </div>
    </div>
  )
}

/**
 * Overlapping "VS" marker centred on the seam between the two columns. It sits
 * on both cards' edges (a fixed 44px circle across the 16px grid gap) so the
 * two panels read as a single head-to-head, not two unrelated cards.
 */
function VsMedallion(): JSX.Element {
  return (
    <span
      aria-hidden
      className="absolute top-1/2 left-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 md:block"
    >
      <span className="bg-card text-primary ring-border flex size-11 items-center justify-center rounded-full text-[13px] font-bold tracking-[0.06em] shadow-sm ring-1 shadow-black/10">
        VS
      </span>
    </span>
  )
}

export function HomeVsClaude(): JSX.Element {
  return (
    <section aria-labelledby="home-vs-claude-heading">
      <div className="border-border relative border-t px-6 py-20 sm:px-10 sm:py-24">
        <GridCornerHandles top />
        <HomeSectionHeader
          eyebrow="Signalor vs Claude"
          headingId="home-vs-claude-heading"
          title="Why not just ask Claude?"
          description="Claude answers one question at a time. SignalorAI watches your brand across every major AI engine, every day."
          size="lg"
          highlight="just ask Claude?"
        />
        <div className="relative mx-auto mt-16 grid max-w-4xl gap-4 sm:mt-20 md:grid-cols-2">
          <VsMedallion />
          <VsCard column={SIGNALOR_COLUMN} highlight />
          <VsCard column={CLAUDE_COLUMN} />
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/tools/url-analyzer" className={LANDING_SECONDARY_CTA_CLASS}>
            See the difference on your site, free
          </Link>
        </div>
      </div>
    </section>
  )
}
