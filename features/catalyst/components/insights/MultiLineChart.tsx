import { ChartFrame } from '@/features/catalyst/components/ChartFrame'
import type { TrendSeries } from '@/hooks/useInsights'

const W = 680
const DEFAULT_H = 180
const PAD_L = 30
const PAD_R = 8
const PAD_T = 8
const PAD_B = 20
const PLOT_W = W - PAD_L - PAD_R
const TICKS = [0, 25, 50, 75, 100]

function plotH(height: number): number {
  return height - PAD_T - PAD_B
}

/** 0 maps to the bottom gridline, so a zero series sits flat on the baseline. */
function yOf(value: number, height: number): number {
  return PAD_T + (1 - Math.max(0, Math.min(100, value)) / 100) * plotH(height)
}

function xOf(index: number, count: number): number {
  if (count <= 1) return PAD_L + PLOT_W / 2
  return PAD_L + (index / (count - 1)) * PLOT_W
}

function linePoints(points: number[], height: number): string {
  return points
    .map((v, i) => `${xOf(i, points.length).toFixed(1)},${yOf(v, height).toFixed(1)}`)
    .join(' ')
}

function GridLines({ height }: { height: number }): JSX.Element {
  return (
    <>
      {TICKS.map(tick => (
        <g key={tick}>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={yOf(tick, height)}
            y2={yOf(tick, height)}
            stroke="var(--cat-grid)"
          />
          <text
            x={PAD_L - 6}
            y={yOf(tick, height) + 3}
            fontSize={9}
            textAnchor="end"
            fill="var(--cat-ink-3)"
          >
            {tick}
          </text>
        </g>
      ))}
    </>
  )
}

function XLabels({ labels, height }: { labels: string[]; height: number }): JSX.Element {
  const shown =
    labels.length <= 6 ? labels : labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0)
  return (
    <>
      {shown.map(label => {
        if (!label) return null
        const i = labels.indexOf(label)
        return (
          <text
            key={`${label}-${i}`}
            x={xOf(i, labels.length)}
            y={height - 6}
            fontSize={9}
            textAnchor="middle"
            fill="var(--cat-ink-3)"
          >
            {label}
          </text>
        )
      })}
    </>
  )
}

function SeriesLine({ s, height }: { s: TrendSeries; height: number }): JSX.Element {
  return (
    <g>
      <polyline
        points={linePoints(s.points, height)}
        fill="none"
        stroke={s.color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {s.points.map((v, i) => (
        <circle
          key={i}
          cx={xOf(i, s.points.length)}
          cy={yOf(v, height)}
          r={2.5}
          fill="var(--color-background-primary-default)"
          stroke={s.color}
          strokeWidth={1.5}
        />
      ))}
    </g>
  )
}

interface MultiLineChartProps {
  series: TrendSeries[]
  xLabels: string[]
  /** viewBox height; the SVG scales to its container width at this aspect ratio. */
  height?: number
}

/** Multi-series 0-100% line chart (inline SVG, no chart lib). */
export function MultiLineChart({
  series,
  xLabels,
  height = DEFAULT_H,
}: MultiLineChartProps): JSX.Element {
  return (
    <ChartFrame>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full">
        <GridLines height={height} />
        <XLabels labels={xLabels} height={height} />
        {series.map(s => (
          <SeriesLine key={s.key} s={s} height={height} />
        ))}
      </svg>
    </ChartFrame>
  )
}
