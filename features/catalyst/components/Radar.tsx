import { ChartFrame } from '@/features/catalyst/components/ChartFrame'

const CX = 130
const CY = 120
const R = 74
const RINGS = [0.25, 0.5, 0.75, 1]

export interface RadarSeries {
  vals: number[]
  color: string
}

type Point = readonly [number, number]

function pt(i: number, frac: number, count: number): Point {
  const a = (Math.PI * 2 * i) / count - Math.PI / 2
  return [CX + Math.cos(a) * R * frac, CY + Math.sin(a) * R * frac]
}

function poly(vals: number[]): string {
  return vals.map((v, i) => pt(i, v, vals.length).join(',')).join(' ')
}

function Series({ vals, color }: RadarSeries): JSX.Element {
  return (
    <>
      <polygon
        points={poly(vals)}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {vals.map((v, i) => {
        const [x, y] = pt(i, v, vals.length)
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill="var(--color-background-primary-default)"
            stroke={color}
            strokeWidth={2}
          />
        )
      })}
    </>
  )
}

function Labels({ axes }: { axes: string[] }): JSX.Element {
  return (
    <>
      {axes.map((name, i) => {
        const [x, y] = pt(i, 1.28, axes.length)
        return (
          <span
            key={name}
            className="bg-background-primary-default absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--cat-border-soft)] px-2 py-0.5 text-[11px] whitespace-nowrap text-[var(--cat-ink-2)]"
            style={{ left: `${(x / 260) * 100}%`, top: `${(y / 240) * 100}%` }}
          >
            {name}
          </span>
        )
      })}
    </>
  )
}

export function Radar({ axes, series }: { axes: string[]; series: RadarSeries[] }): JSX.Element {
  return (
    <ChartFrame className="mt-1">
      <div className="relative mx-auto h-[240px] w-[260px]">
        <svg viewBox="0 0 260 240" className="h-[240px] w-full">
          {RINGS.map(f => (
            <polygon
              key={f}
              points={axes.map((_, i) => pt(i, f, axes.length).join(',')).join(' ')}
              fill="none"
              stroke="var(--cat-grid)"
            />
          ))}
          {axes.map((_, i) => {
            const [x, y] = pt(i, 1, axes.length)
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--cat-grid)" />
          })}
          {series.map(s => (
            <Series key={s.color} vals={s.vals} color={s.color} />
          ))}
        </svg>
        <Labels axes={axes} />
      </div>
    </ChartFrame>
  )
}
