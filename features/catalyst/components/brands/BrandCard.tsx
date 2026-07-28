import Link from 'next/link'

import type { Brand } from '@/features/catalyst/brands-data'
import { StatusPill, TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { scoreColor } from '@/features/catalyst/visibility-data'
import { ArrowRight, Settings, Timer } from '@/lib/icons'

const AVATAR = 'conic-gradient(from 210deg at 50% 50%, #F2A79E, #e04a3d, #b9382d, #F2A79E)'
const LABEL = 'text-[10px] font-medium uppercase tracking-wide text-[var(--cat-ink-3)]'

function BrandMetrics({ brand }: { brand: Brand }): JSX.Element {
  return (
    <div className="mt-5 flex items-end justify-between gap-4">
      <div>
        <p className={LABEL}>GEO</p>
        <p
          className="mt-1 text-[22px] leading-none font-semibold tabular-nums"
          style={{ color: scoreColor(brand.geoScore) }}
        >
          {brand.geoScore}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p className={LABEL}>Visibility</p>
        <div className="mt-2">
          <TickBar value={brand.visibility} ticks={12} />
        </div>
      </div>
    </div>
  )
}

function BrandCardHeader({ brand }: { brand: Brand }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[15px] font-semibold text-white uppercase"
          style={{ background: AVATAR }}
        >
          {brand.name[0]}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[var(--cat-ink)]">{brand.name}</p>
          <p className="truncate text-[12px] text-[var(--cat-ink-3)]">{brand.url}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <StatusPill status={brand.status} />
        <Link
          href={`/dashboard/brands/${brand.slug}/settings`}
          className="grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
          aria-label={`${brand.name} settings`}
        >
          <Settings size={15} />
        </Link>
      </div>
    </div>
  )
}

export function BrandCard({ brand }: { brand: Brand }): JSX.Element {
  return (
    <div className="group flex flex-col rounded-xl border border-[var(--cat-border)] bg-[var(--cat-card)] p-5 shadow-sm transition-all hover:border-[var(--cat-ink-3)] hover:shadow-md">
      <BrandCardHeader brand={brand} />
      <BrandMetrics brand={brand} />

      <div className="mt-5 flex items-center justify-between border-t border-[var(--cat-border-soft)] pt-3.5">
        <span className="flex items-center gap-1.5 text-[12px] text-[var(--cat-ink-3)]">
          <Timer size={13} />
          {brand.lastRun}
        </span>
        <Link
          href={`/dashboard/${brand.slug}`}
          className="flex items-center gap-1 text-[13px] font-semibold text-[#e04a3d] transition-all group-hover:gap-1.5"
        >
          Open
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
