'use client'

import { useState } from 'react'

import { Chip } from '@/components/base/badges/chip'
import { ROLES, ROLE_CHIP_COLOR, type Role } from '@/features/catalyst/brands-data'
import { useAgencyMembers } from '@/hooks/useAgencyMembers'
import { useAgencyRole } from '@/hooks/useAgencyRole'
import type { AgencyMember } from '@/lib/api/agency'
import { ApiError } from '@/lib/api/client'
import { Trash2, UserPlus } from '@/lib/icons'

interface DisplayRow {
  id: number | null // null = the owner (no membership row)
  email: string
  roleLabel: Role
  /** Invited but not yet active. Such a row grants no access at all yet. */
  pending: boolean
  locked: boolean
}

function RoleBadge({ roleLabel }: { roleLabel: Role }): JSX.Element {
  return (
    <Chip variant="subtle" color={ROLE_CHIP_COLOR[roleLabel]}>
      {roleLabel}
    </Chip>
  )
}

function MemberRow({
  row,
  onRemove,
}: {
  row: DisplayRow
  onRemove: (id: number) => void
}): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(224,74,61,0.12)] text-[12px] font-semibold text-[#e04a3d] uppercase">
        {row.email[0]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[var(--cat-ink)]">{row.email}</p>
        {/* An invited row reaches nothing until it goes active, and it looked
            identical to a working one - the roster read as "they have access"
            when the backend grants none. */}
        {row.pending && (
          <p className="text-[11px] text-[var(--cat-ink-3)]">Invited, not active yet</p>
        )}
      </div>
      <RoleBadge roleLabel={row.roleLabel} />
      <button
        type="button"
        onClick={() => row.id !== null && onRemove(row.id)}
        disabled={row.locked}
        className="grid h-8 w-8 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[#E5484D] disabled:opacity-30"
        aria-label="Remove member"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

function InviteRow({
  value,
  setValue,
  onInvite,
  busy,
}: {
  value: string
  setValue: (v: string) => void
  onInvite: () => void
  busy: boolean
}): JSX.Element {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onInvite()}
        placeholder="teammate@company.com"
        className="h-9 flex-1 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 text-[13px] text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)]"
      />
      <button
        type="button"
        onClick={onInvite}
        disabled={busy}
        className="flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[13px] font-medium text-white disabled:opacity-60"
        style={{ background: '#e04a3d' }}
      >
        <UserPlus size={15} />
        Invite
      </button>
    </div>
  )
}

function RolesLegend(): JSX.Element {
  return (
    <div className="grid gap-1.5 rounded-lg border border-[var(--cat-border)] bg-[var(--cat-bg)] p-4 sm:grid-cols-2">
      {ROLES.map(r => (
        <div key={r.role} className="flex items-start gap-2">
          <Chip variant="caption" color={ROLE_CHIP_COLOR[r.role]} className="mt-0.5">
            {r.role}
          </Chip>
          <p className="text-[12px] text-[var(--cat-ink-3)]">{r.desc}</p>
        </div>
      ))}
    </div>
  )
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function rosterRows(agencyEmail: string, members: AgencyMember[]): DisplayRow[] {
  return [
    { id: null, email: agencyEmail, roleLabel: 'Owner', pending: false, locked: true },
    // The API returns each member's real role, and this hardcoded 'Member',
    // so an Admin teammate was labelled — and colour-coded — as a plain Member.
    ...members.map(m => ({
      id: m.id,
      email: m.member_email,
      roleLabel: m.role === 'admin' ? ('Admin' as const) : ('Member' as const),
      pending: m.status === 'invited',
      locked: false,
    })),
  ]
}

/** The admin's team roster: invite input + owner/member rows + legend. */
function TeamRoster({ agencyEmail }: { agencyEmail: string }): JSX.Element {
  const { members, invite, remove, isMutating } = useAgencyMembers(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [error, setError] = useState('')

  const onInvite = async (): Promise<void> => {
    const email = inviteEmail.trim().toLowerCase()
    setError('')
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    try {
      await invite(email)
      setInviteEmail('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not invite that teammate.')
    }
  }

  return (
    <div className="space-y-4">
      <InviteRow
        value={inviteEmail}
        setValue={setInviteEmail}
        onInvite={onInvite}
        busy={isMutating}
      />
      {error && <p className="text-[12px] font-medium text-[#E5484D]">{error}</p>}
      <div className="cat-card-edge divide-y divide-[var(--cat-border)] overflow-hidden rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
        {rosterRows(agencyEmail, members).map(row => (
          <MemberRow key={row.email} row={row} onRemove={remove} />
        ))}
      </div>
      <RolesLegend />
    </div>
  )
}

/** Agency team management — invite up to 2 teammates, all Members; the owner is Admin. */
export function MembersTable(): JSX.Element {
  const { agencyEmail, isAdmin, isLoading } = useAgencyRole()

  if (isLoading) {
    return <p className="text-[13px] text-[var(--cat-ink-3)]">Loading team…</p>
  }
  if (!isAdmin) {
    return (
      <p className="rounded-lg border border-[var(--cat-border)] bg-[var(--cat-bg)] px-4 py-3 text-[13px] text-[var(--cat-ink-3)]">
        Only the agency admin can manage the team.
      </p>
    )
  }
  return <TeamRoster agencyEmail={agencyEmail ?? 'You'} />
}
