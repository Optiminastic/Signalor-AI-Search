'use client'

import { MembersTable } from '@/features/catalyst/components/brands/MembersTable'
import { useAgencyRole } from '@/hooks/useAgencyRole'

import { SectionCard } from './section-card'

/**
 * Agency-admin-only team management, embedded on the profile/settings page.
 * Replaces the old /dashboard/team route so Team lives only here — renders
 * nothing for non-admins.
 */
export function TeamCard(): JSX.Element | null {
  const { isAdmin } = useAgencyRole()
  if (!isAdmin) return null

  return (
    <SectionCard
      title="Team"
      description="Invite up to 2 teammates. Members work on actions you assign to them across your brands."
    >
      <MembersTable />
    </SectionCard>
  )
}
