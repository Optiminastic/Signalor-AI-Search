import { ChartFrame } from '@/features/catalyst/components/ChartFrame'
import { BRAND } from '@/features/catalyst/constants'

const W = 340
const H = 90
const PAD = 8

/** Build the `<polyline>` points and the closed area `<path>` for one layer. */
function toLayer(values: number[], scale: number): { poly: string; path: string } {
  const series = values.length === 1 ? [values[0], values[0]] : values
  const max = Math.max(...series)
  const min = Math.min(...series)
  const span = max - min || 1
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * W
    const y = H - PAD - ((v - min) / span) * scale * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return { poly: pts.join(' '), path: `M${pts.join(' L')} L${W},${H} L0,${H} Z` }
}

export function AreaChart({ data }: { data: number[] }): JSX.Element {
  if (data.length === 0) {
    return (
      <ChartFrame>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-20 w-full" />
      </ChartFrame>
    )
  }
  const band = toLayer(data, 1.25)
  const main = toLayer(data, 1)
  return (
    <ChartFrame>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-20 w-full">
        <defs>
          <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BRAND} stopOpacity="0.35" />
            <stop offset="1" stopColor={BRAND} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cv2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BRAND} stopOpacity="0.12" />
            <stop offset="1" stopColor={BRAND} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={band.path} fill="url(#cv2)" />
        <path d={main.path} fill="url(#cv)" />
        <polyline points={main.poly} fill="none" stroke={BRAND} strokeWidth={2} />
      </svg>
    </ChartFrame>
  )
}
