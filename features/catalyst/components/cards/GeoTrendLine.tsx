import { ChartFrame } from '@/features/catalyst/components/ChartFrame'
import { BRAND } from '@/features/catalyst/constants'

const W = 340
const H = 96
const END_COLOR = '#3b82f6' // gradient end (blue), matching the reference trend

interface Built {
  line: string
  area: string
  endYPct: number
}

function build(values: number[]): Built | null {
  if (values.length === 0) return null
  const series = values.length === 1 ? [values[0], values[0]] : values
  const max = Math.max(...series)
  const min = Math.min(...series)
  const span = max - min || 1
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * W
    const y = H - ((v - min) / span) * (H - 16) - 8
    return [x, y] as const
  })
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return { line, area: `0,${H} ${line} ${W},${H}`, endYPct: (last[1] / H) * 100 }
}

/** Gradient stop definitions for the trend stroke and its soft area fill. */
function GeoTrendDefs(): JSX.Element {
  return (
    <defs>
      <linearGradient id="geo-trend-stroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={BRAND} />
        <stop offset="100%" stopColor={END_COLOR} />
      </linearGradient>
      <linearGradient id="geo-trend-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.14" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
      </linearGradient>
    </defs>
  )
}

/** Smooth red→blue gradient trend line with a soft fill and an end marker. */
export function GeoTrendLine({ data }: { data: number[] }): JSX.Element {
  const built = build(data)
  return (
    <ChartFrame className="mt-3">
      <div className="relative h-[96px] w-full">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
          <GeoTrendDefs />
          {built && (
            <>
              <polygon points={built.area} fill="url(#geo-trend-fill)" />
              <polyline
                points={built.line}
                fill="none"
                stroke="url(#geo-trend-stroke)"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
        {built && (
          <span
            className="border-background-primary-default absolute right-0 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 bg-white shadow-[0_1px_4px_rgba(16,24,40,.25)]"
            style={{ top: `${built.endYPct}%` }}
          />
        )}
      </div>
    </ChartFrame>
  )
}
