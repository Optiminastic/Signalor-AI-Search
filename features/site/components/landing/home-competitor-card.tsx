import { ArrowRight } from '@/features/site/components/icons'
import { SignalorMark } from '@/features/site/components/ui/ai-chip'
import { cn } from '@/features/site/lib/utils'

// Light-mode build of the dashboard's Competitor lens, rebuilt for the
// marketing page. Fixed values, so it renders on the server. Follows the same
// visual grammar as the visibility card: a big share stat, a slim market bar,
// and ranked rival rows with the brand's "You" row highlighted.

interface RivalShare {
  rank: number
  name: string
  share: number
  /** Point change in share this week - signed so the colour is automatic. */
  delta: number
  isBrand?: boolean
}

const SHARE: readonly RivalShare[] = [
  { rank: 1, name: 'Acme', share: 44, delta: 2.0 },
  { rank: 2, name: 'Signalor', share: 38, delta: 6.0, isBrand: true },
  { rank: 3, name: 'Northwind', share: 18, delta: -1.0 },
]

/** Thin vertical share bar - the segmented meter would be too dense at row size. */
function ShareBar({ value, tone }: { value: number; tone: string }): JSX.Element {
  return (
    <span className="bg-muted inline-block h-2.5 w-[3px] shrink-0 overflow-hidden rounded-[1px]">
      <span className="block w-full" style={{ height: `${value}%`, background: tone }} />
    </span>
  )
}

function RivalRow({ item }: { item: RivalShare }): JSX.Element {
  const gain = item.delta >= 0
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-sm px-2 py-1.5',
        item.isBrand && 'bg-muted/70',
      )}
    >
      <span className="text-muted-foreground w-3 shrink-0 text-[11px] tabular-nums">
        {item.rank}
      </span>
      {item.isBrand ? (
        <SignalorMark size="sm" className="!h-6 !w-6 shrink-0" />
      ) : (
        <span className="bg-muted text-muted-foreground grid h-6 w-6 shrink-0 place-items-center rounded-sm text-[11px] font-bold">
          {item.name.charAt(0)}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[12.5px] font-semibold">
          {item.name}
          {item.isBrand && (
            <span className="bg-primary/10 text-primary ml-1.5 rounded px-1 py-px text-[9px] font-bold tracking-wide uppercase">
              You
            </span>
          )}
        </span>
        <span className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[10px]">
          <ShareBar value={(item.share / 50) * 100} tone={item.isBrand ? '#e04a3d' : '#a3a3a3'} />
          <span className="tabular-nums">{item.share}%</span> Share of citations
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span
          className={cn(
            'block text-[11.5px] font-semibold tabular-nums',
            gain ? 'text-success' : 'text-primary',
          )}
        >
          {gain ? '+' : '−'}
          {Math.abs(item.delta)}pt
        </span>
        <span className="text-muted-foreground text-[9px]">this week</span>
      </span>
    </div>
  )
}

/** Light-mode build of the dashboard's Competitor lens. */
export function HomeCompetitorCard(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-[520px] rounded-sm p-4 shadow-sm ring-1 shadow-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-foreground text-[14px] font-semibold">Competitor lens</h4>
          <p className="text-muted-foreground mt-0.5 text-[11.5px]">
            Share of AI citations, vs the brands engines name instead
          </p>
        </div>
        <span className="bg-primary shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white">
          7d
        </span>
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-[32px] leading-none font-bold tracking-tight tabular-nums">
            38%
          </span>
          <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
            ↑ 6pt
          </span>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-foreground text-[17px] font-bold">#2</span>
          <p className="text-muted-foreground text-[10px]">of 7 · your rank</p>
        </div>
      </div>
      <p className="text-muted-foreground mt-0.5 text-[10.5px]">share of tracked prompts</p>

      <div aria-hidden className="bg-muted mt-3 flex h-2.5 w-full overflow-hidden rounded-full">
        <span className="bg-primary" style={{ width: '38%' }} />
        <span className="bg-[#d4d4d4]" style={{ width: '44%' }} />
        <span className="bg-[#e5e5e5]" style={{ width: '18%' }} />
      </div>

      <div className="border-border mt-3 border-t pt-1.5">
        <div className="text-muted-foreground flex items-center justify-between px-2 pb-1 text-[10px] font-semibold">
          <span>Brand</span>
          <span>Delta</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {SHARE.map(item => (
            <RivalRow key={item.name} item={item} />
          ))}
        </div>
      </div>

      <p className="ring-border text-foreground mt-2.5 flex items-center justify-center gap-1.5 rounded-sm py-1.5 text-[12px] font-medium ring-1">
        Compare with a competitor
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </p>
    </div>
  )
}
