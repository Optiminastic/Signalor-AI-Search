import Link from 'next/link'

import { SignalorMark } from '@/components/SignalorMark'
import { LandingNavMenu } from '@/features/landing/components/LandingNavMenu'

function Logo(): JSX.Element {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <SignalorMark className="text-primary h-7 w-7" />
      <span className="text-[19px] font-semibold tracking-tight text-[#171717]">SignalorAI</span>
    </Link>
  )
}

export function LandingNav(): JSX.Element {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-12">
      <Logo />
      <LandingNavMenu />
      <div className="flex items-center gap-1.5">
        <Link
          href="/sign-in"
          className="hidden h-9 items-center rounded-md px-3.5 text-[14px] font-medium text-[#3f3f46] transition-colors hover:text-[#171717] sm:inline-flex"
        >
          Log in
        </Link>
        <Link
          href="/sign-up"
          className="auth-cta-btn inline-flex h-9 items-center rounded-md px-4 text-[14px] font-semibold text-white"
        >
          Sign up
        </Link>
        <Link
          href="/contact"
          className="ml-1 hidden h-9 items-center rounded-md bg-white px-4 text-[14px] font-semibold text-[#171717] shadow-sm ring-1 shadow-black/5 ring-black/10 transition-all hover:bg-[#f4f4f5] motion-safe:hover:-translate-y-px sm:inline-flex"
        >
          Talk to us
        </Link>
      </div>
    </nav>
  )
}
