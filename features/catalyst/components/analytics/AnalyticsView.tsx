'use client'

import Link from 'next/link'
import { useState } from 'react'

import { GaCountryList } from '@/features/catalyst/components/analytics/GaCountryList'
import { GaTopPagesList } from '@/features/catalyst/components/analytics/GaTopPagesList'
import { GaTrafficSourcesList } from '@/features/catalyst/components/analytics/GaTrafficSourcesList'
import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { GeoTrendLine } from '@/features/catalyst/components/cards/GeoTrendLine'
import { DashHeader, type DashStatData } from '@/features/catalyst/components/dash/DashStat'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useGaData } from '@/hooks/useGaData'
import { useGscData } from '@/hooks/useGscData'
import { useIntegrations } from '@/hooks/useIntegrations'
import type { GAData, GscData, GscRow } from '@/lib/api/integrations'
import { BarChart3, Loader2, Search, Settings2 } from '@/lib/icons'

// Property selection lives on Integrations now, opened by this query rather than
// on its own bare route outside the dashboard shell.
const GA_PICKER_QUERY = '?picker=google-analytics'
const GSC_PICKER_QUERY = '?picker=search-console'

function SectionLabel({ children }: { children: string }): JSX.Element {
  return (
    <p className="mb-2 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
      {children}
    </p>
  )
}

function Centered({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[var(--cat-border)] bg-[var(--cat-card)] p-6 text-center">
      {children}
    </div>
  )
}

function Cta({ href, label }: { href: string; label: string }): JSX.Element {
  return (
    <Link
      href={href}
      className="mt-1 inline-flex h-9 items-center rounded-md px-4 text-[13px] font-semibold text-white"
      style={{ background: '#e04a3d' }}
    >
      {label}
    </Link>
  )
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  body: string
  href: string
  cta: string
}

function EmptyState({ icon, title, body, href, cta }: EmptyStateProps): JSX.Element {
  return (
    <Centered>
      <span className="grid h-11 w-11 place-items-center rounded-md bg-[rgba(224,74,61,0.1)] text-[#e04a3d]">
        {icon}
      </span>
      <div>
        <p className="text-[14px] font-semibold text-[var(--cat-ink)]">{title}</p>
        <p className="mt-1 max-w-sm text-[12px] text-[var(--cat-ink-3)]">{body}</p>
      </div>
      <Cta href={href} label={cta} />
    </Centered>
  )
}

function Spinner(): JSX.Element {
  return (
    <Centered>
      <Loader2 className="h-5 w-5 animate-spin text-[var(--cat-ink-3)]" />
    </Centered>
  )
}

/* ───────────────────────────────────────────────────────── Google Analytics */

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function gaStats(data: GAData): DashStatData[] {
  const organicPct =
    data.sessions > 0 ? Math.round((data.organic_sessions / data.sessions) * 100) : 0
  return [
    { label: 'Sessions', value: data.sessions.toLocaleString() },
    { label: 'Organic', value: `${organicPct}%` },
    { label: 'Bounce rate', value: `${Math.round(data.bounce_rate * 100)}%` },
    { label: 'Avg. duration', value: formatDuration(data.avg_session_duration) },
  ]
}

/** Compact metric tile in the Overview card language (rounded-md, tight). */
function StatTile({ label, value }: DashStatData): JSX.Element {
  return (
    <Card>
      <p className="text-[11px] tracking-wide text-[var(--cat-ink-3)] uppercase">{label}</p>
      <p className="mt-1.5 text-[22px] leading-none font-semibold tracking-tight text-[var(--cat-ink)] tabular-nums">
        {value}
      </p>
    </Card>
  )
}

function StatRow({ stats }: { stats: DashStatData[] }): JSX.Element {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(s => (
        <StatTile key={s.label} {...s} />
      ))}
    </div>
  )
}

/** A titled content card — the Overview `Card` + `CardHead` treatment. */
function Panel({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <Card>
      <CardHead title={label} />
      {children}
    </Card>
  )
}

function GaDataBody({ data }: { data: GAData }): JSX.Element {
  return (
    <div className="space-y-2">
      <StatRow stats={gaStats(data)} />
      {data.daily_trend.length > 1 && (
        <Panel label="Sessions trend">
          <GeoTrendLine data={data.daily_trend.map(p => p.sessions)} />
        </Panel>
      )}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {data.traffic_sources.length > 0 && (
          <Panel label="Traffic channels">
            <GaTrafficSourcesList sources={data.traffic_sources} />
          </Panel>
        )}
        {data.countries.length > 0 && (
          <Panel label="Sessions by country">
            <GaCountryList countries={data.countries} />
          </Panel>
        )}
      </div>
      {data.top_pages.length > 0 && (
        <Panel label="Top pages">
          <GaTopPagesList pages={data.top_pages} />
        </Panel>
      )}
    </div>
  )
}

