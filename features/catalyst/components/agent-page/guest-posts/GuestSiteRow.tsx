import { useAgentUi } from '@/features/catalyst/components/agent-page/AgentUiContext'
import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { SiteFavicon } from '@/features/catalyst/components/agent-page/guest-posts/SiteFavicon'
import type { PlanTaskChoice } from '@/lib/api/agent-mode-approvals'
import type { GuestSite, GuestStage } from '@/lib/api/agent-mode-guest-posts'

interface GuestSiteRowProps {
  site: GuestSite
  onStatus: (taskId: number, status: PlanTaskChoice) => void
}

const STAGE_LABELS: Record<GuestStage, string> = {
  to_pitch: 'To pitch',
  needs_contact: 'No editor email found',
  pitch_waiting: 'Pitch ready for your review',
  pitching: 'Working on the pitch',
  pitched: 'Pitched',
  replied: 'Editor replied',
  declined: 'Editor declined',
  no_reply: 'No reply',
  failed: 'Couldn’t pitch',
  skipped: 'Skipped',
}
/** Stages where the owner has something to do in Approvals, and the button that takes them there. */
const REVIEW_LABELS: Partial<Record<GuestStage, string>> = {
  pitch_waiting: 'Review pitch',
  needs_contact: 'Add a contact',
}
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
const CITED_CHIP =
  'rounded-sm bg-[rgba(224,74,61,0.1)] px-1.5 text-[10.5px] font-semibold text-[#e04a3d]'
const REVIEW_BUTTON =
  'shrink-0 rounded-md bg-[#e04a3d] px-2.5 py-1 text-[12px] font-semibold text-white hover:opacity-90'

function shortDate(iso: string): string {
  const date = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso)
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** Where the site stands, in a few words: when it's pitched, follow-ups, a reply. */
function stageDetail(site: GuestSite): string {
  const { pitch } = site
  if (site.stage === 'to_pitch') return ` · pitch from ${shortDate(site.scheduledFor)}`
  if (site.stage === 'replied') return ' · read the reply in your Gmail'
  if (!pitch) return ''
  const sent = ` ${shortDate(pitch.sentOn)}`
  const followUps = pitch.followupsSent ? ` · ${pitch.followupsSent} follow-up(s) sent` : ''
  const next =
    site.stage === 'pitched' && pitch.nextFollowUpOn
      ? ` · next follow-up ${shortDate(pitch.nextFollowUpOn)}`
      : ''
  return `${sent}${followUps}${next}`
}

function StatusAction({ site, onStatus }: GuestSiteRowProps): JSX.Element | null {
  const { setTab } = useAgentUi()
  const review = REVIEW_LABELS[site.stage]
  if (review) {
    return (
      <button type="button" className={REVIEW_BUTTON} onClick={() => setTab('approvals')}>
        {review}
      </button>
    )
  }
  if (site.stage !== 'to_pitch' && site.stage !== 'skipped') return null
  const skip = site.stage === 'to_pitch'
  return (
    <button
      type="button"
      className={SECONDARY_BUTTON}
      onClick={() => onStatus(site.taskId, skip ? 'skipped' : 'planned')}
    >
      {skip ? 'Skip' : 'Restore'}
    </button>
  )
}

function StageLine({ site }: { site: GuestSite }): JSX.Element {
  return (
    <p className={MUTED}>
      {STAGE_LABELS[site.stage]}
      {stageDetail(site)} ·{' '}
      <a
        href={site.guidelinesUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--cat-ink)]"
      >
        Their guidelines
      </a>
    </p>
  )
}

/** One site that invites guest articles: why it was picked, its guidelines, and where it stands. */
export function GuestSiteRow({ site, onStatus }: GuestSiteRowProps): JSX.Element {
  const dimmed = site.stage === 'skipped' ? 'opacity-60' : ''
  return (
    <li
      className={`flex items-start gap-3 rounded-lg border border-[var(--cat-border)] px-3 py-2.5 ${dimmed}`}
    >
      <SiteFavicon domain={site.domain} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-[13.5px] font-medium text-[var(--cat-ink)]">
          {site.domain}
          {site.source === 'cited' && <span className={CITED_CHIP}>Cited by AI</span>}
          {site.source === 'competitor' && (
            <span className={CITED_CHIP}>Covers your competitors</span>
          )}
        </p>
        <p className="text-[12.5px] text-[var(--cat-ink-2)]">{site.reason}</p>
        <StageLine site={site} />
      </div>
      <StatusAction site={site} onStatus={onStatus} />
    </li>
  )
}
