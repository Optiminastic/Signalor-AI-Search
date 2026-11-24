import { ListChecks, MessageSquare, Radar } from '@/features/site/components/icons'
import { cn } from '@/features/site/lib/utils'

// Decorative floating "result glance" cards for the tools hero gutters — a GEO
// score meter, an llms.txt status, a schema check, and a domain rating — drifting
// on the sanctioned `animate-float` loop. Purely visual: hidden from readers and
// on smaller screens where the gutters collapse. Border + shadow follow the blog
// list / tools feature card frame (ring-border + shadow-md) so the cards read as
// real product UI and stay consistent with the rest of the site.

const TICKS = 14

function TickMeter({ value }: { value: number }): React.ReactElement {
  return (
    <div className="mt-2.5 flex items-center gap-[2px]" aria-hidden>
      {Array.from({ length: TICKS }).map((_, i) => (
        <span
          key={i}
          className={cn('h-3.5 w-[3px] rounded-[1px]', i < value ? 'bg-primary' : 'bg-neutral-200')}
        />
      ))}
    </div>
  )
}

/** White icon tile matching the tools feature card (ring-foreground/10, shadow-md). */
function IconTile({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <span className="ring-foreground/10 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white shadow-md ring-1">
      {children}
    </span>
  )
}

interface FloatCardProps {
  left: string
  top: string
  delay: string
  duration: string
  className?: string
  children: React.ReactNode
}

function FloatCard({
  left,
  top,
  delay,
  duration,
  className,
  children,
}: FloatCardProps): React.ReactElement {
  return (
    <span className="absolute" style={{ left, top }}>
      {/* Outer frame + inner hairline border — the blog / tools feature card frame. */}
      <span
        className={cn(
          'bg-card/75 ring-border motion-safe:animate-float block rounded-xl border border-transparent p-0.5 shadow-md ring-1',
          className,
        )}
        style={{ animationDelay: delay, animationDuration: duration }}
      >
        <span className="border-border bg-card block rounded-[10px] border p-3.5">{children}</span>
      </span>
    </span>
  )
}

export function ToolsHeroFloaters(): React.ReactElement {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {/* GEO score meter — upper left */}
      <FloatCard left="1%" top="19%" delay="0s" duration="5.2s" className="w-44">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            GEO score
          </span>
          <span className="bg-success/10 text-success rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
            +12
          </span>
        </div>
        <p className="text-foreground mt-1.5 text-2xl font-bold tabular-nums">
          82<span className="text-muted-foreground text-sm font-medium">/100</span>
        </p>
        <TickMeter value={11} />
      </FloatCard>

      {/* llms.txt status — lower left */}
      <FloatCard left="5%" top="64%" delay="1.1s" duration="5.7s">
        <span className="flex items-center gap-2.5">
          <IconTile>
            <MessageSquare className="text-info h-4 w-4" />
          </IconTile>
          <span className="block pr-1">
            <span className="text-foreground block text-xs font-semibold">llms.txt</span>
            <span className="text-success block text-[10px] font-medium">Ready to cite</span>
          </span>
        </span>
      </FloatCard>

      {/* Schema check — upper right */}
      <FloatCard left="79%" top="17%" delay="0.5s" duration="4.9s">
        <span className="flex items-center gap-2.5">
          <IconTile>
            <ListChecks className="h-4 w-4 text-[var(--feature-violet)]" />
          </IconTile>
          <span className="block pr-1">
            <span className="text-foreground block text-xs font-semibold">Schema 6/8</span>
            <span className="text-muted-foreground block text-[10px]">JSON-LD valid</span>
          </span>
        </span>
      </FloatCard>

      {/* Domain rating — lower right */}
      <FloatCard left="78%" top="60%" delay="1.6s" duration="6s" className="w-40">
        <div className="flex items-center gap-2.5">
          <IconTile>
            <Radar className="text-primary-ink h-4 w-4" />
          </IconTile>
          <span className="text-muted-foreground text-[10px] leading-tight font-semibold tracking-widest uppercase">
            Domain rating
          </span>
        </div>
        <p className="text-foreground mt-2 text-xl font-bold tabular-nums">
          74<span className="text-muted-foreground text-sm font-medium">/100</span>
        </p>
      </FloatCard>

      {/* Empty measurement tiles for drafting-table depth */}
      <span
        className="bg-muted ring-border absolute h-6 w-6 rounded-lg ring-1"
        style={{ left: '13%', top: '46%' }}
      />
      <span
        className="bg-muted ring-border absolute h-6 w-6 rounded-lg ring-1"
        style={{ left: '88%', top: '44%' }}
      />
    </div>
  )
}
