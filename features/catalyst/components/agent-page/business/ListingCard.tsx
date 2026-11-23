import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { BusinessListing } from '@/lib/api/agent-mode-business-profile'

interface ListingCardProps {
  listing: BusinessListing
  checking: boolean
  onCheckNow: () => void
}

const NOTE = 'text-[12.5px] text-[var(--cat-ink-2)]'

function ratingText(listing: BusinessListing): string {
  if (listing.rating === null) return 'No reviews yet'
  const reviews = listing.reviews ?? 0
  return `${listing.rating.toFixed(1)} stars · ${reviews} review${reviews === 1 ? '' : 's'}`
}

/** The brand's Google Business Profile, as Google shows it. */
export function ListingCard({ listing, checking, onCheckNow }: ListingCardProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[var(--cat-ink)]">{listing.name}</p>
          {listing.category && <p className={NOTE}>{listing.category}</p>}
        </div>
        <button type="button" disabled={checking} onClick={onCheckNow} className={SECONDARY_BUTTON}>
          {checking ? 'Checking…' : 'Check again'}
        </button>
      </div>
      {listing.address && <p className={NOTE}>{listing.address}</p>}
      <p className={NOTE}>{ratingText(listing)}</p>
      {listing.link && (
        <a
          href={listing.link}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-[12.5px] font-medium text-[#e04a3d] hover:underline"
        >
          Open on Google Maps
        </a>
      )}
    </div>
  )
}
