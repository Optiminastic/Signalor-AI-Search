'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAgencyMembers,
  inviteAgencyMember,
  removeAgencyMember,
  type AgencyMember,
} from '@/lib/api/agency'
import { useSession } from '@/lib/auth-client'

/** Fire the invite email. Never throws — see the call site for why. */
async function notifyInvitee(to: string, role: string): Promise<void> {
  try {
    await fetch('/api/email/team-invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to, role }),
    })
  } catch {
    // The invite itself succeeded; the roster will show the member either way.
  }
}

export interface UseAgencyMembersResult {
  members: AgencyMember[]
  isLoading: boolean
  invite: (memberEmail: string) => Promise<void>
  remove: (memberId: number) => Promise<void>
  isMutating: boolean
}

/** Loads + mutates the current admin's agency team (invite / remove). */
export function useAgencyMembers(enabled: boolean): UseAgencyMembersResult {
  const { data: session } = useSession()
  const email = session?.user?.email ?? undefined
  const qc = useQueryClient()
  const key = ['agency', 'members', email ?? '']

  const query = useQuery({
    queryKey: key,
    queryFn: () => getAgencyMembers(email as string),
    enabled: Boolean(email) && enabled,
  })

  const inviteMutation = useMutation({
    mutationFn: async (memberEmail: string): Promise<AgencyMember> => {
      const member = await inviteAgencyMember(email as string, memberEmail)
      // Announce it. The backend records the membership and sends nothing, so
      // without this the invitee has access and no way of knowing. Deliberately
      // after the invite resolves and deliberately swallowed: the membership is
      // already committed, so a mail fault must not surface as a failed invite
      // the admin then retries into a 409 "already on your team".
      await notifyInvitee(memberEmail, member.role)
      return member
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const removeMutation = useMutation({
    mutationFn: (memberId: number) => removeAgencyMember(email as string, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    invite: async (memberEmail: string) => {
      await inviteMutation.mutateAsync(memberEmail)
    },
    remove: async (memberId: number) => {
      await removeMutation.mutateAsync(memberId)
    },
    isMutating: inviteMutation.isPending || removeMutation.isPending,
  }
}
