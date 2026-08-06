import { ArrowRight } from '@/features/site/components/icons'

// Light-mode build of the dashboard's Impact view, rebuilt for the marketing
// page. Fixed values, so it renders on the server. Uses the same polished chart
// grammar as the visibility card (HTML axis labels + non-scaling SVG line) and
// a dashed "fix shipped" marker to show the bend where fixes move the number.

const SERIES = [18, 22, 21, 30, 34, 39, 46, 52, 58]
/** Index in SERIES where the fix shipped - the bend point of the story. */
const SHIPPED_INDEX = 3

const CHART_W = 320
const CHART_H = 100
const CHART_TOP = 8
const CHART_BOTTOM = 88

const AXIS_LABELS = ['60', '40', '20', '0']

const POINTS = SERIES.map((value, i) => {
  const x = (i / (SERIES.length - 1)) * CHART_W
  const y = CHART_BOTTOM - (value / 60) * (CHART_BOTTOM - CHART_TOP)
  return [x, y] as const
})

function chartPaths(points: readonly (readonly [number, number])[]): {
  line: string
  area: string
} {
  const line = points.map(([x, y]) => `L ${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L ${CHART_W},${CHART_BOTTOM} L 0,${CHART_BOTTOM} Z`
  return { line: `M ${points[0][0]},${points[0][1].toFixed(1)} ${line}`, area }
}

const LAST = POINTS[POINTS.length - 1]
const SHIPPED_X = POINTS[SHIPPED_INDEX][0]
const GRID_Y = [0.6, 0.4, 0.2, 0].map(
  fraction => CHART_BOTTOM - fraction * (CHART_BOTTOM - CHART_TOP),
)

/** Rising area chart with a start / fix-shipped / today timeline. */
function LiftChart(): JSX.Element {
  const { line, area } = chartPaths(POINTS)
  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <div className="text-muted-foreground flex w-8 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] tabular-nums">
          {AXIS_LABELS.map(label => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative h-[92px] flex-1">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="home-measure-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(224,74,61,0.18)" />
                <stop offset="100%" stopColor="rgba(224,74,61,0)" />
              </linearGradient>
            </defs>
            {GRID_Y.map(y => (
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
            <path d={area} fill="url(#home-measure-fill)" />
            <path
              d={line}
              fill="none"
              stroke="#e04a3d"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={SHIPPED_X}
              x2={SHIPPED_X}
              y1={CHART_TOP}
              y2={CHART_BOTTOM}
              stroke="#e04a3d"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            aria-hidden
            className="ring-primary absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1"
            style={{
              left: `${(LAST[0] / CHART_W) * 100}%`,
              top: `${(LAST[1] / CHART_H) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className="text-muted-foreground mt-1 flex justify-between pl-10 text-[10px]">
        <span>Day 0</span>
        <span>Fix shipped</span>
        <span>Day 30</span>
      </div>
    </div>
  )
}

/** Light-mode build of the dashboard's Impact view. */
export function HomeMeasureCard(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-[520px] rounded-sm p-4 shadow-sm ring-1 shadow-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-foreground text-[14px] font-semibold">Impact</h4>
          <p className="text-muted-foreground mt-0.5 text-[11.5px]">
            Fixes move the number - then it stays moved
          </p>
        </div>
        <span className="bg-primary shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white">
          30d
        </span>
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-[32px] leading-none font-bold tracking-tight tabular-nums">
            58%
          </span>
          <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
            ↑ 40%
          </span>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-foreground text-[17px] font-bold">12</span>
          <p className="text-muted-foreground text-[10px]">fixes shipped</p>
        </div>
      </div>
      <p className="text-muted-foreground mt-0.5 text-[10.5px]">AI citations, up from 18%</p>

      <LiftChart />

      <p className="ring-border text-foreground mt-2.5 flex items-center justify-center gap-1.5 rounded-sm py-1.5 text-[12px] font-medium ring-1">
        See the full impact
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </p>
    </div>
  )
}
