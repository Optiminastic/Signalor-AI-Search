'use client'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { ListingCard } from '@/features/catalyst/components/agent-page/business/ListingCard'
import { ListingForm } from '@/features/catalyst/components/agent-page/business/ListingForm'
import { useBusinessProfile, type BusinessProfile } from '@/hooks/useBusinessProfile'
import type { BusinessProfileReport } from '@/lib/api/agent-mode-business-profile'

interface BusinessProfilePanelProps {
  orgSlug: string
}

const NOTE = 'text-[12.5px] text-[var(--cat-ink-2)]'

const STATUS_TEXT: Record<Exclude<BusinessProfileReport['status'], 'found'>, string> = {
  never_checked:
    'See whether your business has a Google Business Profile: the listing on Google Maps and in search.',
  not_found:
    'No Google Business Profile found for your business. Fill in the details below; the agent will use them to create your listing once Google gives Signalor access.',
  unknown: 'The last check couldn’t reach Google. Try again in a few minutes.',
}

interface StatusProps {
  report: BusinessProfileReport
  profile: BusinessProfile
}

function StatusCard({ report, profile }: StatusProps): JSX.Element {
  const busy = profile.checking || report.checking
  const text = busy
    ? 'Searching Google for your business listing…'
    : STATUS_TEXT[report.status === 'found' ? 'unknown' : report.status]
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] p-4">
      <p className={NOTE}>{text}</p>
      {!busy && (
        <button
          type="button"
          onClick={profile.checkNow}
          className={`${SECONDARY_BUTTON} self-start`}
        >
          {report.checkedAt ? 'Check again' : 'Check now'}
        </button>
      )}
    </div>
  )
}

function Report({ report, profile }: StatusProps): JSX.Element {
  if (report.status === 'found' && report.listing) {
    return (
      <ListingCard
        listing={report.listing}
        checking={profile.checking || report.checking}
        onCheckNow={profile.checkNow}
      />
    )
  }
  return (
    <>
      <StatusCard report={report} profile={profile} />
      {report.status === 'not_found' && <ListingForm profile={profile} report={report} />}
    </>
  )
}

/** The Google Business tab: the brand's listing, or the details to create one. */
export function BusinessProfilePanel({ orgSlug }: BusinessProfilePanelProps): JSX.Element {
  const profile = useBusinessProfile(orgSlug)
  return (
    <div className="flex flex-col gap-4">
      {profile.isLoading && <p className={NOTE}>Loading…</p>}
      {profile.loadError && <p className={NOTE}>{profile.loadError}</p>}
      {profile.report && <Report report={profile.report} profile={profile} />}
      {profile.error && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {profile.error}
        </p>
      )}
    </div>
  )
}
