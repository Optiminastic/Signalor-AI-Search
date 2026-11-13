'use client'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { BingCard } from '@/features/catalyst/components/agent-page/indexing/BingCard'
import { IndexingSetup } from '@/features/catalyst/components/agent-page/indexing/IndexingSetup'
import { IndexingSummary } from '@/features/catalyst/components/agent-page/indexing/IndexingSummary'
import { PageChanges } from '@/features/catalyst/components/agent-page/indexing/PageChanges'
import { ReasonList } from '@/features/catalyst/components/agent-page/indexing/ReasonList'
import { RequestIndexingList } from '@/features/catalyst/components/agent-page/indexing/RequestIndexingList'
import { SatelliteArticlesCard } from '@/features/catalyst/components/agent-page/indexing/SatelliteArticlesCard'
import { useAgentIndexing, type AgentIndexing } from '@/hooks/useAgentIndexing'
import type { IndexingReport } from '@/lib/api/agent-mode-indexing'

interface IndexingPanelProps {
  orgSlug: string
}

const NOTE = 'text-[12.5px] text-[var(--cat-ink-2)]'

const WAITING: Partial<Record<IndexingReport['status'], string>> = {
  never_checked: 'Search Console is connected. The first check reads every page in your sitemap.',
  failed: 'The last check didn’t finish. You can run it again.',
  checking: 'Checking every page in your sitemap with Search Console. This takes a few minutes.',
}

function FirstCheck({
  report,
  indexing,
}: {
  report: IndexingReport
  indexing: AgentIndexing
}): JSX.Element {
  const busy = indexing.checking || report.status === 'checking'
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] p-4">
      <p className={NOTE}>{WAITING[report.status]}</p>
      {!busy && (
        <button
          type="button"
          onClick={indexing.checkNow}
          className={`${SECONDARY_BUTTON} self-start`}
        >
          Check now
        </button>
      )}
    </div>
  )
}

interface ReportProps {
  orgSlug: string
  report: IndexingReport
  indexing: AgentIndexing
}

function Report({ orgSlug, report, indexing }: ReportProps): JSX.Element {
  if (report.status === 'not_connected' || report.status === 'no_property') {
    return <IndexingSetup orgSlug={orgSlug} status={report.status} />
  }
  if (!report.checkedAt) return <FirstCheck report={report} indexing={indexing} />
  return (
    <>
      <IndexingSummary
        report={report}
        checking={indexing.checking}
        onCheckNow={indexing.checkNow}
      />
      <RequestIndexingList
        toRequest={report.toRequest}
        requested={report.requested}
        onOpened={indexing.markRequested}
      />
      <ReasonList reasons={report.reasons} />
      <PageChanges newlyIndexed={report.newlyIndexed} dropped={report.dropped} />
    </>
  )
}

/** The Indexing tab: which pages Google has indexed, why not, and what changed this week. */
export function IndexingPanel({ orgSlug }: IndexingPanelProps): JSX.Element {
  const indexing = useAgentIndexing(orgSlug)
  return (
    <div className="flex flex-col gap-4">
      {indexing.isLoading && <p className={NOTE}>Loading…</p>}
      {indexing.loadError && <p className={NOTE}>{indexing.loadError}</p>}
      {indexing.report && <Report orgSlug={orgSlug} report={indexing.report} indexing={indexing} />}
      {indexing.report?.bing && <BingCard orgSlug={orgSlug} bing={indexing.report.bing} />}
      <SatelliteArticlesCard orgSlug={orgSlug} />
      {indexing.checkError && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {indexing.checkError}
        </p>
      )}
    </div>
  )
}
