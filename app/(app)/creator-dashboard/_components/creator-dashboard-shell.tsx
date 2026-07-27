'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import {
  DashboardAppFrame,
  type DashboardAppSection,
} from '@/features/site/app/dashboard/[slug]/_components/dashboard-app-frame'
import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Settings,
  Sparkles,
  type LucideIcon,
} from '@/features/site/components/icons'
import { OverviewIcon } from '@/features/site/components/icons/nav'
import LogoComp from '@/features/site/components/LogoComp'
import { UserAvatar } from '@/features/site/components/ui/user-avatar'
import { authClient, useSession } from '@/features/site/lib/auth-client'
import { cn } from '@/features/site/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { clearClientSession } from '@/lib/clearClientSession'

import { CreatorProvider, useCreator } from './creator-context'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon | React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
}

const NAV: NavItem[] = [
  { label: 'Overview', href: '/creator-dashboard', icon: OverviewIcon },
  { label: 'Profile & payout', href: '/creator-dashboard/settings', icon: Settings },
]

function sectionFor(pathname: string): DashboardAppSection {
  if (pathname.startsWith('/creator-dashboard/settings')) {
    return {
      title: 'Profile & payout',
      hint: 'Update how you appear and how we pay you.',
    }
  }
  return {
    title: 'Creator overview',
    hint: 'Your link, earnings, and recent commissions.',
  }
}

function CreatorSidebarBrand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoComp
        size={22}
        compact
        animated={false}
        className="text-foreground text-sm font-bold tracking-tight"
      />
      <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-orange-700 uppercase">
        Creator
      </span>
    </Link>
  )
}

function CreatorSidebarNav() {
  const pathname = usePathname()
  return (
    <div className="flex flex-col gap-1 p-2">
      <nav className="flex flex-col gap-0.5">
        {NAV.map(item => {
          const active =
            item.href === '/creator-dashboard'
              ? pathname === '/creator-dashboard'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function CreatorShareCard() {
  const { profile } = useCreator()
  if (!profile) return null
  return (
    <div className="m-2 rounded-md border border-orange-200/60 bg-orange-50/40 p-3">
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-orange-600" />
        <p className="text-[11px] font-semibold tracking-wider text-orange-700 uppercase">
          Your code
        </p>
      </div>
      <p className="text-foreground mt-1 font-mono text-sm font-bold tracking-wider">
        {profile.code}
      </p>
      <p className="text-muted-foreground mt-0.5 text-[10px]">
        {profile.commission_percent}% commission · 10% off for visitors
      </p>
    </div>
  )
}

function CreatorSidebarBottom() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function handleSignOut() {
    await authClient.signOut()
    clearClientSession(queryClient)
    router.replace('/creator/sign-in')
  }

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Creator'
  const userEmail = session?.user?.email || ''
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const userImage = (session?.user as Record<string, unknown>)?.image as string | undefined

  return (
    <div className="border-border/40 shrink-0 space-y-3 border-t px-3 pt-3 pb-1">
      <CreatorShareCard />
      <div className="relative" ref={menuRef}>
        {open ? (
          <div className="border-border bg-card absolute right-0 bottom-full left-0 z-50 mb-1 border p-2.5 shadow-lg">
            <div className="border-border mb-2 flex items-center gap-3 border-b px-1 pb-2.5">
              <UserAvatar src={userImage} initials={userInitials} size={36} />
              <div className="min-w-0">
                <p className="text-foreground truncate text-[13px] font-semibold">{userName}</p>
                <p className="text-muted-foreground truncate text-[11px]">{userEmail}</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="hover:bg-muted flex w-full items-center gap-2.5 rounded-md px-2 py-2 transition"
        >
          <UserAvatar src={userImage} initials={userInitials} size={30} />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-foreground truncate text-[13px] font-medium">{userName}</p>
          </div>
          {open ? (
            <ChevronUp className="text-muted-foreground size-3.5 shrink-0" />
          ) : (
            <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
          )}
        </button>
      </div>
    </div>
  )
}

function CreatorFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const section = sectionFor(pathname)
  return (
    <DashboardAppFrame
      section={section}
      breadcrumbs={[]}
      sidebarBrand={<CreatorSidebarBrand />}
      sidebarBelowHeaderRow={null}
      sidebarNav={<CreatorSidebarNav />}
      sidebarBottom={<CreatorSidebarBottom />}
      brandHref="/creator-dashboard"
    >
      <div className="animate-enter">{children}</div>
    </DashboardAppFrame>
  )
}

export function CreatorDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <CreatorProvider>
      <CreatorFrame>{children}</CreatorFrame>
    </CreatorProvider>
  )
}
