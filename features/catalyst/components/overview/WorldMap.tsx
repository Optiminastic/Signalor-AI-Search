import { BRAND } from '@/features/catalyst/constants'
import type { WorldMarker } from '@/hooks/useWorldPresence'

const W = 48
const H = 22
const LAT_TOP = 84
const LAT_SPAN = 144 // 84°N .. -60°S

function projX(lon: number): number {
  return ((lon + 180) / 360) * W
}
function projY(lat: number): number {
  return ((LAT_TOP - lat) / LAT_SPAN) * H
}

// Coarse equirectangular land mask: inclusive [startCol, endCol] spans per row
// (row 0 = north). Filled as a dot grid — reads as a recognizable world map.
const LAND_SPANS: Array<Array<[number, number]>> = [
  [
    [9, 13],
    [19, 22],
    [31, 40],
  ],
  [
    [6, 15],
    [18, 23],
    [26, 45],
  ],
  [
    [4, 16],
    [19, 22],
    [24, 46],
  ],
  [
    [5, 16],
    [23, 46],
  ],
  [
    [6, 16],
    [23, 46],
  ],
  [
    [7, 15],
    [24, 45],
  ],
  [
    [7, 16],
    [24, 45],
  ],
  [
    [8, 16],
    [22, 45],
  ],
  [
    [9, 14],
    [22, 44],
  ],
  [
    [11, 14],
    [22, 44],
  ],
  [
    [12, 14],
    [22, 38],
    [41, 45],
  ],
  [
    [15, 19],
    [23, 34],
    [40, 46],
  ],
  [
    [15, 21],
    [25, 33],
    [40, 46],
  ],
  [
    [15, 21],
    [27, 33],
    [41, 46],
  ],
  [
    [15, 21],
    [28, 33],
    [42, 46],
  ],
  [
    [16, 21],
    [28, 33],
    [41, 46],
  ],
  [
    [16, 20],
    [29, 33],
    [41, 46],
  ],
  [
    [16, 20],
    [30, 32],
    [41, 45],
  ],
  [
    [17, 19],
    [44, 44],
  ],
  [[17, 18]],
  [[17, 18]],
  [[17, 17]],
]

interface Dot {
  x: number
  y: number
}

const LAND_DOTS: Dot[] = []
LAND_SPANS.forEach((spans, row) => {
  spans.forEach(([a, b]) => {
    for (let c = a; c <= b; c += 1) LAND_DOTS.push({ x: c, y: row })
  })
})

function Marker({ marker }: { marker: WorldMarker }): JSX.Element {
  const x = projX(marker.lon)
  const y = projY(marker.lat)
  // Area-proportional radius so a 96% market reads far bigger than a 1% one,
  // while the smallest still stays visible.
  const r = 0.7 + Math.sqrt(marker.share / 100) * 3
  return (
    <g>
      {/* Native tooltip on hover — the Top Markets list carries the full readout. */}
      <title>{`${marker.country} · ${marker.share}%`}</title>
      <circle cx={x} cy={y} r={r} fill={BRAND} opacity={0.14}>
        <animate
          attributeName="r"
          values={`${r};${r * 1.55};${r}`}
          dur="2.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.14;0.04;0.14"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={x} cy={y} r={r * 0.55} fill={BRAND} />
      <circle cx={x} cy={y} r={r * 0.22} fill="#fff" opacity={0.7} />
    </g>
  )
}

interface WorldMapProps {
  markers: WorldMarker[]
}

export function WorldMap({ markers }: WorldMapProps): JSX.Element {
  return (
    <svg viewBox="-1 -1 50 24" preserveAspectRatio="xMidYMid meet" className="h-[172px] w-full">
      {LAND_DOTS.map(d => (
        <circle
          key={`${d.x}-${d.y}`}
          cx={d.x}
          cy={d.y}
          r={0.34}
          fill="var(--cat-ink-3)"
          opacity={0.3}
        />
      ))}
      {markers.map(m => (
        <Marker key={m.country} marker={m} />
      ))}
    </svg>
  )
}
