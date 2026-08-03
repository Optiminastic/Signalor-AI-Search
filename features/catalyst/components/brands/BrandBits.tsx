'use client'

import { useState } from 'react'

import type { Brand, BrandStatus } from '@/features/catalyst/brands-data'

export function StatusPill({ status }: { status: BrandStatus }): JSX.Element {
  const active = status === 'active'
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${active ? 'text-[#2FBE7E]' : 'text-[var(--cat-ink-3)]'}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#2FBE7E]' : 'bg-[var(--cat-ink-3)]'}`}
      />
      {active ? 'Active' : 'Paused'}
    </span>
  )
}

/** Segmented meter — a row of ticks filled up to `value` (like the GEO gauge). */
export function TickBar({
  value,
  ticks = 22,
  showValue = true,
}: {
  value: number
  ticks?: number
  showValue?: boolean
}): JSX.Element {
  const filled = Math.round((Math.min(100, Math.max(0, value)) / 100) * ticks)
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: ticks }, (_, i) => (
          <span
            key={i}
            className={`h-3.5 w-[3px] rounded-[1px] ${i < filled ? 'bg-[#e04a3d]' : 'bg-[var(--cat-hover)]'}`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-[12px] font-medium text-[var(--cat-ink-2)] tabular-nums">
          {value}%
        </span>
      )}
    </div>
  )
}

/** The site's own favicon, falling back to a letter tile when it has none. */
function BrandAvatar({ brand, tile }: { brand: Brand; tile: string }): JSX.Element {
  const [failed, setFailed] = useState(false)
  const domain = brand.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const base = `grid shrink-0 place-items-center overflow-hidden rounded-md ${tile}`

  if (!domain || failed) {
    return (
      <span className={`${base} bg-[rgba(224,74,61,0.12)] font-semibold text-[#e04a3d] uppercase`}>
        {brand.name[0]}
      </span>
    )
  }
  return (
    <span className={`${base} bg-[var(--cat-bg)]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={20}
        height={20}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-5 w-5 object-contain"
      />
    </span>
  )
}

export function BrandIdentity({ brand, md = false }: { brand: Brand; md?: boolean }): JSX.Element {
  const tile = md ? 'h-10 w-10 text-[15px]' : 'h-9 w-9 text-[13px]'
  return (
    <div className="flex items-center gap-3">
      <BrandAvatar brand={brand} tile={tile} />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[var(--cat-ink)]">{brand.name}</p>
        <p className="text-[12px] text-[var(--cat-ink-3)]">{brand.url}</p>
      </div>
    </div>
  )
}
