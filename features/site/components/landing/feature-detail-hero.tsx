import Link from 'next/link'
import { ArrowLeft, type LucideIcon } from '@/features/site/components/icons'

import type { IntegrationPlatformCopy } from '@/features/site/components/landing/integration-platform-hero'

type FeatureDetailHeroProps = {
  backHref: string
  backLabel: string
  eyebrow: string
  copy: IntegrationPlatformCopy
  Icon: LucideIcon
}

export function FeatureDetailHero({
  backHref,
  backLabel,
  eyebrow,
  copy,
  Icon,
}: FeatureDetailHeroProps) {
  return (
    <section className="bg-background relative px-6 pt-14 pb-14 lg:px-12 lg:pt-16 lg:pb-20">
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-none border border-black/8 bg-white shadow-sm">
            <Icon className="text-primary-ink h-7 w-7" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              {eyebrow}
            </p>
            <h1 className="text-foreground mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {copy.headline}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground mt-5 text-base leading-relaxed font-light sm:text-lg">
          {copy.subhead}
        </p>
        <ul className="mt-8 space-y-3 border-t border-black/8 pt-8">
          {copy.bullets.map(line => (
            <li
              key={line}
              className="text-foreground flex gap-3 text-sm leading-relaxed sm:text-sm"
            >
              <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
