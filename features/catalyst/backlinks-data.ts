import type { DashStatData } from '@/features/catalyst/components/dash/DashStat'
import { BLUE, BRAND, GREEN, PURPLE, YELLOW } from '@/features/catalyst/constants'
import type { AutoBacklink } from '@/lib/api/backlinks'

/* ============================================================ Free / Paid ==
   The simpler "opportunities" table used by the Free and Paid tabs. */

export type Category = 'Directory' | 'Review' | 'Press' | 'Community' | 'Resource'
export type LinkStatus = 'suggested' | 'submitted' | 'live'

export interface BacklinkOpp {
  id: number
  name: string
  domain: string
  category: Category
  dr: number
  status: LinkStatus
}

export const BACKLINKS: BacklinkOpp[] = [
  { id: 1, name: 'G2', domain: 'g2.com', category: 'Review', dr: 92, status: 'live' },
  {
    id: 2,
    name: 'Product Hunt',
    domain: 'producthunt.com',
    category: 'Community',
    dr: 91,
    status: 'submitted',
  },
  {
    id: 3,
    name: 'Capterra',
    domain: 'capterra.com',
    category: 'Review',
    dr: 90,
    status: 'suggested',
  },
  {
    id: 4,
    name: 'TechCrunch',
    domain: 'techcrunch.com',
    category: 'Press',
    dr: 94,
    status: 'suggested',
  },
  {
    id: 5,
    name: 'Crunchbase',
    domain: 'crunchbase.com',
    category: 'Directory',
    dr: 91,
    status: 'live',
  },
  {
    id: 6,
    name: 'Indie Hackers',
    domain: 'indiehackers.com',
    category: 'Community',
    dr: 78,
    status: 'suggested',
  },
  {
    id: 7,
    name: 'SaaSHub',
    domain: 'saashub.com',
    category: 'Directory',
    dr: 72,
    status: 'suggested',
  },
  {
    id: 8,
    name: 'AlternativeTo',
    domain: 'alternativeto.net',
    category: 'Resource',
    dr: 83,
    status: 'submitted',
  },
]

export const BACKLINK_STATS: DashStatData[] = [
  { label: 'Live links', value: '2' },
  { label: 'Opportunities', value: '5' },
  { label: 'Avg DR', value: '86' },
  { label: 'Submitted', value: '2' },
]

export const STATUS_STYLE: Record<LinkStatus, string> = {
  live: 'bg-[rgba(47,190,126,0.12)] text-[#2FBE7E]',
  submitted: 'bg-[rgba(59,158,246,0.14)] text-[#3B9EF6]',
  suggested: 'bg-[var(--cat-hover)] text-[var(--cat-ink-3)]',
}

/* ============================================================ Auto backlinks ==
   The five satellite-network "sites" the auto engine publishes to. The `value`
   matches the backend `BlogPost.Site` choices (== the `site`/`category` field on
   every auto-backlink row). */

export interface SiteMeta {
  value: string
  label: string
  color: string
  initial: string
  domain: string
  /** Public path to the site's real logo (falls back to the letter badge). */
  logo: string
}

export const AUTO_SITES: SiteMeta[] = [
  {
    value: 'research',
    label: 'Research',
    color: BLUE,
    initial: 'R',
    domain: 'brightsfindings.com',
    logo: '/backlink-logos/research.svg',
  },
  {
    value: 'listicals',
    label: 'Listicals',
    color: PURPLE,
    initial: 'L',
    domain: 'thepickpost.com',
    logo: '/backlink-logos/listicals.svg',
  },
  {
    value: 'market_trends',
    label: 'Market Trends',
    color: BRAND,
    initial: 'M',
    domain: 'trendledgers.com',
    logo: '/backlink-logos/market_trends.svg',
  },
  {
    value: 'comparison',
    label: 'Comparison',
    color: GREEN,
    initial: 'C',
    domain: 'betterversus.com',
    logo: '/backlink-logos/comparison.svg',
  },
  {
    value: 'step_guide',
    label: 'Step Guide',
    color: YELLOW,
    initial: 'S',
    domain: 'guidefactories.com',
    logo: '/backlink-logos/step_guide.svg',
  },
]

export function siteMeta(value: string): SiteMeta {
  return (
    AUTO_SITES.find(s => s.value === value) ?? {
      value,
      label: value,
      color: 'var(--cat-ink-3)',
      initial: value.charAt(0).toUpperCase() || '?',
      domain: '',
      logo: '',
    }
  )
}

/** A published auto-backlink is "live" once it has a public URL. */
export function autoStatusStyle(row: AutoBacklink): { label: string; className: string } {
  const status = (row.status || '').toLowerCase()
  if (row.url && (status === 'published' || status === 'live' || status === '')) {
    return { label: 'Live', className: 'bg-[rgba(47,190,126,0.12)] text-[#2FBE7E]' }
  }
  if (status === 'published') {
    return { label: 'Published', className: 'bg-[rgba(59,158,246,0.14)] text-[#3B9EF6]' }
  }
  if (status === 'error' || status === 'failed') {
    return { label: 'Failed', className: 'bg-[rgba(229,72,77,0.12)] text-[#E5484D]' }
  }
  return {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft',
    className: 'bg-[var(--cat-hover)] text-[var(--cat-ink-3)]',
  }
}

export function formatPublished(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Group auto-backlink rows into the five fixed site buckets (empty buckets kept). */
export function groupBySite(rows: AutoBacklink[]): { site: SiteMeta; rows: AutoBacklink[] }[] {
  return AUTO_SITES.map(site => ({
    site,
    rows: rows.filter(r => r.site === site.value),
  }))
}
