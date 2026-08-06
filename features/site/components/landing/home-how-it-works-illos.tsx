import Image from 'next/image'
import type { ReactNode } from 'react'

import {
  ArrowRight,
  Check,
  Gauge,
  Globe,
  Link2,
  Rocket,
  Zap,
} from '@/features/site/components/icons'
import type { HowItWorksStep } from '@/features/site/lib/landing-how-it-works-content'
import { cn } from '@/features/site/lib/utils'

/**
 * The white product-UI card itself - the dominant element of each step. It
 * floats on the section's shared atmospheric canvas (owned by the section), so
 * it belongs to one composition rather than a discrete boxed stage.
 */
function IlloCard({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="bg-card ring-border w-full rounded-lg shadow-lg ring-1 shadow-black/[0.07]">
      {children}
    </div>
  )
}

function IlloBar({ children, top }: { children: ReactNode; top?: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        'border-border/70 bg-muted/40 flex items-center justify-between px-3.5 py-2.5',
        top ? 'border-b' : 'border-t',
      )}
    >
      {children}
    </div>
  )
}

function BrowserChrome(): JSX.Element {
  return (
    <div className="border-border/70 bg-muted/40 flex items-center gap-1 border-b px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <span key={i} aria-hidden className="h-2 w-2 rounded-full bg-neutral-300" />
      ))}
      <span className="bg-card text-muted-foreground ring-border/70 ml-2 flex flex-1 items-center gap-1.5 truncate rounded-md px-2.5 py-1 text-[10px] font-medium ring-1">
        <Globe className="h-3 w-3 shrink-0" aria-hidden />
        app.signalor.ai
      </span>
    </div>
  )
}

function ConnectGate(): JSX.Element {
  return (
    <div className="relative mt-2.5">
      <span className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-semibold shadow-sm shadow-black/10 transition-opacity duration-300 motion-safe:group-hover:opacity-0">
        Connect
      </span>
      <span className="bg-success/10 text-success absolute inset-0 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-semibold opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100">
        <Check className="h-3.5 w-3.5" aria-hidden />
        Connected
      </span>
    </div>
  )
}

