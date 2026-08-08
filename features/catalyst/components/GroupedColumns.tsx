import { ChartFrame } from '@/features/catalyst/components/ChartFrame'

const W = 340
const H = 150
const PAD_L = 26
const PAD_R = 4
const PAD_T = 8
const PAD_B = 18
const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B
const TICKS = [0, 25, 50, 75, 100]
const BAR_W = 13

export interface ColumnGroup {
  label: string
  a: number
  b: number
}

function yOf(value: number): number {
  return PAD_T + (1 - Math.max(0, Math.min(100, value)) / 100) * PLOT_H
}

function GridLines(): JSX.Element {
  return (
    <>
      {TICKS.map(tick => (
        <g key={tick}>
          <line x1={PAD_L} x2={W - PAD_R} y1={yOf(tick)} y2={yOf(tick)} stroke="var(--cat-grid)" />
          <text
            x={PAD_L - 5}
            y={yOf(tick) + 3}
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

interface BarGroupProps {
  group: ColumnGroup
  index: number
  count: number
  colorA: string
  colorB: string
}

function BarGroup({ group, index, count, colorA, colorB }: BarGroupProps): JSX.Element {
  const cx = PAD_L + (index + 0.5) * (PLOT_W / count)
  const aY = yOf(group.a)
  const bY = yOf(group.b)
  const baseline = PAD_T + PLOT_H
  return (
    <g>
      <rect x={cx - BAR_W - 1.5} y={aY} width={BAR_W} height={baseline - aY} rx={2} fill={colorA} />
      <rect x={cx + 1.5} y={bY} width={BAR_W} height={baseline - bY} rx={2} fill={colorB} />
      <text x={cx} y={H - 5} fontSize={9} textAnchor="middle" fill="var(--cat-ink-3)">
        {group.label}
      </text>
    </g>
  )
}

interface GroupedColumnsProps {
  groups: ColumnGroup[]
  colorA: string
  colorB: string
  className?: string
}

/** Grouped two-series column chart on a 0-100 scale (inline SVG, no chart lib). */
export function GroupedColumns({
  groups,
  colorA,
  colorB,
  className = 'w-full',
}: GroupedColumnsProps): JSX.Element {
  return (
    <ChartFrame className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <GridLines />
        {groups.map((group, i) => (
          <BarGroup
            key={group.label}
            group={group}
            index={i}
            count={groups.length}
            colorA={colorA}
            colorB={colorB}
          />
        ))}
      </svg>
    </ChartFrame>
  )
}
