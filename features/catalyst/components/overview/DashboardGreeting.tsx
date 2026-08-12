'use client'

import { OverviewActions } from '@/features/catalyst/components/OverviewActions'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useSession } from '@/lib/auth-client'

function firstNameOf(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.includes('@')) return trimmed.split('@')[0]
  return trimmed.split(' ')[0] || trimmed
}

/**
 * Page header for the dashboard Overview: the greeting on the left and this
 * page's toolbar (range, engine filter, Re-analyze) right-aligned on the same
 * line. The account avatar/search/notifications live once in the shared
 * GlobalBar; the page's own controls sit here in the content flow.
 */
export function DashboardGreeting(): JSX.Element {
  const { data: session } = useSession()
  const { activeOrg } = useActiveProject()

  const raw = session?.user?.name || session?.user?.email || 'there'
  const name = firstNameOf(raw)

  return (
    // relative z-30: `cat-rise`/`cat-stagger` animate transform+opacity, which
    // makes every grid child its own stacking context. Without an explicit
    // z-index here the toolbar's dropdowns are trapped in this row's context and
    // the later sibling cards paint over them. Stays under the topbar's z-40.
    <div className="cat-rise relative z-30 col-span-full mb-0.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        {/* No emoji: DESIGN.md §0.7 lists it as a never-ship tell, and a waving
            hand in the page's opening line is the most visible place to have one. */}
        {/* font-bold matches every other page title in the dashboard (12 of them);
            this was the only semibold one, so page headers changed weight as you
            navigated between sections. */}
        <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
          Welcome back, {name}
        </h1>
        <p className="mt-0.5 text-[13px] text-[var(--cat-ink-2)]">
          {activeOrg
            ? `Here’s what’s happening with ${activeOrg.name} today.`
            : 'Here’s what’s happening today.'}
        </p>
      </div>
      <OverviewActions />
    </div>
  )
}
