'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { VercelSpinner } from '@/features/catalyst/components/VercelSpinner'
import { useActiveProject } from '@/hooks/useActiveProject'

/**
 * Bare `/dashboard` has no brand in the URL — resolve the user's default brand
 * (last-viewed via the store, else their first) and redirect to its slug-scoped
 * dashboard. The layout's DashboardProjectGuard already sends brand-less users
 * to onboarding, so by the time this renders a brand exists.
 */
export default function DashboardIndexPage(): JSX.Element {
  const router = useRouter()
  const { orgSlug } = useActiveProject()

  useEffect(() => {
    if (orgSlug) router.replace(`/dashboard/${orgSlug}`)
  }, [orgSlug, router])

  return (
    <div className="grid min-h-svh place-items-center bg-[var(--cat-canvas)]">
      <VercelSpinner size={22} />
    </div>
  )
}
