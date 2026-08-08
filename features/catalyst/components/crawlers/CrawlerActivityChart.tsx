import { ChartFrame } from '@/features/catalyst/components/ChartFrame'
import type { CrawlerDay } from '@/hooks/useCrawlerLogs'

const W = 680
const H = 180
const PAD_L = 30
const PAD_R = 8
const PAD_T = 8
const PAD_B = 20
const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B

function xOf(index: number, count: number): number {
  return PAD_L + (index + 0.5) * (PLOT_W / count)
}

function GridLines({ max }: { max: number }): JSX.Element {
  const ticks = [0, Math.round(max / 2), max]
  return (
    <>
      {ticks.map(tick => {
        const y = PAD_T + (1 - tick / max) * PLOT_H
        return (
          <g key={tick}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="var(--cat-grid)" />
            <text x={PAD_L - 6} y={y + 3} fontSize={9} textAnchor="end" fill="var(--cat-ink-3)">
              {tick}
            </text>
          </g>
        )
      })}
    </>
  )
}

interface DayBarProps {
  day: CrawlerDay
  index: number
  count: number
  max: number
  colors: string[]
}

interface Segment {
  botIndex: number
  y: number
  h: number
}

/** Stack a day's per-bot counts bottom-up into y/height segments. */
function stackSegments(day: CrawlerDay, max: number): Segment[] {
  const out: Segment[] = []
  let cursor = PAD_T + PLOT_H
  day.counts.forEach((n, botIndex) => {
    if (n === 0) return
    const h = (n / max) * PLOT_H
    cursor -= h
    out.push({ botIndex, y: cursor, h })
  })
  return out
}

function DayBar({ day, index, count, max, colors }: DayBarProps): JSX.Element {
  const cx = xOf(index, count)
  const barW = Math.min(18, (PLOT_W / count) * 0.6)
  return (
    <g>
      <title>{`${day.date}: ${day.total} crawler hits`}</title>
      {stackSegments(day, max).map(seg => (
        <rect
          key={seg.botIndex}
          x={cx - barW / 2}
          y={seg.y}
          width={barW}
          height={seg.h}
          rx={1.5}
          fill={colors[seg.botIndex]}
        />
      ))}
    </g>
  )
}

function XLabels({ days }: { days: CrawlerDay[] }): JSX.Element {
  const step = Math.max(1, Math.ceil(days.length / 6))
  return (
    <>
      {days.map((day, i) =>
        i % step === 0 ? (
          <text
            key={day.date}
            x={xOf(i, days.length)}
            y={H - 6}
            fontSize={9}
            textAnchor="middle"
            fill="var(--cat-ink-3)"
          >
            {day.date}
          </text>
        ) : null,
      )}
    </>
  )
}

interface CrawlerActivityChartProps {
  days: CrawlerDay[]
  colors: string[]
  max: number
}

/** Daily AI-crawler hits, stacked per bot (inline SVG, no chart lib). */
export function CrawlerActivityChart({
  days,
  colors,
  max,
}: CrawlerActivityChartProps): JSX.Element {
  return (
    <ChartFrame>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <GridLines max={max} />
        <XLabels days={days} />
        {days.map((day, i) => (
          <DayBar
            key={day.date}
            day={day}
            index={i}
            count={days.length}
            max={max}
            colors={colors}
          />
        ))}
      </svg>
    </ChartFrame>
  )
}
