'use client'

import {
  IconBugFilled,
  IconEyeFilled,
  IconMessageFilled,
  IconRosetteDiscountCheckFilled,
  type TablerIcon,
} from '@tabler/icons-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ComponentType } from 'react'

import { AnalyticsView } from '@/features/catalyst/components/analytics/AnalyticsView'
import { BrandProfileView } from '@/features/catalyst/components/brand-profile/BrandProfileView'
import { CompetitorsView } from '@/features/catalyst/components/competitors/CompetitorsView'
import { CrawlerLogsView } from '@/features/catalyst/components/crawlers/CrawlerLogsView'
import { InsightsView } from '@/features/catalyst/components/insights/InsightsView'
import { MarketIntelView } from '@/features/catalyst/components/monitoring/MarketIntelView'
import { PromptTrackerView } from '@/features/catalyst/components/prompt-tracker/PromptTrackerView'
import { SitemapView } from '@/features/catalyst/components/sitemap/SitemapView'
import { SiteOneView } from '@/features/catalyst/components/siteone/SiteOneView'
import { VisibilityView } from '@/features/catalyst/components/visibility/VisibilityView'
import { BRAND_SOFT, BRAND_STRONG } from '@/features/catalyst/constants'
import { useBrandPath } from '@/hooks/useBrandPath'

interface MonitoringView {
  key: string
  label: string
  View: ComponentType
}

interface MonitoringGroup {
  key: string
  label: string
  icon: TablerIcon
  views: MonitoringView[]
}

/**
 * Four tabs, grouped by the question each answers, with the old nine surfaces
 * kept as sub-views. Nine top-level tabs made the bar scroll and gave equal
 * weight to a daily surface (Prompts) and a rarely-opened one (SiteOne).
 *
 * Prompts leads because it is what the section is for: everything else explains
 * why a prompt is won or lost.
 */
const GROUPS: MonitoringGroup[] = [
  {
    key: 'prompts',
    label: 'Prompts',
    icon: IconMessageFilled,
    views: [{ key: 'prompts', label: 'Prompts', View: PromptTrackerView }],
  },
  {
    key: 'visibility',
    label: 'Visibility',
    icon: IconEyeFilled,
    views: [
      { key: 'overview', label: 'Overview', View: VisibilityView },
      { key: 'insights', label: 'Trends', View: InsightsView },
      { key: 'competitors', label: 'Competitors', View: CompetitorsView },
      // Moved off Actions: it is evidence to read, not work to start.
      { key: 'intel', label: 'Market Intel', View: MarketIntelView },
    ],
  },
  {
    key: 'website',
    label: 'Website',
    icon: IconBugFilled,
    views: [
      { key: 'sitemap', label: 'Sitemap', View: SitemapView },
      { key: 'siteone', label: 'Health', View: SiteOneView },
      { key: 'crawlers', label: 'Crawlers', View: CrawlerLogsView },
    ],
  },
  {
    key: 'brand',
    label: 'Brand',
    icon: IconRosetteDiscountCheckFilled,
    views: [
      { key: 'profile', label: 'Profile', View: BrandProfileView },
      { key: 'analytics', label: 'Analytics', View: AnalyticsView },
    ],
  },
]

interface Selection {
  group: MonitoringGroup
  view: MonitoringView
}

/**
 * Resolve `?tab=` + `?view=`. Old single-level links (`?tab=insights`) still
 * work: an unknown tab is looked up among the sub-views before falling back.
 */
function resolve(tab: string | null, view: string | null): Selection {
  const group = GROUPS.find(g => g.key === tab)
  if (group) {
    return { group, view: group.views.find(v => v.key === view) ?? group.views[0] }
  }
  for (const candidate of GROUPS) {
    const legacy = candidate.views.find(v => v.key === tab)
    if (legacy) return { group: candidate, view: legacy }
  }
  return { group: GROUPS[0], view: GROUPS[0].views[0] }
}

function GroupTabs({ active }: { active: MonitoringGroup }): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--cat-border)]">
      {GROUPS.map(group => {
        const on = group.key === active.key
        return (
          <Link
            key={group.key}
            href={`${brandPath('visibility')}?tab=${group.key}`}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
              on
                ? 'border-[#e04a3d] text-[var(--cat-ink)]'
                : 'border-transparent text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
            }`}
          >
            <group.icon size={15} />
            {group.label}
          </Link>
        )
      })}
    </div>
  )
}

/**
 * Sub-nav for groups holding more than one surface.
 *
 * Brand-soft chips, the app's active-item affordance (sidebar nav, task status
 * pills) — deliberately NOT the segmented track control, which this dashboard
 * uses for filters (date range, series toggle) and would read as one here.
 */
function ViewTabs({
  group,
  active,
}: {
  group: MonitoringGroup
  active: MonitoringView
}): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <div className="mt-3 flex shrink-0 items-center gap-1 overflow-x-auto">
      {group.views.map(view => {
        const on = view.key === active.key
        return (
          <Link
            key={view.key}
            href={`${brandPath('visibility')}?tab=${group.key}&view=${view.key}`}
            className={`rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
              on ? 'font-semibold' : 'font-medium hover:bg-[var(--cat-hover)]'
            }`}
            style={
              on ? { background: BRAND_SOFT, color: BRAND_STRONG } : { color: 'var(--cat-ink-2)' }
            }
          >
            {view.label}
          </Link>
        )
      })}
    </div>
  )
}

/** Tabbed Signals surface — every view stays linkable via `?tab=` / `?view=`. */
export function MonitoringTabs(): JSX.Element {
  const params = useSearchParams()
  const { group, view } = resolve(params.get('tab'), params.get('view'))
  const ActiveView = view.View

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <GroupTabs active={group} />
      {group.views.length > 1 && <ViewTabs group={group} active={view} />}
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <ActiveView />
      </div>
    </div>
  )
}
