'use client'

import {
  EmptyNote,
  StatTile,
} from '@/features/catalyst/components/prompt-tracker/detail/DetailBits'
import type { CitationEntry, CitationGroup } from '@/features/catalyst/prompt-detail-analytics'
import { formatTaskDate } from '@/features/catalyst/tasks-data'
import { ExternalLink } from '@/lib/icons'

function GroupTag({ group }: { group: CitationGroup }): JSX.Element | null {
  if (group.isBrand) {
    return (
      <span className="rounded-full bg-[rgba(47,190,126,0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[#1e8a5c]">
        Your domain
      </span>
    )
  }
  if (group.isCompetitor) {
    return (
      <span className="rounded-full bg-[#FDECEC] px-1.5 py-0.5 text-[10px] font-semibold text-[#E5484D]">
        Competitor
      </span>
    )
  }
  return null
}

function CitationRow({ entry }: { entry: CitationEntry }): JSX.Element {
  return (
    <li className="border-t border-[var(--cat-border-soft)] px-3 py-2.5 first:border-t-0">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-[var(--cat-ink)]">
            {entry.title || entry.url || entry.domain}
          </p>
          {entry.snippet && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--cat-ink-3)]">
              {entry.snippet}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[var(--cat-ink-3)]">
            <span className="tabular-nums">
              cited {entry.count}× · {entry.engines.join(', ')}
            </span>
            {entry.lastSeenAt && <span>· {formatTaskDate(entry.lastSeenAt)}</span>}
          </div>
        </div>
        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            title={entry.url}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </li>
  )
}

function DomainGroup({ group }: { group: CitationGroup }): JSX.Element {
  return (
    <div className="cat-card-edge overflow-hidden rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
      <div className="flex items-center gap-2 border-b border-[var(--cat-border)] bg-[var(--cat-content)] px-3 py-2">
        <span className="truncate text-[12px] font-semibold text-[var(--cat-ink)]">
          {group.domain || 'Unknown source'}
        </span>
        <GroupTag group={group} />
        <span className="ml-auto shrink-0 text-[11px] text-[var(--cat-ink-3)] tabular-nums">
          {group.entries.length} {group.entries.length === 1 ? 'page' : 'pages'}
        </span>
      </div>
      <ul>
        {group.entries.map(entry => (
          <CitationRow key={entry.url || `${entry.domain}-${entry.position}`} entry={entry} />
        ))}
      </ul>
    </div>
  )
}

/** Every source cited across every run, grouped by domain. */
export function PromptCitationsTab({ groups }: { groups: CitationGroup[] }): JSX.Element {
  if (groups.length === 0) {
    return <EmptyNote>No citations captured for this prompt in this date range.</EmptyNote>
  }
  const total = groups.reduce((sum, group) => sum + group.count, 0)
  const brand = groups.filter(g => g.isBrand).reduce((sum, group) => sum + group.count, 0)
  const rival = groups.filter(g => g.isCompetitor).reduce((sum, group) => sum + group.count, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Citations" value={String(total)} hint={`${groups.length} domains`} />
        <StatTile label="Yours" value={String(brand)} />
        <StatTile label="Competitors" value={String(rival)} />
      </div>
      <div className="space-y-2.5">
        {groups.map(group => (
          <DomainGroup key={group.domain} group={group} />
        ))}
      </div>
    </div>
  )
}
