import Link from 'next/link'
import type { ReactNode } from 'react'
import type { LucideIcon } from '@/features/site/components/icons'
import { ArrowRight } from '@/features/site/components/icons'
import { Button } from '@/features/site/components/ui/button'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { ScreenHR } from '@/features/site/components/ui/intersection-diamonds'
import { cn } from '@/features/site/lib/utils'

export function SolutionsHero({
  eyebrow,
  heading,
  highlight,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string
  heading: ReactNode
  highlight?: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  return (
    <section className="relative bg-transparent" aria-labelledby="solutions-hero-heading">
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 lg:px-12 lg:pt-14 lg:pb-16">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
          [ {eyebrow} ]
        </p>
        <h1
          id="solutions-hero-heading"
          className="text-foreground mt-5 max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-[3.25rem]"
        >
          {heading}
          {highlight ? (
            <>
              {' '}
              <span className="text-primary-ink relative whitespace-nowrap">
                {highlight}
                <span
                  className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
                  aria-hidden
                />
              </span>
            </>
          ) : null}
        </h1>
        <p className="text-accent-foreground mt-6 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button asChild className={LANDING_PRIMARY_CTA_CLASS}>
            <Link href={primaryCta.href}>
              {primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {secondaryCta ? (
            <Button
              asChild
              variant="outline"
              className="text-foreground hover:bg-muted h-10 border-black/12 bg-white px-5 text-sm font-semibold"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function SolutionsSection({
  id,
  eyebrow,
  heading,
  highlight,
  description,
  children,
  bg = 'transparent',
}: {
  id?: string
  eyebrow: string
  heading: ReactNode
  highlight?: string
  description?: string
  children?: ReactNode
  bg?: 'transparent' | 'neutral'
}) {
  const headingId = id ? `${id}-heading` : undefined
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn('relative', bg === 'neutral' ? 'bg-muted' : 'bg-transparent')}
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-16">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
          [ {eyebrow} ]
        </p>
        <h2
          id={headingId}
          className="text-foreground mt-4 max-w-4xl text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]"
        >
          {heading}
          {highlight ? (
            <>
              {' '}
              <span className="text-primary-ink relative whitespace-nowrap">
                {highlight}
                <span
                  className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
                  aria-hidden
                />
              </span>
            </>
          ) : null}
        </h2>
        {description ? (
          <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-10 lg:mt-12">{children}</div> : null}
      </div>
    </section>
  )
}

export type SolutionsFeature = {
  icon: LucideIcon
  title: string
  description: string
}

export function SolutionsFeatureGrid({ features }: { features: SolutionsFeature[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-none border border-black/8 bg-black/8 sm:grid-cols-2 lg:grid-cols-3">
      {features.map(f => {
        const Icon = f.icon
        return (
          <article key={f.title} className="flex flex-col gap-4 bg-white p-6 lg:p-8">
            <div className="bg-primary/10 text-primary-ink inline-flex h-9 w-9 items-center justify-center rounded-md">
              <Icon className="h-4.5 w-4.5" aria-hidden />
            </div>
            <h3 className="text-foreground text-base font-semibold tracking-tight lg:text-lg">
              {f.title}
            </h3>
            <p className="text-accent-foreground text-sm leading-relaxed font-light">
              {f.description}
            </p>
          </article>
        )
      })}
    </div>
  )
}

export type SolutionsStep = {
  n: string
  title: string
  body: string
  icon: LucideIcon
}

export function SolutionsSteps({ steps }: { steps: SolutionsStep[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-none border border-black/8 bg-black/8 md:grid-cols-2 lg:grid-cols-4">
      {steps.map(s => {
        const Icon = s.icon
        return (
          <div key={s.n} className="flex flex-col gap-5 bg-white p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary-ink inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold">
                {s.n}
              </span>
              <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                Step {s.n}
              </span>
            </div>
            <h3 className="text-foreground text-lg font-semibold tracking-tight">{s.title}</h3>
            <p className="text-accent-foreground text-sm leading-relaxed font-light">{s.body}</p>
            <div className="bg-muted text-muted-foreground mt-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/8">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export type SolutionsBenefit = {
  icon: LucideIcon
  title: string
  description: string
}

export function SolutionsBenefitsList({ benefits }: { benefits: SolutionsBenefit[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {benefits.map(b => {
        const Icon = b.icon
        return (
          <li
            key={b.title}
            className="flex items-start gap-4 rounded-none border border-black/8 bg-white p-5 lg:p-6"
          >
            <span className="bg-primary/10 text-primary-ink mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-foreground text-base font-semibold tracking-tight">{b.title}</h3>
              <p className="text-accent-foreground mt-1.5 text-sm leading-relaxed font-light">
                {b.description}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function SolutionsBottomCTA({
  eyebrow,
  heading,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string
  heading: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  return (
    <section className="relative bg-transparent" aria-labelledby="solutions-bottom-cta-heading">
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-20">
        <div className="relative overflow-hidden rounded-none border border-black/8 bg-white p-8 shadow-lg sm:p-12 lg:p-14">
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
            [ {eyebrow} ]
          </p>
          <h2
            id="solutions-bottom-cta-heading"
            className="text-foreground mt-3 max-w-3xl text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-[2.25rem]"
          >
            {heading}
          </h2>
          <p className="text-accent-foreground mt-4 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
            {description}
          </p>
          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button asChild className={LANDING_PRIMARY_CTA_CLASS}>
              <Link href={primaryCta.href}>
                {primaryCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {secondaryCta ? (
              <Button
                asChild
                variant="outline"
                className="text-foreground hover:bg-muted h-10 border-black/12 bg-white px-5 text-sm font-semibold"
              >
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-24 h-40 opacity-60 blur-2xl"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #e04a3d 20%, #f4748f 50%, #fbbf24 80%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </section>
  )
}

export function SolutionsInlineCTA({
  heading,
  description,
  primaryCta,
  secondaryCta,
}: {
  heading: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  return (
    <div className="bg-muted rounded-none border border-black/8 p-6 lg:p-8">
      <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h3 className="text-foreground text-lg font-semibold tracking-tight lg:text-xl">
            {heading}
          </h3>
          <p className="text-accent-foreground mt-2 text-sm leading-relaxed font-light lg:text-sm">
            {description}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <Button asChild className={LANDING_PRIMARY_CTA_CLASS}>
            <Link href={primaryCta.href}>
              {primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {secondaryCta ? (
            <Button
              asChild
              variant="outline"
              className="text-foreground hover:bg-muted h-10 border-black/12 bg-white px-5 text-sm font-semibold"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function SolutionsInternalLinks({
  heading,
  links,
}: {
  heading: string
  links: { label: string; href: string; description: string }[]
}) {
  return (
    <div className="rounded-none border border-black/8 bg-white p-6 lg:p-8">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
        {heading}
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group bg-muted hover:border-primary/30 flex flex-col gap-1.5 rounded-none border border-black/8 px-4 py-3 transition-colors hover:bg-white"
            >
              <span className="text-foreground group-hover:text-primary-ink inline-flex items-center gap-1.5 text-sm font-semibold">
                {l.label}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="text-accent-foreground text-xs leading-relaxed font-light">
                {l.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
