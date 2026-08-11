export type Role = 'Owner' | 'Admin' | 'Member'
export type BrandStatus = 'active' | 'paused'

export interface Brand {
  slug: string
  name: string
  url: string
  plan: string
  geoScore: number
  visibility: number
  status: BrandStatus
  lastRun: string
  members: number
}

/** Badge classes per role, shared by the members table and its legend. */
export const ROLE_STYLES: Record<Role, string> = {
  Owner: 'bg-[rgba(224,74,61,0.12)] text-[#e04a3d]',
  Admin: 'bg-[rgba(37,99,235,0.12)] text-[#2563EB]',
  Member: 'bg-[var(--cat-hover)] text-[var(--cat-ink-2)]',
}

/** What each role can do — the legend under the members table. */
export const ROLES: ReadonlyArray<{ role: Role; desc: string }> = [
  { role: 'Owner', desc: 'Full access, including billing and deleting the brand.' },
  { role: 'Admin', desc: 'Manage brand settings, integrations and members.' },
  { role: 'Member', desc: 'View reports and work through assigned actions.' },
]
