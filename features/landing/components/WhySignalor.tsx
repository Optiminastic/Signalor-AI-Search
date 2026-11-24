import Link from 'next/link'

import { ScreenHR } from '@/components/ui/intersection-diamonds'
import { ArrowRight, Gauge, Layers, Link2, ListChecks, Sparkles } from '@/lib/icons'

const FEATURE_ROWS = [
  {
    icon: Gauge,
    title: 'GEO score',
    description: 'One 0-100 read on how AI engines trust and cite your site.',
  },
  {
    icon: Link2,
    title: 'Citation & prompt signals',
    description: 'See which pages AI models actually use. Double down on what works.',
  },
  {
    icon: ListChecks,
    title: 'Prioritized fixes',
    description: 'Plain-language tasks ranked by impact. Schema, structure, content.',
  },
  {
    icon: Layers,
    title: 'Multi-engine view',
    description: 'ChatGPT, Claude, Gemini, Perplexity, one view, always fresh.',
  },
] as const

const PROOF_METRICS = [
  { value: '5k+', label: 'Websites optimizing with us' },
  { value: '40%', label: 'Avg. lift in AI citations' },
  { value: '40%', label: 'Higher buyer intent' },
  { value: '24h', label: 'To see visibility growth' },
] as const

export function WhySignalor(): JSX.Element {
  return (
    <section className="relative bg-transparent" aria-labelledby="why-signalor-heading">
      <ScreenHR />

      <div className="mx-auto max-w-7xl px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-14">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
          [ why signalor ]
        </p>
        <h2
          id="why-signalor-heading"
          className="text-foreground mt-4 max-w-4xl text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
        >
          SEO got your site on Google. GEO gets you into{' '}
          <span className="text-primary-ink relative inline-flex items-center gap-2 align-middle whitespace-nowrap">
            <Sparkles
              className="text-primary-ink inline-block h-[0.85em] w-[0.85em] shrink-0 align-middle"
              strokeWidth={2.25}
              aria-hidden
            />{' '}
            answers
            <span
              className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
              aria-hidden
            />
          </span>
        </h2>
        <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          Over 40% of searches now happen inside AI tools. Those tools cite sources, not links.
          SignalorAI scores your citability and shows where you win or lose against competitors.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-2 md:divide-x md:divide-y-0 md:divide-black/6">
          {/* 1 — Proof in numbers + CTAs */}
          <div className="flex flex-col gap-8 border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                Proof in numbers
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                From teams using SignalorAI to grow citations.
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="bg-border grid grid-cols-2 gap-px border border-black/6">
                {PROOF_METRICS.map(m => (
                  <div
                    key={m.label}
                    className="hover:bg-muted/50 bg-[#f7f7f7] p-6 transition-colors sm:p-7"
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
              <Link
                href="/sign-up"
                className="auth-cta-btn inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-5 text-sm font-semibold text-white shadow-sm"
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="#features"
                className="text-foreground hover:bg-muted/50 inline-flex h-10 items-center justify-center rounded-md border border-black/15 bg-[#f7f7f7] px-5 text-sm font-semibold shadow-sm transition-colors"
              >
                Explore platform
              </Link>
            </div>
          </div>

          {/* 2 — Citation attribution */}
          <div className="flex flex-col gap-8 border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                Citation attribution
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                See exactly which URLs AI engines cite — yours, your rivals&rsquo;,
                everyone&rsquo;s. No guessing.
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <div className="rounded-none border border-black/6 bg-[#f7f7f7] p-4">
                <div className="rounded-none border border-black/8 bg-white p-4 shadow-xs">
                  <div className="text-muted-foreground mb-3 flex items-center justify-between text-[11px] font-semibold">
                    <span>Top cited domains · 7d</span>
                    <span className="text-muted-foreground tabular-nums">24 citations</span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-medium">
                    {[
                      {
                        domain: 'signalor.ai',
                        pct: 62,
                        tag: 'YOU',
                        tagBg: 'bg-success/10',
                        tagFg: 'text-success',
                        bar: 'bg-success',
                      },
                      {
                        domain: 'tryprofound.com',
                        pct: 38,
                        tag: 'RIVAL',
                        tagBg: 'bg-warning/10',
                        tagFg: 'text-warning',
                        bar: 'bg-warning',
                      },
                      {
                        domain: 'siftly.ai',
                        pct: 26,
                        tag: 'RIVAL',
                        tagBg: 'bg-warning/10',
                        tagFg: 'text-warning',
                        bar: 'bg-warning',
                      },
                      {
                        domain: 'searchengineland.com',
                        pct: 18,
                        tag: '',
                        tagBg: '',
                        tagFg: '',
                        bar: 'bg-muted',
                      },
                    ].map(r => (
                      <li key={r.domain}>
                        <div className="text-foreground flex items-center justify-between gap-2 text-xs font-semibold">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate">{r.domain}</span>
                            {r.tag && (
                              <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${r.tagBg} ${r.tagFg}`}
                              >
                                {r.tag}
                              </span>
                            )}
                          </span>
                          <span className="text-muted-foreground tabular-nums">{r.pct}%</span>
                        </div>
                        <div className="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
                          <div
                            className={`h-full rounded-full ${r.bar}`}
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 3 — Competitor delta */}
          <div className="flex flex-col gap-8 border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                Competitor delta
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                Track which prompts you win back from rivals every week. See the work pay off.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <div className="rounded-none border border-black/6 bg-[#f7f7f7] p-4">
                <div className="rounded-none border border-black/8 bg-white p-4 shadow-xs">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                        Prompts won this week
                      </p>
                      <p className="text-foreground mt-1 text-3xl font-bold tracking-tight tabular-nums">
                        +4
                        <span className="text-success ml-1 text-sm font-semibold">↑</span>
                      </p>
                    </div>
                    <div className="border-success/30 text-success flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 text-[11px] font-bold">
                      +18%
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2.5 border-t border-black/6 pt-3 text-xs font-medium">
                    {[
                      { name: 'Acme', prev: 44, now: 40, delta: -4, rival: true },
                      { name: 'Northwind', prev: 22, now: 20, delta: -2, rival: true },
                      { name: 'You', prev: 34, now: 40, delta: 6, rival: false },
                    ].map(row => (
                      <li key={row.name} className="flex items-center gap-2">
                        <span className="min-w-0 flex-1">
                          <span
                            className={row.rival ? 'text-foreground' : 'text-success font-semibold'}
                          >
                            {row.name}
                          </span>
                          <span className="text-muted-foreground ml-1 text-[11px] tabular-nums">
                            {row.prev}% → {row.now}%
                          </span>
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                            row.delta > 0
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {row.delta > 0 ? '+' : ''}
                          {row.delta}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 4 — What you ship */}
          <div className="flex flex-col gap-8 border border-black/6 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                What you ship
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                Every surface you use weekly — score, fixes, engine-by-engine visibility.
              </p>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="rounded-none border border-black/6 bg-[#f7f7f7] p-4">
                <div className="rounded-none border border-black/8 bg-white p-3 shadow-xs">
                  <ul className="divide-y divide-black/6 text-xs font-medium">
                    {FEATURE_ROWS.map(({ icon: Icon, title, description }) => (
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

      <ScreenHR />
    </section>
  )
}
