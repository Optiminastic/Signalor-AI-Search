'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { CrawlerAccessCard } from '@/features/catalyst/components/crawlers/CrawlerAccessCard'
import { CrawlerActivityChart } from '@/features/catalyst/components/crawlers/CrawlerActivityChart'
import {
  TopCrawlersCard,
  TopPagesCard,
} from '@/features/catalyst/components/crawlers/CrawlerBreakdownCards'
import { CrawlerSetupCard } from '@/features/catalyst/components/crawlers/CrawlerSetupCard'
import { IndexNowCard } from '@/features/catalyst/components/crawlers/IndexNowCard'
import { DataState } from '@/features/catalyst/components/DataState'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useCrawlerLogs, type CrawlerLogsData } from '@/hooks/useCrawlerLogs'
import { Loader2 } from '@/lib/icons'

function LegendDot({ color, children }: { color: string; children: string }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--cat-ink-2)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {children}
    </span>
  )
}

function ActivityCard({ data }: { data: CrawlerLogsData }): JSX.Element {
  return (
    <Card>
      <CardHead title="AI crawler activity" />
      <div className="mb-1 flex flex-wrap items-center gap-3">
        {data.bots.slice(0, 8).map(bot => (
          <LegendDot key={bot.bot} color={bot.color}>
            {bot.label}
          </LegendDot>
        ))}
        <span className="ml-auto text-[11px] text-[var(--cat-ink-3)]">
          Hits per day · last 30 days · {data.raw.total_hits} total
        </span>
      </div>
      <CrawlerActivityChart
        days={data.days}
        colors={data.bots.map(b => b.color)}
        max={data.maxDay}
      />
    </Card>
  )
}

function WaitingBanner(): JSX.Element {
  return (
    <p className="flex items-center gap-1.5 rounded-md border border-dashed border-[var(--cat-border)] px-4 py-3 text-[12px] text-[var(--cat-ink-3)]">
      <Loader2 size={13} className="animate-spin" />
      Waiting for the first crawler hits. Once your site integration is live, this page fills in
      automatically.
    </p>
  )
}

function LogsBody({
  data,
  slug,
}: {
  data: CrawlerLogsData
  slug: string | undefined
}): JSX.Element {
  return (
    <div className="cat-stagger flex flex-col gap-2">
      {/* Access first: whether engines are *allowed* in gates everything below,
          and unlike activity it is meaningful before any telemetry arrives. */}
      <CrawlerAccessCard slug={slug} />
      {/* Access and indexing are the same question from two sides: can engines
          reach the page, and do they know it exists. */}
      <IndexNowCard slug={slug} />
      {data.raw.total_hits === 0 ? (
        <WaitingBanner />
      ) : (
        <>
          <ActivityCard data={data} />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <TopCrawlersCard bots={data.bots} />
            <TopPagesCard data={data} />
          </div>
        </>
      )}
      <CrawlerSetupCard token={data.raw.ingest_token} />
    </div>
  )
}

/** Crawler Logs — which AI bots visit the site, when, and what they read. */
export function CrawlerLogsView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useCrawlerLogs(slug)

  return (
    <>
      <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--cat-border)] pb-4">
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
            Crawler Logs
          </h1>
          <p className="text-[13px] text-[var(--cat-ink-2)]">
            AI bots visiting your site — who crawls, how often, and which pages they read
          </p>
        </div>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!slug || !data}
          emptyTitle="No crawler data yet"
          emptyHint="Run an analysis first, then connect your site to start logging AI crawler visits."
        >
          {data && <LogsBody data={data} slug={slug} />}
        </DataState>
      </div>
    </>
  )
}
