import Image from 'next/image'

import { ArrowRight, BarChart3, LineChart } from '@/features/site/components/icons'
import { SignalorMark } from '@/features/site/components/ui/ai-chip'
import { cn } from '@/features/site/lib/utils'

// The dashboard's LLM Visibility card, rebuilt for the marketing page. Values
// are fixed rather than fetched, so the whole thing renders on the server.

const SERIES = [4, 9, 22, 26, 18, 14, 31, 47, 52, 55, 62]
const AXIS = ['May 25', 'May 27', 'May 29', 'May 31']

const CHART_W = 320
const CHART_H = 100
const CHART_TOP = 12
const CHART_BOTTOM = 86

/** Catmull-Rom → cubic bézier, so the line curves instead of kinking. */
function smoothPath(points: readonly (readonly [number, number])[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

const POINTS = SERIES.map((v, i) => {
  const x = (i / (SERIES.length - 1)) * CHART_W
  const y = CHART_BOTTOM - (v / 80) * (CHART_BOTTOM - CHART_TOP)
  return [x, y] as const
})

const LAST = POINTS[POINTS.length - 1]

/** Gradient trend curve with y-axis grid, tick labels and an end marker. */
function TrendChart(): JSX.Element {
  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <div className="text-muted-foreground flex w-8 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] tabular-nums">
          {['75%', '50%', '25%', '0%'].map(label => (
            <span key={label}>{label}</span>
          ))}
        </div>
        {/* relative so the end marker can be placed as a % of the plot box —
            an SVG circle would stretch into an ellipse under the non-uniform
            preserveAspectRatio this chart needs to fill its width. */}
        <div className="relative h-[92px] flex-1">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="vis-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#c8b5b0" />
                <stop offset="45%" stopColor="#e04a3d" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            {[CHART_TOP, 37, 62, CHART_BOTTOM].map(y => (
              <line
                key={y}
                x1="0"
                x2={CHART_W}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              d={smoothPath(POINTS)}
              fill="none"
              stroke="url(#vis-stroke)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            aria-hidden
            className="ring-border absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1"
            style={{
              left: `${(LAST[0] / CHART_W) * 100}%`,
              top: `${(LAST[1] / CHART_H) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className="text-muted-foreground mt-1 flex justify-between pl-10 text-[10px]">
        {AXIS.map(label => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}

interface Rank {
  rank: number
  name: string
  visibility: number
  sentiment: number
  position: string
  positiveTrend: boolean
  isBrand?: boolean
}

const RANKS: Rank[] = [
  {
    rank: 1,
    name: 'Signalor',
    visibility: 62,
    sentiment: 91,
    position: '#1.2',
    positiveTrend: true,
    isBrand: true,
  },
  {
    rank: 2,
    name: 'Frase.io',
    visibility: 41,
    sentiment: 82,
    position: '#2.8',
    positiveTrend: true,
  },
  {
    rank: 3,
    name: 'Surfer SEO',
    visibility: 33,
    sentiment: 78,
    position: '#4.1',
    positiveTrend: false,
  },
  {
    rank: 4,
    name: 'Clearscope',
    visibility: 27,
    sentiment: 70,
    position: '#5.3',
    positiveTrend: false,
  },
]

const SOURCE_LOGOS = [
  '/logos/google.svg',
  '/logos/perplexity.svg',
  '/logos/chatgpt.svg',
  '/logos/claude.svg',
]

/** Thin share bar — the segmented tick meter would be too dense at this size. */
function MiniBar({ value, tone }: { value: number; tone: string }): JSX.Element {
  return (
    <span className="bg-muted inline-block h-2.5 w-[3px] shrink-0 overflow-hidden rounded-[1px]">
      <span className="block w-full" style={{ height: `${value}%`, background: tone }} />
    </span>
  )
}

function RankRow({ item }: { item: Rank }): JSX.Element {
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
          <MiniBar value={item.visibility} tone="#e04a3d" />
          {item.visibility}% Visibility
          <span className="text-border">|</span>
          {item.sentiment} Sentiment
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span
          className={cn(
            'block text-[11.5px] font-semibold tabular-nums',
            item.positiveTrend ? 'text-success' : 'text-primary',
          )}
        >
          {item.position}
        </span>
        <span className="text-muted-foreground text-[9px]">Avg. Position</span>
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        {SOURCE_LOGOS.map(logo => (
          <Image key={logo} src={logo} alt="" width={12} height={12} className="h-3 w-3" />
        ))}
      </span>
    </div>
  )
}

function CardHead(): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h4 className="text-foreground text-[14px] font-semibold">
          LLM Visibility Score &amp; Ranking
        </h4>
        <p className="text-muted-foreground mt-0.5 text-[11.5px]">
          Your brand visibility &amp; ranking in AI results
        </p>
      </div>
      <div className="bg-muted flex shrink-0 items-center gap-0.5 rounded-sm p-0.5">
        <span className="bg-card ring-border text-primary grid h-6 w-6 place-items-center rounded-[3px] ring-1">
          <LineChart className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="text-muted-foreground grid h-6 w-6 place-items-center">
          <BarChart3 className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </div>
  )
}

/** Light-mode build of the dashboard's LLM Visibility Score & Ranking card. */
export function HomeVisibilityCard(): JSX.Element {
  return (
    <div className="bg-card ring-border relative w-full max-w-[520px] rounded-sm p-4 shadow-sm ring-1 shadow-black/5">
      <CardHead />

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-[32px] leading-none font-bold tracking-tight tabular-nums">
            62%
          </span>
          <span className="text-success bg-success/10 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
            ↑ 8.4%
          </span>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-foreground text-[17px] font-bold">#1</span>
          <p className="text-muted-foreground text-[10px]">Your rank</p>
        </div>
      </div>
      <p className="text-muted-foreground mt-0.5 text-[10.5px]">vs previous week</p>

      <TrendChart />

      <div className="border-border mt-3 border-t pt-1.5">
        <div className="text-muted-foreground flex items-center justify-between px-2 pb-1 text-[10px] font-semibold">
          <span>Rank</span>
          <span>Sources</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {RANKS.map(item => (
            <RankRow key={item.name} item={item} />
          ))}
        </div>
      </div>

      <p className="ring-border text-foreground mt-2.5 flex items-center justify-center gap-1.5 rounded-sm py-1.5 text-[12px] font-medium ring-1">
        View full rankings
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </p>
    </div>
  )
}
