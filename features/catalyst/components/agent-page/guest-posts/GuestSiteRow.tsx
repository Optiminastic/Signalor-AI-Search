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
  pitch_waiting: 'Pitch waiting for you',
  pitching: 'Sending pitch',
  pitched: 'Pitched',
  failed: 'Couldn’t pitch',
  skipped: 'Skipped',
}
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
const CITED_CHIP =
  'rounded-sm bg-[rgba(224,74,61,0.1)] px-1.5 text-[10.5px] font-semibold text-[#e04a3d]'

function pitchDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function StatusAction({ site, onStatus }: GuestSiteRowProps): JSX.Element | null {
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
  const when = site.stage === 'to_pitch' ? ` · pitch from ${pitchDate(site.scheduledFor)}` : ''
  return (
    <p className={MUTED}>
      {STAGE_LABELS[site.stage]}
      {when} ·{' '}
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
        </p>
        <p className="text-[12.5px] text-[var(--cat-ink-2)]">{site.reason}</p>
        <StageLine site={site} />
      </div>
      <StatusAction site={site} onStatus={onStatus} />
    </li>
  )
}
