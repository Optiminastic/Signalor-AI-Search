'use client'

import type { TablerIcon } from '@tabler/icons-react'
import { useParams, usePathname } from 'next/navigation'

import { Badge } from '@/components/base/badges/badge'
import { TransitionLink } from '@/components/TransitionLink'

interface NavItemProps {
  icon: TablerIcon
  /** Brand-relative sub-path (e.g. 'tasks', '' for overview) or an absolute
   *  path starting with '/' for account-level pages (e.g. '/dashboard/team'). */
  href: string
  label: string
  badge?: number
  collapsed?: boolean
  /** Extra brand-relative paths that also count as "on this page" (drill-downs). */
  alsoMatch?: string[]
}

/** Resolve a nav entry's href against the active brand slug in the URL. */
export function resolveHref(href: string, slug: string | undefined): string {
  if (href.startsWith('/')) return href
  if (!slug) return '/dashboard'
  return href ? `/dashboard/${slug}/${href}` : `/dashboard/${slug}`
}

function Trailing({ badge, active }: { badge?: number; active: boolean }): JSX.Element | null {
  if (!badge) return null
  // BoardUI's own Badge, so the count matches the kit exactly (primary when the
  // row is selected, neutral otherwise).
  return <Badge color={active ? 'primary' : 'neutral'}>{badge}</Badge>
}

function isActive(pathname: string, href: string, isIndex: boolean): boolean {
  if (href === '#') return false
  if (pathname === href) return true
  // The brand index (/dashboard/<slug>) must not stay active on every sub-page.
  return !isIndex && pathname.startsWith(`${href}/`)
}

interface ActiveArgs {
  pathname: string
  href: string
  slug: string | undefined
  alsoMatch?: string[]
}

/**
 * Whether this entry represents the current page.
 *
 * On a slug-less page (/dashboard/brands, /dashboard/team) every brand-relative
 * href collapses to '/dashboard', which then prefix-matched the current path and
 * lit up the entire sidebar. Nothing brand-scoped can be active without a brand.
 */
function isNavActive({ pathname, href, slug, alsoMatch }: ActiveArgs): boolean {
  if (!href.startsWith('/') && !slug) return false
  if (isActive(pathname, resolveHref(href, slug), href === '')) return true
  return (alsoMatch ?? []).some(sub => isActive(pathname, resolveHref(sub, slug), false))
}

function NavRight({
  collapsed,
  badge,
  active,
}: {
  collapsed?: boolean
  badge?: number
  active: boolean
}): JSX.Element | null {
  if (!collapsed) return <Trailing badge={badge} active={active} />
  if (!badge) return null
  return <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#e04a3d]" />
}

export function NavItem({
  icon: Icon,
  label,
  href,
  badge,
  collapsed,
  alsoMatch,
}: NavItemProps): JSX.Element {
  const pathname = usePathname()
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : undefined
  const fullHref = resolveHref(href, slug)
  const active = isNavActive({ pathname, href, slug, alsoMatch })
  // BoardUI's exact nav-item treatment: rounded-2lg (10px), a top-to-bottom
  // brand gradient with the `shadow-nav-selected` ring for the selected row,
  // and a `background/secondary/hover` wash otherwise. Retinted from BoardUI's
  // blue to Signalor red; every other value is theirs.
  const stateClass = active
    ? 'bg-linear-to-b from-[#e04a3d] to-[#c53f34] shadow-nav-selected'
    : 'hover:bg-background-secondary-hover'

  return (
    <TransitionLink
      href={fullHref}
      title={collapsed ? label : undefined}
      className={`rounded-2lg relative flex items-center justify-between overflow-hidden p-2 transition-[background-color] duration-300 ease-in-out ${collapsed ? 'w-9 justify-center' : 'w-full'} ${stateClass}`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon
          size={20}
          className={`shrink-0 ${active ? 'text-white' : 'text-foreground-icon-secondary'}`}
        />
        {!collapsed && (
          <span
            className={`text-body-medium truncate whitespace-nowrap ${active ? 'text-white' : 'text-text-secondary'}`}
          >
            {label}
          </span>
        )}
      </span>
      <NavRight collapsed={collapsed} badge={badge} active={active} />
    </TransitionLink>
  )
}
