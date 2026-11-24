import { ScreenHR, GridDividerDiamonds } from '@/components/ui/intersection-diamonds'
import { Sparkles } from '@/lib/icons'

export function FeaturesGrid(): JSX.Element {
  return (
    <section
      id="features"
      className="relative scroll-mt-24 bg-transparent"
      aria-labelledby="landing-features-grid-heading"
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-14">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
          [ platform ]
        </p>
        <h2
          id="landing-features-grid-heading"
          className="text-foreground mt-4 max-w-4xl text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
        >
          Everything you need to{' '}
          <span className="text-primary-ink relative inline-flex items-center gap-2 align-middle whitespace-nowrap">
            win in{' '}
            <Sparkles
              className="text-primary-ink inline-block h-[0.85em] w-[0.85em] shrink-0 align-middle"
              strokeWidth={2.25}
              aria-hidden
            />{' '}
            search
            <span
              className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
              aria-hidden
            />
          </span>
        </h2>
        <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          Track and improve how AI engines cite your brand, across ChatGPT, Claude, Gemini, and
          Perplexity.
        </p>
      </div>
      <ScreenHR />
      <div className="mx-auto max-w-7xl">
        <div className="relative grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-black/6">
          <GridDividerDiamonds columns={3} top bottom />
          {/* Prompt tracking */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                Prompt tracking
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                Track real user prompts. See exactly when AI mentions your brand.
              </p>
            </div>
            <div className="flex h-full w-full items-center justify-center rounded-none border bg-[#f7f7f7] p-4">
              <div className="mt-auto rounded-none border border-black/8 bg-white p-4 shadow-xs">
                <div className="space-y-3 text-[13px] leading-snug">
                  <div className="bg-muted text-foreground max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5">
                    What CRM do you recommend for a small sales team?
                  </div>
                  <div className="bg-foreground text-muted-foreground ml-auto max-w-[94%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-xs font-medium">
                    Popular picks include{' '}
                    <span className="font-semibold text-orange-400">HubSpot</span>
                    {' and '}
                    <span className="text-white underline decoration-white/40">Salesforce</span> for
                    pipeline and reporting.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Citations analysis */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                Citations analysis
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                See which pages drive citations. Learn what content AI engines actually use.
              </p>
            </div>
            <div className="flex h-full w-full items-center justify-center rounded-none border bg-[#f7f7f7] p-4">
              <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-4 shadow-xs">
                <div className="text-muted-foreground mb-3 flex items-center justify-between text-[11px] font-semibold">
                  <span>Mentioned</span>
                  <span>Missing</span>
                </div>
                <div className="bg-muted mb-4 flex h-2.5 overflow-hidden rounded-full">
                  <div className="bg-info w-[40%]" />
                  <div
                    className="bg-muted relative flex-1"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)',
                    }}
                  />
                </div>
                <div className="text-muted-foreground flex justify-between text-[11px] font-semibold tabular-nums">
                  <span>40%</span>
                  <span>60%</span>
                </div>
                <ul className="text-foreground mt-4 space-y-2 border-t border-black/6 pt-3 text-xs font-medium">
                  <li className="flex items-center gap-2">
                    <span className="bg-info h-1.5 w-1.5 shrink-0 rounded-full" />
                    Listicle (23%) · missing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-success h-1.5 w-1.5 shrink-0 rounded-full" />
                    Guide (18%) · cited
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-warning h-1.5 w-1.5 shrink-0 rounded-full" />
                    Comparison (12%) · partial
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agent analytics */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                Agent analytics
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                Watch ChatGPT, Claude, and Gemini crawlers read your pages in real time.
              </p>
            </div>
            <div className="flex h-full w-full items-center justify-center rounded-none border bg-[#f7f7f7] p-4">
              <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
                <ul className="divide-y divide-black/6 text-xs font-medium">
                  {[
                    { name: 'ChatGPT', path: '/blog/security-…', tone: 'bg-success' },
                    { name: 'Claude', path: '/pricing/com…', tone: 'bg-[var(--feature-violet)]' },
                    { name: 'Perplexity', path: '/docs/api-v2…', tone: 'bg-info' },
                    { name: 'Copilot', path: '/resources/…', tone: 'bg-info' },
                  ].map(row => (
                    <li
                      key={row.name}
                      className="flex items-center gap-2.5 py-2.5 first:pt-1 last:pb-1"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white ${row.tone}`}
                        aria-hidden
                      >
                        {row.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground font-semibold">{row.name}</div>
                        <div className="text-muted-foreground truncate text-[11px]">{row.path}</div>
                      </div>
                      <span className="bg-muted text-muted-foreground shrink-0 rounded-md border border-black/8 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                        Cited
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
        />

        <div className="relative grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-black/6">
          <GridDividerDiamonds columns={3} top bottom />
          {/* GEO score */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                GEO score
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                One 0–100 score. Citability, schema, content — all rolled up. Know where you stand.
              </p>
            </div>
            <div className="flex h-full w-full items-center justify-center rounded-none border bg-[#f7f7f7] p-4">
              <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-4 shadow-xs">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                      Overall
                    </p>
                    <p className="text-foreground mt-1 text-3xl font-bold tracking-tight tabular-nums">
                      78
                      <span className="text-muted-foreground text-lg font-semibold">/100</span>
                    </p>
                  </div>
                  <div className="border-info/25 text-info flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 text-[11px] font-bold">
                    +12
                  </div>
                </div>
                <ul className="text-foreground mt-4 space-y-2.5 border-t border-black/6 pt-3 text-xs font-medium">
                  <li className="flex items-center gap-2">
                    <span className="bg-info/80 h-1.5 w-8 shrink-0 rounded-full" />
                    Citability · 82
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-success/90 h-1.5 w-6 shrink-0 rounded-full" />
                    Schema · 71
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-warning/90 h-1.5 w-7 shrink-0 rounded-full" />
                    Content · 74
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fix queue */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                Fix queue
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                Ranked fixes with impact estimates. Ship what moves citations first.
              </p>
            </div>
            <div className="flex h-full w-full items-center justify-center rounded-none border bg-[#f7f7f7] p-4">
              <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
                <ul className="divide-y divide-black/6 text-xs font-medium">
                  <li className="flex items-start gap-2 py-2.5 first:pt-1">
                    <span className="bg-destructive mt-0.5 h-2 w-2 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground font-semibold">Add Organization JSON-LD</div>
                      <div className="text-muted-foreground mt-0.5 text-[11px]">
                        High impact · ~2h
                      </div>
                    </div>
                    <span className="bg-destructive/10 text-destructive shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                      Critical
                    </span>
                  </li>
                  <li className="flex items-start gap-2 py-2.5">
                    <span className="bg-warning mt-0.5 h-2 w-2 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground font-semibold">Rewrite meta for /pricing</div>
                      <div className="text-muted-foreground mt-0.5 text-[11px]">Medium · ~45m</div>
                    </div>
                    <span className="bg-muted text-muted-foreground shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                      Next
                    </span>
                  </li>
                  <li className="flex items-start gap-2 py-2.5 last:pb-1">
                    <span className="bg-success mt-0.5 h-2 w-2 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground font-semibold">
                        Publish FAQ block on /docs
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-[11px]">
                        Shipped · cited in Perplexity
                      </div>
                    </div>
                    <span className="bg-success/10 text-success shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                      Done
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Competitor lens */}
          <div className="flex flex-col gap-8 bg-white px-6 py-12 md:px-8 md:py-16 lg:px-10">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                Competitor lens
              </h3>
              <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
                Compare your citation share with rivals. Close gaps before they widen.
              </p>
            </div>
            <div className="flex h-full w-full items-center justify-center rounded-none border bg-[#f7f7f7] p-4">
              <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-4 shadow-xs">
                <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
                  <span>Share of AI citations</span>
                  <span className="text-muted-foreground tabular-nums">7d</span>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="text-foreground flex justify-between text-xs font-semibold">
                      <span>You</span>
                      <span className="text-info tabular-nums">38%</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
                      <div className="bg-info h-full w-[38%] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="text-foreground flex justify-between text-xs font-semibold">
                      <span>Acme</span>
                      <span className="text-muted-foreground tabular-nums">44%</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
                      <div className="bg-muted h-full w-[44%] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="text-foreground flex justify-between text-xs font-semibold">
                      <span>Northwind</span>
                      <span className="text-muted-foreground tabular-nums">18%</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
                      <div className="bg-muted h-full w-[18%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
