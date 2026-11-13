'use client'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { BingKeySetup } from '@/features/catalyst/components/agent-page/indexing/BingKeySetup'
import { ScheduleToggle } from '@/features/catalyst/components/backlinks/ScheduleToggle'
import { useBingIndexing } from '@/hooks/useBingIndexing'
import type { BingState } from '@/lib/api/agent-mode-indexing'

interface BingCardProps {
  orgSlug: string
  bing: BingState
}

const MUTED = 'text-[12px] text-[var(--cat-ink-3)]'

function day(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso))
}

function LastRun({ last }: { last: NonNullable<BingState['last']> }): JSX.Element {
  if (last.kind === 'submitted') {
    return (
      <p className="text-[12.5px] text-[var(--cat-ink)]">
        Sent {last.submitted} pages to Bing on {day(last.at)}. Bing decides when to index them.
      </p>
    )
  }
  if (last.kind === 'no_changes') {
    return <p className={MUTED}>No new or changed pages on {day(last.at)}, so nothing was sent.</p>
  }
  return (
    <p className="text-[12.5px] text-[#e04a3d]">
      Couldn&apos;t send on {day(last.at)}: {last.message}
    </p>
  )
}

interface SendRowProps {
  nextAt: string | null
  sending: boolean
  onSend: () => void
}

function SendRow({ nextAt, sending, onSend }: SendRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={MUTED}>{nextAt ? `Next send ${day(nextAt)}` : 'First send this week'}</span>
      <button type="button" disabled={sending} onClick={onSend} className={SECONDARY_BUTTON}>
        {sending ? 'Sending…' : 'Send now'}
      </button>
    </div>
  )
}

/**
 * Weekly Bing sending (IndexNow). Bing's index feeds ChatGPT search; the agent
 * sends new and changed sitemap pages once a week after the owner turns it on.
 */
export function BingCard({ orgSlug, bing }: BingCardProps): JSX.Element {
  const actions = useBingIndexing(orgSlug)
  return (
    <section className="flex flex-col gap-2.5 rounded-lg border border-[var(--cat-border)] p-4">
      <ScheduleToggle
        enabled={bing.enabled}
        disabled={actions.switching}
        onToggle={() => actions.setEnabled(!bing.enabled)}
        label="Send new and changed pages to Bing every week"
      />
      <p className={MUTED}>
        ChatGPT search reads Bing&apos;s index. Each week the agent sends the pages in your sitemap
        that are new or changed. It publishes nothing on your site.
      </p>
      <BingKeySetup
        bing={bing}
        keyCheck={actions.keyCheck}
        verifying={actions.verifying}
        onVerify={actions.verify}
      />
      {bing.last && <LastRun last={bing.last} />}
      {bing.enabled && (
        <SendRow nextAt={bing.nextAt} sending={actions.sending} onSend={actions.sendNow} />
      )}
      {actions.error && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {actions.error}
        </p>
      )}
    </section>
  )
}
