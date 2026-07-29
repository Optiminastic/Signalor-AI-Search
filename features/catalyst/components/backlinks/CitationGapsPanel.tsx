'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { DataState } from '@/features/catalyst/components/DataState'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useCitationGaps, useSetGapStatus } from '@/hooks/useCitationGaps'
import type { CitationGap, CitationGapStatus } from '@/lib/api/prompts'

const STATUS: Record<CitationGapStatus, { label: string; color: string }> = {
  identified: { label: 'To pitch', color: 'var(--cat-ink-3)' },
  pitched: { label: 'Pitched', color: YELLOW },
  live: { label: 'Live', color: GREEN },
  dismissed: { label: 'Not pursuing', color: 'var(--cat-ink-3)' },
}

function StatusControl({ gap, slug }: { gap: CitationGap; slug: string | undefined }): JSX.Element {
  const { setStatus, isSaving } = useSetGapStatus(slug)

  // "live" is derived from a presence check, so it is shown but never offered.
  if (gap.status === 'live') {
    return (
      <span className="text-[11px] font-semibold" style={{ color: GREEN }}>
        Live · verified
      </span>
    )
  }
  return (
    <select
      aria-label={`Outreach status for ${gap.domain}`}
      value={gap.status}
      disabled={isSaving}
      onChange={e =>
        setStatus(gap.domain, e.target.value as 'identified' | 'pitched' | 'dismissed')
      }
      className="h-[26px] rounded-sm border border-[var(--cat-border)] bg-[var(--cat-card)] px-1.5 text-[11px] text-[var(--cat-ink-2)]"
    >
      <option value="identified">To pitch</option>
      <option value="pitched">Pitched</option>
      <option value="dismissed">Not pursuing</option>
    </select>
  )
}

function GapRow({ gap, slug }: { gap: CitationGap; slug: string | undefined }): JSX.Element {
  return (
    <li className="flex items-center gap-3 border-b border-[var(--cat-border)] py-2 last:border-0">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-[var(--cat-ink)]">
          {gap.domain}
        </span>
        <span className="text-[11px] text-[var(--cat-ink-3)]">
          wins {gap.prompts_won} of your prompts · {gap.citations} citations
        </span>
      </span>
      <span
        className="shrink-0 text-[11px] font-semibold"
        style={{ color: STATUS[gap.status].color }}
      >
        {STATUS[gap.status].label}
      </span>
      <StatusControl gap={gap} slug={slug} />
    </li>
  )
}

/**
 * The domains engines cite instead of you.
 *
 * The strongest signal in the product because it is observed: these are the
 * exact sources returned when an engine answered a tracked prompt and did not
 * mention the brand. For a brand with no authority, getting into these pages
 * beats publishing more of your own.
 */
export function CitationGapsPanel(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useCitationGaps(slug)

  return (
    <Card>
      <CardHead title="Citation gaps" />
      <DataState
        isLoading={projectLoading || isLoading}
        isError={isError}
        isEmpty={!data || data.targets.length === 0}
        emptyTitle="No citation gaps found"
        emptyHint="Once prompts have run, the domains cited instead of you appear here."
      >
        {data && (
          <>
            <p className="text-[13px] text-[var(--cat-ink)]">
              <span className="font-semibold" style={{ color: NEG }}>
                {data.summary.total} domains
              </span>{' '}
              are cited on prompts where you are not. Earning a mention on these feeds the answers
              directly.
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--cat-ink-3)]">
              “Live” is verified by search, not self-reported — it appears once your brand is
              actually found on the domain.
            </p>
            <ul className="mt-2">
              {data.targets.map(gap => (
                <GapRow key={gap.domain} gap={gap} slug={slug} />
              ))}
            </ul>
          </>
        )}
      </DataState>
    </Card>
  )
}
