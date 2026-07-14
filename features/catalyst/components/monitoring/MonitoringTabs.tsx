'use client'

import { BarChart3, Eye, Gauge, MessageSquareText, Network } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ComponentType } from 'react'

import { AnalyticsView } from '@/features/catalyst/components/analytics/AnalyticsView'
import { PromptTrackerView } from '@/features/catalyst/components/prompt-tracker/PromptTrackerView'
import { SitemapView } from '@/features/catalyst/components/sitemap/SitemapView'
import { SiteOneView } from '@/features/catalyst/components/siteone/SiteOneView'
import { VisibilityView } from '@/features/catalyst/components/visibility/VisibilityView'
import { useBrandPath } from '@/hooks/useBrandPath'

interface MonitoringTab {
  key: string
  label: string
  icon: LucideIcon
  View: ComponentType
}

const TABS: MonitoringTab[] = [
  { key: 'visibility', label: 'Visibility', icon: Eye, View: VisibilityView },
  { key: 'prompts', label: 'Prompt Tracking', icon: MessageSquareText, View: PromptTrackerView },
  { key: 'sitemap', label: 'Sitemap', icon: Network, View: SitemapView },
  { key: 'siteone', label: 'SiteOne', icon: Gauge, View: SiteOneView },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, View: AnalyticsView },
]

/** Tabbed Monitoring surface: Visibility hosts Prompt Tracking, Sitemap and
 * Analytics as tabs (selected via the `?tab=` query param, so each is linkable). */
export function MonitoringTabs(): JSX.Element {
  const params = useSearchParams()
  const brandPath = useBrandPath()
  const current = params.get('tab') ?? 'visibility'
  const active = TABS.find(t => t.key === current) ?? TABS[0]
  const ActiveView = active.View

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--cat-border)]">
        {TABS.map(tab => {
          const on = tab.key === active.key
          return (
            <Link
              key={tab.key}
              href={`${brandPath('visibility')}?tab=${tab.key}`}
              className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                on
                  ? 'border-[#e04a3d] text-[var(--cat-ink)]'
                  : 'border-transparent text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </Link>
          )
        })}
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <ActiveView />
      </div>
    </div>
  )
}
