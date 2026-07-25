'use client'

import Link from 'next/link'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { Card } from '@/features/catalyst/components/Card'
import { WorldMap } from '@/features/catalyst/components/overview/WorldMap'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useWorldPresence, type WorldMarker } from '@/hooks/useWorldPresence'
import { ArrowRight, Globe, Loader2 } from '@/lib/icons'

/** ISO alpha-2 code → flag emoji (regional indicators); globe fallback. */
function flagEmoji(code: string): string {
  const cc = (code || '').toUpperCase()
  if (!/^[A-Z]{2}$/.test(cc)) return '🌐'
  return String.fromCodePoint(...[...cc].map(c => 127397 + c.charCodeAt(0)))
}

function Header(): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <div className="mb-3 flex items-start justify-between">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-[rgba(224,74,61,0.1)] text-[#e04a3d]">
          <Globe size={16} />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-[var(--cat-ink)]">World Presence</p>
          <p className="text-[11px] text-[var(--cat-ink-3)]">Sessions by country</p>
        </div>
      </div>
      <span className="flex items-center gap-2">
        <span className="rounded-full bg-[var(--cat-hover)] px-2 py-0.5 text-[10px] font-medium text-[var(--cat-ink-3)]">
          Google Analytics
        </span>
        <Link
          href={`${brandPath('visibility')}?tab=analytics`}
          className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[#e04a3d] transition-colors hover:text-[#b9382d]"
        >
          View details <ArrowRight size={13} />
        </Link>
      </span>
    </div>
  )
}

function MarketRow({ marker, max }: { marker: WorldMarker; max: number }): JSX.Element {
  return (
    <div className="py-[7px]">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="shrink-0 text-[14px] leading-none">{flagEmoji(marker.code)}</span>
        <span className="flex-1 truncate text-[12.5px] font-medium text-[var(--cat-ink)]">
          {marker.country}
        </span>
        <span className="text-[12.5px] font-semibold text-[var(--cat-ink)] tabular-nums">
          {marker.share}%
        </span>
      </div>
      <TickBar value={(marker.share / max) * 100} ticks={16} showValue={false} />
    </div>
  )
}

function TopMarkets({ markers }: { markers: WorldMarker[] }): JSX.Element {
  const top = [...markers].sort((a, b) => b.share - a.share).slice(0, 5)
  const max = top[0]?.share ?? 1
  return (
    <div className="w-full shrink-0 lg:w-[210px] lg:border-l lg:border-[var(--cat-border-soft)] lg:pl-5">
      <div className="mb-1 text-[11px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
        Top markets
      </div>
      <div className="divide-y divide-[var(--cat-border-soft)]">
        {top.map(m => (
          <MarketRow key={m.country} marker={m} max={max} />
        ))}
      </div>
    </div>
  )
}

interface PromptProps {
  href: string
  title: string
  hint: string
  cta: string
}

function Prompt({ href, title, hint, cta }: PromptProps): JSX.Element {
  return (
    <div className="flex min-h-[172px] flex-col items-center justify-center gap-2 text-center">
      <p className="text-[13px] font-medium text-[var(--cat-ink-2)]">{title}</p>
      <p className="max-w-xs text-[11.5px] text-[var(--cat-ink-3)]">{hint}</p>
      <Link
        href={href}
        className="auth-cta-btn mt-1 inline-flex h-[34px] items-center rounded-md px-3.5 text-[13px] font-semibold text-white"
      >
        {cta}
      </Link>
    </div>
  )
}

const GA_PROPERTY_HREF = '/settings/integrations/google-analytics/property'

function SyncingState(): JSX.Element {
  return (
    <div className="flex min-h-[172px] flex-col items-center justify-center gap-2 text-center">
      <Loader2 size={18} className="animate-spin text-[var(--cat-ink-3)]" />
      <p className="text-[13px] font-medium text-[var(--cat-ink-2)]">Syncing your GA4 data</p>
      <p className="max-w-xs text-[11.5px] text-[var(--cat-ink-3)]">
        The first sync usually takes a minute or two. This card fills in automatically.
      </p>
    </div>
  )
}

interface StateProps {
  isEmpty: boolean
  syncing: boolean
}

function EmptyOrConnect({ isEmpty, syncing }: StateProps): JSX.Element {
  const brandPath = useBrandPath()
  if (syncing) return <SyncingState />
  return isEmpty ? (
    <Prompt
      href={GA_PROPERTY_HREF}
      title="No location data for this GA4 property"
      hint="Google Analytics is connected, but the selected property has no sessions-by-country to plot. Try a different property."
      cta="Change property"
    />
  ) : (
    <Prompt
      href={brandPath('integrations')}
      title="Connect Google Analytics to see where your traffic comes from"
      hint="We’ll plot sessions by country from your GA4 property."
      cta="Connect Google Analytics"
    />
  )
}

export function WorldPresenceCard(): JSX.Element {
  const { markers, countries, sessions, hasData, isEmpty, isLoading, syncing } = useWorldPresence()

  return (
    <Card className="xl:col-span-2">
      <Header />
      {isLoading && (
        <div className="min-h-[172px] animate-pulse rounded-md bg-[var(--cat-hover)]" />
      )}
      {!isLoading && !hasData && <EmptyOrConnect isEmpty={isEmpty} syncing={syncing} />}
      {!isLoading && hasData && (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <WorldMap markers={markers} />
            </div>
            <TopMarkets markers={markers} />
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--cat-border-soft)] pt-2.5 text-[11px] text-[var(--cat-ink-3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2FBE7E]" />
            {countries} countries reached · {sessions} sessions in the last 30 days
          </div>
        </>
      )}
    </Card>
  )
}
