import Link from 'next/link'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { IndexingStatus } from '@/lib/api/agent-mode-indexing'

interface IndexingSetupProps {
  orgSlug: string
  status: Extract<IndexingStatus, 'not_connected' | 'no_property'>
}

const COPY = {
  not_connected: {
    title: 'Connect Search Console',
    body: 'The agent checks every week which of your pages Google has indexed, explains why the others are not, and fixes what it can. It needs Search Console for that.',
  },
  no_property: {
    title: 'Pick your site in Search Console',
    body: 'Search Console is connected, but no site (property) is selected yet.',
  },
} as const

/** Shown until Search Console is connected with a property picked. */
export function IndexingSetup({ orgSlug, status }: IndexingSetupProps): JSX.Element {
  const copy = COPY[status]
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] p-4">
      <p className="text-[14px] font-semibold text-[var(--cat-ink)]">{copy.title}</p>
      <p className="text-[12.5px] text-[var(--cat-ink-2)]">{copy.body}</p>
      <Link
        href={`/dashboard/${orgSlug}/integrations`}
        className={`${SECONDARY_BUTTON} self-start`}
      >
        Open Integrations
      </Link>
    </div>
  )
}
