'use client'

import { useState } from 'react'

import { TrackedKeywords } from '@/features/catalyst/components/agent-page/tracking/TrackedKeywords'
import {
  colorOf,
  latestFor,
  seriesFor,
  weeksFor,
  type TrackingTab,
} from '@/features/catalyst/components/agent-page/tracking/tracking-data'
import {
  AioTable,
  SeoTable,
} from '@/features/catalyst/components/agent-page/tracking/TrackingTables'
import { MultiLineChart } from '@/features/catalyst/components/insights/MultiLineChart'
import { POS, NEG } from '@/features/catalyst/constants'
import { useRankTracking, type RankTrackingState } from '@/hooks/useRankTracking'
import type { RankTracking } from '@/lib/api/agent-mode-rank-tracking'

interface RankTrackingPanelProps {
  orgSlug: string
}

const TABS: { id: TrackingTab; label: string; explain: string; empty: string }[] = [
  {
    id: 'seo',
    label: 'SEO',
    explain: 'Share of your tracked keywords where each brand is in Google’s top 10.',
    empty: 'The first Google check runs this week.',
  },
  {
    id: 'geo',
    label: 'GEO',
    explain: 'Share of AI answers (ChatGPT, Gemini, Claude, Perplexity) that mention each brand.',
    empty:
      'AI answers are measured every week; the first week appears after the first measurement.',
  },
  {
    id: 'aio',
    label: 'AIO',
    explain: 'Share of tracked keywords where Google’s AI Overview cites each brand.',
    empty: 'The first AI Overview check runs this week.',
  },
]
const CHART_WIDTH = 360
const CHART_HEIGHT = 170
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
const NOTE = 'text-[12px] text-[var(--cat-ink-2)]'

function TabSwitch({
  value,
  onChange,
}: {
  value: TrackingTab
  onChange: (t: TrackingTab) => void
}): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label="Tracking"
      className="inline-flex gap-0.5 rounded-md bg-[var(--cat-track)] p-[3px]"
    >
      {TABS.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === value}
          onClick={() => onChange(tab.id)}
          className={`rounded-sm px-3 py-[5px] text-xs font-medium ${
            tab.id === value
              ? 'bg-[var(--cat-card)] font-semibold text-[var(--cat-ink)] shadow-sm'
              : 'text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function Change({ change }: { change: number | null }): JSX.Element | null {
  if (!change) return null
  return (
    <span className="text-[10.5px] tabular-nums" style={{ color: change > 0 ? POS : NEG }}>
      {change > 0 ? '+' : ''}
      {change}
    </span>
  )
}

/** Each player's latest value and change since last week, in their chart colour. */
function Legend({ tab, report }: { tab: TrackingTab; report: RankTracking }): JSX.Element {
  return (
    <ul className="flex flex-col gap-1">
      {latestFor(tab, report).map(({ player, now, change }, index) => (
        <li key={player.domain} className="flex items-center gap-2 text-[12px]">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: colorOf(player, index) }}
          />
          <span className="min-w-0 flex-1 truncate text-[var(--cat-ink)]" title={player.domain}>
            {player.name}
            {player.isBrand && <span className={`ml-1 ${MUTED}`}>(you)</span>}
          </span>
          <span className="font-medium text-[var(--cat-ink)] tabular-nums">{now}%</span>
          <Change change={change} />
        </li>
      ))}
    </ul>
  )
}

function TabBody({
  tab,
  tracking,
}: {
  tab: TrackingTab
  tracking: RankTrackingState
}): JSX.Element {
  const report = tracking.report as RankTracking // TabBody only renders once the report loaded
  const meta = TABS.find(t => t.id === tab) ?? TABS[0]
  const weeks = weeksFor(tab, report)
  return (
    <div className="flex flex-col gap-3">
      <p className={MUTED}>{meta.explain}</p>
      {tab === 'aio' && report.aioNote && <p className={NOTE}>{report.aioNote}</p>}
      {weeks.length ? (
        <>
          <MultiLineChart
            series={seriesFor(tab, report)}
            xLabels={weeks}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
          />
          <Legend tab={tab} report={report} />
        </>
      ) : (
        <p className={NOTE}>{meta.empty}</p>
      )}
      {tab === 'seo' && report.seo.latest.length > 0 && <SeoTable report={report} />}
      {tab === 'aio' && report.aio.latest.length > 0 && <AioTable report={report} />}
      {tab !== 'geo' && (
        <TrackedKeywords
          keywords={report.keywords}
          busy={tracking.busy}
          onAdd={tracking.addKeyword}
          onRemove={tracking.removeKeyword}
        />
      )}
    </div>
  )
}

function checkedText(tracking: RankTrackingState): string {
  if (tracking.checking) return 'Checking positions…'
  const at = tracking.report?.lastCheckAt
  return at ? `Checked ${new Date(at).toLocaleDateString()}` : 'Checked every week'
}

function Header({ tracking }: { tracking: RankTrackingState }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-[var(--cat-ink)]">You vs competitors</h2>
        <p className={MUTED}>{checkedText(tracking)}</p>
      </div>
      <button
        type="button"
        disabled={tracking.checking}
        onClick={tracking.checkNow}
        className="shrink-0 rounded-md border border-[var(--cat-border)] px-2.5 py-1 text-[12px] text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)] disabled:opacity-50"
      >
        Check now
      </button>
    </div>
  )
}

/**
 * Weekly tracking of the brand against its top competitors: Google positions
 * (SEO), mentions in AI answers (GEO) and Google AI Overview citations (AIO).
 */
export function RankTrackingPanel({ orgSlug }: RankTrackingPanelProps): JSX.Element {
  const [tab, setTab] = useState<TrackingTab>('seo')
  const tracking = useRankTracking(orgSlug)
  return (
    <div className="flex flex-col gap-4">
      <Header tracking={tracking} />
      <TabSwitch value={tab} onChange={setTab} />
      {tracking.actionError && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {tracking.actionError}
        </p>
      )}
      {tracking.isLoading && <p className={NOTE}>Loading…</p>}
      {tracking.loadError && <p className={NOTE}>{tracking.loadError}</p>}
      {tracking.report && <TabBody tab={tab} tracking={tracking} />}
    </div>
  )
}
