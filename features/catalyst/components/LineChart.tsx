import { ChartFrame } from '@/features/catalyst/components/ChartFrame'
import { BRAND } from '@/features/catalyst/constants'

const W = 340
const H = 90

/** Builds an SVG polyline `points` string from a numeric series. A single point
 * is drawn as a flat line; an empty series renders nothing. */
function buildPoints(values: number[]): string {
  if (values.length === 0) return ''
  const series = values.length === 1 ? [values[0], values[0]] : values
  const max = Math.max(...series)
  const min = Math.min(...series)
  const span = max - min || 1
  return series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * W
      const y = H - ((v - min) / span) * (H - 12) - 6
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

interface LineChartProps {
  data: number[]
  /** Rendered height class; the SVG stretches to fill it. */
  heightClass?: string
}

export function LineChart({ data, heightClass = 'h-[90px]' }: LineChartProps): JSX.Element {
  const points = buildPoints(data)
  return (
    <ChartFrame>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={`${heightClass} w-full`}>
        {points && (
          <polyline
            points={points}
            fill="none"
            stroke={BRAND}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </ChartFrame>
  )
}
