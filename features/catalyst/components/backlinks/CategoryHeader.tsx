'use client'

import { ChevronRight } from 'lucide-react'

import type { SiteMeta } from '@/features/catalyst/backlinks-data'

interface CategoryHeaderProps {
  site: SiteMeta
  count: number
  liveCount: number
  open: boolean
  onToggle: () => void
}

/** The clickable accordion header row for a satellite-site category. */
export function CategoryHeader({
  site,
  count,
  liveCount,
  open,
  onToggle,
}: CategoryHeaderProps): JSX.Element {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--cat-hover)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <ChevronRight
          size={15}
          className={`shrink-0 text-[var(--cat-ink-3)] transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <SiteLogo site={site} />
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--cat-ink)]">{site.label}</span>
          <span className="rounded-full bg-[var(--cat-hover)] px-2 py-0.5 text-[11px] font-medium text-[var(--cat-ink-3)] tabular-nums">
            {count}
          </span>
        </span>
      </button>
      <SiteDomainLink site={site} liveCount={liveCount} />
    </div>
  )
}

/** "N live · domain" where the domain opens the live satellite site in a new tab. */
function SiteDomainLink({ site, liveCount }: { site: SiteMeta; liveCount: number }): JSX.Element {
  return (
    <span className="hidden shrink-0 text-[12px] text-[var(--cat-ink-3)] sm:block">
      {liveCount} live ·{' '}
      <a
        href={`https://${site.domain}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[var(--cat-ink-2)] transition-colors hover:text-[#e04a3d] hover:underline"
      >
        {site.domain}
      </a>
    </span>
  )
}

/** The site's real logo, falling back to the coloured letter badge. */
function SiteLogo({ site }: { site: SiteMeta }): JSX.Element {
  if (site.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny static brand SVG; next/image adds no value
      <img src={site.logo} alt={`${site.label} logo`} className="h-6 w-6 shrink-0 rounded-md" />
    )
  }
  return (
    <span
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold text-white"
      style={{ background: site.color }}
    >
      {site.initial}
    </span>
  )
}
