'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { DataState } from '@/features/catalyst/components/DataState'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import { useCrawlerAccess, type EngineGroup } from '@/hooks/useCrawlerAccess'
import type { CrawlerAccessStatus } from '@/lib/api/crawler'

interface StatusStyle {
  label: string
  color: string
  /** Short enough to sit on one line next to the engine name. */
  short: string
}

const STATUS: Record<CrawlerAccessStatus, StatusStyle> = {
  blocked: { label: 'Blocked', color: NEG, short: 'robots.txt blocks it' },
  allowed_never_crawled: { label: 'Never crawled', color: YELLOW, short: 'allowed, never visited' },
  allowed_stale: { label: 'Stale', color: YELLOW, short: 'no recent visit' },
  active: { label: 'Crawling', color: GREEN, short: 'fetching pages' },
  unknown: { label: 'Not measured', color: 'var(--cat-ink-3)', short: 'no crawler telemetry' },
}

function StatusDot({ status }: { status: CrawlerAccessStatus }): JSX.Element {
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ background: STATUS[status].color }}
      aria-hidden
    />
  )
}

function EngineRow({ group }: { group: EngineGroup }): JSX.Element {
  const style = STATUS[group.status]
  return (
    <li className="flex items-center gap-2 border-b border-[var(--cat-border)] py-2 last:border-0">
      <StatusDot status={group.status} />
      <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--cat-ink)]">
        {group.engine}
      </span>
      <span className="shrink-0 text-[11px] text-[var(--cat-ink-3)]">{style.short}</span>
      <span className="shrink-0 text-[11px] font-semibold" style={{ color: style.color }}>
        {style.label}
      </span>
    </li>
  )
}

/** One-line verdict, so the card answers the question before anything is read. */
function Headline({
  hasBlocked,
  blockedCount,
  crawlableCount,
  unmeasured,
  total,
}: {
  hasBlocked: boolean
  blockedCount: number
  crawlableCount: number
  unmeasured: boolean
  total: number
}): JSX.Element {
  if (hasBlocked) {
    return (
      <p className="text-[13px] text-[var(--cat-ink)]">
        <span className="font-semibold" style={{ color: NEG }}>
          {blockedCount} of {total} AI engines are blocked
        </span>{' '}
        by your robots.txt. They cannot fetch your pages, so they cannot cite you.
      </p>
    )
  }
  if (unmeasured) {
    return (
      <p className="text-[13px] text-[var(--cat-ink-2)]">
        Nothing in your robots.txt blocks AI engines. Visits cannot be confirmed yet — connect
        crawler logs to see which engines actually arrive.
      </p>
    )
  }
  return (
    <p className="text-[13px] text-[var(--cat-ink)]">
      <span className="font-semibold" style={{ color: GREEN }}>
        {crawlableCount} of {total} AI engines
      </span>{' '}
      are allowed and actively crawling your site.
    </p>
  )
}

/**
 * Can AI engines crawl this site?
 *
 * The first question in the chain — an engine can only cite a page it has
 * fetched — so a blocked crawler caps every other effort at zero. Cloudflare
 * ships its AI-crawler block enabled by default and writes the rules into
 * robots.txt, so sites commonly block every engine without anyone choosing to.
 *
 * "Not measured" is deliberately distinct from "never crawled": with no crawler
 * telemetry we cannot claim an engine stayed away, only that we did not see it.
 */
export function CrawlerAccessCard({ slug }: { slug: string | undefined }): JSX.Element {
  const { data, isLoading, isError } = useCrawlerAccess(slug)

  return (
    <Card>
      <CardHead title="AI crawlability" />
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data || data.groups.length === 0}
        emptyTitle="Crawlability unknown"
        emptyHint="Run an analysis to check whether AI engines can reach your site."
      >
        {data && (
          <>
            <Headline
              hasBlocked={data.hasBlocked}
              blockedCount={data.blockedCount}
              crawlableCount={data.crawlableCount}
              unmeasured={data.unmeasured}
              total={data.groups.length}
            />
            <ul className="mt-2">
              {data.groups.map(group => (
                <EngineRow key={group.engine} group={group} />
              ))}
            </ul>
            {data.hasBlocked && (
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--cat-ink-3)]">
                If your robots.txt contains a “Cloudflare Managed content” block, these rules are
                added by Cloudflare rather than your site. Turn off Managed robots.txt under AI
                Crawl Control in the Cloudflare dashboard.
              </p>
            )}
          </>
        )}
      </DataState>
    </Card>
  )
}
