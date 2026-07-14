'use client'

import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import type { SiteOneReport } from '@/lib/api/siteone'

interface SiteOneSummaryProps {
  report: SiteOneReport
}

interface StatTileProps {
  label: string
  value: string
  tone?: string
}

/** 0-10 SiteOne score → traffic-light colour (matches the category meters). */
function scoreColor(score: number): string {
  if (score >= 8) return GREEN
  if (score >= 5) return YELLOW
  return NEG
}

function formatMs(ms: number): string {
  if (!ms) return '-'
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`
}

function StatTile({ label, value, tone }: StatTileProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3">
      <span className="text-[11px] font-medium tracking-wide text-[var(--cat-ink-3)] uppercase">
        {label}
      </span>
      <span
        className="text-[20px] font-semibold text-[var(--cat-ink)] tabular-nums"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </span>
    </div>
  )
}

/** Top-of-tab KPI row: overall SiteOne score plus crawl issue + latency counts. */
export function SiteOneSummary({ report }: SiteOneSummaryProps): JSX.Element {
  const { counts, performance } = report
  const overall = report.overall_score
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      <StatTile
        label="Overall"
        value={overall === null || overall === undefined ? '-' : `${overall.toFixed(1)}/10`}
        tone={overall ? scoreColor(overall) : undefined}
      />
      <StatTile label="Broken links" value={String(counts.broken_links)} />
      <StatTile label="Redirects" value={String(counts.redirects)} />
      <StatTile label="Security" value={String(counts.security_findings)} />
      <StatTile label="Pages crawled" value={String(counts.pages_crawled)} />
      <StatTile
        label="Avg / P90 req"
        value={`${formatMs(performance.request_ms_avg)} / ${formatMs(performance.request_ms_p90)}`}
      />
    </div>
  )
}
