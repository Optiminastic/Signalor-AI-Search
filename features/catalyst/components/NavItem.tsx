'use client'

import type { TablerIcon } from '@tabler/icons-react'
import { useParams, usePathname } from 'next/navigation'

import { TransitionLink } from '@/components/TransitionLink'
import { BRAND } from '@/features/catalyst/constants'

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

function Trailing({ badge }: { badge?: number }): JSX.Element | null {
  if (!badge) return null
  return (
    <span
      className="ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-sm px-1 text-[10px] font-semibold text-white"
      style={{ background: BRAND }}
    >
      {badge}
    </span>
  )
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
}: {
  collapsed?: boolean
  badge?: number
}): JSX.Element | null {
  if (!collapsed) return <Trailing badge={badge} />
  if (!badge) return null
  return (
    <span
      className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
      style={{ background: BRAND }}
    />
  )
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
  // Reference-style selection: the active row lifts to an elevated white card;
  // inactive rows are muted and reveal a white pill on hover. All via surface
  // tokens so it stays correct in dark mode.
  const stateClass = active
    ? 'border-[var(--cat-border-soft)] bg-[var(--cat-card)] font-semibold text-[var(--cat-ink)] shadow-[0_1px_2px_rgba(16,24,40,.06)]'
    : 'border-transparent text-[var(--cat-ink-2)] hover:bg-[var(--cat-card)] hover:text-[var(--cat-ink)]'

  return (
    <TransitionLink
      href={fullHref}
      title={collapsed ? label : undefined}
      className={`ring-foreground/10 relative flex items-center rounded-md border py-2 text-[14px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[rgba(224,74,61,0.4)] focus-visible:outline-none ${collapsed ? 'justify-center px-0' : 'gap-3 px-2.5'} ${stateClass}`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && label}
      <NavRight collapsed={collapsed} badge={badge} />
    </TransitionLink>
  )
}