function ConnectIllo(): JSX.Element {
  return (
    <IlloCard>
      <BrowserChrome />
      <div className="p-5 sm:p-6">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
          Add your site
        </p>
        <div className="ring-border/70 bg-muted/60 mt-3 flex items-center gap-2.5 rounded-lg px-3 py-3 ring-1">
          <Globe className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
          <span className="text-foreground flex-1 truncate font-mono text-xs">
            signalor.ai
            <span
              aria-hidden
              className="bg-foreground/70 motion-safe:animate-blink ml-0.5 inline-block h-3 w-[1.5px] translate-y-0.5"
            />
          </span>
        </div>
        <ConnectGate />
        <p className="text-muted-foreground mt-2.5 text-center text-[11px]">
          No code needed - just a public URL.
        </p>
      </div>
    </IlloCard>
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

function AuditPillar({ label, value }: { label: string; value: number }): JSX.Element {
  const filled = Math.round((value / 100) * 12)
  return (
    <div>
      <div className="text-muted-foreground flex items-center justify-between text-[10px] font-medium">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
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
}

function AuditIllo(): JSX.Element {
  return (
    <IlloCard>
      <IlloBar top>
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
          GEO audit
        </p>
        <p className="text-foreground text-lg leading-none font-semibold tracking-tight tabular-nums">
          78<span className="text-muted-foreground text-xs font-medium">/100</span>
        </p>
      </IlloBar>
      <div className="p-4">
        <p className="text-muted-foreground mb-3 text-[11px]">
          Six weighted pillars, one citable score
        </p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
          {AUDIT_PILLARS.map(pillar => (
            <AuditPillar key={pillar.label} label={pillar.label} value={pillar.value} />
          ))}
        </div>
      </div>
      <IlloBar>
        <span className="text-muted-foreground text-[11px]">
          <span aria-hidden className="bg-success mr-1.5 inline-block h-1.5 w-1.5 rounded-full" />
          Citable
        </span>
        <span className="text-primary inline-flex items-center gap-1 text-[11px] font-semibold">
          View report
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </IlloBar>
    </IlloCard>
  )
}

interface TrackRow {
  engine: string
  logo: string
  count: number
  fresh: boolean
}

const TRACK_ROWS: TrackRow[] = [
  { engine: 'Perplexity', logo: '/logos/perplexity.svg', count: 8, fresh: true },
  { engine: 'Gemini', logo: '/logos/gemini.svg', count: 5, fresh: false },
  { engine: 'ChatGPT', logo: '/logos/chatgpt.svg', count: 3, fresh: false },
  { engine: 'Claude', logo: '/logos/claude.svg', count: 4, fresh: false },
]

function CitationRow({ row }: { row: TrackRow }): JSX.Element {
  return (
    <li className="flex items-center gap-2.5 rounded-lg px-2 py-2">
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
      <Image
        src={row.logo}
        alt=""
        width={16}
        height={16}
        className={cn('h-4 w-4 shrink-0', !row.fresh && 'opacity-60')}
      />
      <span className="text-foreground flex-1 truncate text-[12px] font-medium">{row.engine}</span>
      {row.fresh ? (
        <span className="bg-success/10 text-success rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
          +2 new
        </span>
      ) : null}
      <span className="text-muted-foreground w-5 text-right text-xs font-semibold tabular-nums">
        {row.count}
      </span>
    </li>
  )
}

function TrackIllo(): JSX.Element {
  return (
    <IlloCard>
      <IlloBar top>
        <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
          <Link2 className="h-3 w-3" aria-hidden />
          Citations
        </p>
        <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums">
          +1 new
        </span>
      </IlloBar>
      <ul className="px-1.5 py-1">
        {TRACK_ROWS.map(row => (
          <CitationRow key={row.engine} row={row} />
        ))}
      </ul>
      <IlloBar>
        <span className="text-muted-foreground text-[11px]">This week</span>
        <span className="text-foreground text-[11px] font-semibold tabular-nums">
          20 citations across 4 engines
        </span>
      </IlloBar>
    </IlloCard>
  )
}

function ShipCriticalItem(): JSX.Element {
  return (
    <li className="bg-muted/60 ring-border/70 flex items-center gap-2.5 rounded-lg px-3 py-2.5 ring-1">
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
    </li>
  )
}

function ShipDoneItem({ title }: { title: string }): JSX.Element {
  return (
    <li className="border-border/70 flex items-center gap-2.5 border-t px-3 py-2.5">
      <span
        aria-hidden
        className="bg-success grid h-4 w-4 shrink-0 place-items-center rounded-full"
      >
        <Check className="h-2.5 w-2.5 text-white" aria-hidden />
      </span>
      <span className="text-foreground flex-1 truncate text-xs font-medium">{title}</span>
      <span className="bg-primary/10 text-primary inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold">
        <Zap className="h-3 w-3" aria-hidden />
        Auto
      </span>
    </li>
  )
}

function ShipProgress(): JSX.Element {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-foreground text-[11px] font-semibold tabular-nums">2/4</span>
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            className={cn('h-3 w-[3px] rounded-[1px]', i < 2 ? 'bg-primary' : 'bg-neutral-200')}
          />
        ))}
      </div>
    </div>
  )
}

function ShipIllo(): JSX.Element {
  return (
    <IlloCard>
      <IlloBar top>
        <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
          <Rocket className="h-3 w-3" aria-hidden />
          Fix queue
        </p>
        <ShipProgress />
      </IlloBar>
      <ul className="p-1.5">
        <ShipCriticalItem />
        <ShipDoneItem title="Add author bylines" />
        <ShipDoneItem title="Schema.org: FAQPage" />
      </ul>
      <IlloBar>
        <span className="text-muted-foreground text-[11px]">
          Cited by Perplexity after shipping
        </span>
        <span className="text-primary inline-flex items-center gap-1 text-[11px] font-semibold">
          Review
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </IlloBar>
    </IlloCard>
  )
}

export const STEP_ILLOS: Record<HowItWorksStep['illo'], () => JSX.Element> = {
  connect: ConnectIllo,
  audit: AuditIllo,
  track: TrackIllo,
  ship: ShipIllo,
}
