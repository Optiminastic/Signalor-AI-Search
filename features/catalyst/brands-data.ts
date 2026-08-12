import type { ChipColor } from '@/components/base/badges/chip'

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

/** Chip colour per role, shared by the members table and its legend. */
export const ROLE_CHIP_COLOR: Record<Role, ChipColor> = {
  Owner: 'rose',
  Admin: 'blue',
  Member: 'neutral',
}

/** What each role can do — the legend under the members table. */
export const ROLES: ReadonlyArray<{ role: Role; desc: string }> = [
  { role: 'Owner', desc: 'Full access, including billing and deleting the brand.' },
  { role: 'Admin', desc: 'Manage brand settings, integrations and members.' },
  { role: 'Member', desc: 'View reports and work through assigned actions.' },
]
