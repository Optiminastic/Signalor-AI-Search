import Link from 'next/link'
import { ArrowRight } from '@/features/site/components/icons'

import { Button } from '@/features/site/components/ui/button'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { PromptTrackingChatAnswerParts } from '@/features/site/components/landing/prompt-tracking-chat-answer-parts'
import {
  PROMPT_TRACKING_CAPABILITY_ROWS,
  PROMPT_TRACKING_HERO,
  PROMPT_TRACKING_PILLAR_ROWS,
  PROMPT_TRACKING_PROOF_METRICS,
  PROMPT_TRACKING_WHY,
} from '@/features/site/lib/landing-prompt-tracking-content'
import type { LucideIcon } from '@/features/site/components/icons'

/**
 * Same structural pattern as {@link LandingWhySignalor}: eyebrow, headline with dashed primary span,
 * intro copy, then bg-black-10 md:grid-cols-2 band with proof tiles, preview, breakdown, capability list.
 */
export function PromptTrackingWhySection({
  content = PROMPT_TRACKING_WHY,
  proofMetrics = PROMPT_TRACKING_PROOF_METRICS,
  pillarRows = PROMPT_TRACKING_PILLAR_ROWS,
  capabilityRows = PROMPT_TRACKING_CAPABILITY_ROWS,
  primaryCta = PROMPT_TRACKING_HERO.primaryCta,
  secondaryCtaLabel = 'Browse prompt library',
  secondaryCtaHref = '/prompt-tracking/prompt-library',
  headingId = 'prompt-tracking-why-heading',
}: {
  content?: Partial<{
    eyebrow: string
    titleBefore: string
    titleAccent: string
    titleAfter: string
    intro: string
    proofTitle: string
    proofBody: string
    breakdownTitle: string
    breakdownBody: string
    capabilityTitle: string
    capabilityBody: string
  }>
  proofMetrics?: readonly { value: string; label: string }[]
  pillarRows?: readonly { label: string; value: number; tone: string }[]
  capabilityRows?: readonly { icon: LucideIcon; title: string; description: string }[]
  primaryCta?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  headingId?: string
} = {}) {
  const w = { ...PROMPT_TRACKING_WHY, ...content }
  return (
    <section className="bg-background relative" aria-labelledby={headingId}>
      <div
        aria-hidden
        className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
      />

      <div className="mx-auto max-w-7xl px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-14">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
          {w.eyebrow}
        </p>
        <h2
          id={headingId}
          className="text-foreground mt-4 max-w-4xl text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
        >
          {w.titleBefore}{' '}
          <span className="text-primary-ink relative whitespace-nowrap">
            {w.titleAccent}
            <span
              className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
              aria-hidden
            />
          </span>{' '}
          {w.titleAfter}
        </h2>
        <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          {w.intro}
        </p>
      </div>

      <div
        aria-hidden
        className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
      />

      <div className="bg-black-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-2 md:divide-x md:divide-y-0 md:divide-black/6">
          {/* Proof + CTAs */}
          <div className="flex flex-col gap-8 rounded-none border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                {w.proofTitle}
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                {w.proofBody}
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="bg-border grid grid-cols-2 gap-px border border-black/6">
                {proofMetrics.map(m => (
                  <div
                    key={m.label}
                    className="bg-background hover:bg-muted/50 p-6 transition-colors sm:p-7"
                  >
                    <p className="text-foreground font-sans text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
                      {m.value}
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm leading-snug font-medium">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <Button asChild className={`${LANDING_PRIMARY_CTA_CLASS} h-10 px-5`}>
                <Link href="/sign-up">
                  {primaryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-background hover:bg-muted/50 h-10 border-black/15 px-5 text-sm font-semibold shadow-sm"
              >
                <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div className="flex flex-col gap-8 rounded-none border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                {w.liveTitle}
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                {w.liveBody}
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <div className="bg-background rounded-none border border-black/6 p-4">
                <div className="rounded-none border border-black/8 bg-white p-4 shadow-xs">
                  <div className="space-y-3 text-[13px] leading-snug">
                    <div className="bg-muted text-foreground max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5">
                      {w.livePrompt}
                    </div>
                    <div className="bg-foreground text-muted-foreground ml-auto max-w-[94%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-xs font-medium">
                      <PromptTrackingChatAnswerParts parts={w.liveAnswerParts} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt coverage breakdown */}
          <div className="flex flex-col gap-8 rounded-none border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                {w.coverageTitle}
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                {w.coverageBody}
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <div className="bg-background rounded-none border border-black/6 p-4">
                <div className="rounded-none border border-black/8 bg-white p-4 shadow-xs">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                        {w.coverageScoreLabel}
                      </p>
                      <p className="text-foreground mt-1 text-3xl font-bold tracking-tight tabular-nums">
                        {w.coverageScore}
                        <span className="text-muted-foreground text-lg font-semibold">
                          {w.coverageSuffix}
                        </span>
                      </p>
                    </div>
                    <div className="border-info/25 text-info flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 text-[11px] font-bold">
                      {w.coverageDelta}
                    </div>
                  </div>
                  <ul className="text-foreground mt-4 space-y-2.5 border-t border-black/6 pt-3 text-xs font-medium">
                    {pillarRows.map(row => (
                      <li key={row.label} className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-8 shrink-0 rounded-full ${row.tone}`}
                          aria-hidden
                        />
                        <span>
                          {row.label} · {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <div className="text-muted-foreground mb-2 flex items-center justify-between text-[11px] font-semibold">
                      <span>{w.citedLabel}</span>
                      <span>{w.missedLabel}</span>
                    </div>
                    <div className="bg-muted flex h-2.5 overflow-hidden rounded-full">
                      <div className="bg-info" style={{ width: `${w.coverageCitedBarPct}%` }} />
                      <div
                        className="bg-muted relative flex-1"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)',
                        }}
                      />
                    </div>
                    <div className="text-muted-foreground mt-1.5 flex justify-between text-[11px] font-semibold tabular-nums">
                      <span>{w.citedPct}</span>
                      <span>{w.missedPct}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What you ship */}
          <div className="flex flex-col gap-8 rounded-none border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                {w.shipTitle}
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                {w.shipBody}
              </p>
            </div>
            <div className="flex flex-1 flex-col">
              <div className="bg-background rounded-none border border-black/6 p-4">
                <div className="rounded-none border border-black/8 bg-white p-3 shadow-xs">
                  <ul className="divide-y divide-black/6 text-xs font-medium">
                    {capabilityRows.map(({ icon: Icon, title, description }) => (
                      <li key={title} className="flex gap-3 py-3 first:pt-1 last:pb-1">
                        <span className="bg-muted text-primary-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-black/8">
                          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-foreground font-semibold">{title}</div>
                          <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed font-normal">
                            {description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
      />
    </section>
  )
}
