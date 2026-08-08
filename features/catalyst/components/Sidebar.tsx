'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { SidebarContent } from '@/features/catalyst/components/SidebarContent'
import { useUiStore } from '@/stores/useUiStore'

// BoardUI's exact sidebar panel: a background/secondary surface with the large
// rounded-3xl radius, the white/zinc hairline border and the layered
// `shadow-sidebar`. Its rail is 260px expanded / 60px collapsed with the
// asymmetric collapsed padding (px-[11px]) that keeps the 36px icon rows centred.
//
// NOT `justify-between`: SidebarContent renders a flat column whose nav already
// takes `flex-1`, so justify-between would split any overflow across the top and
// bottom edges and clip the logo/brand switcher off the top. Default start
// alignment keeps them pinned; only the nav scrolls.
const BASE =
  'flex-none flex-col overflow-y-auto rounded-3xl border border-border-button-white bg-background-secondary-default shadow-sidebar'

export function Sidebar(): JSX.Element {
  const collapsed = useUiStore(s => s.collapsed)
  const mobileOpen = useUiStore(s => s.mobileOpen)
  const setMobileOpen = useUiStore(s => s.setMobileOpen)
  const pathname = usePathname()

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, setMobileOpen])

  return (
    <>
      <aside
        className={`hidden transition-[width] duration-200 lg:flex ${BASE} ${collapsed ? 'w-[60px] px-[11px] pt-4 pb-3' : 'w-[260px] px-3 pt-4 pb-3'}`}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
          <aside className={`fixed inset-y-2 left-2 z-50 flex w-[268px] p-3 lg:hidden ${BASE}`}>
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
