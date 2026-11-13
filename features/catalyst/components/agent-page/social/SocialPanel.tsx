'use client'

import {
  SECONDARY_BUTTON,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { PlatformRow } from '@/features/catalyst/components/agent-page/social/PlatformRow'
import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { useAgentSocial, type AgentSocial } from '@/hooks/useAgentSocial'
import type { SocialReport } from '@/lib/api/agent-mode-social'

interface SocialPanelProps {
  orgSlug: string
}

const ORDER = ['linkedin', 'x', 'youtube', 'instagram', 'reddit']
const NOTE = 'text-[12.5px] text-[var(--cat-ink-2)]'
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'

function changeText(change: number | null): string {
  if (change === null) return 'First check'
  if (change === 0) return 'No change since last week'
  return `${change > 0 ? '+' : ''}${change} since last week`
}

function Overall({ report, social }: { report: SocialReport; social: AgentSocial }): JSX.Element {
  const busy = social.checking || report.status === 'checking'
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[22px] font-semibold text-[var(--cat-ink)] tabular-nums">
            {report.overall?.score ?? 0} <span className="text-[14px] font-normal">of 100</span>
          </p>
          <p className={NOTE}>Social presence score</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={social.checkNow}
          className={SECONDARY_BUTTON}
        >
          {busy ? 'Checking…' : 'Check now'}
        </button>
      </div>
      <TickBar value={Math.round(report.overall?.score ?? 0)} />
      <p className={MUTED}>
        {changeText(report.change)}
        {report.overall?.partial
          ? ' · Partial: some numbers aren’t measured yet. Connecting Buffer (next step) adds exact LinkedIn, X and Instagram numbers.'
          : ''}
      </p>
    </div>
  )
}

function RedditCommunities({ report }: { report: SocialReport }): JSX.Element | null {
  if (!report.reddit || report.reddit.communities.length === 0) return null
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className={SECTION_TITLE}>Reddit communities talking about you</h3>
      <ul className="flex flex-col gap-0.5 text-[12px] text-[var(--cat-ink-2)]">
        {report.reddit.communities.map(c => (
          <li key={c.name}>
            r/{c.name} · {c.mentions} mentions in 90 days
          </li>
        ))}
      </ul>
      <p className={MUTED}>Join these conversations yourself; the agent never posts to Reddit.</p>
    </section>
  )
}

function Ready({ report, social }: { report: SocialReport; social: AgentSocial }): JSX.Element {
  return (
    <>
      <Overall report={report} social={social} />
      <ul className="flex flex-col gap-1.5">
        {ORDER.filter(name => report.platforms[name]).map(name => (
          <PlatformRow
            key={name}
            label={report.labels[name] ?? name}
            platform={report.platforms[name]}
          />
        ))}
      </ul>
      <RedditCommunities report={report} />
      {report.notes.length > 0 && (
        <ul className={`flex flex-col gap-0.5 ${MUTED}`}>
          {report.notes.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </>
  )
}

function FirstCheck({
  report,
  social,
}: {
  report: SocialReport
  social: AgentSocial
}): JSX.Element {
  const busy = social.checking || report.status === 'checking'
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] p-4">
      <p className={NOTE}>
        {busy
          ? 'Checking your profiles on LinkedIn, X, YouTube, Instagram and Reddit…'
          : 'See how strong your marketing is on LinkedIn, X, YouTube, Instagram and Reddit.'}
      </p>
      {!busy && (
        <button
          type="button"
          onClick={social.checkNow}
          className={`${SECONDARY_BUTTON} self-start`}
        >
          Check now
        </button>
      )}
    </div>
  )
}

/** The Social tab: how strong the brand's marketing is, per platform and overall. */
export function SocialPanel({ orgSlug }: SocialPanelProps): JSX.Element {
  const social = useAgentSocial(orgSlug)
  const report = social.report
  return (
    <div className="flex flex-col gap-4">
      {social.loadError && <p className={NOTE}>{social.loadError}</p>}
      {report && !report.checkedAt && <FirstCheck report={report} social={social} />}
      {report?.checkedAt && <Ready report={report} social={social} />}
      {social.checkError && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {social.checkError}
        </p>
      )}
    </div>
  )
}
