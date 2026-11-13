'use client'

import { SECTION_TITLE } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { useSatelliteRanks } from '@/hooks/useSatelliteRanks'
import type { SatelliteArticle } from '@/lib/api/agent-mode-satellite'

interface SatelliteArticlesCardProps {
  orgSlug: string
}

const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'

const FLAG_TEXT: Record<Exclude<SatelliteArticle['flag'], ''>, string> = {
  needs_links: 'Not on Google after a week. Links to it from other articles usually help.',
  needs_refresh: 'Below page 1 after two weeks. A fuller, refreshed article usually helps.',
}

const REFRESH_QUEUED = 'Below page 1 after two weeks. A refreshed version is waiting in Approvals.'

function flagText(article: SatelliteArticle): string {
  if (article.flag === '') return ''
  if (article.flag === 'needs_refresh' && article.refreshQueued) return REFRESH_QUEUED
  return FLAG_TEXT[article.flag]
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function googleStatus(article: SatelliteArticle): string {
  const check = article.check
  if (!check) return 'Not checked yet'
  if (check.error) return 'Couldn’t check this week'
  if (!check.propertyFound) return 'Site not in Search Console yet'
  if (!check.indexed) return `Not on Google yet${check.reason ? ` (${check.reason})` : ''}`
  const position = check.position ? `position ${check.position}` : 'no searches yet'
  return `On Google · ${position} · ${check.clicks} clicks`
}

function ArticleRow({ article }: { article: SatelliteArticle }): JSX.Element {
  return (
    <li className="flex flex-col gap-0.5 rounded-lg border border-[var(--cat-border)] px-3 py-2">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-[12.5px] text-[var(--cat-ink)] underline-offset-2 hover:underline"
      >
        {article.topic || article.url}
      </a>
      <span className={MUTED}>
        {hostOf(article.url)} · {googleStatus(article)}
      </span>
      {article.flag && <span className="text-[11.5px] text-[#e04a3d]">{flagText(article)}</span>}
    </li>
  )
}

/** Published articles on signalor.ai's sites, and how Google treats each one. */
export function SatelliteArticlesCard({ orgSlug }: SatelliteArticlesCardProps): JSX.Element | null {
  const { data, error } = useSatelliteRanks(orgSlug)
  if (error) return <p className={MUTED}>{error}</p>
  if (!data || data.articles.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h3 className={SECTION_TITLE}>Your articles on signalor.ai sites</h3>
      {!data.searchConsole && (
        <p className={MUTED}>
          Google rankings appear once signalor.ai&apos;s Search Console is connected.
        </p>
      )}
      <ul className="flex flex-col gap-1.5">
        {data.articles.map(article => (
          <ArticleRow key={article.taskId} article={article} />
        ))}
      </ul>
    </section>
  )
}
