'use client'

import { Globe, Gauge, Link2, Rocket } from '@/features/site/components/icons'

import {
  HOW_IT_WORKS_STEPS,
  type HowItWorksStep,
} from '@/features/site/lib/landing-how-it-works-content'
import { ScreenHR } from '@/features/site/components/ui/intersection-diamonds'

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-transparent"
      aria-labelledby="how-it-works-heading"
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-14">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
          [ how it works ]
        </p>
        <h2
          id="how-it-works-heading"
          className="text-foreground mt-4 max-w-4xl text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.65rem]"
        >
          From pasted URL to{' '}
          <span className="text-primary-ink relative whitespace-nowrap">
            shipped fix
            <span
              className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
              aria-hidden
            />
          </span>{' '}
          in four steps
        </h2>
        <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          Sign up, paste a URL, get a score. No setup calls. No separate tools.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map(s => (
            <StepCard key={s.n} step={s} />
          ))}
        </div>
      </div>

      <ScreenHR />
    </section>
  )
}

function StepCard({ step }: { step: HowItWorksStep }) {
  return (
    <div className="group hover:bg-muted/25 flex flex-col gap-6 bg-white px-6 py-12 transition-colors duration-200 md:px-8 md:py-14 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="bg-primary/10 text-primary-ink group-hover:bg-primary/15 inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors">
          {step.n}
        </span>
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
          Step {step.n}
        </span>
      </div>
      <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
        {step.title}
      </h3>
      <p className="text-accent-foreground max-w-sm text-sm leading-relaxed font-light md:text-sm">
        {step.body}
      </p>
      <div className="bg-background mt-auto flex items-center justify-center rounded-none border border-black/6 p-4">
        <StepIllustration illo={step.illo} />
      </div>
    </div>
  )
}

function StepIllustration({ illo }: { illo: HowItWorksStep['illo'] }) {
  if (illo === 'connect') {
    return (
      <div className="flex w-full items-center gap-2 rounded-none border border-black/8 bg-white px-3 py-2.5 shadow-xs">
        <Globe className="text-muted-foreground h-4 w-4" aria-hidden />
        <span className="text-muted-foreground flex-1 truncate text-xs">signalor.ai</span>
        <span className="bg-primary-strong rounded-md px-2 py-0.5 text-[10px] font-semibold text-white">
          Connect
        </span>
      </div>
    )
  }
  if (illo === 'audit') {
    return (
      <div className="w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
        <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold">
          <Gauge className="h-3.5 w-3.5" aria-hidden />
          GEO score
        </div>
        <p className="text-foreground mt-1 text-2xl font-bold tabular-nums">
          78<span className="text-muted-foreground text-sm">/100</span>
        </p>
        <div className="mt-2 flex gap-1">
          {[82, 71, 74].map(v => (
            <div key={v} className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
              <div className="bg-success h-full rounded-full" style={{ width: `${v}%` }} />
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (illo === 'track') {
    return (
      <div className="w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
        <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold">
          <Link2 className="h-3.5 w-3.5" aria-hidden />
          Citations this week
        </div>
        <ul className="text-foreground mt-2 space-y-1.5 text-[11px] font-medium">
          <li className="flex items-center justify-between">
            <span className="truncate">perplexity.ai</span>
            <span className="text-primary-ink tabular-nums">8</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="truncate">gemini</span>
            <span className="text-muted-foreground tabular-nums">5</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="truncate">chatgpt</span>
            <span className="text-muted-foreground tabular-nums">3</span>
          </li>
        </ul>
      </div>
    )
  }
  // ship
  return (
    <div className="w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
      <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold">
        <Rocket className="h-3.5 w-3.5" aria-hidden />
        Fix queue
      </div>
      <ul className="mt-2 space-y-1.5 text-[11px] font-medium">
        <li className="flex items-center gap-2">
          <span className="bg-destructive h-1.5 w-1.5 rounded-full" />
          <span className="text-foreground flex-1 truncate">Organization JSON-LD</span>
          <span className="bg-destructive/10 text-destructive rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
            Critical
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="bg-success h-1.5 w-1.5 rounded-full" />
          <span className="text-foreground flex-1 truncate">FAQ block · /docs</span>
          <span className="bg-success/10 text-success rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
            Shipped
          </span>
        </li>
      </ul>
    </div>
  )
}
