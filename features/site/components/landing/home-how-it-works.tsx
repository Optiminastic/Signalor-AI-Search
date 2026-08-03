import Link from 'next/link'

import { ArrowRight, Gauge, Globe, Link2, Rocket } from '@/features/site/components/icons'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { HOME_WELL } from '@/features/site/components/landing/home-styles'
import {
  HOW_IT_WORKS_STEPS,
  type HowItWorksStep,
} from '@/features/site/lib/landing-how-it-works-content'
import { cn } from '@/features/site/lib/utils'

const STEP_LABELS: Record<HowItWorksStep['illo'], string> = {
  connect: 'Connect',
  audit: 'Audit',
  track: 'Track',
  ship: 'Ship',
}

/** Browser-bar mock: paste a domain, hit Connect. */
function ConnectIllo(): JSX.Element {
  return (
    <div className="bg-card ring-border flex w-full max-w-sm items-center gap-2.5 rounded-xl px-3.5 py-3 shadow-sm ring-1 shadow-black/5">
      <Globe className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
      <span className="text-foreground flex-1 truncate font-mono text-xs">
        signalor.ai
        <span
          aria-hidden
          className="bg-foreground/70 motion-safe:animate-blink ml-0.5 inline-block h-3 w-[1.5px] translate-y-0.5"
        />
      </span>
      <span className="bg-primary text-primary-foreground rounded-md px-2.5 py-1 text-[11px] font-semibold shadow-sm shadow-black/10 transition-transform duration-200 motion-safe:group-hover:scale-105">
        Connect
      </span>
    </div>
  )
}

const AUDIT_PILLARS = [
  { label: 'Content', value: 82 },
  { label: 'Schema', value: 71 },
  { label: 'E-E-A-T', value: 76 },
  { label: 'Technical', value: 84 },
  { label: 'Entity', value: 69 },
  { label: 'AI visibility', value: 74 },
] as const

/** Six-pillar audit readout with segmented tick meters. */
function AuditIllo(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-sm rounded-xl p-4 shadow-sm ring-1 shadow-black/5">
      <div className="flex items-baseline justify-between">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
          GEO audit
        </p>
        <p className="text-foreground text-lg font-semibold tracking-tight tabular-nums">
          78<span className="text-muted-foreground text-xs font-medium">/100</span>
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5">
        {AUDIT_PILLARS.map(pillar => {
          const filled = Math.round((pillar.value / 100) * 12)
          return (
            <div key={pillar.label}>
              <div className="text-muted-foreground flex items-center justify-between text-[10px] font-medium">
                <span>{pillar.label}</span>
                <span className="tabular-nums">{pillar.value}</span>
              </div>
              <div className="mt-1 flex items-center gap-[2px]">
                {Array.from({ length: 12 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-3.5 w-[3px] rounded-[1px]',
                      i < filled ? 'bg-primary' : 'bg-neutral-200',
                    )}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Citation log: fresh mentions arriving engine by engine. */
function TrackIllo(): JSX.Element {
  const rows = [
    { engine: 'perplexity.ai', count: 8, fresh: true },
    { engine: 'gemini', count: 5, fresh: false },
    { engine: 'chatgpt', count: 3, fresh: false },
  ]
  return (
    <div className="bg-card ring-border w-full max-w-sm rounded-xl p-4 shadow-sm ring-1 shadow-black/5">
      <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] uppercase">
        <Link2 className="h-3.5 w-3.5" aria-hidden />
        Citations this week
      </div>
      <ul className="divide-border/70 mt-2.5 divide-y">
        {rows.map(row => (
          <li key={row.engine} className="flex items-center gap-2.5 py-2.5">
            {row.fresh ? (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span
                  aria-hidden
                  className="bg-success/50 absolute inline-flex h-full w-full rounded-full [animation-duration:2.2s] motion-safe:animate-ping"
                />
                <span className="bg-success relative inline-flex h-1.5 w-1.5 rounded-full" />
              </span>
            ) : (
              <span aria-hidden className="bg-foreground/20 h-1.5 w-1.5 shrink-0 rounded-full" />
            )}
            <span className="text-foreground flex-1 truncate font-mono text-xs">{row.engine}</span>
            {row.fresh ? (
              <span className="bg-success/10 text-success rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                +2 new
              </span>
            ) : null}
            <span className="text-muted-foreground w-5 text-right text-xs font-semibold tabular-nums">
              {row.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Fix shipping: the critical item flips to shipped on hover. */
function ShipIllo(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-sm rounded-xl p-4 shadow-sm ring-1 shadow-black/5">
      <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] uppercase">
        <Rocket className="h-3.5 w-3.5" aria-hidden />
        Fix queue
      </div>
      <div className="bg-muted/60 ring-border/70 mt-2.5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 ring-1">
        <Gauge className="text-primary h-4 w-4 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-xs font-semibold">Organization JSON-LD</p>
          <p className="text-muted-foreground mt-0.5 text-[10px]">High impact · ~2h</p>
        </div>
        <span className="relative inline-grid shrink-0 text-[10px] font-semibold uppercase">
          <span className="bg-destructive/10 text-destructive col-start-1 row-start-1 rounded-md px-2 py-0.5 transition-opacity duration-300 motion-safe:group-hover:opacity-0">
            Critical
          </span>
          <span className="bg-success/10 text-success col-start-1 row-start-1 rounded-md px-2 py-0.5 text-center opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100">
            Shipped
          </span>
        </span>
      </div>
      <p className="text-muted-foreground mt-2.5 text-[11px] leading-relaxed">
        Cited by Perplexity four days after shipping.
      </p>
    </div>
  )
}

const STEP_ILLOS: Record<HowItWorksStep['illo'], () => JSX.Element> = {
  connect: ConnectIllo,
  audit: AuditIllo,
  track: TrackIllo,
  ship: ShipIllo,
}

/**
 * One step per row, alternating which side the illustration sits on: step 01
 * text-left/card-right, step 02 text-right/card-left, and so on.
 */
function StepBlock({ step, flipped }: { step: HowItWorksStep; flipped: boolean }): JSX.Element {
  const Illo = STEP_ILLOS[step.illo]
  return (
    <article
      className={cn(
        'group flex flex-col gap-10 px-6 py-14 sm:px-10 lg:flex-row lg:items-center lg:gap-20 lg:py-20',
        flipped ? 'lg:flex-row-reverse' : 'lg:flex-row',
      )}
    >
      <div className="lg:flex-1">
        <p className="text-muted-foreground font-mono text-[13px] tracking-[0.12em]">
          {String(step.n).padStart(2, '0')}. {STEP_LABELS[step.illo]}
        </p>
        <p className="text-foreground mt-3 max-w-md text-2xl leading-snug font-semibold text-pretty sm:text-3xl">
          {step.title}
        </p>
      </div>
      <div className={cn(HOME_WELL, 'flex shrink-0 justify-center px-8 py-8 lg:w-[420px]')}>
        <Illo />
      </div>
    </article>
  )
}

export function HomeHowItWorks(): JSX.Element {
  return (
    <section id="how-it-works" className="scroll-mt-20" aria-labelledby="home-how-it-works-heading">
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <div className="px-6 py-20 sm:px-10 sm:py-24">
          <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
            How it works
          </p>
          <h2
            id="home-how-it-works-heading"
            className="text-foreground mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            From pasted URL to shipped fix
          </h2>
          <Link
            href="/sign-up"
            className="text-primary hover:text-primary/80 mt-6 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
          >
            Start step one
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div>
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <StepBlock key={step.n} step={step} flipped={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
