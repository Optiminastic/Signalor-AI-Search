'use client'

import {
  IconAffiliateFilled,
  IconHelpCircleFilled,
  IconMoonFilled,
  IconSparklesFilled,
  IconSunFilled,
} from '@tabler/icons-react'
import Link from 'next/link'

import { useCatalystTheme } from '@/features/catalyst/components/CatalystThemeProvider'
import { NavGroup } from '@/features/catalyst/components/NavGroup'
import { NavItem } from '@/features/catalyst/components/NavItem'
import { SidebarLogo } from '@/features/catalyst/components/SidebarLogo'
import { SidebarUser } from '@/features/catalyst/components/SidebarUser'
import { WorkspaceSwitcher } from '@/features/catalyst/components/WorkspaceSwitcher'
import {
  ACTIONS_NAV,
  INTEGRATIONS_NAV,
  MAIN_NAV,
  OPTIMIZATION_NAV,
  SIGNALS_NAV,
  SOCIALS_NAV,
} from '@/features/catalyst/constants'
import { useTaskCount } from '@/hooks/useTaskCount'
import { X } from '@/lib/icons'

const FOOTER_ROW =
  'flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-card)] hover:text-[var(--cat-ink)]'

function DarkModeToggle(): JSX.Element {
  const { dark, toggle } = useCatalystTheme()
  return (
    <button type="button" onClick={toggle} className={FOOTER_ROW}>
      {dark ? <IconSunFilled size={17} /> : <IconMoonFilled size={17} />}
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

/** Plan card + utility links (dark mode, help), pinned above the user card. */
function SidebarFooter({ collapsed }: { collapsed: boolean }): JSX.Element {
  if (collapsed) return <></>
  return (
    <div className="flex flex-col gap-0.5">
      <DarkModeToggle />
      <Link href="/help" className={FOOTER_ROW}>
        <IconHelpCircleFilled size={17} />
        Help
      </Link>
    </div>
  )
}

interface SidebarContentProps {
  collapsed: boolean
  onClose?: () => void
}

/**
 * The six consolidated nav entries — Overview, Actions, then Monitor / Optimize
 * as collapsible groups, Integrations and Socials — so the rail reads at a glance
 * instead of a long flat list. Each group auto-expands on one of its pages.
 */
function SidebarNav({ collapsed }: { collapsed: boolean }): JSX.Element {
  const taskCount = useTaskCount()
  // Real open-task count on the Actions item (hidden when 0), not a hardcoded badge.
  const actionsNav = { ...ACTIONS_NAV, badge: taskCount || undefined }
  // The whole sidebar scrolls (see Sidebar.tsx), so the nav is a plain column.
  //
  // Expanded, px-1 keeps the selected row's ring clear of that scroll clip. It
  // must not survive the collapse: the rail's content box is exactly 36px and a
  // collapsed row is a fixed w-9, so 4px of left padding pushed every icon 4px
  // right of the centre line the logo, brand tile and avatar all sit on — the
  // nav was the one thing in the rail that wasn't centred.
  return (
    <div className={`mt-4 flex flex-col gap-0.5 ${collapsed ? 'items-center' : 'px-1'}`}>
      <NavItem {...MAIN_NAV[0]} collapsed={collapsed} />
      <NavItem {...actionsNav} collapsed={collapsed} />
      <NavItem {...SIGNALS_NAV} collapsed={collapsed} />
      <NavGroup
        icon={IconSparklesFilled}
        label="Optimize"
        items={OPTIMIZATION_NAV}
        collapsed={collapsed}
      />
      <NavItem {...INTEGRATIONS_NAV} collapsed={collapsed} />
      <NavGroup
        icon={IconAffiliateFilled}
        label="Socials"
        items={SOCIALS_NAV}
        collapsed={collapsed}
      />
    </div>
  )
}

export function SidebarContent({ collapsed, onClose }: SidebarContentProps): JSX.Element {
  // shrink-0 on the header + footer so a tall sidebar (high zoom) compresses the
  // scrolling nav, never the pinned brand card / user — that compression was
  // clipping the brand card's top content.
  return (
    <>
      <div className="shrink-0">
        <div className="flex items-center pb-0.5">
          <SidebarLogo collapsed={collapsed} />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="ml-auto grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)] lg:hidden"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>
      <SidebarNav collapsed={collapsed} />
      {/* mt-auto pins the footer to the bottom when the sidebar has room; when
          content is taller than the panel the whole sidebar scrolls instead. */}
      <div className="mt-auto shrink-0 pt-2">
        <SidebarFooter collapsed={collapsed} />
        <SidebarUser collapsed={collapsed} />
      </div>
    </>
  )
}
