import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { HomeSectionHeader } from '@/features/site/components/landing/home-section-header'
import { HOME_WELL } from '@/features/site/components/landing/home-styles'
import {
  FOR_AGENCIES_CAPABILITY_ROWS,
  FOR_AGENCIES_FEATURES_INTRO,
  FOR_AGENCIES_PROOF_METRICS,
} from '@/features/site/lib/landing-for-agencies-content'
import { cn } from '@/features/site/lib/utils'

function TickMeter({ value, ticks = 14 }: { value: number; ticks?: number }): JSX.Element {
  const filled = Math.round((value / 100) * ticks)
  return (
    <span className="flex items-center gap-[2px]" role="presentation">
      {Array.from({ length: ticks }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-3.5 w-[3px] rounded-[1px]',
            i < filled ? 'bg-primary' : 'bg-neutral-200',
          )}
        />
      ))}
    </span>
  )
}

/** Roster list: every client as its own tracked project. */
function RosterIllo(): JSX.Element {
  const rows = [
    { name: 'Acme Retail', initial: 'A', meta: 'GEO 78 · 214 pages · run 2h ago' },
    { name: 'Northwind Labs', initial: 'N', meta: 'GEO 64 · 88 pages · run 1d ago' },
    { name: 'Vertex Cloud', initial: 'V', meta: 'GEO 52 · 132 pages · run 3d ago' },
  ]
  return (
    <ul className="divide-border/70 bg-card ring-border w-full max-w-75 divide-y rounded-xl px-3 py-1 shadow-sm ring-1 shadow-black/5">
      {rows.map(row => (
        <li key={row.name} className="flex items-center gap-2.5 py-2.5">
          <span className="bg-muted text-foreground ring-border flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ring-1">
            {row.initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-foreground block truncate text-xs font-semibold">{row.name}</span>
            <span className="text-muted-foreground block truncate text-[10px] tabular-nums">
              {row.meta}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Per-client score card with pillar tick meters. */
function ClientScoreIllo(): JSX.Element {
  const pillars = [
    { label: 'Schema', value: 71 },
    { label: 'Content', value: 74 },
    { label: 'E-E-A-T', value: 61 },
  ]
  return (
    <div className="bg-card ring-border w-full max-w-75 rounded-xl p-4 shadow-sm ring-1 shadow-black/5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            Acme Retail · GEO
          </p>
          <p className="text-foreground mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            78<span className="text-muted-foreground text-base font-medium">/100</span>
          </p>
        </div>
        <span className="bg-success/10 text-success mb-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
          +12
        </span>
      </div>
      <div className="border-border mt-3 space-y-2 border-t pt-3">
        {pillars.map(pillar => (
          <div key={pillar.label} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground w-14 shrink-0 text-[11px] font-medium">
              {pillar.label}
            </span>
            <TickMeter value={pillar.value} />
            <span className="text-foreground w-6 text-right text-[11px] font-semibold tabular-nums">
              {pillar.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Client-scoped fix queue with estimated GEO lift. */
function FixQueueIllo(): JSX.Element {
  return (
    <ul className="divide-border bg-card ring-border w-full max-w-75 divide-y rounded-xl px-4 py-1 text-xs font-medium shadow-sm ring-1 shadow-black/5">
      <li className="flex items-center gap-2.5 py-3">
        <span aria-hidden className="bg-destructive h-1.5 w-1.5 shrink-0 rounded-full" />
        <span className="min-w-0 flex-1">
          <span className="text-foreground block truncate">Organization JSON-LD · Acme</span>
          <span className="text-muted-foreground block truncate text-[10px] font-normal">
            Site-wide · est +4 GEO
          </span>
        </span>
        <span className="bg-destructive/10 text-destructive shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase">
          Critical
        </span>
      </li>
      <li className="flex items-center gap-2.5 py-3">
        <span aria-hidden className="bg-warning h-1.5 w-1.5 shrink-0 rounded-full" />
        <span className="min-w-0 flex-1">
          <span className="text-foreground block truncate">FAQ schema · Northwind</span>
          <span className="text-muted-foreground block truncate text-[10px] font-normal">
            Template · est +2 GEO
          </span>
        </span>
        <span className="bg-muted text-muted-foreground ring-border shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ring-1">
          Next
        </span>
      </li>
      <li className="flex items-center gap-2.5 py-3">
        <span aria-hidden className="bg-success h-1.5 w-1.5 shrink-0 rounded-full" />
        <span className="min-w-0 flex-1">
          <span className="text-foreground block truncate">Author bios · Vertex</span>
          <span className="text-muted-foreground block truncate text-[10px] font-normal">
            Shipped · cite lift
          </span>
        </span>
        <span className="bg-success/10 text-success shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase">
          Done
        </span>
      </li>
    </ul>
  )
}

const ROSTER_CELLS = [
  {
    title: 'One roster, every brand',
    description:
      'See each client as its own tracked project - GEO score, page count, and last run - without switching workspaces.',
    illo: <RosterIllo />,
  },
  {
    title: 'Per-client GEO score',
    description:
      'One 0-100 read per brand across schema, content, E-E-A-T, and technical, so each review opens on a number.',
    illo: <ClientScoreIllo />,
  },
  {
    title: 'White-label fix queue',
    description:
      'Each audit becomes a ranked, client-scoped task list - execute it in-house or hand it to their developers.',
    illo: <FixQueueIllo />,
  },
]

function RosterGrid(): JSX.Element {
  return (
    <section aria-labelledby="for-agencies-roster-heading">
      <div className="border-border relative border-b px-6 py-14 sm:py-16">
        <HomeSectionHeader
          eyebrow="For agencies"
          headingId="for-agencies-roster-heading"
          title={`${FOR_AGENCIES_FEATURES_INTRO.titleBefore} ${FOR_AGENCIES_FEATURES_INTRO.titleAccent}`}
          description="Answer engines cite structure, schema, and trust signals - not blue-link rankings. SignalorAI keeps those markers healthy across every client."
        />
      </div>
      <div className="relative">
        <GridHandle className="-top-[3.5px] left-1/3 -ml-[3.5px] hidden lg:block" />
        <GridHandle className="-top-[3.5px] left-2/3 -ml-[3.5px] hidden lg:block" />
        <div className="divide-border grid grid-cols-1 max-lg:divide-y lg:grid-cols-3 lg:divide-x">
          {ROSTER_CELLS.map(cell => (
            <div key={cell.title} className="group bg-card flex flex-col px-6 py-10 sm:px-8">
              <div className={cn(HOME_WELL, 'flex min-h-44 flex-1 items-center justify-center')}>
                {cell.illo}
              </div>
              <h3 className="text-foreground mt-7 text-center text-base font-semibold tracking-tight">
                {cell.title}
              </h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed">
                {cell.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AgencyStats(): JSX.Element {
  return (
    <section aria-labelledby="for-agencies-stats-heading">
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <GridHandle className="-top-[3.5px] left-1/2 -ml-[3.5px] hidden lg:block" />
        <div className="lg:divide-border grid lg:grid-cols-2 lg:divide-x">
          <div className="max-lg:border-border flex flex-col justify-center px-6 py-14 max-lg:border-b sm:px-10 lg:py-20">
            <p className="text-primary-ink text-[12px] font-semibold tracking-[0.18em] uppercase">
              Built for rosters
            </p>
            <h2
              id="for-agencies-stats-heading"
              className="text-foreground mt-3 max-w-md text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              One login, a full book of business
            </h2>
            <p className="text-muted-foreground mt-4 max-w-sm text-base leading-relaxed text-pretty">
              Rolled-up scores and shared prompt libraries mean{' '}
              <strong className="text-foreground font-semibold">
                one strategist runs AI search for twenty clients
              </strong>{' '}
              without spreadsheets.
            </p>
          </div>
          <dl className="grid gap-x-10 gap-y-10 px-6 py-14 sm:grid-cols-2 sm:px-10 lg:py-20">
            {FOR_AGENCIES_PROOF_METRICS.map(stat => (
              <div
                key={stat.label}
                className="border-foreground/15 hover:border-primary border-l-2 pl-4 transition-colors duration-200"
              >
                <dd className="text-foreground text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  {stat.value}
                </dd>
                <dt className="text-muted-foreground mt-2 max-w-[14rem] text-sm leading-relaxed text-pretty">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function AgencyCapabilities(): JSX.Element {
  return (
    <section aria-labelledby="for-agencies-capabilities-heading">
      <div className="border-border relative border-t px-6 py-14 sm:py-16">
        <GridCornerHandles top />
        <HomeSectionHeader
          eyebrow="Retainer-ready"
          headingId="for-agencies-capabilities-heading"
          title="Deliverables your account managers can present"
          description="Every audit ends in something a client meeting can open with: a score, a report, and a ranked plan."
        />
      </div>
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <GridHandle className="-top-[3.5px] left-1/4 -ml-[3.5px] hidden lg:block" />
        <GridHandle className="-top-[3.5px] left-1/2 -ml-[3.5px] hidden sm:block" />
        <GridHandle className="-top-[3.5px] left-3/4 -ml-[3.5px] hidden lg:block" />
        <div className="divide-border grid max-sm:divide-y sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
          {FOR_AGENCIES_CAPABILITY_ROWS.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={cn(
                'bg-card flex flex-col px-6 py-8 sm:px-8',
                index % 2 === 1 && 'sm:max-lg:border-border sm:max-lg:border-l',
                index >= 2 && 'sm:max-lg:border-border sm:max-lg:border-t',
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="text-primary-ink h-4.5 w-4.5" strokeWidth={2} aria-hidden />
                <span className="text-foreground text-[15px] font-semibold tracking-tight">
                  {title}
                </span>
              </span>
              <span className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
                {description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** The three mid-page sections for /for-agencies, inside the page rail. */
export function ForAgenciesSections(): JSX.Element {
  return (
    <div className="border-border mx-auto max-w-6xl border-x">
      <RosterGrid />
      <AgencyStats />
      <AgencyCapabilities />
    </div>
  )
}
