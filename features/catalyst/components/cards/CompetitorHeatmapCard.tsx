'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { BrandFavicon } from '@/features/catalyst/components/competitors/BrandFavicon'
import { GREEN, LOGO_SIZE } from '@/features/catalyst/constants'
import { engineLabel, engineLogo } from '@/features/catalyst/engine-logos'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useCompetitorMatrix, type MatrixRow } from '@/hooks/useCompetitorMatrix'
import { UserRound } from '@/lib/icons'

/** A tint that scales with the cell's share, capped so even the hottest cell
 *  reads as a shade of the data green — not a solid block. Range 0.14–0.56. */
function heatBackground(value: number, max: number): string {
  const alpha = 0.14 + 0.42 * (value / max)
  return `${GREEN}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`
}

function HeatCell({ value, max }: { value: number; max: number }): JSX.Element {
  if (value <= 0) {
    return (
      <td className="px-1.5 py-1 text-center align-middle text-[12px] text-[var(--cat-ink-3)]">
        —
      </td>
    )
  }
  return (
    <td className="px-1.5 py-1 align-middle">
      <div
        className="rounded-md py-1.5 text-center text-[12px] font-semibold text-[var(--cat-ink)] tabular-nums"
        style={{ background: heatBackground(value, max) }}
      >
        {value}%
      </div>
    </td>
  )
}

/** Icon-only column head — the engine logo, centered, with the full name on
 *  hover. Keeps every column the same compact width so the cells line up as a
 *  clean grid (the old inline label wrapped "Meta Llama" onto two lines). */
function EngineHeader({ engine }: { engine: string }): JSX.Element {
  const logo = engineLogo(engine)
  const label = engineLabel(engine)
  return (
    <th scope="col" className="px-1.5 pb-2.5 text-center align-middle">
      <span title={label} className="flex items-center justify-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={label} className="h-5 w-5" />
        ) : (
          <span className="text-[11px] font-medium text-[var(--cat-ink-2)]">{label}</span>
        )}
      </span>
    </th>
  )
}

interface RowProps {
  row: MatrixRow
  engines: string[]
  max: number
}

function HeatRow({ row, engines, max }: RowProps): JSX.Element {
  return (
    <tr>
      <td
        className={`rounded-md py-1 pr-3 pl-1.5 align-middle ${row.isBrand ? 'bg-[rgba(224,74,61,0.06)]' : ''}`}
      >
        <span className="flex items-center gap-2">
          <BrandFavicon domain={row.domain} name={row.name} color="#111827" size={LOGO_SIZE.base} />
          <span className="truncate text-[13px] font-medium text-[var(--cat-ink)]">{row.name}</span>
          {row.isBrand && <UserRound size={13} className="shrink-0 text-[#e04a3d]" />}
        </span>
      </td>
      {engines.map(engine => (
        <HeatCell key={engine} value={row.cells[engine] ?? 0} max={max} />
      ))}
    </tr>
  )
}

/**
 * Dashboard heatmap: how visible the brand and each competitor are per AI
 * engine, on the same mention-rate basis. Hidden until a run has prompt data.
 */
export function CompetitorHeatmapCard(): JSX.Element | null {
  const { slug } = useActiveProject()
  const brandPath = useBrandPath()
  const { data } = useCompetitorMatrix(slug)

  if (!data || data.engines.length === 0 || data.rows.length < 2) return null

  return (
    <Card className="sm:col-span-2">
      <CardHead title="Competitor Visibility" action="Details" href={brandPath('competitors')} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-[190px] pb-2.5 pl-1.5 text-left align-middle text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
                Brand
              </th>
              {data.engines.map(engine => (
                <EngineHeader key={engine} engine={engine} />
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map(row => (
              <HeatRow
                key={row.domain || row.name}
                row={row}
                engines={data.engines}
                max={data.max}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-[var(--cat-ink-3)]">
        Share of answers per engine that mention your brand or cite the competitor domain.
      </p>
    </Card>
  )
}
