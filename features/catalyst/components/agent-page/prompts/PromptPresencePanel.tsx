'use client'

import { useMemo, useState } from 'react'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import {
  PlatformFilter,
  type PlatformChoice,
} from '@/features/catalyst/components/agent-page/prompts/PlatformFilter'
import { PLATFORM_ORDER } from '@/features/catalyst/components/agent-page/prompts/platforms'
import { PromptCard } from '@/features/catalyst/components/agent-page/prompts/PromptCard'
import { usePromptPresence, type PromptPresenceState } from '@/hooks/usePromptPresence'
import type { Platform, PromptPresenceReport } from '@/lib/api/agent-mode-prompt-presence'

const NOTE = 'text-[12.5px] text-[var(--cat-ink-2)]'
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'

function when(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

/** How many results each platform has across every prompt. */
export function platformCounts(report: PromptPresenceReport): Record<Platform, number> {
  const counts = { reddit: 0, linkedin: 0, x: 0, google: 0 }
  for (const prompt of report.prompts) {
    for (const p of PLATFORM_ORDER) counts[p] += prompt.results[p].length
  }
  return counts
}

function Header({
  report,
  state,
}: {
  report: PromptPresenceReport
  state: PromptPresenceState
}): JSX.Element {
  const busy = state.checking || report.checking
  const withBrand = report.prompts.filter(p => p.brandPresentOn.length > 0).length
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className={NOTE}>
          {report.prompts.length
            ? `You appear in conversations for ${withBrand} of ${report.prompts.length} prompts.`
            : 'Where people discuss each of your prompts: Reddit, LinkedIn, X and Google.'}
        </p>
        {report.checkedAt && <p className={MUTED}>Checked {when(report.checkedAt)}</p>}
      </div>
      <button
        type="button"
        disabled={busy || report.trackedPrompts === 0}
        onClick={state.checkNow}
        className={SECONDARY_BUTTON}
      >
        {busy ? 'Searching…' : 'Check now'}
      </button>
    </div>
  )
}

function Body({ report }: { report: PromptPresenceReport }): JSX.Element {
  const [choice, setChoice] = useState<PlatformChoice>('all')
  const counts = useMemo(() => platformCounts(report), [report])
  if (report.trackedPrompts === 0) {
    return <p className={NOTE}>No tracked prompts yet. Prompts come from the brand’s analysis.</p>
  }
  if (report.prompts.length === 0) {
    return (
      <p className={NOTE}>
        Not checked yet. Press “Check now” to search your {report.trackedPrompts} prompts.
      </p>
    )
  }
  const platforms = choice === 'all' ? PLATFORM_ORDER : [choice]
  return (
    <div className="flex flex-col gap-3">
      <PlatformFilter value={choice} onChange={setChoice} counts={counts} />
      <ul className="flex flex-col gap-2">
        {report.prompts.map((p, i) => (
          <li key={p.prompt}>
            <PromptCard presence={p} open={i === 0 || choice !== 'all'} platforms={platforms} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The Prompts tab: for each prompt the brand tracks, the Reddit threads (and
 * their subreddits), LinkedIn posts, X posts and Google links where it's being
 * discussed, each platform marked and filterable, and where the brand already
 * shows up, so the owner knows which conversations to join.
 */
export function PromptPresencePanel({ orgSlug }: { orgSlug: string }): JSX.Element {
  const state = usePromptPresence(orgSlug)
  const report = state.report
  return (
    <div className="flex flex-col gap-4">
      {state.isLoading && <p className={NOTE}>Loading…</p>}
      {state.loadError && <p className={NOTE}>{state.loadError}</p>}
      {report && <Header report={report} state={state} />}
      {report && <Body report={report} />}
      {state.checkError && (
        <p role="alert" className="text-primary-ink text-[12px]">
          {state.checkError}
        </p>
      )}
    </div>
  )
}
