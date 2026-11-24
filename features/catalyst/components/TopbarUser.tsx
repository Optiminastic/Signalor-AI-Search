'use client'

import Link from 'next/link'

import { useSession } from '@/lib/auth-client'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U'
}

/** Avatar in the top bar linking to the profile page. */
export function TopbarUser(): JSX.Element {
  const { data: session } = useSession()
  const name = session?.user?.name?.trim() || 'Your account'
  return (
    <Link
      href="/profile"
      aria-label={`${initials(name)}, your account`}
      title={name}
      className="bg-primary-strong grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white"
    >
      {initials(name)}
    </Link>
  )
}
