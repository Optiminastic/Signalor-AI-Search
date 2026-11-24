import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { SignalorMark } from '@/components/SignalorMark'
import { cn } from '@/lib/utils'

const DEFAULT_EYEBROW = 'Answer-engine visibility'
const DEFAULT_HEADLINE = 'See how your brand shows up in AI chat, and fix what holds you back.'

interface AuthMarketingPanelProps {
  /** Right-panel illustration. Defaults to the sign-in/up hands visual. */
  imageSrc?: string
  /** Small uppercase kicker above the headline. */
  eyebrow?: string
  /** Bottom-right headline copy. */
  headline?: string
}

/**
 * Right-hand marketing panel in the landing language: a white framed card with
 * a recessed muted well holding the illustration, eyebrow + headline anchored
 * bottom-right. Hidden below the lg breakpoint.
 */
export function AuthMarketingPanel({
  imageSrc = '/auth-illustration.png',
  eyebrow = DEFAULT_EYEBROW,
  headline = DEFAULT_HEADLINE,
}: AuthMarketingPanelProps): JSX.Element {
  return (
    <aside className="relative hidden min-h-svh p-3 lg:flex xl:p-4">
      <div className="bg-card ring-foreground/10 relative flex flex-1 flex-col overflow-hidden rounded-2xl p-2 shadow ring-1">
        <div className="bg-muted/50 ring-border/50 relative flex flex-1 flex-col overflow-hidden rounded-xl p-10 ring-1 xl:p-14">
          {/* Illustration, fully contained so nothing is cropped. */}
          <div className="relative flex-1">
            <Image
              src={imageSrc}
              alt="Illustration of hands holding phones"
              fill
              priority
              sizes="50vw"
              className="pointer-events-none object-contain object-center select-none"
            />
          </div>

          <div className="relative z-10 ml-auto max-w-md text-right">
            <p className="text-primary-ink text-[12px] font-semibold tracking-[0.18em] uppercase">
              {eyebrow}
            </p>
            <h2 className="text-foreground mt-3 ml-auto max-w-sm text-2xl leading-[1.15] font-semibold tracking-tight xl:text-[28px]">
              {headline}
            </h2>
          </div>
        </div>
      </div>
    </aside>
  )
}

interface AuthShellProps {
  children: ReactNode
  /** Inner column max width. Auth forms use the default 380px. */
  contentClassName?: string
  /** Override the right-hand panel. Defaults to the marketing panel. */
  rightPanel?: ReactNode
}

/**
 * Split-screen auth layout on the landing canvas: logo + carded form column on
 * the left (inside the landing's measured frame), marketing panel on the right.
 */
export function AuthShell({
  children,
  contentClassName = '',
  rightPanel,
}: AuthShellProps): JSX.Element {
  return (
    <div className="min-h-svh w-full bg-[#fafafa] text-[13px] leading-normal lg:grid lg:h-svh lg:grid-cols-2 lg:overflow-hidden">
      {/* LEFT — scrolls independently so the right illustration stays fixed. */}
      <div className="relative flex min-h-svh flex-col px-4 py-6 sm:px-6 lg:h-svh lg:min-h-0 lg:overflow-y-auto lg:px-10 xl:px-14">
        <Link href="/" className="flex w-fit shrink-0 items-center gap-2">
          <SignalorMark className="text-primary-ink h-6 w-6" />
          <span className="text-foreground text-[17px] font-semibold tracking-tight">
            SignalorAI
          </span>
        </Link>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className={cn('relative z-10 mx-auto w-[380px] max-w-full', contentClassName)}>
            {/* Measured frame — the landing hero's annotated-box motif. */}
            <div className="bg-foreground/5 relative p-2">
              <span
                aria-hidden
                className="bg-foreground/20 absolute top-1 left-1 size-[3px] rounded-full"
              />
              <span
                aria-hidden
                className="bg-foreground/20 absolute top-1 right-1 size-[3px] rounded-full"
              />
              <span
                aria-hidden
                className="bg-foreground/20 absolute bottom-1 left-1 size-[3px] rounded-full"
              />
              <span
                aria-hidden
                className="bg-foreground/20 absolute right-1 bottom-1 size-[3px] rounded-full"
              />
              <div className="bg-card ring-foreground/10 rounded-xl p-6 shadow ring-1 sm:p-7">
                {children}
              </div>
            </div>

            <p className="text-muted-foreground mt-4 text-center text-[11px] leading-relaxed">
              By continuing you agree to our{' '}
              <Link
                href="/terms"
                className="text-foreground/70 decoration-border hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href="/policy"
                className="text-foreground/70 decoration-border hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Privacy policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      {rightPanel ?? <AuthMarketingPanel />}
    </div>
  )
}
