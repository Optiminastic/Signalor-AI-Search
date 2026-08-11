import {
  BarChart3,
  Blocks,
  Building2,
  Eye,
  LayoutGrid,
  Lightbulb,
  Link2,
  ListChecks,
  Network,
  Search,
  User,
  Users,
} from '@/lib/icons'
import type { LucideIcon } from '@/lib/icons'

export interface SearchItem {
  type: string
  label: string
  sublabel?: string
  href: string
  icon: LucideIcon
}

const PAGE_ITEMS: SearchItem[] = [
  {
    type: 'Page',
    label: 'Overview',
    sublabel: 'Dashboard home',
    href: '',
    icon: LayoutGrid,
  },
  {
    type: 'Page',
    label: 'Visibility',
    sublabel: 'Answer-engine visibility',
    href: 'visibility',
    icon: Eye,
  },
  {
    type: 'Page',
    label: 'Brands',
    sublabel: 'Your tracked brands',
    href: '/dashboard/brands',
    icon: Building2,
  },
  {
    type: 'Page',
    label: 'Competitors',
    sublabel: 'Competitive landscape',
    href: 'competitors',
    icon: Users,
  },
  {
    type: 'Page',
    label: 'Prompt Tracker',
    sublabel: 'Tracked prompts',
    href: 'prompt-tracker',
    icon: Search,
  },
  {
    type: 'Page',
    label: 'Sitemap',
    sublabel: 'Crawl & audit URLs',
    href: 'sitemap',
    icon: Network,
  },
  {
    type: 'Page',
    label: 'Backlinks',
    sublabel: 'Link profile',
    href: 'backlinks',
    icon: Link2,
  },
  {
    type: 'Page',
    label: 'Analytics',
    sublabel: 'Traffic & trends',
    href: 'analytics',
    icon: BarChart3,
  },
  {
    type: 'Page',
    label: 'Recommendations',
    sublabel: 'Suggested actions',
    href: 'recommendations',
    icon: Lightbulb,
  },
  {
    type: 'Page',
    label: 'Actions',
    sublabel: 'Your work queue',
    href: 'tasks',
    icon: ListChecks,
  },
  {
    type: 'Page',
    label: 'Integrations',
    sublabel: 'Connect data sources',
    href: 'integrations',
    icon: Blocks,
  },
  {
    type: 'Account',
    label: 'Profile & billing',
    sublabel: 'Manage your account',
    href: '/profile',
    icon: User,
  },
]

export const SEARCH_INDEX: SearchItem[] = PAGE_ITEMS

/** Case-insensitive substring match over label + sublabel; top 8. */
export function searchIndex(query: string): SearchItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return SEARCH_INDEX.filter(
    item =>
      item.label.toLowerCase().includes(q) || (item.sublabel?.toLowerCase().includes(q) ?? false),
  ).slice(0, 8)
}
