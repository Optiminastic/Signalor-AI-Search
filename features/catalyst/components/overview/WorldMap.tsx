'use client'

import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

import { BRAND } from '@/features/catalyst/constants'
import type { WorldMarker } from '@/hooks/useWorldPresence'

// World country shapes (TopoJSON, ~105KB) served from public/ — same-origin, no CDN.
const GEO_URL = '/geo/countries-110m.json'

const GEOGRAPHY_STYLE = {
  default: { outline: 'none' as const },
  hover: { outline: 'none' as const, fill: 'var(--cat-hover)' },
  pressed: { outline: 'none' as const },
}

/** A session-share bubble anchored to a country's centroid. */
function Bubble({ marker }: { marker: WorldMarker }): JSX.Element {
  // Area-proportional radius so a 96% market dwarfs a 1% one, small ones stay visible.
  const r = 4 + Math.sqrt(marker.share / 100) * 15
  return (
    <Marker coordinates={[marker.lon, marker.lat]}>
      <title>{`${marker.country} · ${marker.share}%`}</title>
      <circle r={r} fill={BRAND} opacity={0.14}>
        <animate
          attributeName="r"
          values={`${r};${r * 1.5};${r}`}
          dur="2.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.14;0.03;0.14"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </circle>
      <circle r={r * 0.5} fill={BRAND} />
      <circle r={r * 0.2} fill="#fff" opacity={0.7} />
    </Marker>
  )
}

interface WorldMapProps {
  markers: WorldMarker[]
}

/** Real geographic world map (react-simple-maps) with proportional session bubbles. */
export function WorldMap({ markers }: WorldMapProps): JSX.Element {
  return (
    <div className="aspect-[2/1] w-full border">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 165 }}
        width={800}
        height={400}
        className="h-full w-full"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="var(--cat-hover)"
                stroke="var(--cat-border)"
                strokeWidth={0.4}
                style={GEOGRAPHY_STYLE}
              />
            ))
          }
        </Geographies>
        {markers.map(m => (
          <Bubble key={m.country} marker={m} />
        ))}
      </ComposableMap>
    </div>
  )
}
