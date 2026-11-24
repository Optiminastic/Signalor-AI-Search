'use client'

import { useState } from 'react'

import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { LOGO_SIZE } from '@/features/catalyst/constants'
import { engineLabel } from '@/features/catalyst/engine-logos'
import { Globe } from '@/lib/icons'

export interface RankItem {
  rank: number
  name: string
  domain: string
  isBrand: boolean
  visibility: number
  /** Engine keys where this brand appears (cell > 0), best-first. */
  present: string[]
}

const MAX_ENGINE_ICONS = 4

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
}

function BrandLogo({ name, domain }: { name: string; domain: string }): JSX.Element {
  const [failed, setFailed] = useState(false)
  if (!domain || failed) {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-[var(--cat-hover)] text-[10px] font-semibold text-[var(--cat-ink-2)]">
        {name.charAt(0).toUpperCase() || <Globe size={12} />}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconUrl(domain)}
      alt=""
      width={LOGO_SIZE.base}
      height={LOGO_SIZE.base}
      onError={() => setFailed(true)}
      className="h-5 w-5 shrink-0 rounded object-contain"
    />
  )
}

function EngineIcons({ engines }: { engines: string[] }): JSX.Element {
  const shown = engines.slice(0, MAX_ENGINE_ICONS)
  const extra = engines.length - shown.length
  return (
    <div className="flex shrink-0 items-center gap-1">
      {shown.map(key => (
        <EngineLogo key={key} name={engineLabel(key)} size={LOGO_SIZE.chip} />
      ))}
      {extra > 0 && <span className="text-[10px] text-[var(--cat-ink-3)]">+{extra}</span>}
    </div>
  )
}

function RankRow({ item }: { item: RankItem }): JSX.Element {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 ${
        item.isBrand ? 'bg-[var(--cat-hover)]' : ''
      }`}
    >
      <span className="w-4 shrink-0 text-right text-[11px] font-semibold text-[var(--cat-ink-3)]">
        {item.rank}
      </span>
      <BrandLogo name={item.name} domain={item.domain} />
      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--cat-ink)]">
        {item.name}
        {item.isBrand && (
          <span className="text-primary-ink ml-1.5 rounded bg-[#e04a3d]/10 px-1 py-px text-[9px] font-semibold tracking-wide uppercase">
            You
          </span>
        )}
      </span>
      <EngineIcons engines={item.present} />
      <span className="w-9 shrink-0 text-right text-[12.5px] font-semibold text-[var(--cat-ink)]">
        {item.visibility}%
      </span>
    </div>
  )
}

/** Competitor visibility leaderboard: rank, logo, name, engines present, share. */
export function GeoRankTable({ items }: { items: RankItem[] }): JSX.Element {
  if (items.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-[12px] text-[var(--cat-ink-3)]">
        No competitor ranking yet.
      </p>
    )
  }
  return (
    <div className="mt-1 flex flex-col gap-0.5">
      <div className="flex items-center gap-2.5 px-2 pb-1 text-[10px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
        <span className="w-4 shrink-0 text-right">#</span>
        <span className="flex-1">Brand</span>
        <span>Visibility</span>
      </div>
      <div className="flex max-h-[248px] flex-col gap-0.5 overflow-y-auto">
        {items.map(item => (
          <RankRow key={`${item.name}-${item.domain}`} item={item} />
        ))}
      </div>
    </div>
  )
}