function GaSection({ days }: { days?: number }): JSX.Element {
  const brandPath = useBrandPath()
  const { connected, isLoading: statusLoading } = useIntegrations()
  const { data, isLoading, isEmpty } = useGaData(days)
  const gaConnected = connected.has('google-analytics')

  let body: JSX.Element
  if (statusLoading || (gaConnected && isLoading)) body = <Spinner />
  else if (!gaConnected) {
    body = (
      <EmptyState
        icon={<BarChart3 size={20} />}
        title="Connect Google Analytics"
        body="Link GA4 to see how much traffic AI engines send you and where it lands."
        href={brandPath('integrations')}
        cta="Connect analytics"
      />
    )
  } else if (!data || isEmpty) {
    body = (
      <EmptyState
        icon={<Settings2 size={20} />}
        title="No traffic on this GA4 property"
        body="Connected, but the selected property has no sessions in the last 30 days. Pick a different property."
        href={`${brandPath('integrations')}${GA_PICKER_QUERY}`}
        cta="Change property"
      />
    )
  } else body = <GaDataBody data={data} />

  return (
    <section>
      <SectionLabel>Google Analytics</SectionLabel>
      {body}
    </section>
  )
}

/* ─────────────────────────────────────────────────── Google Search Console */

function gscStats(data: GscData): DashStatData[] {
  return [
    { label: 'Clicks', value: data.clicks.toLocaleString() },
    { label: 'Impressions', value: data.impressions.toLocaleString() },
    { label: 'CTR', value: `${(data.ctr * 100).toFixed(1)}%` },
    { label: 'Avg. position', value: data.position ? data.position.toFixed(1) : '—' },
  ]
}

function gscLabel(row: GscRow, i: number): string {
  return row.query || row.page || (row.country ? row.country.toUpperCase() : '') || `#${i + 1}`
}

/** Ranked GSC rows (queries / pages / countries) with clicks + impressions. */
function GscRowList({ rows }: { rows: GscRow[] }): JSX.Element {
  return (
    <div className="flex flex-col">
      {rows.slice(0, 8).map((row, i) => (
        <div
          key={`${gscLabel(row, i)}-${i}`}
          className="flex items-center justify-between gap-3 border-t border-[var(--cat-border-soft)] py-1.5 text-[13px] first:border-t-0"
        >
          <span className="truncate text-[var(--cat-ink)]">{gscLabel(row, i)}</span>
          <span className="shrink-0 text-[12px] text-[var(--cat-ink-3)] tabular-nums">
            {row.clicks.toLocaleString()} clicks · {row.impressions.toLocaleString()} impr.
          </span>
        </div>
      ))}
    </div>
  )
}

function GscDataBody({ data }: { data: GscData }): JSX.Element {
  return (
    <div className="space-y-2">
      <StatRow stats={gscStats(data)} />
      {data.daily_trend.length > 1 && (
        <Panel label="Clicks trend">
          <GeoTrendLine data={data.daily_trend.map(p => p.clicks)} />
        </Panel>
      )}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {data.top_queries.length > 0 && (
          <Panel label="Top queries">
            <GscRowList rows={data.top_queries} />
          </Panel>
        )}
        {data.top_pages.length > 0 && (
          <Panel label="Top pages">
            <GscRowList rows={data.top_pages} />
          </Panel>
        )}
      </div>
      {data.countries.length > 0 && (
        <Panel label="Top countries">
          <GscRowList rows={data.countries} />
        </Panel>
      )}
    </div>
  )
}

function GscSection({ days }: { days?: number }): JSX.Element {
  const brandPath = useBrandPath()
  const { connected, isLoading: statusLoading } = useIntegrations()
  const { data, isLoading, isEmpty } = useGscData(days)
  const gscConnected = connected.has('search-console')

  let body: JSX.Element
  if (statusLoading || (gscConnected && isLoading)) body = <Spinner />
  else if (!gscConnected) {
    body = (
      <EmptyState
        icon={<Search size={20} />}
        title="Connect Search Console"
        body="Link Search Console to track clicks, impressions, CTR and where you rank."
        href={brandPath('integrations')}
        cta="Connect Search Console"
      />
    )
  } else if (!data || isEmpty) {
    body = (
      <EmptyState
        icon={<Settings2 size={20} />}
        title="No Search Console data yet"
        body="Connected, but no impressions in the window. Pick a verified property or wait for the first sync."
        href={`${brandPath('integrations')}${GSC_PICKER_QUERY}`}
        cta="Choose property"
      />
    )
  } else body = <GscDataBody data={data} />

  return (
    <section>
      <SectionLabel>Search Console</SectionLabel>
      {body}
    </section>
  )
}

/** Date-range selector. "Last 30 days" ⇒ the fast cached snapshot (value 30 maps
 *  to undefined); 7/90 trigger a live fetch for that window. */
function RangeSelect({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (days: number | undefined) => void
}): JSX.Element {
  return (
    <select
      aria-label="Date range"
      value={value ?? 30}
      onChange={e => {
        const n = Number(e.target.value)
        onChange(n === 30 ? undefined : n)
      }}
      className="h-9 shrink-0 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-2.5 text-[13px] font-medium text-[var(--cat-ink-2)] outline-none"
    >
      <option value={7}>Last 7 days</option>
      <option value={30}>Last 30 days</option>
      <option value={90}>Last 90 days</option>
    </select>
  )
}

export function AnalyticsView(): JSX.Element {
  const [days, setDays] = useState<number | undefined>(undefined)
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashHeader
          title="Analytics"
          subtitle="How much traffic AI engines send you, and how you perform in search."
        />
        <RangeSelect value={days} onChange={setDays} />
      </div>
      <GaSection days={days} />
      <GscSection days={days} />
    </div>
  )
}
