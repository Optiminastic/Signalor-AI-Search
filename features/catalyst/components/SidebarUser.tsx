'use client'

import Link from 'next/link'

import { useSession } from '@/lib/auth-client'
import { ChevronDown } from '@/lib/icons'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U'
}

function UserAvatar({ name }: { name: string }): JSX.Element {
  return (
    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#e04a3d] text-[12px] font-semibold text-white">
      {initials(name)}
    </span>
  )
}

/** Bottom user card — links to the profile page, shows the signed-in user. */
export function SidebarUser({ collapsed }: { collapsed?: boolean }): JSX.Element {
  const { data: session } = useSession()
  const name = session?.user?.name?.trim() || 'Your account'
  const email = session?.user?.email ?? 'Manage profile & billing'

  if (collapsed) {
    return (
      <Link
        href="/profile"
        title={name}
        aria-label={name}
        className="mt-3 flex justify-center border-t border-[var(--cat-border-soft)] pt-3"
      >
        <UserAvatar name={name} />
      </Link>
    )
  }

  // BoardUI's "team" card: the same tertiary grey as the project switcher, with
  // the chevron in its own small boxed button.
  return (
    <Link
      href="/profile"
      className="bg-background-primary-default hover:bg-background-secondary-hover mt-3.5 flex items-center gap-2.5 rounded-2xl border border-[var(--cat-border-soft)] p-2 transition-colors focus-visible:ring-2 focus-visible:ring-[rgba(224,74,61,0.4)] focus-visible:outline-none"
    >
      <UserAvatar name={name} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-[var(--cat-ink)]">
          {name}
        </span>
        <span className="block truncate text-xs text-[var(--cat-ink-3)]">{email}</span>
      </span>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--cat-card)] text-[var(--cat-ink-3)] shadow-xs">
        <ChevronDown size={14} />
      </span>
    </Link>
  )
}
