import { Chip } from '@/components/base/badges/chip'
import type { AccountOverview } from '@/services/account.service'

const AVATAR_BG = 'conic-gradient(from 210deg at 50% 50%, #F2A79E, #e04a3d, #b9382d, #F2A79E)'
const COVER_BG = 'linear-gradient(100deg, rgba(224,74,61,.16), rgba(224,74,61,.02) 60%)'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

interface ProfileHeaderProps {
  user: AccountOverview['user']
  planLabel: string
}

/** Cover strip + overlapping avatar + identity + plan / account-type badges. */
export function ProfileHeader({ user, planLabel }: ProfileHeaderProps): JSX.Element {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--cat-border)] bg-[var(--cat-card)] shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="h-16" style={{ background: COVER_BG }} />
      <div className="-mt-8 flex flex-wrap items-end gap-4 px-5 pb-5">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white uppercase ring-4 ring-[var(--cat-card)]"
          style={{ background: AVATAR_BG }}
        >
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1 pb-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--cat-ink)]">
            {user.name}
          </h1>
          <p className="truncate text-[13px] text-[var(--cat-ink-2)]">{user.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pb-1">
          <Chip variant="caption" color="blue">
            {planLabel} plan
          </Chip>
          <Chip variant="caption" color="neutral" className="capitalize">
            {user.accountType}
          </Chip>
        </div>
      </div>
    </section>
  )
}
