import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from '@/features/site/components/icons'

import { Button } from '@/features/site/components/ui/button'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import {
  PROMPT_TRACKING_FEATURES_FOOTER_CTAS,
  PROMPT_TRACKING_FEATURES_INTRO,
  PROMPT_TRACKING_FEATURE_CELLS,
  type PromptTrackingFeatureMock,
} from '@/features/site/lib/landing-prompt-tracking-content'
import { PromptTrackingChatAnswerParts } from '@/features/site/components/landing/prompt-tracking-chat-answer-parts'
import { cn } from '@/features/site/lib/utils'

const ENGINE_LOGO_BY_NAME: Record<string, string> = {
  ChatGPT: '/logos/chatgpt.svg',
  Claude: '/logos/claude.svg',
  Gemini: '/logos/gemini.svg',
  Perplexity: '/logos/perplexity.svg',
  Copilot: '/logos/copilot.svg',
  'Google AI': '/logos/google.svg',
}

function dotClass(dot: 'emerald' | 'amber' | 'neutral') {
  if (dot === 'emerald') return 'bg-success'
  if (dot === 'amber') return 'bg-warning'
  return 'bg-muted'
}

function alertDotClass(dot: 'red' | 'amber' | 'emerald') {
  if (dot === 'red') return 'bg-destructive'
  if (dot === 'amber') return 'bg-warning'
  return 'bg-success'
}

function alertBadgeClass(tone: 'red' | 'neutral' | 'emerald') {
  if (tone === 'red') return 'bg-destructive/10 text-destructive'
  if (tone === 'emerald') return 'bg-success/10 text-success'
  return 'bg-muted text-muted-foreground'
}

