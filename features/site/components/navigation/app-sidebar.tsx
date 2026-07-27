'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Radar,
  PlugZap,
  ChartNoAxesCombined,
  LayoutDashboard,
  ArrowLeft,
  User,
  LogOut,
} from '@/features/site/components/icons'
import { Sidebar, SidebarBody } from '@/features/site/components/ui/sidebar'
import { routes } from '@/features/site/lib/config'
import { cn } from '@/features/site/lib/utils'
import { getRunBySlug } from '@/features/site/lib/api/analyzer'
import { signOut } from '@/features/site/lib/auth-client'
import { useQueryClient } from '@tanstack/react-query'
import { clearClientSession } from '@/lib/clearClientSession'

type LinkItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(true)
  const [runUrl, setRunUrl] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  // Match /dashboard/[slug]/analytics or /dashboard/[slug]/integrations
  const runMatch = pathname.match(/^\/dashboard\/([a-zA-Z0-9_-]+)\/(integrations|analytics)$/)
  const slug = runMatch ? runMatch[1] : null
  const runSubPage = runMatch?.[2] ?? null
  const isRunScopedSubpage = slug !== null && !!runSubPage

  useEffect(() => {
    if (!isRunScopedSubpage || !slug) {
      setRunUrl('')
      return
    }
    getRunBySlug(slug)
      .then(r => setRunUrl(r.url || ''))
      .catch(() => setRunUrl(''))
  }, [isRunScopedSubpage, slug])

  const mainItems: LinkItem[] = useMemo(() => {
    const isAccountPage =
      pathname === routes.settingsAccount || pathname.startsWith(`${routes.settingsAccount}/`)

    if (isRunScopedSubpage && slug) {
      return [
        {
          label: 'Results',
          href: routes.dashboardProject(slug),
          icon: LayoutDashboard,
          active: false,
        },
        {
          label: 'Analytics',
          href: routes.dashboardProjectAnalytics(slug),
          icon: ChartNoAxesCombined,
          active: pathname.endsWith('/analytics'),
        },
        {
          label: 'Integrations',
          href: routes.dashboardProjectIntegrations(slug),
          icon: PlugZap,
          active: pathname.endsWith('/integrations'),
        },
        {
          label: 'Projects',
          href: routes.dashboard,
          icon: ArrowLeft,
          active: false,
        },
      ]
    }

    return [
      {
        label: 'Account',
        href: routes.settingsAccount,
        icon: User,
        active: isAccountPage,
      },
    ]
  }, [isRunScopedSubpage, slug, pathname])

  async function handleSignOut() {
    try {
      setSigningOut(true)
      await signOut()
      clearClientSession(queryClient)
      router.push(routes.signIn)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <Sidebar open={open} setOpen={setOpen} hoverExpand={false}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="border-border/50 mb-3 border-b pb-3">
            <div
              className={cn('flex items-center', open ? 'justify-start gap-2' : 'justify-center')}
            >
              <div className="bg-primary/20 text-primary rounded-md p-1.5">
                <Radar className="h-3.5 w-3.5" />
              </div>
              {open ? (
                <span className="text-foreground text-sm font-semibold">SignalorAI GEO</span>
              ) : null}
            </div>

            {open && isRunScopedSubpage && slug ? (
              <>
                <p className="text-primary mt-2 text-xs font-semibold tracking-wide uppercase">
                  Project
                </p>
                <p className="text-muted-foreground mt-1 truncate text-xs">
                  {runUrl || 'Loading...'}
                </p>
              </>
            ) : null}
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {mainItems.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.href + item.label}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'flex h-10 w-full items-center rounded-md font-medium transition-colors',
                    open ? 'justify-start gap-2.5 px-2.5' : 'mx-auto size-10 justify-center px-0',
                    item.active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {open ? <span className="text-sm">{item.label}</span> : null}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-border/50 space-y-2 border-t pt-3">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(
              'flex h-10 w-full items-center rounded-md transition-colors',
              open ? 'justify-start gap-2.5 px-2.5' : 'mx-auto size-10 justify-center px-0',
              'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <LogOut className="text-muted-foreground h-4 w-4 shrink-0" />
            {open ? (
              <span className="text-foreground/85 text-sm">
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </span>
            ) : null}
          </button>
        </div>
      </SidebarBody>
    </Sidebar>
  )
}
