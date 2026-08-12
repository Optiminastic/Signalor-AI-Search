import type { ReactNode } from 'react'

import { GithubMark } from '@/components/GithubMark'

/** `default` is a row/header control; `compact` fits a dense notice strip. */
type GithubPrLinkSize = 'default' | 'compact'

interface GithubPrLinkProps {
  /** The pull request's URL on GitHub. */
  href: string
  /** Tooltip — usually the fix's status message. */
  title?: string
  size?: GithubPrLinkSize
  children: ReactNode
}

const SIZE_STYLES: Record<GithubPrLinkSize, string> = {
  default: 'h-8 gap-1.5 rounded-md px-3 text-[12px]',
  compact: 'h-6 gap-1 rounded px-2 text-[11px]',
}

const ICON_SIZE: Record<GithubPrLinkSize, number> = {
  default: 13,
  compact: 11,
}

/**
 * The "a PR exists" link — the one affordance that leaves our app for GitHub.
 *
 * Solid GitHub black with the inverted (white) Invertocat, rather than the
 * neutral outline every other row control uses: once a pull request is open,
 * the next step happens on GitHub, and the button should look like it. The mark
 * inherits `currentColor`, so `text-white` is what inverts it.
 *
 * Shared by the tasks table, the task header, the auto-fix flow and content
 * optimisation so a PR link never drifts between surfaces.
 */
export function GithubPrLink({
  href,
  title,
  size = 'default',
  children,
}: GithubPrLinkProps): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={`inline-flex w-fit items-center bg-[#24292f] font-semibold text-white transition-colors hover:bg-[#1f2328] ${SIZE_STYLES[size]}`}
    >
      <GithubMark size={ICON_SIZE[size]} />
      {children}
    </a>
  )
}