function FeatureMock({ mock }: { mock: PromptTrackingFeatureMock }) {
  if (mock.kind === 'chat') {
    return (
      <div className="mt-auto rounded-none border border-black/8 bg-white p-4 shadow-xs">
        <div className="space-y-3 text-[13px] leading-snug">
          <div className="bg-muted text-foreground max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5">
            {mock.prompt}
          </div>
          <div className="bg-foreground text-muted-foreground ml-auto max-w-[94%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-xs font-medium">
            <PromptTrackingChatAnswerParts parts={mock.answerParts} />
          </div>
        </div>
      </div>
    )
  }

  if (mock.kind === 'library') {
    return (
      <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
        <ul className="divide-y divide-black/6 text-xs font-medium">
          {mock.rows.map(row => (
            <li key={row.q} className="flex items-center gap-2 py-2.5 first:pt-1 last:pb-1">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white',
                  row.tone,
                )}
                aria-hidden
              >
                {row.tagLetter}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-foreground truncate font-semibold">{row.q}</div>
                <div className="text-muted-foreground truncate text-[11px]">{row.meta}</div>
              </div>
              <span className="bg-muted text-muted-foreground shrink-0 rounded-md border border-black/8 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                Tracked
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (mock.kind === 'citationBar') {
    const rightPct = 100 - mock.leftPct
    return (
      <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-4 shadow-xs">
        <div className="text-muted-foreground mb-3 flex items-center justify-between text-[11px] font-semibold">
          <span>{mock.leftLabel}</span>
          <span>{mock.rightLabel}</span>
        </div>
        <div className="bg-muted mb-4 flex h-2.5 overflow-hidden rounded-full">
          <div className="bg-info" style={{ width: `${mock.leftPct}%` }} />
          <div
            className="bg-muted relative flex-1"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)',
            }}
          />
        </div>
        <div className="text-muted-foreground flex justify-between text-[11px] font-semibold tabular-nums">
          <span>{mock.leftPct}%</span>
          <span>{rightPct}%</span>
        </div>
        <ul className="text-foreground mt-4 space-y-2 border-t border-black/6 pt-3 text-xs font-medium">
          {mock.list.map(row => (
            <li key={row.text} className="flex items-center gap-2">
              <span
                className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClass(row.dot))}
                aria-hidden
              />
              {row.text}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (mock.kind === 'scoreCard') {
    return (
      <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-4 shadow-xs">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              {mock.label}
            </p>
            <p className="text-foreground mt-1 text-3xl font-bold tracking-tight tabular-nums">
              {mock.score}
              <span className="text-muted-foreground text-lg font-semibold">{mock.suffix}</span>
            </p>
          </div>
          <div className="border-info/25 text-info flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 text-[11px] font-bold">
            {mock.delta}
          </div>
        </div>
        <ul className="text-foreground mt-4 space-y-2.5 border-t border-black/6 pt-3 text-xs font-medium">
          {mock.bars.map(b => (
            <li key={b.label} className="flex items-center gap-2">
              <span
                className={cn('h-1.5 shrink-0 rounded-full', b.widthClass, b.tone)}
                aria-hidden
              />
              {b.label}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (mock.kind === 'alertList') {
    return (
      <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
        <ul className="divide-y divide-black/6 text-xs font-medium">
          {mock.items.map(item => (
            <li key={item.title} className="flex items-start gap-2 py-2.5 first:pt-1 last:pb-1">
              <span
                className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', alertDotClass(item.dot))}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="text-foreground font-semibold">{item.title}</div>
                <div className="text-muted-foreground mt-0.5 text-[11px]">{item.meta}</div>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                  alertBadgeClass(item.badgeTone),
                )}
              >
                {item.badge}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (mock.kind === 'competitorBars') {
    return (
      <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-4 shadow-xs">
        <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
          <span>{mock.title}</span>
          <span className="text-muted-foreground tabular-nums">{mock.window}</span>
        </div>
        <div className="mt-3 space-y-3">
          {mock.rows.map(r => (
            <div key={r.name}>
              <div className="text-foreground flex justify-between text-xs font-semibold">
                <span>{r.name}</span>
                <span
                  className={cn(
                    'tabular-nums',
                    r.name === 'You' ? 'text-info' : 'text-muted-foreground',
                  )}
                >
                  {r.pct}
                </span>
              </div>
              <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
                <div
                  className={cn('h-full rounded-full', r.barClass)}
                  style={{ width: `${r.pctNum}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (mock.kind === 'engineGrid') {
    return (
      <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {mock.engines.map(e => {
            const arrow = e.trend === 'up' ? '↑' : e.trend === 'down' ? '↓' : '→'
            const arrowTone =
              e.trend === 'up'
                ? 'text-success'
                : e.trend === 'down'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            return (
              <div key={e.name} className="bg-muted rounded-none border border-black/6 p-2">
                <div className="flex items-center gap-1.5">
                  {ENGINE_LOGO_BY_NAME[e.name] ? (
                    <Image
                      src={ENGINE_LOGO_BY_NAME[e.name]}
                      alt={e.name}
                      width={16}
                      height={16}
                      className="h-4 w-4 shrink-0 rounded-none"
                      unoptimized
                    />
                  ) : (
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-none text-[10px] font-bold text-white',
                        e.tone,
                      )}
                      aria-hidden
                    >
                      {e.initial}
                    </span>
                  )}
                  <span className="text-foreground truncate text-[11px] font-semibold">
                    {e.name}
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-foreground text-sm font-bold tabular-nums">
                    {e.coverage}%
                  </span>
                  <span className={cn('text-[11px] font-bold', arrowTone)} aria-hidden>
                    {arrow}
                  </span>
                </div>
                <div className="bg-muted mt-1 h-1 overflow-hidden rounded-full">
                  <div
                    className={cn('h-full rounded-full', e.tone)}
                    style={{ width: `${e.coverage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (mock.kind === 'impactList') {
    const effortLabel = { S: 'S', M: 'M', L: 'L' } as const
    const impactBg = {
      red: 'bg-destructive/10 text-destructive',
      amber: 'bg-warning/10 text-warning',
      emerald: 'bg-success/10 text-success',
      blue: 'bg-info/10 text-info',
    } as const
    return (
      <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
        <ul className="space-y-2 text-xs">
          {mock.items.map(it => (
            <li
              key={it.title}
              className="bg-muted flex items-center gap-2.5 rounded-none border border-black/6 p-2"
            >
              <span
                className={cn(
                  'flex h-6 w-10 shrink-0 items-center justify-center rounded text-[10px] font-bold tabular-nums',
                  impactBg[it.impactTone],
                )}
                aria-hidden
              >
                +{it.impact}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-foreground truncate font-semibold">{it.title}</div>
                <div className="bg-muted mt-1 h-1 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      it.impactTone === 'red' && 'bg-destructive',
                      it.impactTone === 'amber' && 'bg-warning',
                      it.impactTone === 'emerald' && 'bg-success',
                      it.impactTone === 'blue' && 'bg-info',
                    )}
                    style={{ width: `${Math.min(100, it.impact * 10)}%` }}
                  />
                </div>
              </div>
              <span className="text-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded border border-black/10 bg-white text-[10px] font-bold">
                {effortLabel[it.effort]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (mock.kind === 'trendingList') {
    return (
      <div className="mt-auto w-full rounded-none border border-black/8 bg-white p-3 shadow-xs">
        <ul className="space-y-2 text-xs">
          {mock.items.map(it => (
            <li
              key={it.prompt}
              className="bg-muted flex items-center gap-2.5 rounded-none border border-black/6 p-2"
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  it.direction === 'new' ? 'bg-info/10 text-info' : 'bg-success/10 text-success',
                )}
                aria-hidden
              >
                {it.direction === 'new' ? '★' : '↑'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-foreground truncate font-semibold">{it.prompt}</div>
                <div className="text-muted-foreground truncate text-[10px]">
                  {it.surface} · {it.velocity}
                </div>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                  it.direction === 'new' ? 'bg-info text-white' : 'bg-success text-white',
                )}
              >
                {it.direction === 'new' ? 'New' : 'Rising'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return null
}

type FeaturesGridTheme = 'orange' | 'blue' | 'emerald' | 'violet'

const THEME_STYLES: Record<
  FeaturesGridTheme,
  {
    sectionBg: string
    eyebrow: string
    accentText: string
    accentUnderline: string
    cellBg: string
    cellPreviewBg: string
    cellPreviewBorder: string
    cellRadius: string
  }
> = {
  orange: {
    sectionBg: 'bg-background',
    eyebrow: 'text-muted-foreground',
    accentText: 'text-primary-ink',
    accentUnderline: 'border-primary/45',
    cellBg: 'bg-white',
    cellPreviewBg: 'bg-background',
    cellPreviewBorder: 'border-black/10',
    cellRadius: 'rounded-none',
  },
  blue: {
    sectionBg: 'bg-[#eff6ff]/40',
    eyebrow: 'text-info/70',
    accentText: 'text-info',
    accentUnderline: 'border-info/45',
    cellBg: 'bg-white',
    cellPreviewBg: 'bg-[#eff6ff]/60',
    cellPreviewBorder: 'border-info/15',
    cellRadius: 'rounded-none',
  },
  emerald: {
    sectionBg: 'bg-[#ecfdf5]/40',
    eyebrow: 'text-success/70',
    accentText: 'text-success',
    accentUnderline: 'border-success/45',
    cellBg: 'bg-white',
    cellPreviewBg: 'bg-[#ecfdf5]/60',
    cellPreviewBorder: 'border-success/15',
    cellRadius: 'rounded-none',
  },
  violet: {
    sectionBg: 'bg-[#f5f3ff]/40',
    eyebrow: 'text-[var(--feature-violet)]/70',
    accentText: 'text-[var(--feature-violet)]',
    accentUnderline: 'border-[var(--feature-violet)]/45',
    cellBg: 'bg-white',
    cellPreviewBg: 'bg-[#f5f3ff]/60',
    cellPreviewBorder: 'border-[var(--feature-violet)]/15',
    cellRadius: 'rounded-none',
  },
}

function FeatureCell({
  title,
  description,
  mock,
  theme,
}: {
  title: string
  description: string
  mock: PromptTrackingFeatureMock
  theme: FeaturesGridTheme
}) {
  const t = THEME_STYLES[theme]
  return (
    <div
      className={cn(
        'flex flex-col gap-8 px-6 py-12 md:px-8 md:py-16 lg:px-10',
        t.cellBg,
        t.cellRadius,
      )}
    >
      <div>
        <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">{title}</h3>
        <p className="text-accent-foreground mt-3 max-w-sm text-sm leading-relaxed font-light md:text-sm">
          {description}
        </p>
      </div>
      <div
        className={cn(
          'flex h-full w-full items-center justify-center border p-4',
          t.cellRadius,
          t.cellPreviewBg,
          t.cellPreviewBorder,
        )}
      >
        <FeatureMock mock={mock} />
      </div>
    </div>
  )
}

/**
 * Same structural pattern as {@link LandingFeaturesGrid}: full-bleed dividers,
 * max-w-7xl intro, bg-black-10 grid with divide borders and mock UI cards.
 * Copy is driven by {@link PROMPT_TRACKING_FEATURE_CELLS} in `landing-prompt-tracking-content.ts`.
 */
type FeatureCellContent = { title: string; description: string; mock: PromptTrackingFeatureMock }
type FeaturesIntroContent = {
  eyebrow: string
  titleBefore: string
  titleAccent: string
  description: string
}
type FeaturesFooterCtas = {
  primary: string
  secondary: string
  secondaryHref: string
}

export function PromptTrackingFeaturesGrid({
  intro = PROMPT_TRACKING_FEATURES_INTRO,
  cells = PROMPT_TRACKING_FEATURE_CELLS,
  footerCtas = PROMPT_TRACKING_FEATURES_FOOTER_CTAS,
  headingId = 'prompt-tracking-features-heading',
  theme = 'orange',
}: {
  intro?: FeaturesIntroContent
  cells?: readonly FeatureCellContent[]
  footerCtas?: FeaturesFooterCtas
  headingId?: string
  theme?: FeaturesGridTheme
}) {
  const row1 = cells.slice(0, 3)
  const row2 = cells.slice(3, 6)
  const t = THEME_STYLES[theme]

  return (
    <section className={cn('relative', t.sectionBg)} aria-labelledby={headingId}>
      <div
        aria-hidden
        className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
      />
      <div className="mx-auto max-w-7xl rounded-none px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-14">
        <p className={cn('text-[11px] font-medium tracking-[0.22em] uppercase', t.eyebrow)}>
          {intro.eyebrow}
        </p>
        <h2
          id={headingId}
          className="text-foreground mt-4 max-w-4xl text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
        >
          {intro.titleBefore}{' '}
          <span className={cn('relative whitespace-nowrap', t.accentText)}>
            {intro.titleAccent}
            <span
              className={cn(
                'absolute right-0 -bottom-1 left-0 border-b-2 border-dashed',
                t.accentUnderline,
              )}
              aria-hidden
            />
          </span>
        </h2>
        <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          {intro.description}
        </p>
      </div>
      <div
        aria-hidden
        className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
      />
      <div className="bg-black-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-black/6">
          {row1.map(cell => (
            <FeatureCell
              key={cell.title}
              title={cell.title}
              description={cell.description}
              mock={cell.mock}
              theme={theme}
            />
          ))}
        </div>

        {row2.length > 0 && (
          <>
            <div
              aria-hidden
              className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
            />
            <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-black/6">
              {row2.map(cell => (
                <FeatureCell
                  key={cell.title}
                  title={cell.title}
                  description={cell.description}
                  mock={cell.mock}
                  theme={theme}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-10 lg:px-12">
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className={cn(LANDING_PRIMARY_CTA_CLASS, 'h-10 px-5')}>
            <Link href="/sign-up">
              {footerCtas.primary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="bg-background hover:bg-muted/50 h-10 border-black/15 px-5 text-sm font-semibold shadow-sm"
          >
            <Link href={footerCtas.secondaryHref}>{footerCtas.secondary}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
