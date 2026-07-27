'use client'

import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useCatalystTheme } from '@/features/catalyst/components/CatalystThemeProvider'
import { signOut } from '@/lib/auth-client'
import { clearClientSession } from '@/lib/clearClientSession'
import { ArrowLeft, LogOut, Moon, Sun } from '@/lib/icons'
import { routes } from '@/lib/routes'

export function ProfileTopBar(): JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { dark, toggle } = useCatalystTheme()

  const handleSignOut = async (): Promise<void> => {
    await signOut().catch(() => {})
    clearClientSession(queryClient)
    router.push(routes.signIn)
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--cat-border)] bg-[var(--cat-card)]/85 px-5 backdrop-blur">
      <Link
        href={routes.dashboard}
        className="flex items-center gap-1.5 text-[13px] text-[var(--cat-ink-2)] transition hover:text-[var(--cat-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>
      <span className="text-[15px] font-semibold tracking-tight text-[var(--cat-ink)]">
        SignalorAI
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--cat-ink-2)] transition hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[var(--cat-ink-2)] transition hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  )
}
