'use client'

import { Quote } from '@/features/site/components/icons'

import { TESTIMONIALS, type Testimonial } from '@/features/site/lib/landing-testimonials-content'
import { ScreenHR } from '@/features/site/components/ui/intersection-diamonds'
import { cn } from '@/features/site/lib/utils'

const TINT_CLASSES: Record<Testimonial['tint'], { dot: string; avatar: string; quote: string }> = {
  orange: {
    dot: 'bg-primary/15 text-primary-ink',
    avatar: 'bg-gradient-to-br from-primary to-orange-400 text-white',
    quote: 'text-primary-ink/25',
  },
  blue: {
    dot: 'bg-info/15 text-info',
    avatar: 'bg-info text-white',
    quote: 'text-info/25',
  },
  emerald: {
    dot: 'bg-success/15 text-success',
    avatar: 'bg-success text-white',
    quote: 'text-success/25',
  },
}

export function LandingTestimonials() {
  return (
    <section className="relative bg-transparent" aria-labelledby="landing-testimonials-heading">
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-14">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
          [ in their words ]
        </p>
        <h2
          id="landing-testimonials-heading"
          className="text-foreground mt-4 max-w-4xl text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.65rem]"
        >
          Teams running{' '}
          <span className="text-primary-ink relative whitespace-nowrap">
            weekly GEO sprints
            <span
              className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
              aria-hidden
            />
          </span>
        </h2>
        <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          Real outcomes from growth, content, and DTC teams shipping SignalorAI into their existing
          workflow, not another dashboard to babysit.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      <ScreenHR />
    </section>
  )
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const tone = TINT_CLASSES[t.tint]
  return (
    <figure className="hover:bg-muted/25 relative flex flex-col gap-6 bg-white px-6 py-12 transition-colors duration-200 md:px-8 md:py-14 lg:px-10">
      <Quote className={cn('h-8 w-8 shrink-0', tone.quote)} strokeWidth={1.5} aria-hidden />
      <blockquote className="text-foreground flex-1 text-sm leading-relaxed font-light md:text-base">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-2 flex items-center gap-3 border-t border-black/6 pt-4">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold',
            tone.avatar,
          )}
          aria-hidden
        >
          {t.initials}
        </span>
        <div className="min-w-0">
          <p className="text-foreground truncate text-[13px] font-semibold">
            <cite className="not-italic">{t.name}</cite>
          </p>
          <p className="text-muted-foreground truncate text-[11px]">
            {t.role} · {t.company}
          </p>
        </div>
      </figcaption>
    </figure>
  )
}
