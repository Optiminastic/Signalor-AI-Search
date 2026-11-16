'use client'

import {
  SECONDARY_BUTTON,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { GuestSiteRow } from '@/features/catalyst/components/agent-page/guest-posts/GuestSiteRow'
import { useGuestPosts, type GuestPosts } from '@/hooks/useGuestPosts'

interface GuestPostsPanelProps {
  orgSlug: string
}

interface GuestPartProps {
  guest: GuestPosts
}

const NOTE = 'text-[12.5px] text-[var(--cat-ink-2)]'
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
const DEFAULT_CAP = 8

function lastSearchText(guest: GuestPosts): string {
  const report = guest.report
  if (!report?.lastSearchAt) return 'The agent searches every week.'
  const day = new Date(report.lastSearchAt).toLocaleDateString()
  return `Last search ${day}: ${report.lastFound ?? 0} new site(s).`
}

function SearchBar({ guest }: GuestPartProps): JSX.Element {
  const busy = guest.finding || Boolean(guest.report?.searching)
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={MUTED}>
        {busy ? 'Searching for sites… this takes a minute or two.' : lastSearchText(guest)}
      </p>
      <button type="button" disabled={busy} onClick={guest.findNow} className={SECONDARY_BUTTON}>
        Find sites now
      </button>
    </div>
  )
}

function Sites({ guest }: GuestPartProps): JSX.Element {
  const sites = guest.report?.sites ?? []
  if (!sites.length) {
    return (
      <p className={NOTE}>
        No sites yet. The agent looks for sites in your niche that invite guest articles.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {sites.map(site => (
        <GuestSiteRow key={site.taskId} site={site} onStatus={guest.setStatus} />
      ))}
    </ul>
  )
}

/**
 * Sites in the brand's niche that invite guest articles. The agent pitches each
 * one from the brand's Gmail (every email approved by the owner), writes the
 * article once an editor says yes, and checks it went live.
 */
export function GuestPostsPanel({ orgSlug }: GuestPostsPanelProps): JSX.Element {
  const guest = useGuestPosts(orgSlug)
  if (guest.isLoading) return <p className={NOTE}>Loading…</p>
  if (guest.loadError) return <p className={NOTE}>{guest.loadError}</p>
  return (
    <div className="flex flex-col gap-4">
      <p className={NOTE}>
        Sites in your niche that publish guest articles. Every pitch, article and reply is shown to
        you for approval before it’s sent, and the agent never pays for links. Up to{' '}
        {guest.report?.monthlyCap ?? DEFAULT_CAP} new pitches a month.
      </p>
      <SearchBar guest={guest} />
      {guest.actionError && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {guest.actionError}
        </p>
      )}
      <section className="flex flex-col gap-2">
        <h3 className={SECTION_TITLE}>Sites this month</h3>
        <Sites guest={guest} />
      </section>
      {guest.report?.notes.map(note => (
        <p key={note} className={MUTED}>
          {note}
        </p>
      ))}
    </div>
  )
}
