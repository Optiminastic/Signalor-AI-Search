import Image from 'next/image'

import { GitFork, Radar, RefreshCw, ShieldCheck, Zap } from '@/features/site/components/icons'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { HOME_WELL } from '@/features/site/components/landing/home-styles'
import { cn } from '@/features/site/lib/utils'

type EngineRow = {
  name: string
  logo: string
  cited: boolean
  /** Flips from "Missing" to "Cited" on hover — the win SignalorAI delivers. */
  flipsOnHover?: boolean
}

const ENGINE_ROWS: EngineRow[] = [
  { name: 'ChatGPT', logo: '/logos/chatgpt.svg', cited: true },
  { name: 'Claude', logo: '/logos/claude.svg', cited: true },
  { name: 'Gemini', logo: '/logos/gemini.svg', cited: false, flipsOnHover: true },
  { name: 'Perplexity', logo: '/logos/perplexity.svg', cited: true },
]

/** Engine coverage list; the missing engine flips to "Cited" on hover. */
function EngineCoverageIllo(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-75 rounded-xl p-2 shadow-sm ring-1 shadow-black/5">
      <p className="text-muted-foreground px-2.5 pt-1 pb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
        Engines
      </p>
      <ul className="divide-border/70 divide-y">
        {ENGINE_ROWS.map(row => (
          <li key={row.name} className="flex items-center gap-2.5 px-2.5 py-2">
            <Image src={row.logo} alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
            <span className="text-foreground flex-1 text-[13px] font-medium">{row.name}</span>
            {row.flipsOnHover ? (
              <span className="relative inline-grid text-[10px] font-semibold uppercase">
                <span className="bg-muted text-muted-foreground ring-border col-start-1 row-start-1 rounded-md px-1.5 py-0.5 ring-1 transition-opacity duration-300 motion-safe:group-hover:opacity-0">
                  Missing
                </span>
                <span className="bg-success/10 text-success col-start-1 row-start-1 rounded-md px-1.5 py-0.5 text-center opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100">
                  Cited
                </span>
              </span>
            ) : (
              <span className="bg-success/10 text-success rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                Cited
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const RUN_EVENTS = [
  { label: 'Weekly run · 128 prompts', meta: 'done', tone: 'text-muted-foreground' },
  { label: 'New citation · perplexity.ai', meta: '12s ago', tone: 'text-muted-foreground' },
  { label: 'Fix suggested · Product schema', meta: '3s ago', tone: 'text-muted-foreground' },
  { label: 'GEO score +4', meta: 'now', tone: 'text-success' },
] as const

/** Automation timeline; events step up in sequence on hover. */
function AutopilotIllo(): JSX.Element {
  return (
    <div className="w-full max-w-75">
      <div className="bg-card ring-border relative mx-auto flex w-fit items-center gap-2 rounded-full px-3 py-1 shadow-sm ring-1 shadow-black/5">
        <span className="bg-success h-2 w-2 rounded-full" aria-hidden />
        <span className="text-foreground text-xs font-medium">Run completed</span>
      </div>
      <ul className="relative mt-3 space-y-2 pl-4">
        <span
          aria-hidden
          className="border-border absolute top-1 bottom-3 left-1 w-px border-l border-dashed"
        />
        {RUN_EVENTS.map((event, index) => (
          <li
            key={event.label}
            className="bg-card ring-border relative flex items-center gap-2 rounded-lg px-3 py-2 shadow-sm ring-1 shadow-black/5 transition-all duration-300 ease-out motion-safe:translate-y-0.5 motion-safe:opacity-80 motion-safe:group-hover:translate-y-0 motion-safe:group-hover:opacity-100"
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            <span
              aria-hidden
              className="bg-foreground/25 absolute -left-3.75 h-1.5 w-1.5 rounded-full ring-2 ring-[#fafafa]"
            />
            <span className="text-foreground flex-1 truncate text-xs font-medium">
              {event.label}
            </span>
            <span className={cn('shrink-0 text-[10px] font-semibold tabular-nums', event.tone)}>
              {event.meta}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const MINI_FEATURES = [
  { icon: Zap, title: 'llms.txt & crawler checks' },
  { icon: Radar, title: 'AI crawler analytics' },
  { icon: RefreshCw, title: 'Scheduled re-audits' },
  { icon: ShieldCheck, title: 'E-E-A-T signals' },
] as const

interface SpotlightCellProps {
  title: React.ReactNode
  children: React.ReactNode
}

function SpotlightCell({ title, children }: SpotlightCellProps): JSX.Element {
  return (
    <div className="group bg-card flex flex-col px-6 py-12 sm:px-10">
      <div className={cn(HOME_WELL, 'flex min-h-56 flex-1 items-center justify-center')}>
        {children}
      </div>
      <h3 className="text-foreground mt-8 text-center text-base font-semibold tracking-tight sm:text-lg">
        {title}
      </h3>
    </div>
  )
}

export function HomeFeatureShowcase(): JSX.Element {
  return (
    <section aria-labelledby="home-showcase-heading">
      <h2 id="home-showcase-heading" className="sr-only">
        How SignalorAI works under the hood
      </h2>
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <GridHandle className="-top-[3.5px] left-1/2 -ml-[3.5px] hidden lg:block" />
        <div className="divide-border grid grid-cols-1 max-lg:divide-y lg:grid-cols-2 lg:divide-x">
          <SpotlightCell
            title={
              <>
                <GitFork
                  className="text-primary mr-1.5 inline-block h-4 w-4 -translate-y-px"
                  aria-hidden
                />
                Every engine, one view
              </>
            }
          >
            <EngineCoverageIllo />
          </SpotlightCell>
          <SpotlightCell title="Runs on autopilot">
            <AutopilotIllo />
          </SpotlightCell>
        </div>
      </div>
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <GridHandle className="-top-[3.5px] left-1/4 -ml-[3.5px] hidden lg:block" />
        <GridHandle className="-top-[3.5px] left-1/2 -ml-[3.5px] hidden lg:block" />
        <GridHandle className="-top-[3.5px] left-3/4 -ml-[3.5px] hidden lg:block" />
        <div className="divide-border grid grid-cols-1 max-lg:divide-y sm:max-lg:grid-cols-2 lg:grid-cols-4 lg:divide-x">
          {MINI_FEATURES.map(({ icon: Icon, title }) => (
            <div key={title} className="bg-card px-6 py-6 sm:px-8">
              <div className="flex items-center gap-2">
                <Icon className="text-primary h-4 w-4" strokeWidth={2} aria-hidden />
                <h3 className="text-foreground text-sm font-semibold">{title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
