import Link from 'next/link'

import type { Brand } from '@/features/catalyst/brands-data'
import { BrandIdentity, StatusPill, TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { scoreColor } from '@/features/catalyst/visibility-data'
import { Settings } from '@/lib/icons'

const TH =
  'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--cat-ink-3)]'
const TH_NUM = `${TH} text-right`
const TD = 'px-4 py-3 align-middle'

/**
 * Plan and member count are account-scoped, not per-brand, so they were the same
 * placeholder on every row ("—" and "1"). Plan now lives once in the page header;
 * members belong on the brand's own settings screen.
 */
const COLUMNS: ReadonlyArray<{ label: string; numeric?: boolean }> = [
  { label: 'Brand' },
  { label: 'GEO', numeric: true },
  { label: 'Visibility' },
  { label: 'Last run' },
  { label: 'Status' },
  { label: '' },
]

function BrandRow({ brand }: { brand: Brand }): JSX.Element {
  return (
    <tr className="group border-t border-[var(--cat-border)] transition-colors hover:bg-[var(--cat-hover)]">
      <td className={TD}>
        <Link href={`/dashboard/${brand.slug}`} className="block" aria-label={`Open ${brand.name}`}>
          <BrandIdentity brand={brand} />
        </Link>
      </td>
      <td className={`${TD} text-right`}>
        <span
          className="text-[14px] font-semibold tabular-nums"
          style={{ color: scoreColor(brand.geoScore) }}
        >
          {brand.geoScore}
        </span>
      </td>
      <td className={TD}>
        <TickBar value={brand.visibility} />
      </td>
      <td className={`${TD} text-[13px] whitespace-nowrap text-[var(--cat-ink-3)]`}>
        {brand.lastRun}
      </td>
      <td className={TD}>
        <StatusPill status={brand.status} />
      </td>
      <td className={`${TD} text-right`}>
        <Link
          href={`/dashboard/brands/${brand.slug}/settings`}
          className="inline-grid h-8 w-8 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
          aria-label={`${brand.name} settings`}
        >
          <Settings size={16} />
        </Link>
      </td>
    </tr>
  )
}

export function BrandsTable({ brands }: { brands: Brand[] }): JSX.Element {
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)]">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th key={col.label || 'actions'} className={col.numeric ? TH_NUM : TH}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {brands.map(b => (
            <BrandRow key={b.slug} brand={b} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
